# Phase 2.4.0 — Implementation

## Files Changed

### Backend (`find-ai-backend/`)

| File | Action | Lines | Description |
|------|--------|-------|-------------|
| `auth/supabase_auth.py` | Modified | ~100 | Added ES256 support via PyJWKClient + JWKS endpoint. Detects algorithm from token header, dispatches to ES256 or HS256 decoder. |
| `routes/me.py` | Modified | ~345 | Replaced single-table queries with three-table schema. GET uses `get_user_progress` RPC. POST routes by `activity_type` to correct table. Added `LessonProgressItem`, `QuizProgressItem`, `SimulationProgressItem` models. |
| `migrations/003_split_progress_tables.sql` | New | ~160 | Drops old `user_lesson_progress`, creates three new tables, indexes, RLS policies, updated_at triggers, and `get_user_progress` RPC function. |
| `migrations/002_user_auth_tables.sql` | New | ~130 | Original user tables migration (users, activity_log, signup trigger, RLS). Created in Phase 2.3 session. |

### Mobile App (`find-ai/`)

| File | Action | Lines | Description |
|------|--------|-------|-------------|
| `lib/api.ts` | Modified | ~55 | Added `import { supabase }` and Bearer token attachment via `supabase.auth.getSession()` on every request. |

### Server Deployment

| Action | Detail |
|--------|--------|
| Uploaded `auth/` folder | 5 files (models, provider, supabase_auth, permissions, __init__) |
| Uploaded `routes/me.py` | Updated with three-table schema |
| Uploaded `middleware/auth_gateway.py` | Gateway middleware (was missing from server) |
| Uploaded `middleware/admin_auth.py` | Updated admin auth check |
| Uploaded `main.py` | Updated with me_router import |
| Uploaded `db.py` | Updated to prefer SUPABASE_SERVICE_KEY |
| Added `SUPABASE_SERVICE_KEY` to `.env` | Service role key bypasses RLS |
| Restarted uvicorn | Server healthy at 152.67.178.243:8000 |

## Key Implementation Choices

1. **Column renamed: `lesson_id` → `concept_id`** across all three tables. The old name was misleading — it always referenced `concepts.id`, not a separate "lessons" table.

2. **RPC over parallel queries** for the read path. `get_user_progress` is `SECURITY DEFINER` + `STABLE` — one network hop, three subqueries inside Postgres.

3. **Single POST endpoint** with `activity_type` routing rather than three separate endpoints (`/me/progress/lesson`, etc.). Simpler for the mobile app — one `postProgress` function handles all types.

4. **JWKS client cached for 1 hour** via `PyJWKClient(cache_keys=True, lifespan=3600)`. No DB or network call per request for token validation.

## What's NOT Done (Next Phase)

The mobile app's `useProgress.tsx` still sends the OLD payload format:
- Sends `lesson_id` instead of `concept_id`
- Missing `activity_type` field
- `completeQuiz` and `completeSimulation` never call `postProgress`
- GET `/me/progress` response parsing expects `{ progress: [...] }` not `{ lessons, quizzes, simulations }`
- `types/api.ts` has stale type definitions

These errors are silently swallowed by `.catch(() => {})`, so the app appears functional but progress is local-only.

## Git History

```
77f0376 Fix auth: ES256 JWT support, Bearer token on all API calls, user tables migration
```

## Deploy Instructions

```bash
# Upload files to Oracle VM
scp -i ~/.ssh/orecal.key -r find-ai-backend/auth ubuntu@152.67.178.243:/home/ubuntu/find-ai-backend/
scp -i ~/.ssh/orecal.key find-ai-backend/routes/me.py ubuntu@152.67.178.243:/home/ubuntu/find-ai-backend/routes/
scp -i ~/.ssh/orecal.key find-ai-backend/middleware/auth_gateway.py ubuntu@152.67.178.243:/home/ubuntu/find-ai-backend/middleware/
scp -i ~/.ssh/orecal.key find-ai-backend/main.py ubuntu@152.67.178.243:/home/ubuntu/find-ai-backend/
scp -i ~/.ssh/orecal.key find-ai-backend/db.py ubuntu@152.67.178.243:/home/ubuntu/find-ai-backend/

# Restart
ssh -i ~/.ssh/orecal.key ubuntu@152.67.178.243 \
  "kill \$(ps aux | grep 'uvicorn.*8000' | grep -v grep | awk '{print \$2}'); sleep 3; \
   cd /home/ubuntu/find-ai-backend && nohup .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/findai.log 2>&1 &"
```

## Run Migration

Run `003_split_progress_tables.sql` in the Supabase SQL Editor (backend project: mjrmavtdhrbrrheuqbzg).
