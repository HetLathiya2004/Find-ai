"""Authenticated user routes: profile, lesson progress, activity log.

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


class ProgressItem(BaseModel):
    lesson_id: str
    status: str
    xp_earned: int
    completed_at: Optional[str]


class ProgressListResponse(BaseModel):
    progress: list[ProgressItem]


class ProgressIn(BaseModel):
    lesson_id: str
    status: str
    xp_earned: int = 0

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


# --- Lesson progress ---

@router.get("/progress", response_model=ProgressListResponse)
def get_progress(ctx: RequestContext = Depends(get_request_context)):
    result = (
        supabase.table("user_lesson_progress")
        .select("lesson_id, status, xp_earned, completed_at")
        .eq("user_id", ctx.user_id)
        .execute()
    )
    return ProgressListResponse(progress=result.data)


@router.post("/progress", response_model=ProgressItem)
def save_progress(payload: ProgressIn, ctx: RequestContext = Depends(get_request_context)):
    now = datetime.now(timezone.utc).isoformat()
    row = {
        "user_id": ctx.user_id,
        "lesson_id": payload.lesson_id,
        "status": payload.status,
        "xp_earned": payload.xp_earned,
        "completed_at": now if payload.status == "completed" else None,
        "updated_at": now,
    }

    # Never downgrade a completed lesson back to in_progress, and keep the
    # highest XP earned for it.
    existing = (
        supabase.table("user_lesson_progress")
        .select("status, xp_earned, completed_at")
        .eq("user_id", ctx.user_id)
        .eq("lesson_id", payload.lesson_id)
        .execute()
    )
    if existing.data:
        prev = existing.data[0]
        if prev["status"] == "completed":
            row["status"] = "completed"
            row["completed_at"] = prev["completed_at"]
        row["xp_earned"] = max(prev["xp_earned"] or 0, payload.xp_earned)

    try:
        result = (
            supabase.table("user_lesson_progress")
            .upsert(row, on_conflict="user_id,lesson_id")
            .execute()
        )
    except Exception as exc:
        if "foreign key" in str(exc).lower():
            raise HTTPException(status_code=404, detail="Lesson not found")
        raise

    saved = result.data[0]
    return ProgressItem(
        lesson_id=saved["lesson_id"],
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
