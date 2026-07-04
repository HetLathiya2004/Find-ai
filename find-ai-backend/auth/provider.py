"""Single import point for the active auth provider.

To swap auth providers (e.g. Supabase -> Auth0 -> homegrown), write a new
module exposing `get_current_user(authorization: str | None) -> AuthUser`
and change ONLY the import line below. Nothing else in the codebase knows
which provider is in use.
"""

from fastapi import Request

from auth.models import RequestContext

# --- The one line to change when swapping providers -----------------------
from auth.supabase_auth import get_current_user  # noqa: F401

# ---------------------------------------------------------------------------


def get_request_context(request: Request) -> RequestContext:
    """FastAPI dependency: the RequestContext attached by the gateway
    middleware. Route handlers depend on this — never on tokens."""
    ctx = getattr(request.state, "ctx", None)
    if ctx is None:
        # The gateway middleware guarantees a context on every route; hitting
        # this means the middleware is not installed.
        raise RuntimeError("RequestContext missing — is AuthGatewayMiddleware installed?")
    return ctx
