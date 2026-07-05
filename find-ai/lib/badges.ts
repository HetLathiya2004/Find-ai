// Real badge definitions + earning rules, derived from actual user progress.
// Replaces the Phase 1 MOCK_BADGES (emoji icons, hardcoded earned flags).
// Icons are custom SVGs rendered by components/profile/BadgeIcon.

export type BadgeId =
  | 'first-lesson'
  | 'quiz-ace'
  | 'simulation-pro'
  | 'week-warrior'
  | 'knowledge-seeker'
  | 'market-maven';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  earned: boolean;
}

export interface BadgeInputs {
  /** Lessons with status 'completed'. */
  lessonsCompleted: number;
  /** Highest quiz score (0-100) across all concepts. */
  bestQuizScore: number;
  /** Simulations with status 'completed'. */
  simulationsCompleted: number;
  /** Longest streak the user has reached. */
  streak: number;
  /** Concepts in the markets domain: [mastered count, total count]. */
  marketsMastered: number;
  marketsTotal: number;
}

export function deriveBadges(inputs: BadgeInputs): Badge[] {
  return [
    {
      id: 'first-lesson',
      name: 'First Lesson',
      description: 'Complete your first lesson',
      earned: inputs.lessonsCompleted >= 1,
    },
    {
      id: 'quiz-ace',
      name: 'Quiz Ace',
      description: 'Score 100% on a quiz',
      earned: inputs.bestQuizScore >= 100,
    },
    {
      id: 'simulation-pro',
      name: 'Simulation Pro',
      description: 'Complete a simulation',
      earned: inputs.simulationsCompleted >= 1,
    },
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: 'Hit a 7-day streak',
      earned: inputs.streak >= 7,
    },
    {
      id: 'knowledge-seeker',
      name: 'Knowledge Seeker',
      description: 'Complete 5 lessons',
      earned: inputs.lessonsCompleted >= 5,
    },
    {
      id: 'market-maven',
      name: 'Market Maven',
      description: 'Master every markets concept',
      earned: inputs.marketsTotal > 0 && inputs.marketsMastered >= inputs.marketsTotal,
    },
  ];
}
