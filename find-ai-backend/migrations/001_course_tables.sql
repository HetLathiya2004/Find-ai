-- Phase 2.2: Course content tables for Find.ai
-- Run this in the Supabase SQL Editor.

-- 1. courses
CREATE TABLE courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    icon_emoji text NOT NULL,
    is_published boolean NOT NULL DEFAULT false,
    order_index integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. modules
CREATE TABLE modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title text NOT NULL,
    domain text NOT NULL CHECK (domain IN ('markets', 'investing', 'macro', 'corporate_finance')),
    order_index integer NOT NULL
);

-- 3. concepts
CREATE TABLE concepts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text NOT NULL,
    order_index integer NOT NULL,
    lesson_title text NOT NULL,
    lesson_xp integer NOT NULL DEFAULT 25,
    quiz_xp integer NOT NULL DEFAULT 30,
    quiz_pass_threshold integer NOT NULL DEFAULT 70,
    sim_title text NOT NULL,
    sim_scenario text NOT NULL,
    sim_xp integer NOT NULL DEFAULT 20
);

-- 4. lesson_cards
CREATE TABLE lesson_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    title text NOT NULL,
    body text NOT NULL,
    visual_hint text,
    order_index integer NOT NULL
);

-- 5. quiz_questions
CREATE TABLE quiz_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    question text NOT NULL,
    options jsonb NOT NULL,
    correct_index integer NOT NULL,
    explanation text NOT NULL,
    order_index integer NOT NULL
);

-- 6. simulation_choices
CREATE TABLE simulation_choices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    text text NOT NULL,
    outcome text NOT NULL CHECK (outcome IN ('risky', 'strategic', 'balanced')),
    feedback text NOT NULL,
    learner_pct integer NOT NULL DEFAULT 0,
    order_index integer NOT NULL
);

-- 7. concept_tags
CREATE TABLE concept_tags (
    concept_id uuid NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    tag text NOT NULL,
    PRIMARY KEY (concept_id, tag)
);

-- 8. tags
CREATE TABLE tags (
    tag text PRIMARY KEY,
    category text
);

-- Indexes
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_concepts_module ON concepts(module_id);
CREATE INDEX idx_concepts_slug ON concepts(slug);
CREATE INDEX idx_lesson_cards_concept ON lesson_cards(concept_id);
CREATE INDEX idx_quiz_questions_concept ON quiz_questions(concept_id);
CREATE INDEX idx_sim_choices_concept ON simulation_choices(concept_id);
CREATE INDEX idx_concept_tags_tag ON concept_tags(tag);
