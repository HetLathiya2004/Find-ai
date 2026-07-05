"""Provider-agnostic auth data structures. This module never changes when
swapping auth providers."""

from __future__ import annotations

from dataclasses import dataclass, field


class AuthError(Exception):
    """Raised by a provider when a request carries no valid credentials.

    Always translated to a 401 by the gateway middleware.
    """

    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(detail)
        self.detail = detail


@dataclass(frozen=True)
class AuthUser:
    """Identity extracted from validated credentials — no app-level data."""

    user_id: str
    email: str


@dataclass(frozen=True)
class RequestContext:
    """What route handlers see. Built by the gateway middleware from the
    provider's AuthUser plus the app's own user record (tier/permissions).

    Handlers never touch raw tokens.
    """

    user_id: str
    email: str
    tier: str
    permissions: frozenset[str] = field(default_factory=frozenset)

    def has_permission(self, permission: str) -> bool:
        return permission in self.permissions

    @property
    def is_admin(self) -> bool:
        return self.tier == "admin"
