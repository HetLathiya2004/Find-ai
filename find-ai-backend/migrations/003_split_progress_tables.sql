-- Phase 2.5: Split progress into 3 clean tables (no nullables)
-- Run this in the Supabase SQL Editor (backend project: mjrmavtdhrbrrheuqbzg).
--
-- Replaces the single user_lesson_progress table with three purpose-built
-- tables: user_lesson_progress, user_quiz_progress, user_simulation_progress.
-- Each table has only the columns it needs — zero nullable fields.

-- ============================================
-- Step 1: Drop old table
-- ============================================

DROP TABLE IF EXISTS user_lesson_progress CASCADE;

-- ============================================
-- Step 2: Create three progress tables
-- ============================================

-- Lesson progress: tracks card-by-card resume position
CREATE TABLE user_lesson_progress (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    card_index integer NOT NULL DEFAULT 0,
    xp_earned integer NOT NULL DEFAULT 0,
    completed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, concept_id)
);

-- Quiz progress: tracks best score and pass state
CREATE TABLE user_quiz_progress (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    best_score integer NOT NULL DEFAULT 0,
    passed boolean NOT NULL DEFAULT false,
    xp_earned integer NOT NULL DEFAULT 0,
    completed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, concept_id)
);

-- Simulation progress: tracks completion
CREATE TABLE user_simulation_progress (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
    xp_earned integer NOT NULL DEFAULT 0,
    completed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, concept_id)
);

-- ============================================
-- Step 3: Indexes
-- ============================================

CREATE INDEX idx_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_concept ON user_lesson_progress(concept_id);

CREATE INDEX idx_quiz_progress_user ON user_quiz_progress(user_id);
CREATE INDEX idx_quiz_progress_concept ON user_quiz_progress(concept_id);

CREATE INDEX idx_sim_progress_user ON user_simulation_progress(user_id);
CREATE INDEX idx_sim_progress_concept ON user_simulation_progress(concept_id);

-- ============================================
-- Step 4: Auto-update updated_at triggers
-- ============================================

CREATE TRIGGER user_lesson_progress_updated_at
    BEFORE UPDATE ON user_lesson_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER user_quiz_progress_updated_at
    BEFORE UPDATE ON user_quiz_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER user_sim_progress_updated_at
    BEFORE UPDATE ON user_simulation_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Step 5: Row Level Security
-- ============================================

-- Lesson progress RLS
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own lesson progress"
    ON user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lesson progress"
    ON user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress"
    ON user_lesson_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Quiz progress RLS
ALTER TABLE user_quiz_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quiz progress"
    ON user_quiz_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz progress"
    ON user_quiz_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz progress"
    ON user_quiz_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Simulation progress RLS
ALTER TABLE user_simulation_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sim progress"
    ON user_simulation_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sim progress"
    ON user_simulation_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sim progress"
    ON user_simulation_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Step 6: RPC — fetch all progress in one call
-- ============================================

CREATE OR REPLACE FUNCTION get_user_progress(p_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT json_build_object(
        'lessons', COALESCE(
            (SELECT json_agg(json_build_object(
                'concept_id', concept_id,
                'status', status,
                'card_index', card_index,
                'xp_earned', xp_earned,
                'completed_at', completed_at
            )) FROM user_lesson_progress WHERE user_id = p_user_id),
            '[]'::json
        ),
        'quizzes', COALESCE(
            (SELECT json_agg(json_build_object(
                'concept_id', concept_id,
                'status', status,
                'best_score', best_score,
                'passed', passed,
                'xp_earned', xp_earned,
                'completed_at', completed_at
            )) FROM user_quiz_progress WHERE user_id = p_user_id),
            '[]'::json
        ),
        'simulations', COALESCE(
            (SELECT json_agg(json_build_object(
                'concept_id', concept_id,
                'status', status,
                'xp_earned', xp_earned,
                'completed_at', completed_at
            )) FROM user_simulation_progress WHERE user_id = p_user_id),
            '[]'::json
        )
    );
$$;
