"""Authenticated user routes: profile, progress (lessons/quizzes/simulations), activity log.

Handlers receive a RequestContext from the gateway middleware (via the
`get_request_context` dependency) and never touch tokens. Only imports from
`auth.provider` / `auth.models` — swapping auth providers doesn't touch this
file.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, field_validator

from auth.models import RequestContext
from auth.provider import get_request_context
from db import supabase

router = APIRouter(prefix="/api/v1/me")

PROFILE_FIELDS = "id, username, tier, total_xp, current_streak, longest_streak, last_active_date"

ACTIVITY_ACTIONS = ("lesson_complete", "quiz_complete", "sim_complete", "streak_bonus")


# --- Models ---

class UserProfile(BaseModel):
    id: str
    email: str
    username: Optional[str]
    tier: str
    total_xp: int
    current_streak: int
    longest_streak: int
    last_active_date: Optional[str]


class UserProfileResponse(BaseModel):
    user: UserProfile


class UserUpdate(BaseModel):
    username: Optional[str] = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not (1 <= len(v) <= 40):
            raise ValueError("username must be 1-40 characters")
        return v


class LessonProgressItem(BaseModel):
    concept_id: str
    status: str
    card_index: int
    xp_earned: int
    completed_at: Optional[str]


class QuizProgressItem(BaseModel):
    concept_id: str
    status: str
    best_score: int
    passed: bool
    xp_earned: int
    completed_at: Optional[str]


class SimulationProgressItem(BaseModel):
    concept_id: str
    status: str
    xp_earned: int
    completed_at: Optional[str]


class ProgressListResponse(BaseModel):
    lessons: list[LessonProgressItem]
    quizzes: list[QuizProgressItem]
    simulations: list[SimulationProgressItem]


ACTIVITY_TYPES = ("lesson", "quiz", "simulation")


class ProgressIn(BaseModel):
    activity_type: str
    concept_id: str
    status: str
    xp_earned: int = 0
    card_index: Optional[int] = None
    best_score: Optional[int] = None
    passed: Optional[bool] = None

    @field_validator("activity_type")
    @classmethod
    def validate_activity_type(cls, v: str) -> str:
        if v not in ACTIVITY_TYPES:
            raise ValueError(f"activity_type must be one of {', '.join(ACTIVITY_TYPES)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ("in_progress", "completed"):
            raise ValueError("status must be in_progress or completed")
        return v


class ActivityItem(BaseModel):
    id: str
    action: str
    xp_earned: int
    created_at: str


class ActivityListResponse(BaseModel):
    activity: list[ActivityItem]


class ActivityIn(BaseModel):
    action: str
    xp_earned: int = 0

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        if v not in ACTIVITY_ACTIONS:
            raise ValueError(f"action must be one of {', '.join(ACTIVITY_ACTIONS)}")
        return v

    @field_validator("xp_earned")
    @classmethod
    def validate_xp(cls, v: int) -> int:
        if not (0 <= v <= 1000):
            raise ValueError("xp_earned must be between 0 and 1000")
        return v


# --- Helpers ---

def _load_profile(ctx: RequestContext) -> dict:
    result = supabase.table("users").select(PROFILE_FIELDS).eq("id", ctx.user_id).execute()
    if not result.data:
        # The gateway middleware self-heals missing rows; reaching this means
        # the row vanished between middleware and handler.
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]


def _profile_response(ctx: RequestContext, row: dict) -> UserProfileResponse:
    return UserProfileResponse(user=UserProfile(email=ctx.email, **row))


def _apply_streak(row: dict, today: date) -> dict:
    """Streak bookkeeping for a new XP-earning activity."""
    last_active = row.get("last_active_date")
    last_date = date.fromisoformat(last_active) if last_active else None

    if last_date == today:
        current = row["current_streak"] or 1
    elif last_date == today - timedelta(days=1):
        current = (row["current_streak"] or 0) + 1
    else:
        current = 1

    return {
        "current_streak": current,
        "longest_streak": max(row["longest_streak"] or 0, current),
        "last_active_date": today.isoformat(),
    }


# --- Profile ---

@router.get("", response_model=UserProfileResponse)
def get_me(ctx: RequestContext = Depends(get_request_context)):
    return _profile_response(ctx, _load_profile(ctx))


@router.put("", response_model=UserProfileResponse)
def update_me(payload: UserUpdate, ctx: RequestContext = Depends(get_request_context)):
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    try:
        result = (
            supabase.table("users")
            .update(updates)
            .eq("id", ctx.user_id)
            .execute()
        )
    except Exception as exc:
        if "duplicate" in str(exc).lower() or "unique" in str(exc).lower():
            raise HTTPException(status_code=409, detail="Username is already taken")
        raise

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return _profile_response(ctx, _load_profile(ctx))


# --- Progress ---

@router.get("/progress", response_model=ProgressListResponse)
def get_progress(ctx: RequestContext = Depends(get_request_context)):
    result = supabase.rpc("get_user_progress", {"p_user_id": ctx.user_id}).execute()
    data = result.data or {}
    return ProgressListResponse(
        lessons=data.get("lessons", []),
        quizzes=data.get("quizzes", []),
        simulations=data.get("simulations", []),
    )


_TABLE_FOR_TYPE = {
    "lesson": "user_lesson_progress",
    "quiz": "user_quiz_progress",
    "simulation": "user_simulation_progress",
}


@router.post("/progress")
def save_progress(payload: ProgressIn, ctx: RequestContext = Depends(get_request_context)):
    table = _TABLE_FOR_TYPE[payload.activity_type]
    now = datetime.now(timezone.utc).isoformat()

    row: dict = {
        "user_id": ctx.user_id,
        "concept_id": payload.concept_id,
        "status": payload.status,
        "xp_earned": payload.xp_earned,
        "completed_at": now if payload.status == "completed" else None,
        "updated_at": now,
    }

    if payload.activity_type == "lesson":
        row["card_index"] = payload.card_index or 0
    elif payload.activity_type == "quiz":
        row["best_score"] = payload.best_score or 0
        row["passed"] = payload.passed or False

    # Never downgrade a completed activity back to in_progress, and keep the
    # highest XP earned. For quizzes: keep max best_score, once passed stays
    # passed.
    existing = (
        supabase.table(table)
        .select("status, xp_earned, completed_at"
                + (", best_score, passed" if payload.activity_type == "quiz" else ""))
        .eq("user_id", ctx.user_id)
        .eq("concept_id", payload.concept_id)
        .execute()
    )
    if existing.data:
        prev = existing.data[0]
        if prev["status"] == "completed":
            row["status"] = "completed"
            row["completed_at"] = prev["completed_at"]
        row["xp_earned"] = max(prev["xp_earned"] or 0, payload.xp_earned)
        if payload.activity_type == "quiz":
            row["best_score"] = max(prev.get("best_score") or 0, row["best_score"])
            row["passed"] = prev.get("passed", False) or row.get("passed", False)

    try:
        result = (
            supabase.table(table)
            .upsert(row, on_conflict="user_id,concept_id")
            .execute()
        )
    except Exception as exc:
        if "foreign key" in str(exc).lower():
            raise HTTPException(status_code=404, detail="Concept not found")
        raise

    saved = result.data[0]
    if payload.activity_type == "lesson":
        return LessonProgressItem(
            concept_id=saved["concept_id"],
            status=saved["status"],
            card_index=saved["card_index"],
            xp_earned=saved["xp_earned"],
            completed_at=saved.get("completed_at"),
        )
    elif payload.activity_type == "quiz":
        return QuizProgressItem(
            concept_id=saved["concept_id"],
            status=saved["status"],
            best_score=saved["best_score"],
            passed=saved["passed"],
            xp_earned=saved["xp_earned"],
            completed_at=saved.get("completed_at"),
        )
    else:
        return SimulationProgressItem(
            concept_id=saved["concept_id"],
            status=saved["status"],
            xp_earned=saved["xp_earned"],
            completed_at=saved.get("completed_at"),
        )


# --- Activity log ---

@router.get("/activity", response_model=ActivityListResponse)
def get_activity(
    ctx: RequestContext = Depends(get_request_context),
    limit: int = Query(50, ge=1, le=200),
):
    result = (
        supabase.table("activity_log")
        .select("id, action, xp_earned, created_at")
        .eq("user_id", ctx.user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return ActivityListResponse(activity=result.data)


@router.post("/activity", response_model=UserProfileResponse)
def log_activity(payload: ActivityIn, ctx: RequestContext = Depends(get_request_context)):
    """Append an activity entry and roll its XP + streak effect into the
    user's profile. Returns the updated profile so the client can sync."""
    supabase.table("activity_log").insert({
        "user_id": ctx.user_id,
        "action": payload.action,
        "xp_earned": payload.xp_earned,
    }).execute()

    profile = _load_profile(ctx)
    updates = _apply_streak(profile, datetime.now(timezone.utc).date())
    updates["total_xp"] = (profile["total_xp"] or 0) + payload.xp_earned
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    supabase.table("users").update(updates).eq("id", ctx.user_id).execute()
    return _profile_response(ctx, _load_profile(ctx))
