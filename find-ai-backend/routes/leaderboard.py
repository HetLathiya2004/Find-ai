"""Leaderboard endpoint — total XP + streak bonus scoring.

League score = total_xp + (current_streak * 10). Streak bonus rewards
daily consistency without inflating the real XP economy.

Tier is derived from rank position — no persistent league tables.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth.models import RequestContext
from auth.provider import get_request_context
from db import supabase


router = APIRouter(prefix="/api/v1")


class LeaderboardUser(BaseModel):
    rank: int
    username: str
    total_xp: int
    streak: int
    league_score: int
    is_current_user: bool


class LeaderboardResponse(BaseModel):
    users: list[LeaderboardUser]
    current_user_rank: Optional[int]
    current_user_tier: Optional[str]


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(ctx: RequestContext = Depends(get_request_context)):
    result = supabase.rpc("get_leaderboard", {"p_user_id": ctx.user_id}).execute()
    data = result.data or {}
    return LeaderboardResponse(
        users=data.get("users", []),
        current_user_rank=data.get("current_user_rank"),
        current_user_tier=data.get("current_user_tier"),
    )
