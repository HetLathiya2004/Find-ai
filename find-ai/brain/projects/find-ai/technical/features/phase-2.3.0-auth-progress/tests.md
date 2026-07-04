# Phase 2.3.0 — Tests & Validation

Backend verified 2026-07-04 with a local TestClient harness: real PyJWT-signed
tokens against the actual app (middleware + routes), with `db.supabase`
replaced by an in-memory fake implementing the supabase-py query-builder
chain. **37/37 checks passed.** Mobile verified with `tsc --noEmit` (clean).

## Gateway middleware results

| Check | Result |
|-------|--------|
| `GET /health` public (no token) | PASS |
| 401 without token on all 7 resource route groups (courses, news, categories, concepts, me, me/progress, me/activity) | PASS |
| 401 on garbage token | PASS |
| 401 on token signed with wrong secret | PASS |
| 401 on expired token | PASS |
| 401 on wrong audience | PASS |
| 401 on non-Bearer scheme | PASS |
| Valid JWT → existing course routes work unchanged | PASS |
| `users` row self-healed for account without row | PASS |
| Tier lookups cached — 5 repeat requests, zero extra `users` queries | PASS |

## /me endpoint results

| Check | Result |
|-------|--------|
| `GET /me` returns profile with tier + email from token | PASS |
| `PUT /me` updates username | PASS |
| `PUT /me` duplicate username → 409 | PASS |
| `POST /me/progress` in_progress, then completed (sets completed_at) | PASS |
| Completed status never downgraded; max xp_earned kept | PASS |
| `POST /me/progress` unknown lesson_id → 404 | PASS |
| Invalid status/action → 422 | PASS |
| `POST /me/activity` increments total_xp, starts streak at 1 | PASS |
| Same-day second activity: streak unchanged, XP accumulates | PASS |
| Next-day activity: current_streak +1, longest_streak follows | PASS |
| `GET /me/activity` returns logged events | PASS |
| Progress isolated per user (second account sees empty list) | PASS |

## Admin auth coexistence results

| Check | Result |
|-------|--------|
| `/api/admin/*` with no credentials → 401 | PASS |
| Wrong `X-Admin-Key` → 401 | PASS |
| Valid `X-Admin-Key` → admin route works (legacy path intact) | PASS |
| Free-tier JWT on admin route → 403 | PASS |
| Admin-tier JWT on admin route → works | PASS |

## Mobile validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` after full mock → real swap (30 files) | PASS |
| No remaining `useMockAuth`/`useMockProgress` references | PASS (grep) |
| All 4 data hooks route through `apiFetch` (Bearer header) | PASS (code review) |
| Player screens unchanged (same progress context interface) | PASS |

## Not validated (blocked on credentials / device)

- [ ] Migration 002 against live Supabase (needs dashboard) — SQL is
  syntactically consistent with 001 conventions but not executed
- [ ] Signup trigger firing on a real `auth.users` insert
- [ ] RLS policies against a real anon-key client
- [ ] Google OAuth end-to-end on device (needs provider enabled + dev build;
  MMKV and the OAuth deep link don't work in Expo Go)
- [ ] Email confirmation flow (depends on project auth settings; signUp
  surfaces a "check your inbox" message when no session is returned)
- [ ] Token refresh over a long session on device
- [ ] Deployed backend on Oracle VM with real `SUPABASE_JWT_SECRET`

## Final validation status

| Layer | Status |
|-------|--------|
| JWT validation (all rejection paths) | PASS — 7 negative cases |
| Gateway coverage (no public resource routes) | PASS |
| Tier cache | PASS |
| /me profile / progress / activity | PASS — 12 checks incl. streak math |
| Admin coexistence | PASS — 5 checks |
| Migration SQL | Written, not executed (needs dashboard) |
| Mobile TypeScript | PASS |
| Mobile on-device auth flows | Pending dev build + Supabase config |

**Overall Phase 2.3:** **Code complete, locally verified, not yet deployed.**
Remaining work is configuration (migration, Google provider, env vars) — see
deploy steps in `implementation.md`.
