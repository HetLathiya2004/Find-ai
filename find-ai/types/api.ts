// ---------------------------------------------------------------------------
// Phase 2.2 course backend response shapes (GET /api/v1/courses,
// /courses/{id}, /concepts/{slug}) plus transforms into the existing Mock*
// interfaces so Phase 1 components render API data without changes.
// ---------------------------------------------------------------------------

import type {
  Domain,
  MockConcept,
  MockLessonCard,
  MockQuizQuestion,
  MockSimulationChoice,
} from '@/constants/mock-data';

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ApiCourseSummary {
  id: string;
  title: string;
  description: string;
  difficulty: CourseDifficulty;
  icon_emoji: string;
  order_index: number;
}

export interface ApiCoursesResponse {
  courses: ApiCourseSummary[];
}

export interface ApiConceptSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
}

export interface ApiModule {
  id: string;
  title: string;
  domain: Domain;
  order_index: number;
  /**
   * Future backend field — when the API starts returning it, modules flagged
   * true render blurred "Coming Soon" cards automatically. Missing = false.
   */
  is_coming_soon?: boolean;
  concepts: ApiConceptSummary[];
}

export interface ApiCourseDetail {
  id: string;
  title: string;
  description: string;
  difficulty: CourseDifficulty;
  icon_emoji: string;
  modules: ApiModule[];
}

export interface ApiCourseResponse {
  course: ApiCourseDetail;
}

/** Superset of MockLessonCard — LessonCard renders API cards directly. */
export interface ApiLessonCard extends MockLessonCard {
  id: string;
  order_index: number;
}

/** Superset of MockQuizQuestion — QuestionCard renders API questions directly. */
export interface ApiQuizQuestion extends MockQuizQuestion {
  id: string;
  order_index: number;
}

/** Superset of MockSimulationChoice, with the learner percentage inline per choice. */
export interface ApiSimulationChoice extends MockSimulationChoice {
  id: string;
  learner_pct: number;
  order_index: number;
}

export interface ApiConceptDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  lesson_title: string;
  lesson_xp: number;
  quiz_xp: number;
  quiz_pass_threshold: number;
  sim_title: string;
  sim_scenario: string;
  sim_xp: number;
  cards: ApiLessonCard[];
  questions: ApiQuizQuestion[];
  choices: ApiSimulationChoice[];
  tags: string[];
}

export interface ApiConceptResponse {
  concept: ApiConceptDetail;
}

/**
 * Concept summary + parent module's domain → MockConcept, so ConceptCard and
 * the domain filter keep working unchanged. Mastery is derived from local
 * progress (user progress stays mock until Phase 2.3).
 */
export function toMockConcept(
  concept: ApiConceptSummary,
  domain: Domain,
  masteryLevel: number,
): MockConcept {
  return {
    id: concept.id,
    title: concept.title,
    slug: concept.slug,
    description: concept.description,
    domain,
    order_index: concept.order_index,
    mastery_level: masteryLevel,
  };
}
