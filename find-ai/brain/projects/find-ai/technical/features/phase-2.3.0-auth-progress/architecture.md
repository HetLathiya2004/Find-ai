# Phase 2.3.0 — Architecture

## Core principle: Gateway auth, swappable provider

```
Layer 1: AuthGatewayMiddleware   — every request authenticated before any handler
Layer 2: auth/ package           — provider behind a single import point
Layer 3: routes/                 — handlers consume RequestContext, never tokens
```

There are no public resource routes. Only `/health` (load-balancer checks)
and CORS preflight (OPTIONS) bypass the gateway.

## Token flow

```
Mobile app signs in via Supabase Auth SDK
       |
access_token (JWT) + refresh_token — persisted via MMKV, refreshed by SDK
       |
Every API request: Authorization: Bearer <access_token>
       |
AuthGatewayMiddleware validates JWT locally (HS256, SUPABASE_JWT_SECRET)
       |
Decodes user_id + email from claims (sub, email; audience "authenticated")
       |
Tier lookup from users table (in-memory TTL cache, 5 min; self-heals missing rows)
       |
RequestContext(user_id, email, tier, permissions) -> request.state.ctx
       |
Route handler receives ctx via get_request_context dependency
```

No valid token → 401 with `WWW-Authenticate: Bearer`. Always.

## Swappable provider design (`auth/`)

```
auth/
├── models.py         AuthUser, RequestContext, AuthError — never changes
├── provider.py       single import point: get_current_user + get_request_context
├── supabase_auth.py  current provider — validates Supabase JWT, returns AuthUser
└── permissions.py    tier → permission sets (free/premium/admin), provider-agnostic
```

Provider contract: `get_current_user(authorization: str | None) -> AuthUser`,
raising `AuthError` on anything invalid. To swap providers, write a new
module satisfying the contract and change ONE import line in `provider.py`.
Routes and middleware only import from `provider.py` and `models.py`.

## Database schema (3 new tables)

```
auth.users (Supabase-managed)
  └── public.users (1:1, auto-created by on_auth_user_created trigger)
       ├── user_lesson_progress (PK: user_id + lesson_id → concepts.id)
       └── activity_log (append-only XP event stream)
```

| Table | Key columns |
|-------|-------------|
| `users` | id (PK → auth.users), username (unique), tier ('free'/'premium'/'admin', default 'free'), total_xp, current_streak, longest_streak, last_active_date |
| `user_lesson_progress` | user_id + lesson_id (composite PK), status ('in_progress'/'completed'), xp_earned, completed_at |
| `activity_log` | id (uuid PK), user_id, action ('lesson_complete'/'quiz_complete'/'sim_complete'/'streak_bonus'), xp_earned, created_at |

**Naming note:** the spec said `lesson_id → lessons.id`, but this schema has
no `lessons` table — `concepts` is the lesson/quiz/sim content unit — so
`lesson_id` references `concepts(id)`.

### Signup trigger

`handle_new_user()` (SECURITY DEFINER) fires AFTER INSERT on `auth.users`,
derives a username from the email local-part, appends a random suffix on
collision, and inserts into `public.users`. Works for both Google OAuth and
email/password signups.

### RLS

RLS enabled on all 3 tables: users can only SELECT/UPDATE/INSERT their own
rows (`auth.uid() = id / user_id`); users cannot change their own tier;
activity_log is append-only. This is defense-in-depth — the FastAPI gateway
uses the **service-role key** (bypasses RLS) and enforces authorization in
middleware. The course tables from Phase 2.2 keep RLS disabled.

## Admin auth coexistence

```
/api/admin/* request
   ├── X-Admin-Key valid?  → synthetic admin RequestContext, pass
   └── else: normal JWT flow → require_admin_key checks ctx.tier == 'admin'
                                (free/premium JWT → 403; no creds → 401)
```

`middleware/admin_auth.py` no longer reads headers itself — it checks the
context the gateway attached, so both credential types converge on one code
path.

## Tier cache

`TierCache` in `middleware/auth_gateway.py`: dict of user_id → (tier,
expiry), 5-minute TTL, 10k-entry cap with expired-entry sweep. DB lookup runs
in Starlette's threadpool (supabase-py is sync). A missing `users` row is
self-healed by inserting a default free-tier row (covers accounts that
predate the trigger).

## Protected API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/me` | Profile from users table (+ email from token) |
| PUT | `/api/v1/me` | Update username (409 on duplicate) |
| GET | `/api/v1/me/progress` | All progress rows for the user |
| POST | `/api/v1/me/progress` | Upsert progress; never downgrades completed; keeps max xp_earned |
| GET | `/api/v1/me/activity` | Recent activity (limit param, default 50) |
| POST | `/api/v1/me/activity` | Append event + roll XP/streak into profile; returns updated profile |

Streak logic on POST /me/activity: same day → unchanged; consecutive day →
+1; gap → reset to 1; longest_streak = max(longest, current).

## App architecture

```
lib/supabase.ts   Supabase client — PKCE flow, MMKV session storage adapter,
                  foreground-only token auto-refresh (AppState listener)
lib/api.ts        apiFetch/apiGet/apiPost/apiPut — reads access token via
                  supabase.auth.getSession() (auto-refreshes), attaches Bearer header
hooks/useAuth     AuthProvider — session state, email/password + Google OAuth
                  (expo-web-browser + findai:// deep link + code exchange),
                  device-local prefs (onboarded/goal/dailyGoalMinutes),
                  username sync via PUT /me
hooks/useProgress ProgressProvider — same context interface as the old mock;
                  server is source of truth for XP/streaks/completions,
                  device keeps UI granularity (card index, quiz best score,
                  read news ids, daily goal/challenge) with optimistic writes
```

## Key decisions

| Decision | Rationale |
|----------|-----------|
| Middleware (BaseHTTPMiddleware) over route dependencies | Guarantees no route can be accidentally left public; single enforcement point |
| Local JWT validation (PyJWT + shared secret) | No network round-trip to Supabase per request; middleware stays fast |
| Tier lookup in middleware, not in token claims | Tier changes take effect within cache TTL without re-issuing tokens |
| In-memory TTL cache over Redis | Single-process uvicorn deployment; no new infra |
| Service-role key on backend | User tables have RLS; gateway is the authorization layer |
| RLS anyway | Defense-in-depth if the anon key is ever used against these tables directly |
| `lesson_id → concepts(id)` | No `lessons` table exists; concepts are the content unit |
| PKCE flow for Google OAuth | Redirect carries a one-time code, not tokens in a URL fragment |
| App keeps same progress context interface | Player screens (lesson/quiz/sim), home, learn, profile unchanged |
| Optimistic local writes + background POST | App stays responsive offline; re-syncs from profile responses |
| xpBonus split (news/challenge XP local-only) | activity_log action enum has no news/challenge actions; avoids XP display regressions |
| Admin key produces synthetic admin context | Admin routes have one authorization code path for both credential types |
