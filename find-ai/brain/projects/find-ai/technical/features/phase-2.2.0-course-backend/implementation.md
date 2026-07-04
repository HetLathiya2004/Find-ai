# Phase 2.2.0 — Implementation Summary

## What was built

Course content backend for Find.ai — 8 Supabase tables, Supabase client
connection, admin API (5 endpoints), public API (3 endpoints), admin auth
middleware, seed script, and sample course data. Deployed and live on
Oracle VM at `152.67.178.243`.

## Files

| File | Lines | Responsibility |
|------|-------|----------------|
| `migrations/001_course_tables.sql` | ~90 | 8 tables + 7 indexes, run in Supabase SQL Editor |
| `db.py` | ~12 | Supabase client singleton, loads from `.env` |
| `.env` | 3 | `SUPABASE_URL`, `SUPABASE_KEY`, `ADMIN_API_KEY` (gitignored) |
| `middleware/__init__.py` | 0 | Package marker |
| `middleware/admin_auth.py` | ~10 | `require_admin_key` FastAPI dependency |
| `routes/__init__.py` | 0 | Package marker |
| `routes/admin.py` | ~200 | 5 admin endpoints + Pydantic request/response models |
| `routes/courses.py` | ~170 | 3 public endpoints + Pydantic response models |
| `seed_course.py` | ~25 | CLI: `python seed_course.py courses/sample-course.json` |
| `courses/sample-course.json` | ~500 | "Financial Literacy Foundations" — 2 modules, 4 concepts |

**Modified existing files:**

| File | Change |
|------|--------|
| `main.py` | Added `load_dotenv()`, imported + included both routers, bumped version to 2.2.0 |
| `requirements.txt` | Added `supabase`, `python-dotenv` |
| `.gitignore` | Added `.env` |

**No changes** to any existing news API files (`core/`, `handlers/`,
`models/schemas.py`, `config/`).

**Total new code:** ~1,072 lines across 12 files.

## Implementation choices & rationale

### Supabase client as singleton
`db.py` creates one `Client` at import time. All routes import from `db`.
No async client needed — supabase-py's sync client runs fine in FastAPI's
threadpool via `run_in_threadpool` (sync endpoint functions).

### Pydantic models in route files
Admin and public route files each define their own request/response models
inline rather than in a shared `models/` file. This keeps each router
self-contained and avoids circular imports with `db.py`.

### Nested insert cascade
`POST /api/admin/courses` accepts the entire course tree and inserts
top-down: course -> modules -> concepts -> cards/questions/choices/tags.
Each insert returns the generated UUID used as FK for child inserts.

### Tag upsert
`supabase.table("tags").upsert({...}, on_conflict="tag")` handles duplicate
tags across concepts cleanly — if "beginner" already exists, it's skipped.

### RLS disabled
Supabase enables RLS by default. The anon key was blocked from inserts
until RLS was disabled. Since the backend is the sole database client,
API-layer auth (`X-Admin-Key`) is sufficient.

## Behavior notes discovered during build

- **RLS blocking inserts:** First seed attempt failed on `simulation_choices`
  insert due to RLS. Required manual `ALTER TABLE ... DISABLE ROW LEVEL
  SECURITY` on all 8 tables via Supabase SQL Editor.
- **Partial insert on failure:** The cascade inserted course + modules +
  some concepts before hitting the RLS error. Had to clean orphaned data
  (delete courses) before re-seeding.
- **No pip in venv:** The `.venv` was created by `uv` which doesn't include
  pip. Bootstrapped with `python3 -m ensurepip --default-pip`.
- **Tag upsert works:** `on_conflict="tag"` silently skips existing tags.

## Deployment (2026-07-04)

| Step | Action |
|------|--------|
| 1 | SCP'd all new/modified files to server |
| 2 | Created directories: `middleware/`, `routes/`, `migrations/`, `courses/` |
| 3 | Installed deps: `pip install supabase python-dotenv requests` |
| 4 | User ran SQL migration in Supabase SQL Editor |
| 5 | User disabled RLS via SQL Editor |
| 6 | Killed old uvicorn, started new process |
| 7 | Seeded sample course via `seed_course.py` |
| 8 | Published course via `POST /api/admin/courses/{id}/publish` |

### How to run locally

```bash
cd find-ai-backend
pip install -r requirements.txt
# Create .env with SUPABASE_URL, SUPABASE_KEY, ADMIN_API_KEY
uvicorn main:app --host 0.0.0.0 --port 8000
```

### How to seed a course

```bash
python seed_course.py courses/sample-course.json
# Then publish:
curl -X POST http://localhost:8000/api/admin/courses/<course_id>/publish \
  -H "X-Admin-Key: findai_admin_2024_secret"
```

## Git

- **Branch:** `main`
- **Commit:** `670b3a8` — "Phase 2.2: Course content backend — Supabase DB, public + admin APIs"
- **Remote:** `https://github.com/HetLathiya2004/Find-ai`

## Phase 2.3 swap points

- `routes/courses.py` -> add user progress endpoints (XP earned, concept completion)
- `middleware/admin_auth.py` -> extend to support Supabase Auth JWT for user endpoints
- App `constants/mock-data.ts` -> replace with API calls to `/api/v1/courses` and `/api/v1/concepts/{slug}`
- Add React Query in app for caching + optimistic updates
