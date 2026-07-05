# Phase 2.6.0 — Test Plan

## Backend Verification

- [x] `GET /api/v1/leaderboard` returns 401 without token (route registered)
- [x] `GET /api/v1/me/streak-calendar` returns 401 without token
- [x] `GET /api/v1/me/daily-goal` returns 401 without token
- [x] Server health check passes after deployment

## Database Verification

- [x] `user_daily_activity` table exists with PK (user_id, activity_date)
- [x] `users.daily_goal_target` column exists (default 3)
- [x] `users.streak_freeze_count` column exists (default 0)
- [x] `get_streak_calendar` RPC function exists
- [x] `get_leaderboard` RPC function exists (updated: total_xp based, not weekly)
- [x] RLS policies active on `user_daily_activity`

## Frontend Verification

- [x] TypeScript compiles clean (`npx tsc --noEmit` — zero errors)
- [x] No remaining references to `MOCK_LEAGUE`, `MOCK_STREAK_HISTORY`, `MOCK_DAILY_CHALLENGE`
- [x] No remaining references to removed `incrementDailyGoal`, `dailyGoalCompleted`, `dailyGoalTarget` in progress

## Still Needs Testing

- [ ] Complete a lesson → verify `user_daily_activity` row created
- [ ] Complete another activity same day → verify row increments
- [ ] League screen renders real ranked users
- [ ] Streak screen shows 28 real days
- [ ] Daily goal card shows server-backed count
- [ ] Existing user sign-up via Google → skips onboarding → lands on home
- [ ] New user sign-up → goes through onboarding normally
