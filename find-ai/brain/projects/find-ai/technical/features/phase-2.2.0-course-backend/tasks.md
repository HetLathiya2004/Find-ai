# Phase 2.2.0 — Tasks

Status legend: `[x]` done - `[ ]` pending - `[-]` deferred

## Section 1 — Database setup

- [x] Create SQL migration file (`migrations/001_course_tables.sql`)
- [x] Run migration in Supabase SQL Editor — create all 8 tables
- [x] Disable RLS on all 8 tables (Supabase enables RLS by default)
- [x] Verify tables, FKs, cascading deletes, and indexes in Supabase dashboard

## Section 2 — Supabase connection

- [x] Create `.env` with SUPABASE_URL, SUPABASE_KEY, ADMIN_API_KEY
- [x] Add `.env` to `.gitignore`
- [x] Create `db.py` — singleton supabase client
- [x] Add `supabase` and `python-dotenv` to `requirements.txt`

## Section 3 — Admin auth middleware

- [x] Create `middleware/admin_auth.py` — X-Admin-Key header check
- [x] Return 401 on missing or invalid key
- [x] Test: request without key -> 401, with correct key -> passes through

## Section 4 — Admin API

- [x] Create `routes/admin.py` with APIRouter prefix `/api/admin`
- [x] `POST /api/admin/courses` — full course JSON insert (course -> modules -> concepts -> cards/questions/choices/tags)
- [x] `PUT /api/admin/courses/{course_id}` — update course metadata
- [x] `DELETE /api/admin/courses/{course_id}` — delete course (CASCADE)
- [x] `POST /api/admin/courses/{course_id}/publish` — set is_published = true
- [x] `POST /api/admin/courses/{course_id}/unpublish` — set is_published = false
- [x] Register admin router in main.py

## Section 5 — Public API

- [x] Create `routes/courses.py` with APIRouter prefix `/api/v1`
- [x] `GET /api/v1/courses` — list published courses
- [x] `GET /api/v1/courses/{course_id}` — course with nested modules and concepts
- [x] `GET /api/v1/concepts/{slug}` — full concept detail (cards, questions, choices, tags)
- [x] Register courses router in main.py

## Section 6 — Seed script and sample data

- [x] Create `courses/sample-course.json` — "Financial Literacy Foundations" with 2 modules, 4 concepts, real content
- [x] Create `seed_course.py` — reads JSON, POSTs to admin API
- [x] Seed sample course and verify via public API
- [x] Publish seeded course

## Section 7 — Deployment

- [x] Deploy updated backend to Oracle VM (152.67.178.243)
- [x] Install new dependencies (supabase, python-dotenv, requests)
- [x] Set .env on server
- [x] Restart uvicorn process
- [x] Verify all endpoints externally on port 80

## Section 8 — Validation

- [x] Existing news API still works (/health, /api/v1/news, /api/v1/categories)
- [x] GET /api/v1/courses returns sample course
- [x] GET /api/v1/courses/{id} returns nested modules/concepts
- [x] GET /api/v1/concepts/{slug} returns full detail with cards/questions/choices/tags
- [x] POST without X-Admin-Key -> 401
- [x] DELETE course -> CASCADE removes all children
- [x] Unpublished course not visible in public API
- [x] Git commit and push to GitHub

## Phase 2.3 — User Progress (NOT started, future)

- [ ] User accounts via Supabase Auth
- [ ] user_progress table (per-user per-concept status)
- [ ] Progress API endpoints (complete lesson, submit quiz, complete sim)
- [ ] Server-side quiz validation (remove correct_index from public response)
- [ ] Unlock logic between concepts
- [ ] XP transactions, streaks, badges
- [ ] App integration — swap mock data for API calls
