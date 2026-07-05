"""Gateway auth middleware — every request passes through here before any
route handler runs. There are no public resource routes: no valid credentials
means 401, always.

Flow per request:
  1. Extract the Bearer token and validate it via the active auth provider
     (`auth.provider.get_current_user` — swap providers there, not here).
  2. Decode user_id + email from the token claims.
  3. Look up the user's tier from the `users` table (cached with a TTL so we
     don't hit the DB on every request; a missing row is self-healed).
  4. Attach RequestContext(user_id, email, tier, permissions) to
     `request.state.ctx` for route handlers.

Exceptions to the JWT requirement:
  - CORS preflight (OPTIONS) requests.
  - `/health`, used by load-balancer checks.
  - `/api/admin/*` with a valid X-Admin-Key header (legacy admin auth) — a
    JWT from an admin-tier user works there too.
"""

from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass

from starlette.concurrency import run_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from auth.models import AuthError, AuthUser, RequestContext
from auth.permissions import DEFAULT_TIER, normalize_tier, permissions_for_tier
from auth.provider import get_current_user

logger = logging.getLogger("find-ai-backend.auth")

EXEMPT_PATHS = frozenset({"/health"})
ADMIN_PATH_PREFIX = "/api/admin"

TIER_CACHE_TTL_SECONDS = 300
TIER_CACHE_MAX_ENTRIES = 10_000


@dataclass
class _CacheEntry:
    tier: str
    expires_at: float


class TierCache:
    """In-memory user_id -> tier cache with TTL, so the middleware doesn't
    query the users table on every request."""

    def __init__(self, ttl: float = TIER_CACHE_TTL_SECONDS, max_entries: int = TIER_CACHE_MAX_ENTRIES):
        self._ttl = ttl
        self._max_entries = max_entries
        self._entries: dict[str, _CacheEntry] = {}

    def get(self, user_id: str) -> str | None:
        entry = self._entries.get(user_id)
        if entry is None:
            return None
        if entry.expires_at < time.monotonic():
            self._entries.pop(user_id, None)
            return None
        return entry.tier

    def set(self, user_id: str, tier: str) -> None:
        if len(self._entries) >= self._max_entries:
            # Drop expired entries first; if still full, reset (cheap + rare).
            now = time.monotonic()
            self._entries = {k: v for k, v in self._entries.items() if v.expires_at >= now}
            if len(self._entries) >= self._max_entries:
                self._entries.clear()
        self._entries[user_id] = _CacheEntry(tier=tier, expires_at=time.monotonic() + self._ttl)

    def invalidate(self, user_id: str) -> None:
        self._entries.pop(user_id, None)


tier_cache = TierCache()


def _fetch_tier_from_db(user: AuthUser) -> str:
    """Read the user's tier; create the row if it doesn't exist yet (e.g.
    accounts that predate the signup trigger)."""
    from db import supabase  # deferred so tests can patch db.supabase

    result = supabase.table("users").select("tier").eq("id", user.user_id).execute()
    if result.data:
        return normalize_tier(result.data[0].get("tier"))

    username = (user.email.split("@")[0] if user.email else None) or None
    try:
        supabase.table("users").insert({"id": user.user_id, "username": username}).execute()
    except Exception:
        # Row may have been created concurrently, or the username collided;
        # retry the read and fall back to the default tier.
        result = supabase.table("users").select("tier").eq("id", user.user_id).execute()
        if result.data:
            return normalize_tier(result.data[0].get("tier"))
        try:
            supabase.table("users").insert({"id": user.user_id}).execute()
        except Exception:
            logger.exception("Failed to self-heal users row for %s", user.user_id)
    return DEFAULT_TIER


async def _resolve_tier(user: AuthUser) -> str:
    cached = tier_cache.get(user.user_id)
    if cached is not None:
        return cached
    tier = await run_in_threadpool(_fetch_tier_from_db, user)
    tier_cache.set(user.user_id, tier)
    return tier


def _unauthorized(detail: str) -> JSONResponse:
    return JSONResponse(
        status_code=401,
        content={"detail": detail},
        headers={"WWW-Authenticate": "Bearer"},
    )


def _valid_admin_key(request: Request) -> bool:
    expected = os.environ.get("ADMIN_API_KEY", "")
    provided = request.headers.get("X-Admin-Key", "")
    return bool(expected) and provided == expected


ADMIN_KEY_CONTEXT = RequestContext(
    user_id="admin-api-key",
    email="",
    tier="admin",
    permissions=permissions_for_tier("admin"),
)


class AuthGatewayMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.method == "OPTIONS" or request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        # Legacy admin auth: a valid X-Admin-Key still works on admin routes.
        if request.url.path.startswith(ADMIN_PATH_PREFIX) and _valid_admin_key(request):
            request.state.ctx = ADMIN_KEY_CONTEXT
            return await call_next(request)

        try:
            user = get_current_user(request.headers.get("Authorization"))
        except AuthError as exc:
            return _unauthorized(exc.detail)

        try:
            tier = await _resolve_tier(user)
        except Exception:
            logger.exception("Tier lookup failed for user %s", user.user_id)
            return JSONResponse(status_code=503, content={"detail": "Auth backend unavailable"})

        request.state.ctx = RequestContext(
            user_id=user.user_id,
            email=user.email,
            tier=tier,
            permissions=permissions_for_tier(tier),
        )
        return await call_next(request)
