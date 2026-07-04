# Phase 2.2.0 — Course Content Backend (Intent)

## Goal

Build the course content database and API layer for Find.ai. All course
content (lessons, quizzes, simulations) moves from hardcoded mock data into
a Supabase Postgres database. Admins upload courses via a protected API and
seed script. The React Native app consumes course data through public API
endpoints on the existing FastAPI server.

## Motivation

- Phase 1 UI runs on `constants/mock-data.ts` — 12 hardcoded concepts with
  no way to add, edit, or publish content without a code deploy.
- Phase 2.1 added a live news feed but learning content remains static.
- This phase makes course content a first-class backend resource: authored
  via admin API, stored in Supabase, served to the app via public endpoints.
- Enables non-engineers to manage courses via API tooling (Postman, scripts)
  without touching the codebase.

## Scope (IN)

| Area | Included |
|------|----------|
| Database | 8 Supabase Postgres tables: courses, modules, concepts, lesson_cards, quiz_questions, simulation_choices, concept_tags, tags |
| Public API | `GET /api/v1/courses`, `GET /api/v1/courses/{id}`, `GET /api/v1/concepts/{slug}` |
| Admin API | `POST /api/admin/courses`, `PUT /api/admin/courses/{id}`, `DELETE /api/admin/courses/{id}`, publish/unpublish |
| Auth | Admin endpoints protected by `X-Admin-Key` header |
| Seed script | `seed_course.py` — reads a JSON file and POSTs to admin API |
| Sample data | One complete sample course JSON with 2 modules, 4 concepts, real financial literacy content |

## Out of scope (later phases)

- User progress tracking (Phase 2.3)
- User accounts / Supabase Auth (Phase 2.3)
- Unlock logic between concepts (Phase 2.3)
- Recommendation engine based on concept_tags (Phase 2.4)
- Server-side quiz answer validation (Phase 2.3 — correct_index exposed for now)
- Web admin panel (future — CLI seed script for now)
- XP transactions / streaks / badges (Phase 2.3)

## Constraints

- Python 3.12 (uv-managed venv on Oracle VM)
- Supabase as database (cloud instance, can self-host later)
- supabase-py client library (not raw asyncpg)
- Must not break existing news API (Phase 2.1)
- All course content served through FastAPI — app never talks to Supabase directly
- Admin API key stored in .env, not hardcoded

## Success criteria

- [x] All 8 tables created in Supabase with proper FKs and cascading deletes
- [x] Sample course seeded via seed_course.py and visible at GET /api/v1/courses
- [x] Full concept detail (cards + questions + choices + tags) returned at GET /api/v1/concepts/{slug}
- [x] Admin can create, update, delete, publish, and unpublish courses
- [x] Unauthorized admin requests return 401
- [x] Existing news API unchanged and functional

## Related

- **Supabase:** `https://mjrmavtdhrbrrheuqbzg.supabase.co`
- **Server:** Oracle VM `152.67.178.243`, port 80 (nginx) -> port 8000 (uvicorn)
- **Commit:** `670b3a8` on `main`
- **Previous:** Phase 2.1 — News Backend (`../phase-2.1.0-news-backend/`)
- **Previous:** Phase 1 — Expo UI (`../phase-1-expo-ui/`)
- **Next:** Phase 2.3 — User progress, Supabase Auth, app integration
- **Mock data to replace:** `find-ai/constants/mock-data.ts` (concepts, lessons, quizzes, simulations)
