-- Phase 2.6: Daily activity tracking, leaderboard, streak calendar
-- Run this in the Supabase SQL Editor (backend project: mjrmavtdhrbrrheuqbzg).
--
-- Creates user_daily_activity (one row per user per day) which powers:
--   1. Streak calendar (28-day activity history)
--   2. Daily goal progress (activities_completed vs target)
--   3. Leaderboard (weekly XP + streak bonus)
--
-- Also adds daily_goal_target and streak_freeze_count to users.

-- ============================================
-- Step 1: Alter users table
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_goal_target integer NOT NULL DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_freeze_count integer NOT NULL DEFAULT 0;

-- ============================================
-- Step 2: Create user_daily_activity table
-- ============================================

CREATE TABLE user_daily_activity (
    user_id              uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date        date NOT NULL,
    xp_earned            integer NOT NULL DEFAULT 0,
    activities_completed integer NOT NULL DEFAULT 0,
    created_at           timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, activity_date)
);

CREATE INDEX idx_daily_activity_user ON user_daily_activity(user_id);
CREATE INDEX idx_daily_activity_date ON user_daily_activity(activity_date);
CREATE INDEX idx_daily_activity_user_date ON user_daily_activity(user_id, activity_date);

-- ============================================
-- Step 3: Row Level Security
-- ============================================

ALTER TABLE user_daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily activity"
    ON user_daily_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily activity"
    ON user_daily_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily activity"
    ON user_daily_activity FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Step 4: RPC — streak calendar (last 28 days)
-- ============================================

CREATE OR REPLACE FUNCTION get_streak_calendar(p_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'date', d.day::text,
                'active', CASE WHEN a.user_id IS NOT NULL THEN true ELSE false END,
                'xp_earned', COALESCE(a.xp_earned, 0),
                'activities', COALESCE(a.activities_completed, 0)
            ) ORDER BY d.day
        ),
        '[]'::json
    )
    FROM generate_series(
        (current_date - interval '27 days')::date,
        current_date,
        '1 day'::interval
    ) AS d(day)
    LEFT JOIN user_daily_activity a
        ON a.user_id = p_user_id
        AND a.activity_date = d.day::date;
$$;

-- ============================================
-- Step 5: RPC — leaderboard (total XP + streak bonus)
-- ============================================

CREATE OR REPLACE FUNCTION get_leaderboard(p_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    WITH ranked AS (
        SELECT
            u.id,
            u.username,
            u.total_xp,
            u.current_streak,
            (u.total_xp + u.current_streak * 10)::integer AS league_score,
            ROW_NUMBER() OVER (ORDER BY (u.total_xp + u.current_streak * 10) DESC) AS rank,
            u.id = p_user_id AS is_current_user
        FROM users u
        WHERE u.total_xp > 0 OR u.current_streak > 0
        ORDER BY league_score DESC
        LIMIT 30
    )
    SELECT json_build_object(
        'users', COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'rank', r.rank,
                    'username', COALESCE(r.username, 'User'),
                    'total_xp', r.total_xp,
                    'streak', r.current_streak,
                    'league_score', r.league_score,
                    'is_current_user', r.is_current_user
                ) ORDER BY r.rank
            ) FROM ranked r),
            '[]'::json
        ),
        'current_user_rank', (SELECT rank FROM ranked WHERE is_current_user),
        'current_user_tier', CASE
            WHEN (SELECT rank FROM ranked WHERE is_current_user) <= 3 THEN 'Diamond'
            WHEN (SELECT rank FROM ranked WHERE is_current_user) <= 10 THEN 'Gold'
            WHEN (SELECT rank FROM ranked WHERE is_current_user) <= 20 THEN 'Silver'
            ELSE 'Bronze'
        END
    );
$$;
