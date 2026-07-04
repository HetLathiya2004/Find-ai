# Phase 2.2.0 — Architecture

## Core principle: Database-driven content

```
Layer 1: Supabase Postgres           — single source of truth for all course content
Layer 2: FastAPI (main.py, routes/)  — public + admin API, Supabase client
Layer 3: Seed script + JSON files    — admin uploads courses via CLI
```

Adding a course = write a JSON file, run `python seed_course.py courses/my-course.json`.
No code changes needed. The admin API validates and inserts everything.

## Data flow

```
Admin writes JSON
       |
seed_course.py -> POST /api/admin/courses (X-Admin-Key header)
       |
FastAPI validates -> supabase-py inserts into Postgres
       |
App calls GET /api/v1/courses or GET /api/v1/concepts/{slug}
       |
FastAPI queries Supabase -> returns nested JSON response
```

## Database schema (8 tables)

```
courses (top-level container)
  └── modules (sections within a course, each has a domain for color coding)
       └── concepts (individual topics — holds lesson/quiz/sim settings inline)
            ├── lesson_cards (ordered swipeable content cards)
            ├── quiz_questions (MCQs with options as jsonb)
            ├── simulation_choices (scenario decision options)
            └── concept_tags (many-to-many with tags table)

tags (registry of all available tags with optional category)
```

### Why settings are inline on concepts

Each concept has exactly one lesson, one quiz, one simulation. Instead of
three separate tables with 1:1 relationships, lesson/quiz/sim metadata
(xp_reward, pass_threshold, title, scenario) lives directly on the
`concepts` row. Only the repeating children (cards, questions, choices)
get their own tables. This eliminates 3 joins per concept query.

## Table relationships

```
courses 1──N modules 1──N concepts 1──N lesson_cards
                                   1──N quiz_questions
                                   1──N simulation_choices
                                   N──M tags (via concept_tags)
```

All foreign keys use ON DELETE CASCADE — deleting a course removes
everything underneath it automatically.

## Key constraints

- `courses.difficulty` CHECK: `beginner`, `intermediate`, `advanced`
- `modules.domain` CHECK: `markets`, `investing`, `macro`, `corporate_finance`
- `simulation_choices.outcome` CHECK: `risky`, `strategic`, `balanced`
- `concepts.slug` UNIQUE — used for URL-friendly lookups
- `concept_tags` composite PK: `(concept_id, tag)` — no duplicates

## API architecture

### Public API (app consumes)

| Endpoint | Query pattern | Returns |
|----------|--------------|---------|
| `GET /api/v1/courses` | `courses WHERE is_published = true ORDER BY order_index` | List of course summaries |
| `GET /api/v1/courses/{id}` | Course + join modules + join concepts, all ordered | Full course tree (no cards/questions) |
| `GET /api/v1/concepts/{slug}` | Concept by slug + 4 parallel queries for cards, questions, choices, tags | Complete concept with all content |

### Admin API (protected by X-Admin-Key)

| Endpoint | Operation |
|----------|-----------|
| `POST /api/admin/courses` | Insert full course tree from JSON payload |
| `PUT /api/admin/courses/{id}` | Update course metadata only |
| `DELETE /api/admin/courses/{id}` | Delete course (CASCADE cleans children) |
| `POST /api/admin/courses/{id}/publish` | Set is_published = true |
| `POST /api/admin/courses/{id}/unpublish` | Set is_published = false |

## Key decisions

| Decision | Rationale |
|----------|-----------|
| Supabase (Postgres) over SQLite | Open-source, self-hostable, built-in dashboard, ready for Phase 2.3 auth |
| supabase-py over raw asyncpg | Simpler client, matches Supabase ecosystem, sufficient for current scale |
| JSON seed files over YAML | No extra parser dependency, standard format, easy to validate |
| Inline lesson/quiz/sim on concepts | 1:1 relationship — separate tables add joins without value |
| options as jsonb | Always 4 strings, no benefit to a separate quiz_options table |
| concept_tags + tags tables | Enables future recommendation engine (Phase 2.4) without schema changes |
| order_index on every table | Deterministic sort order, admin controls sequence, easy reordering |
| is_published flag | Admins can stage courses before making them visible to users |
| Admin API key (not Supabase RLS) | Simple for Phase 2.2, RLS can be added in Phase 2.3 with user auth |
| App -> FastAPI -> Supabase (not direct) | FastAPI controls what data is exposed, handles validation, single gateway |
| RLS disabled on all tables | Anon key used for simplicity; API-layer auth is sufficient for now |
| Pydantic validators on enums | Catches bad difficulty/domain/outcome at API boundary, not DB level |
| Nested JSON ingestion | Single POST creates entire course tree — natural for content authoring |

## Indexes

- `modules(course_id)` — course detail query
- `concepts(module_id)` — module detail query
- `concepts(slug)` — concept lookup by slug
- `lesson_cards(concept_id)` — cards for a concept
- `quiz_questions(concept_id)` — questions for a concept
- `simulation_choices(concept_id)` — choices for a concept
- `concept_tags(tag)` — future tag-based queries for recommendations

## Phase 2.3 integration points

- User progress -> new `user_progress` table with FK to `concepts(id)`
- Auth -> Supabase GoTrue, add user_id to progress queries
- Unlock logic -> `unlock_after` column on concepts (nullable FK to self)
- Quiz validation -> move correct_index check to server, remove from public response
- App mock data swap -> replace `constants/mock-data.ts` with API calls
