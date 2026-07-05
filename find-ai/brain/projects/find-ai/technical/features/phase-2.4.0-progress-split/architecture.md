# Phase 2.4.0 — Architecture

## Key Decision: Three Tables vs. One Table with Nullable Fields

**Chosen: Three separate tables.** Each activity type has only the columns it needs — zero nullable fields.

### Schema

```
user_lesson_progress
├── user_id (uuid FK → users.id)       PK ─┐
├── concept_id (uuid FK → concepts.id) PK ─┘
├── status ('in_progress' | 'completed')
├── card_index (int, default 0)         ← lesson resume position
├── xp_earned (int, default 0)
├── completed_at (timestamptz)
├── created_at / updated_at

user_quiz_progress
├── user_id (uuid FK → users.id)       PK ─┐
├── concept_id (uuid FK → concepts.id) PK ─┘
├── status ('in_progress' | 'completed')
├── best_score (int, default 0)         ← 0-100
├── passed (boolean, default false)
├── xp_earned (int, default 0)
├── completed_at (timestamptz)
├── created_at / updated_at

user_simulation_progress
├── user_id (uuid FK → users.id)       PK ─┐
├── concept_id (uuid FK → concepts.id) PK ─┘
├── status ('in_progress' | 'completed')
├── xp_earned (int, default 0)
├── completed_at (timestamptz)
├── created_at / updated_at
```

### RPC: `get_user_progress(p_user_id uuid)`

Single Postgres function that returns all three tables in one JSON response:

```json
{
  "lessons": [{"concept_id": "...", "status": "completed", "card_index": 5, "xp_earned": 25}],
  "quizzes": [{"concept_id": "...", "best_score": 85, "passed": true, "xp_earned": 30}],
  "simulations": [{"concept_id": "...", "status": "completed", "xp_earned": 20}]
}
```

Called via `supabase.rpc("get_user_progress", {"p_user_id": uid})` — one network round-trip instead of three.

### POST /me/progress — Unified Endpoint with `activity_type` Routing

The mobile app sends:
```json
{"activity_type": "quiz", "concept_id": "abc-123", "status": "completed", "best_score": 85, "passed": true, "xp_earned": 30}
```

The backend routes the upsert to the correct table via `_TABLE_FOR_TYPE` lookup. Guard logic per type:
- **All types:** Never downgrade `completed` → `in_progress`, keep max `xp_earned`
- **Quiz only:** Keep max `best_score`, once `passed` stays `passed` (OR logic)
- **Lesson only:** Includes `card_index` for resume position

### ES256 JWT Validation

Supabase newer projects sign access tokens with ES256 (ECDSA). The auth provider now:
1. Reads the token's `alg` header without verifying
2. ES256 → fetches signing key from Supabase JWKS endpoint (cached 1hr)
3. HS256 → uses `SUPABASE_JWT_SECRET` env var (legacy fallback)

Both paths validate audience=`authenticated`, require `exp` and `sub` claims.

### Lock Progression

The concept detail screen gates activities linearly:
```
Lesson  →  always unlocked
Quiz    →  locked until lessonStatus === 'completed'
Simulation → locked until quizPassed === true
```

With all three progress types now server-backed, this lock state survives app uninstall.

## Data Flow

```
Mobile App
  ├── Sign in → Supabase Auth (direct) → JWT
  ├── All API calls → Bearer JWT → FastAPI Gateway Middleware
  │   ├── Validate ES256 JWT via JWKS
  │   ├── Resolve user tier (cached 5min)
  │   └── Attach RequestContext(user_id, email, tier, permissions)
  ├── GET /me/progress → RPC get_user_progress → 3 tables in 1 call
  ├── POST /me/progress → route by activity_type → upsert correct table
  └── POST /me/activity → activity_log + update XP/streak on users table
```
