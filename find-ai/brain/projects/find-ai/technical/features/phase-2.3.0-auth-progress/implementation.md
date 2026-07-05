# Phase 2.3.0 — Implementation Summary

## What was built

Gateway auth middleware + swappable Supabase JWT provider + user data layer
(3 tables, trigger, RLS) + 6 protected `/me` endpoints on the backend; real
Supabase Auth (email/password + Google OAuth) and server-backed progress in
the mobile app. Built on branch `cursor/auth-middleware-user-data-ff54`
(PR #6). **Not yet deployed** — see deploy steps below.

## Backend files

| File | Lines | Responsibility |
|------|-------|----------------|
| `auth/__init__.py` | ~7 | Package marker + import-discipline note |
| `auth/models.py` | ~50 | `AuthUser`, `RequestContext`, `AuthError` dataclasses — never change |
| `auth/provider.py` | ~30 | Single swap point: re-exports `get_current_user`; `get_request_context` dependency |
| `auth/supabase_auth.py` | ~60 | Validates Supabase JWT (PyJWT, HS256, audience `authenticated`) |
| `auth/permissions.py` | ~45 | Tier → permission sets; `normalize_tier` |
| `middleware/auth_gateway.py` | ~170 | `AuthGatewayMiddleware` + `TierCache` (5 min TTL) + users-row self-heal |
| `routes/me.py` | ~250 | 6 endpoints: profile GET/PUT, progress GET/POST, activity GET/POST + streak math |
| `migrations/002_users_auth.sql` | ~120 | 3 tables, signup trigger, RLS policies, indexes |

**Modified existing files:**

| File | Change |
|------|--------|
| `main.py` | Added `AuthGatewayMiddleware` (before CORS so CORS wraps it), included `me_router`, version 2.3.0 |
| `middleware/admin_auth.py` | Rewritten: checks `request.state.ctx.tier == 'admin'` instead of reading the header itself |
| `db.py` | Prefers `SUPABASE_SERVICE_KEY` over `SUPABASE_KEY` (RLS bypass) |
| `requirements.txt` | Added `pyjwt` |
| `README.md` | Auth section: flow, env vars, swap instructions |

## App files

| File | Change |
|------|--------|
| `lib/supabase.ts` | NEW — client (PKCE), MMKV storage adapter, foreground-only auto-refresh |
| `lib/api.ts` | NEW — `apiFetch/apiGet/apiPost/apiPut` with Bearer header + 10s timeout + `ApiError` |
| `lib/storage.ts` | Added `getString`/`setString` for the Supabase storage adapter |
| `hooks/useAuth.tsx` | NEW — replaces `useMockAuth` (deleted); async signIn/signUp/signInWithGoogle/signOut |
| `hooks/useProgress.tsx` | NEW — replaces `useMockProgress` (deleted); same context interface, server-synced |
| `hooks/useNews.ts`, `useCourses.ts`, `useCourse.ts`, `useConcept.ts` | fetch → `apiFetch` (Bearer token) |
| `types/api.ts` | Added `ApiUserProfile`, `ApiProgressItem`, `ApiActivityItem` + response types |
| `app/_layout.tsx` | `AuthProvider` + `ProgressProvider` replace the mock providers |
| `app/index.tsx` | Waits for session restore (`loading`) before redirecting |
| `app/(auth)/sign-in.tsx`, `sign-up.tsx` | Async submit with busy state, Supabase error surfaces, "Continue with Google" button |
| 10 other screens | `useMockAuth`/`useMockProgress` imports → `useAuth`/`useProgress` (call sites unchanged) |
| `package.json` | Added `@supabase/supabase-js`, `react-native-mmkv`, `react-native-url-polyfill` |
| `.env.example` | NEW — `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| `.gitignore` | Added `.env` |

## Implementation choices & rationale

### JWT validated locally, not via Supabase API
`supabase_auth.py` decodes with the project's JWT secret (`SUPABASE_JWT_SECRET`,
HS256, audience `authenticated`, requires `exp` + `sub`). Missing secret fails
closed (401), never open.

### Middleware order
`add_middleware(AuthGatewayMiddleware)` then `add_middleware(CORSMiddleware)` —
last added is outermost, so CORS headers decorate 401 responses and OPTIONS
preflight is exempted in the gateway anyway.

### Tier lookup in threadpool
supabase-py is sync; the gateway's async `dispatch` calls
`run_in_threadpool(_fetch_tier_from_db, ...)` to avoid blocking the event
loop. Deferred `from db import supabase` inside the function lets tests patch
`db.supabase`.

### Progress upsert semantics
`POST /me/progress` reads the existing row first: a `completed` status is
never downgraded to `in_progress`, `xp_earned` keeps the max, and
`completed_at` is preserved. FK violation on unknown lesson_id → 404.

### Activity → profile rollup
`POST /me/activity` inserts the log row, then read-modify-writes the profile:
`total_xp += xp_earned`, streak same-day/consecutive/reset logic, returns the
updated profile so the client re-syncs in one round trip. (No atomic
increment in supabase-py — acceptable at current scale.)

### App: server/local state split
Server owns total XP, streaks, and per-concept completion. Device (MMKV) owns
lesson card resume index, quiz best score/passed, sim status, read news ids,
daily goal/challenge, and `xpBonus` (news + challenge XP — the activity_log
action enum doesn't include those). Displayed XP = server total + xpBonus.
Writes are optimistic; activity responses overwrite the server portion.
Progress storage resets on sign-out.

### Google OAuth in Expo
`signInWithOAuth({ skipBrowserRedirect: true })` → `WebBrowser.openAuthSessionAsync`
→ parse `?code=` from the `findai://auth/callback` redirect →
`exchangeCodeForSession(code)`. `expo-web-browser`, `expo-linking`, and the
`findai` scheme already existed in the app.

## Behavior notes discovered during build

- Old `require_admin_key` read the header directly; with the gateway also
  wanting to allow admin-tier JWTs, converging both on `request.state.ctx`
  was cleaner than teaching the dependency about JWTs.
- `users` self-heal needs a concurrent-insert fallback: two first requests
  can race the insert, so the except path re-reads before giving up.
- `react-native-mmkv` was already dynamically `require`d by `lib/storage.ts`
  with a memory fallback (Expo Go), so adding the real dependency required
  no storage code changes — Supabase sessions just need a dev build to
  actually persist.

## Deploy steps (not yet done — needs Supabase dashboard + VM access)

| Step | Action |
|------|--------|
| 1 | Run `migrations/002_users_auth.sql` in Supabase SQL Editor (project `mjrmavtdhrbrrheuqbzg`) |
| 2 | Supabase dashboard → Auth → Providers: enable Google (built-in) + Email |
| 3 | Add to backend `.env`: `SUPABASE_JWT_SECRET` (Settings → API), `SUPABASE_SERVICE_KEY` (service_role) |
| 4 | `pip install -r requirements.txt` (adds pyjwt), restart uvicorn |
| 5 | App: copy `.env.example` → `.env`, set `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `npm install` |
| 6 | Existing seeded content is unaffected — course tables untouched |

## Git

- **Branch:** `cursor/auth-middleware-user-data-ff54` → PR #6
- **Commits:** `ca011f3` (backend), `35ffee6` (mobile)
- **Remote:** `https://github.com/HetLathiya2004/Find-ai`

## Phase 2.4 swap points

- Server-side quiz validation → strip `correct_index` from public concept
  response; add `POST /me/quiz-attempts` that grades server-side
- Premium content → gate via `ctx.has_permission('content:premium')`
- Streak freezes → column on `users` + consume logic in `_apply_streak`
- News/challenge XP → extend `activity_log` action enum, fold `xpBonus` into server
- Auth provider swap → new module satisfying the provider contract + one
  import change in `auth/provider.py`
