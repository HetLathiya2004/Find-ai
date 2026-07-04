"""Supabase Auth provider.

Validates Supabase-issued access tokens (JWT, HS256) locally using the
project's JWT secret — no network round-trip to Supabase per request.

Contract every provider module must satisfy:

    def get_current_user(authorization: str | None) -> AuthUser

`authorization` is the raw Authorization header value ("Bearer <token>").
Raise AuthError for anything invalid; never return a partial user.
"""

from __future__ import annotations

import os

import jwt

from auth.models import AuthError, AuthUser

# Supabase signs access tokens for the "authenticated" audience.
_AUDIENCE = "authenticated"
_ALGORITHMS = ["HS256"]


def _jwt_secret() -> str:
    secret = os.environ.get("SUPABASE_JWT_SECRET", "")
    if not secret:
        # Misconfiguration must fail closed, not open.
        raise AuthError("Auth is not configured on the server")
    return secret


def get_current_user(authorization: str | None) -> AuthUser:
    """Validate the Authorization header and return the authenticated user."""
    if not authorization:
        raise AuthError("Missing Authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise AuthError("Invalid Authorization header, expected 'Bearer <token>'")

    try:
        claims = jwt.decode(
            token.strip(),
            _jwt_secret(),
            algorithms=_ALGORITHMS,
            audience=_AUDIENCE,
            options={"require": ["exp", "sub"]},
        )
    except jwt.ExpiredSignatureError:
        raise AuthError("Token has expired")
    except jwt.InvalidTokenError:
        raise AuthError("Invalid token")

    user_id = claims.get("sub", "")
    if not user_id:
        raise AuthError("Token has no subject")

    return AuthUser(user_id=user_id, email=claims.get("email", "") or "")
