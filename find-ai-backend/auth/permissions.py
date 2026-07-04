"""Tier-based permission logic. Provider-agnostic — depends only on the
`tier` column of the app's own users table."""

from __future__ import annotations

TIERS = ("free", "premium", "admin")
DEFAULT_TIER = "free"

_FREE = frozenset({
    "content:read",
    "profile:read",
    "profile:write",
    "progress:read",
    "progress:write",
    "activity:read",
    "activity:write",
})

_PREMIUM = _FREE | frozenset({
    "content:premium",
})

_ADMIN = _PREMIUM | frozenset({
    "content:manage",
    "users:manage",
})

_TIER_PERMISSIONS: dict[str, frozenset[str]] = {
    "free": _FREE,
    "premium": _PREMIUM,
    "admin": _ADMIN,
}


def permissions_for_tier(tier: str) -> frozenset[str]:
    """Permissions granted to a tier; unknown tiers get free-tier access."""
    return _TIER_PERMISSIONS.get(tier, _FREE)


def normalize_tier(tier: str | None) -> str:
    return tier if tier in TIERS else DEFAULT_TIER
