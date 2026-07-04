-- Phase 2.3: Auth + user data tables for Find.ai
-- Run this in the Supabase SQL Editor of the backend project
-- (mjrmavtdhrbrrheuqbzg.supabase.co).
--
-- Adds: users, user_lesson_progress, activity_log
--       + auto-provisioning trigger on auth.users
--       + RLS policies (defense-in-depth; the FastAPI gateway uses the
--         service-role key and enforces auth in middleware).
--
-- Note: the spec calls the progress unit a "lesson". In this schema the
-- lesson/quiz/simulation content unit is the `concepts` table (there is no
-- separate `lessons` table), so user_lesson_progress.lesson_id references
-- concepts(id).

-- 1. users — one row per auth.users row, created automatically on signup.
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE,
    tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'admin')),
    total_xp integer NOT NULL DEFAULT 0,
    current_streak integer NOT NULL DEFAULT 0,
    longest_streak integer NOT NULL DEFAULT 0,
    last_active_date date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. user_lesson_progress — per-user, per-concept completion state.
CREATE TABLE public.user_lesson_progress (
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id uuid NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    xp_earned integer NOT NULL DEFAULT 0,
    completed_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, lesson_id)
);

-- 3. activity_log — append-only XP-earning event stream.
CREATE TABLE public.activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action text NOT NULL CHECK (action IN ('lesson_complete', 'quiz_complete', 'sim_complete', 'streak_bonus')),
    xp_earned integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);
CREATE INDEX idx_activity_log_user_created ON public.activity_log(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Auto-provision public.users on signup (Google OAuth or email+password).
-- SECURITY DEFINER so the trigger can write to public.users regardless of the
-- role that inserts into auth.users.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_username text;
    candidate text;
BEGIN
    base_username := split_part(COALESCE(NEW.email, 'user'), '@', 1);
    candidate := base_username;
    -- username is UNIQUE; add a short random suffix until it is free.
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = candidate) LOOP
        candidate := base_username || '_' || substr(md5(random()::text), 1, 4);
    END LOOP;

    INSERT INTO public.users (id, username)
    VALUES (NEW.id, candidate)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security: each user can only touch their own rows.
-- The FastAPI gateway uses the service-role key (bypasses RLS) and enforces
-- authorization in middleware; these policies protect against any direct
-- client access with the anon key.
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- users: read + update own profile (tier changes are blocked — clients may
-- never set their own tier).
CREATE POLICY users_select_own ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND tier = (SELECT u.tier FROM public.users u WHERE u.id = auth.uid()));

-- user_lesson_progress: full read/write on own rows.
CREATE POLICY progress_select_own ON public.user_lesson_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY progress_insert_own ON public.user_lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY progress_update_own ON public.user_lesson_progress
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- activity_log: read + append own rows (no update/delete — append-only).
CREATE POLICY activity_select_own ON public.activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY activity_insert_own ON public.activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);
