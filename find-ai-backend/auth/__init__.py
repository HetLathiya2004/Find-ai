"""Auth package for the Find.ai gateway.

Route handlers must only import from `auth.provider` and `auth.models` —
never from a concrete provider module — so the auth backend can be swapped
by editing a single import in `auth/provider.py`.
"""
