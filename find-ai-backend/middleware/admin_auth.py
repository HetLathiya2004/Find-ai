"""Admin route authorization.

Two ways in, both established by the gateway middleware before this runs:
  1. Legacy X-Admin-Key header (the gateway attaches an admin context).
  2. A Supabase JWT belonging to an admin-tier user.
"""

from fastapi import HTTPException, Request


def require_admin_key(request: Request):
    ctx = getattr(request.state, "ctx", None)
    if ctx is None or ctx.tier != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
