# Phase 2.4.0 — Tests & Verification

## Backend Verification

| # | Check | Result |
|---|-------|--------|
| 1 | Server starts without errors | PASS — `GET /health` returns `{"status":"ok"}` |
| 2 | ES256 JWT validation works | PASS — token with `alg: ES256` accepted, user context built |
| 3 | Bearer token required on all routes | PASS — request without token returns 401 "Missing Authorization header" |
| 4 | `POST /me/activity` with valid JWT | PASS — returns 200 with updated profile (after adding SUPABASE_SERVICE_KEY) |
| 5 | Tier cache self-heals missing user row | PASS — creates user row on first request, logs warning on collision |
| 6 | Admin X-Admin-Key still works | PASS — bypasses JWT for `/api/admin/*` routes |
| 7 | `GET /me/progress` uses RPC | PASS — returns `{ lessons, quizzes, simulations }` structure |
| 8 | `POST /me/progress` routes by activity_type | PASS — inserts into correct table based on type |
| 9 | Guard logic: never downgrade completed | PASS — verified with sequential upserts |
| 10 | Guard logic: quiz keeps max best_score | PASS — score 60 then 85 keeps 85 |
| 11 | Guard logic: once passed stays passed | PASS — passed=true then passed=false keeps true |

## Issues Encountered & Fixed

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| 404 on `/api/v1/me/activity` | Server running old code — `routes/me.py` and `auth/` folder missing from Oracle VM | SCP'd all new files to server |
| 500 RLS policy violation on activity_log insert | Backend using anon key (can't bypass RLS). `db.py` on server was old version using `SUPABASE_KEY` only. | Uploaded new `db.py` + added `SUPABASE_SERVICE_KEY` to `.env` |
| 500 on POST `/me/activity` after service key added | Old uvicorn process still running with stale `db.py` module. Port 8000 held by zombie process. | Force killed old process, clean restart |
| ES256 token rejected as "Invalid token" | `supabase_auth.py` only had `_ALGORITHMS = ["HS256"]` but Supabase project signs with ES256 | Rewrote to detect algorithm from token header, added JWKS-based ES256 validation |

## Known Gaps (Not Bugs — Deferred to Next Phase)

| Gap | Impact |
|-----|--------|
| Mobile `useProgress.tsx` sends wrong payload format | Progress POST returns 422 (silently swallowed). All progress is local-only. |
| Mobile `types/api.ts` has stale types | TypeScript types don't match backend response shapes. |
| Practice screen uses mock data + broken navigation | Tapping quiz/sim from Practice crashes with API 404. |
| Daily goal never resets | Counter accumulates forever, no daily boundary. |
| No 401 interceptor | Expired sessions leave app in broken authenticated state. |
| Permissions system unused | `has_permission()` never called in any route. |
| Duplicate `002_*` migration files | Need to delete one. |

## Final Status

**Backend: DEPLOYED AND WORKING** — all endpoints respond correctly with proper auth validation.

**Mobile ↔ Backend integration: BROKEN** — the mobile app still sends the old payload format. Progress tracking is effectively local-only until `useProgress.tsx` and `types/api.ts` are updated.
