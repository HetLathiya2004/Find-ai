"""Supabase Auth provider.

Validates Supabase-issued access tokens locally — no network round-trip per
request.  Supports both HS256 (legacy JWT secret) and ES256 (newer JWKS-based
signing) depending on what the Supabase project uses.

Contract every provider module must satisfy:

    def get_current_user(authorization: str | None) -> AuthUser

`authorization` is the raw Authorization header value ("Bearer <token>").
Raise AuthError for anything invalid; never return a partial user.
"""

from __future__ import annotations

import logging
import os

import jwt
from jwt import PyJWKClient

from auth.models import AuthError, AuthUser

logger = logging.getLogger("find-ai-backend.auth")

_AUDIENCE = "authenticated"

_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        url = os.environ.get("SUPABASE_URL", "")
        if not url:
            raise AuthError("SUPABASE_URL is not configured")
        jwks_url = f"{url}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True, lifespan=3600)
    return _jwks_client


def _decode_es256(token: str) -> dict:
    client = _get_jwks_client()
    signing_key = client.get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["ES256"],
        audience=_AUDIENCE,
        options={"require": ["exp", "sub"]},
    )


def _decode_hs256(token: str) -> dict:
    secret = os.environ.get("SUPABASE_JWT_SECRET", "")
    if not secret:
        raise AuthError("SUPABASE_JWT_SECRET is not configured")
    return jwt.decode(
        token,
        secret,
        algorithms=["HS256"],
        audience=_AUDIENCE,
        options={"require": ["exp", "sub"]},
    )


def get_current_user(authorization: str | None) -> AuthUser:
    """Validate the Authorization header and return the authenticated user."""
    if not authorization:
        raise AuthError("Missing Authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise AuthError("Invalid Authorization header, expected 'Bearer <token>'")

    token = token.strip()

    try:
        header = jwt.get_unverified_header(token)
    except jwt.exceptions.DecodeError:
        raise AuthError("Malformed token")

    alg = header.get("alg", "")

    try:
        if alg == "ES256":
            claims = _decode_es256(token)
        elif alg == "HS256":
            claims = _decode_hs256(token)
        else:
            raise AuthError(f"Unsupported token algorithm: {alg}")
    except AuthError:
        raise
    except jwt.ExpiredSignatureError:
        raise AuthError("Token has expired")
    except jwt.InvalidTokenError as exc:
        logger.warning("JWT validation failed: %s", exc)
        raise AuthError("Invalid token")

    user_id = claims.get("sub", "")
    if not user_id:
        raise AuthError("Token has no subject")

    return AuthUser(user_id=user_id, email=claims.get("email", "") or "")
