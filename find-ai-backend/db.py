"""Supabase client singleton for Find.ai backend."""

import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

_url = os.environ["SUPABASE_URL"]
_key = os.environ["SUPABASE_KEY"]

supabase: Client = create_client(_url, _key)
