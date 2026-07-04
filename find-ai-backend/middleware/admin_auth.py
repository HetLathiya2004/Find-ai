"""Admin API key authentication dependency."""

import os

from fastapi import Header, HTTPException


def require_admin_key(x_admin_key: str = Header(alias="X-Admin-Key", default="")):
    expected = os.environ.get("ADMIN_API_KEY", "")
    if not x_admin_key or x_admin_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
