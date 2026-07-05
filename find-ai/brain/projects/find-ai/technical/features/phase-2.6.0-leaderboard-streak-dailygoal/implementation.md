# Phase 2.6.0 — Implementation

## Files Modified

### Backend
| File | Change |
|------|--------|
| `migrations/004_daily_activity_leaderboard.sql` | New table, ALTER users, RPC functions |
| `routes/me.py` | Expanded profile fields, `_upsert_daily_activity()`, streak-calendar endpoint, daily-goal endpoint, `daily_goal_target` in PUT /me |
| `routes/leaderboard.py` | New file — `GET /api/v1/leaderboard` via RPC |
| `main.py` | Register `leaderboard_router` |

### Frontend
| File | Change |
|------|--------|
| `types/api.ts` | Added `LeaderboardUser`, `LeaderboardResponse`, `StreakDay`, `StreakCalendarResponse`, `DailyGoalResponse`; expanded `ApiUserProfile` with `daily_goal_target`, `streak_freeze_count` |
| `hooks/useLeaderboard.ts` | New hook |
| `hooks/useStreakCalendar.ts` | New hook |
| `hooks/useDailyGoal.ts` | New hook |
| `hooks/useProgress.tsx` | Removed `dailyGoalCompleted`, `dailyGoalTarget`, `lastGoalDate`, `withDailyReset()`, `incrementDailyGoal`; `streakFreezes` now from `user.streak_freeze_count` |
| `hooks/useAuth.tsx` | Added `_isExistingUser()` check in `signUp` and `signInWithGoogle`; auto-sets `onboarded` |
| `app/league.tsx` | Real data from `useLeaderboard()`; loading/error/empty states |
| `app/streak.tsx` | Real data from `useStreakCalendar()`; `cellTodayActive` style |
| `app/(tabs)/home.tsx` | `useLeaderboard()` for LeagueCard, `useDailyGoal()` for DailyGoalCard |
| `app/(auth)/sign-in.tsx` | Removed manual `markOnboarded()` (auto-detected now) |
| `app/(auth)/sign-up.tsx` | Removed hardcoded onboarding navigation; lets `index.tsx` routing handle it |
| `app/lesson/[slug].tsx` | Replaced `MOCK_DAILY_CHALLENGE.xp_reward` with `DAILY_CHALLENGE_XP = 50` constant |
| `components/home/LeagueCard.tsx` | Removed `daysUntilReset`; shows "XP + Streak bonus" |
| `components/home/DailyGoalCard.tsx` | Added `loading` prop with spinner state |
| `constants/mock-data.ts` | Removed `MOCK_LEAGUE`, `MockLeagueUser`, `MockLeague`, `LEAGUE_NAMES`, `LEAGUE_XP`, `MOCK_DAILY_CHALLENGE`, `MockDailyChallenge`, `MOCK_STREAK_HISTORY` |

## Key Decisions

1. **No weekly reset**: League score is total_xp + streak bonus, not weekly. Simpler, no cron needed.
2. **RPC over raw queries**: Both leaderboard and streak calendar use Postgres RPC for single-call efficiency.
3. **Daily activity upsert pattern**: Fetch existing row, increment, upsert — not raw SQL increment to stay compatible with Supabase client.
4. **Existing user detection**: `_isExistingUser()` calls `GET /me` after auth — checks `total_xp > 0 || !!username`. Small latency cost but eliminates the routing bug.
