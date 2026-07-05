# Phase 2.6.0 — Architecture

## Database

### New table: `user_daily_activity`
One row per user per day. Serves three features:
- **Streak calendar**: which days had activity
- **Daily goal**: `activities_completed` vs `daily_goal_target`
- **Leaderboard**: `total_xp` from `users` table (not weekly)

```
user_daily_activity (
    user_id              uuid PK FK → users(id)
    activity_date        date PK
    xp_earned            integer NOT NULL DEFAULT 0
    activities_completed integer NOT NULL DEFAULT 0
    created_at           timestamptz NOT NULL DEFAULT now()
)
```

### Altered `users` table
```
+ daily_goal_target    integer NOT NULL DEFAULT 3
+ streak_freeze_count  integer NOT NULL DEFAULT 0
```

## League Scoring

```
league_score = total_xp + (current_streak × 10)
```

- Uses **actual total XP** from `users.total_xp`, not weekly XP
- Streak bonus rewards consistency without inflating the real XP economy
- No weekly resets, no league groups, no promotion/demotion cron
- Tier derived from rank position at query time:
  - Rank 1-3: Diamond
  - Rank 4-10: Gold
  - Rank 11-20: Silver
  - Rank 21+: Bronze

## RPC Functions

### `get_streak_calendar(p_user_id uuid) → json`
Uses `generate_series` to produce 28 dates (today minus 27 days through today), LEFT JOINs against `user_daily_activity`. Returns array of `{date, active, xp_earned, activities}`.

### `get_leaderboard(p_user_id uuid) → json`
Queries `users` directly (no join to `user_daily_activity`). Ranks by `total_xp + current_streak * 10`. Returns top 30 users with rank, tier for current user.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/leaderboard` | Top 30 users by league score |
| GET | `/api/v1/me/streak-calendar` | 28-day activity calendar |
| GET | `/api/v1/me/daily-goal` | Today's goal progress |
| GET | `/api/v1/me` | Profile (now includes `daily_goal_target`, `streak_freeze_count`) |
| PUT | `/api/v1/me` | Update profile (now accepts `daily_goal_target` 1-10) |
| POST | `/api/v1/me/activity` | Existing — now also upserts `user_daily_activity` |

## Frontend Hooks

| Hook | Endpoint | Returns |
|------|----------|---------|
| `useLeaderboard()` | `GET /leaderboard` | `{ leaderboard, loading, error, refresh }` |
| `useStreakCalendar()` | `GET /me/streak-calendar` | `{ history: StreakDay[], loading, error }` |
| `useDailyGoal()` | `GET /me/daily-goal` | `{ target, completed, xpEarned, loading, error, refresh }` |

## Auth: Existing User Detection

`signInWithGoogle()` and `signUp()` now call `_isExistingUser()` after auth succeeds. This checks `GET /me` — if `total_xp > 0` or username is set, the user is existing and `onboarded` is set to `true`, skipping onboarding. New users get `onboarded: false` and flow through onboarding as before.

## Data Flow: Activity Completion

```
User completes lesson/quiz/sim
  → useProgress.completeLesson() (optimistic local update)
  → POST /me/progress (upsert per-type table)
  → POST /me/activity (XP + streak + daily activity upsert)
    → _apply_streak() updates users.current_streak
    → _upsert_daily_activity() increments today's row
    → Returns updated profile → client syncs
```
