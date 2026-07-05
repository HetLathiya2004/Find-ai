"""Supabase client singleton for Find.ai backend."""

import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

_url = os.environ["SUPABASE_URL"]
# Prefer the service-role key: user tables have RLS enabled and the gateway
# enforces authorization in middleware, so the backend needs to bypass RLS.
_key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ["SUPABASE_KEY"]

supabase: Client = create_client(_url, _key)
