# Phase 2.3.0 — Auth Middleware + User Data Layer (Intent)

## Goal

Add gateway-style authentication to the Find.ai backend and a real user data
layer. Every single request passes through auth middleware before reaching
any route handler — no public resource routes, no valid token means 401,
always. The mobile app replaces its Phase 1 mock auth/progress with real
Supabase Auth and server-backed progress.

## Motivation

- Phase 1 auth is a mock: any email "signs in", nothing is validated, and
  XP/streaks/progress live only on the device.
- Phase 2.2 left every public endpoint wide open — anyone can scrape course
  content and news.
- User progress must survive reinstalls and sync across devices, which
  requires accounts and server-side storage.
- Tiers (free/premium/admin) need to exist before any premium content or
  admin tooling can be gated.

## Scope (IN)

| Area | Included |
|------|----------|
| Auth providers | Supabase Auth: Google OAuth (Supabase built-in provider) + email/password |
| Middleware | `AuthGatewayMiddleware` — validates JWT on every request, builds `RequestContext`, attaches to request state |
| Swappable design | `auth/` package: `models.py`, `provider.py` (single swap point), `supabase_auth.py`, `permissions.py` |
| Database | 3 new tables: `users`, `user_lesson_progress`, `activity_log` + signup trigger + RLS policies |
| Protected API | `GET/PUT /api/v1/me`, `GET/POST /api/v1/me/progress`, `GET/POST /api/v1/me/activity` |
| Existing routes | Courses, concepts, news, categories now all require a Bearer token |
| Admin auth | Legacy `X-Admin-Key` still works on `/api/admin/*`; admin-tier JWTs work there too |
| Tier cache | In-memory TTL cache for tier lookups — no DB hit per request |
| App auth | `useAuth` replaces `useMockAuth` — real sign-in/up, Google OAuth (PKCE), session restore, MMKV persistence |
| App progress | `useProgress` replaces `useMockProgress` — syncs XP/streaks/completions through `/me` endpoints |
| App API layer | `lib/api.ts` attaches `Authorization: Bearer <access_token>` to every fetch |

## Out of scope (later phases)

- Server-side quiz answer validation (`correct_index` still in public response)
- Unlock logic between concepts
- Streak freezes (client shows 0 — not modeled server-side)
- Badges, leagues, daily challenges server-side (still device-local)
- Password reset / email confirmation UX flows
- Rate limiting

## Constraints

- Middleware stays in Python — backend is already FastAPI
- Swapping auth providers must touch exactly one file (`auth/provider.py`)
- Route handlers never see raw tokens — only `RequestContext`
- Cache tier lookups; don't hit the DB on every request
- Existing `X-Admin-Key` admin auth keeps working
- Don't break existing course content or news functionality
- App keeps its FastAPI-gateway pattern — Supabase is used for auth only,
  never for data access from the app

## Success criteria

- [x] Every resource route returns 401 without a valid token (verified: 37/37 local checks)
- [x] Valid JWT → `RequestContext(user_id, email, tier, permissions)` reaches handlers
- [x] Tier lookups cached (verified: no extra `users` queries on repeat requests)
- [x] `users` row auto-created on signup via trigger; middleware self-heals missing rows
- [x] RLS policies scope all user rows to `auth.uid()`
- [x] `X-Admin-Key` and admin-tier JWT both work on admin routes; free-tier JWT gets 403
- [x] App signs in with email/password and Google, stores session in MMKV
- [x] All app fetch hooks send Bearer tokens
- [x] Progress/XP/streaks persist server-side and re-sync on launch
- [ ] Migration run on live Supabase project (needs dashboard access)
- [ ] Google provider enabled in Supabase Auth settings (needs dashboard access)
- [ ] Deployed to Oracle VM with new env vars

## Related

- **Supabase:** `https://mjrmavtdhrbrrheuqbzg.supabase.co` (project ref `mjrmavtdhrbrrheuqbzg`)
- **Server:** Oracle VM `152.67.178.243`, port 80 (nginx) → port 8000 (uvicorn)
- **Branch:** `cursor/auth-middleware-user-data-ff54`, PR #6
- **Previous:** Phase 2.2 — Course Backend (`../phase-2.2.0-course-backend/`)
- **Previous:** Phase 2.1 — News Backend (`../phase-2.1.0-news-backend/`)
- **Mock code replaced:** `find-ai/hooks/useMockAuth.tsx`, `find-ai/hooks/useMockProgress.tsx` (deleted)
