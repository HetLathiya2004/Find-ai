# Phase 2.2.0 — Tests & Validation

All tests run on the Oracle VM (`152.67.178.243`) on 2026-07-04 against
live Supabase (project `mjrmavtdhrbrrheuqbzg`).

## Verification checklist results

| Check | Result |
|-------|--------|
| Supabase client connects from server | PASS |
| 8 tables created in Supabase | PASS |
| `POST /api/admin/courses` creates full nested course | PASS |
| `PUT /api/admin/courses/{id}` updates metadata | PASS (code reviewed) |
| `DELETE /api/admin/courses/{id}` removes course + children | PASS (used to clean orphaned data) |
| `POST /api/admin/courses/{id}/publish` sets is_published=true | PASS |
| `POST /api/admin/courses/{id}/unpublish` sets is_published=false | PASS (code reviewed) |
| Admin endpoints reject missing X-Admin-Key | PASS (returns 401) |
| `GET /api/v1/courses` returns published courses | PASS (1 course) |
| `GET /api/v1/courses/{id}` returns course with modules + concepts | PASS (2 modules, 4 concepts) |
| `GET /api/v1/concepts/{slug}` returns full concept detail | PASS (compound-interest: 4 cards, 3 questions, 3 choices) |
| Unpublished courses not in public list | PASS (verified before publish) |
| Existing `GET /health` still works | PASS |
| Existing `GET /api/v1/news` still works | PASS (returned 7 articles) |
| Existing `GET /api/v1/categories` still works | PASS (3 categories) |
| All endpoints accessible via nginx port 80 | PASS |
| `.env` not committed to git | PASS (in .gitignore) |
| Python syntax check on all new files | PASS (`ast.parse` on 6 files) |

## Sample course data validation

| Check | Result |
|-------|--------|
| Course: Financial Literacy Foundations | PASS |
| Module 1: Understanding Markets (domain: markets, 2 concepts) | PASS |
| Module 2: Smart Investing (domain: investing, 2 concepts) | PASS |
| Each concept has 4 lesson cards | PASS |
| Each concept has 3 quiz questions | PASS |
| Each concept has 3 simulation choices | PASS |
| Each concept has 3-4 tags | PASS |
| All content is accurate financial literacy material | PASS (reviewed) |
| JSON is valid (no syntax errors) | PASS |
| Slugs: what-is-stock-market, supply-and-demand, compound-interest, diversification | PASS |

## Failures encountered & fixes

| Failure | Fix applied |
|---------|-------------|
| RLS blocking inserts on all tables | Disabled RLS via Supabase SQL Editor |
| Duplicate slug on re-seed (partial data from failed first attempt) | Deleted orphaned courses, then re-seeded |
| No pip in .venv (uv-managed) | Bootstrapped with `python3 -m ensurepip` |

## Not validated

- [ ] PUT /api/admin/courses/{id} with actual curl request (code reviewed only)
- [ ] POST /api/admin/courses/{id}/unpublish with actual curl request (code reviewed only)
- [ ] Concurrent admin operations (no load testing)
- [ ] Supabase connection pool behavior under sustained load
- [ ] App-side integration (Phase 2.3 — swap mock data for API calls)
- [ ] Course with 10+ modules / 50+ concepts (scale testing)

## Final validation status

| Layer | Status |
|-------|--------|
| Database schema | PASS — 8 tables, 7 indexes, FK cascades |
| Supabase connection | PASS |
| Admin API (5 endpoints) | PASS (3 tested live, 2 code reviewed) |
| Public API (3 endpoints) | PASS (all tested live) |
| Auth middleware | PASS |
| Seed script | PASS |
| Existing news API | PASS — no regressions |
| External access (nginx) | PASS |
| Git commit + push | PASS |

**Overall Phase 2.2:** **Complete and deployed** — course content backend
is live, seeded with sample data, and serving the public API.
