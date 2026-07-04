# Phase 2.2.0 — System Exploration

## Infrastructure

### Server (Oracle Cloud VM)

- **IP:** 152.67.178.243
- **OS:** Ubuntu 20.04.6 LTS (Focal Fossa), x86_64
- **Python:** 3.12.12 in `.venv` (bootstrapped pip via `ensurepip`)
- **Networking:** nginx on port 80 -> uvicorn on port 8000
- **Other services:** scraper_api on port 8081 (untouched)
- **SSH:** `ssh -i ~/.ssh/orecal.key ubuntu@152.67.178.243`

### Supabase

- **URL:** `https://mjrmavtdhrbrrheuqbzg.supabase.co`
- **Key:** publishable/anon key (`sb_publishable_...`)
- **RLS:** Disabled on all 8 course tables
- **Connection flow:** FastAPI -> supabase-py -> Supabase REST API -> Postgres

### Backend layout (after Phase 2.2)

```
find-ai-backend/
├── .env                     ← Supabase creds + admin key (gitignored)
├── .gitignore               ← __pycache__, *.pyc, .venv/, .env
├── main.py                  ← FastAPI entry point, news routes + router includes
├── db.py                    ← Supabase client singleton
├── seed_course.py           ← CLI seeder: python seed_course.py courses/file.json
├── requirements.txt         ← 7 deps: fastapi, uvicorn, curl_cffi, pyyaml, pydantic, supabase, python-dotenv
├── config/
│   ├── feeds.yaml           ← RSS feed definitions (3 feeds)
│   └── concepts.yaml        ← keyword -> concept mapping (13 concepts)
├── core/
│   ├── registry.py          ← handler dispatch
│   ├── mapper.py            ← keyword-based concept matching
│   └── enricher.py          ← article enrichment stub
├── handlers/
│   ├── google_news.py       ← Google News RSS fetcher (curl_cffi)
│   └── generic_rss.py       ← Standard RSS/Atom fetcher
├── models/
│   └── schemas.py           ← Pydantic models for news API
├── middleware/
│   └── admin_auth.py        ← X-Admin-Key header check
├── routes/
│   ├── courses.py           ← Public course API (3 endpoints)
│   └── admin.py             ← Admin course API (5 endpoints)
├── migrations/
│   └── 001_course_tables.sql ← 8 tables + 7 indexes
├── courses/
│   └── sample-course.json   ← Seed data: Financial Literacy Foundations
└── .venv/                   ← Python 3.12 venv
```

### All API endpoints (combined)

| Method | Endpoint | Source | Auth |
|--------|----------|--------|------|
| GET | `/health` | main.py | None |
| GET | `/api/v1/categories` | main.py | None |
| GET | `/api/v1/news` | main.py | None |
| GET | `/api/v1/news/{category}` | main.py | None |
| GET | `/api/v1/courses` | routes/courses.py | None |
| GET | `/api/v1/courses/{id}` | routes/courses.py | None |
| GET | `/api/v1/concepts/{slug}` | routes/courses.py | None |
| POST | `/api/admin/courses` | routes/admin.py | X-Admin-Key |
| PUT | `/api/admin/courses/{id}` | routes/admin.py | X-Admin-Key |
| DELETE | `/api/admin/courses/{id}` | routes/admin.py | X-Admin-Key |
| POST | `/api/admin/courses/{id}/publish` | routes/admin.py | X-Admin-Key |
| POST | `/api/admin/courses/{id}/unpublish` | routes/admin.py | X-Admin-Key |

## Database schema

8 tables, all in Supabase Postgres (RLS disabled):

```
courses ──1:N──> modules ──1:N──> concepts ──1:N──> lesson_cards
                                            ──1:N──> quiz_questions
                                            ──1:N──> simulation_choices
                                            ──N:M──> tags (via concept_tags)
```

- UUIDs as primary keys (gen_random_uuid)
- ON DELETE CASCADE on all foreign keys
- order_index on every table for deterministic sorting
- is_published on courses for draft/live control
- slug on concepts for URL routing (unique)
- options as jsonb on quiz_questions (always 4 strings)

## Live data

**Course:** Financial Literacy Foundations
**Course ID:** `b97be096-42dd-447b-9c88-54a1e8350c9a`
**Status:** Published

| Module | Domain | Concepts |
|--------|--------|----------|
| Understanding Markets | markets | what-is-stock-market, supply-and-demand |
| Smart Investing | investing | compound-interest, diversification |

Each concept: 4 lesson cards, 3 quiz questions, 3 simulation choices, 3-4 tags.

## Issues discovered during implementation

| Issue | Resolution |
|-------|------------|
| Supabase RLS blocks inserts with anon key | Disabled RLS on all 8 tables via SQL Editor |
| Partial insert on cascade failure | First seed partially inserted before RLS error; had to clean orphaned data and re-seed |
| No pip in uv-managed venv | Bootstrapped with `python3 -m ensurepip` |
| Service role key not available | Using anon key with RLS disabled; sufficient for current phase |

## Mock data being replaced (Phase 2.3 app integration)

Currently in `find-ai/constants/mock-data.ts`:

| Mock data | Count | Replacement |
|-----------|-------|-------------|
| MOCK_CONCEPTS | 12 concepts, 4 domains | concepts table |
| MOCK_LESSONS | 12 lessons, ~4 cards each | lesson_cards table |
| MOCK_QUIZZES | 12 quizzes, 3 questions each | quiz_questions table |
| MOCK_SIMULATIONS | 12 simulations, 3 choices each | simulation_choices table |

The app's Learn tab, Lesson player, Quiz player, and Simulation player
will eventually read from the API instead of mock-data.ts. This wiring
happens in Phase 2.3.
