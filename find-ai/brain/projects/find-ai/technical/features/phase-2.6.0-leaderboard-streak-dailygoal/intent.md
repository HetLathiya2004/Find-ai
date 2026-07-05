# Phase 2.6.0 — Real Leaderboard, Streak Calendar, Daily Goal

## Goal

Replace all mock/device-local data for leaderboard, streak calendar, and daily goal with server-backed real data. Add auto-detection of existing users on sign-up to skip onboarding.

## Motivation

Three features were still running on fake or device-local data:
1. **Leaderboard** — entirely mock (`MOCK_LEAGUE` with 30 hardcoded users). No backend support.
2. **Streak calendar** — the streak count was real (server-backed), but the 28-day grid used `MOCK_STREAK_HISTORY` (hardcoded boolean array). Streak freezes hardcoded to 0.
3. **Daily goal** — tracked entirely in MMKV (`dailyGoalCompleted`, `dailyGoalTarget`, `lastGoalDate`). Lost on reinstall or device switch.
4. **Sign-up routing** — existing users signing up via Google or email were always forced through onboarding.

## Scope

### In scope
- New `user_daily_activity` table (one row per user per day)
- New columns on `users`: `daily_goal_target`, `streak_freeze_count`
- Leaderboard RPC: league_score = total_xp + (streak × 10)
- Streak calendar RPC: 28-day activity history via `generate_series`
- New endpoints: `GET /leaderboard`, `GET /me/streak-calendar`, `GET /me/daily-goal`
- Daily activity upsert in `POST /me/activity`
- Expanded `GET /me` profile with `daily_goal_target` and `streak_freeze_count`
- `daily_goal_target` updatable via `PUT /me`
- Frontend hooks: `useLeaderboard`, `useStreakCalendar`, `useDailyGoal`
- Remove all mock data: `MOCK_LEAGUE`, `MOCK_STREAK_HISTORY`, `MOCK_DAILY_CHALLENGE`
- Remove device-local daily goal from `useProgress` (no more `withDailyReset`, `lastGoalDate`)
- `streakFreezes` now server-backed from `users.streak_freeze_count`
- Auto-detect existing users on sign-up/Google sign-in via `_isExistingUser()`
- Deploy to Oracle VM

### Out of scope
- Streak freeze deduction logic (freeze count exists but no spend/earn mechanic yet)
- League tier promotions/demotions (tiers are derived from rank, no weekly resets)
- Badges (still mock)
- HTTPS

## Success Criteria

- [x] `user_daily_activity` table created with RLS
- [x] `daily_goal_target` and `streak_freeze_count` columns on `users`
- [x] `GET /leaderboard` returns ranked users by total_xp + streak bonus
- [x] `GET /me/streak-calendar` returns 28 real activity days
- [x] `GET /me/daily-goal` returns today's server-backed progress
- [x] `POST /me/activity` upserts daily activity row
- [x] No mock data remaining for league/streak/daily-goal
- [x] Existing users auto-skip onboarding on sign-up page
- [x] TypeScript compiles clean
- [x] Server deployed and healthy
