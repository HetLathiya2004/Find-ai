# Phase 2.4.0 — Split Progress Tables + ES256 Auth Fix

## Goal

Replace the single `user_lesson_progress` table with three purpose-built tables — one per activity type (lesson, quiz, simulation) — so quiz scores, pass status, and simulation completion survive app uninstall. Fix the auth provider to support ES256 JWTs (Supabase's default signing algorithm for newer projects).

## Motivation

Phase 2.3.0 built the auth middleware and user data layer, but:
1. Only lesson progress was saved to the server. Quiz best scores, pass status, and simulation completion lived only in MMKV — lost on uninstall.
2. The `user_lesson_progress` table had nullable fields to accommodate quiz-specific data (score, passed) — a design smell.
3. The Supabase project uses ES256-signed JWTs, but `supabase_auth.py` only supported HS256. Auth was silently failing.
4. The mobile app's `lib/api.ts` was not attaching the Bearer token to API requests.

## Scope

### In scope
- Split `user_lesson_progress` into 3 clean tables (no nullables)
- Add `get_user_progress` Postgres RPC for single-call fetch
- Update `routes/me.py` to use the new schema
- Fix `supabase_auth.py` for ES256 via JWKS
- Fix `lib/api.ts` to attach Bearer token
- Deploy to Oracle Cloud VM
- Add `SUPABASE_SERVICE_KEY` to server `.env`

### Out of scope
- Updating the mobile `useProgress.tsx` hook to match the new backend API (next phase)
- Practice screen fixes (still uses mock data)
- Daily goal reset logic
- 401 interceptor
- Permission enforcement in routes

## Success Criteria

- [x] Backend validates ES256 JWTs correctly
- [x] Every API request carries the Bearer token
- [x] Three progress tables exist with no nullable columns
- [x] RPC returns all progress in one call
- [x] `POST /me/progress` accepts `activity_type` and routes to the correct table
- [x] Guard logic preserved: never downgrade completed, keep max scores
- [x] Server deployed and healthy at 152.67.178.243
