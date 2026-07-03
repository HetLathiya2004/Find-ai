import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { MOCK_USER } from '@/constants/mock-data';
import { getJSON, setJSON, StorageKeys } from '@/lib/storage';

export type ActivityStatus = 'not_started' | 'in_progress' | 'completed';

export interface ConceptProgress {
  lessonStatus: ActivityStatus;
  lessonCardIndex: number; // resume position within the lesson
  quizStatus: ActivityStatus;
  quizBestScore: number | null; // percentage 0-100
  quizPassed: boolean;
  simulationStatus: ActivityStatus;
}

export interface ProgressState {
  xp: number;
  streakCount: number;
  streakBest: number;
  streakFreezes: number;
  dailyGoalCompleted: number; // activities done today
  dailyGoalTarget: number;
  concepts: Record<string, ConceptProgress>;
  readNewsIds: string[];
  dailyChallengeCompleted: boolean;
}

export const EMPTY_CONCEPT_PROGRESS: ConceptProgress = {
  lessonStatus: 'not_started',
  lessonCardIndex: 0,
  quizStatus: 'not_started',
  quizBestScore: null,
  quizPassed: false,
  simulationStatus: 'not_started',
};

// Seed state matches the mock user so screens look lived-in on first launch.
const DEFAULT_STATE: ProgressState = {
  xp: MOCK_USER.xp,
  streakCount: MOCK_USER.streak_count,
  streakBest: MOCK_USER.streak_best,
  streakFreezes: MOCK_USER.streak_freeze_count,
  dailyGoalCompleted: 3,
  dailyGoalTarget: 5,
  concepts: {
    c1: {
      lessonStatus: 'in_progress',
      lessonCardIndex: 2,
      quizStatus: 'not_started',
      quizBestScore: null,
      quizPassed: false,
      simulationStatus: 'not_started',
    },
    c6: {
      lessonStatus: 'completed',
      lessonCardIndex: 0,
      quizStatus: 'completed',
      quizBestScore: 85,
      quizPassed: true,
      simulationStatus: 'completed',
    },
    c3: {
      lessonStatus: 'completed',
      lessonCardIndex: 0,
      quizStatus: 'in_progress',
      quizBestScore: null,
      quizPassed: false,
      simulationStatus: 'not_started',
    },
  },
  readNewsIds: [],
  dailyChallengeCompleted: false,
};

interface ProgressContextValue extends ProgressState {
  getConceptProgress: (conceptId: string) => ConceptProgress;
  addXP: (amount: number) => void;
  incrementDailyGoal: () => void;
  startLesson: (conceptId: string) => void;
  setLessonCardIndex: (conceptId: string, index: number) => void;
  completeLesson: (conceptId: string, xpReward: number) => void;
  startQuiz: (conceptId: string) => void;
  completeQuiz: (conceptId: string, score: number, passed: boolean, xpReward: number) => void;
  completeSimulation: (conceptId: string, xpReward: number) => void;
  markNewsRead: (newsId: string, xpReward: number) => void;
  completeDailyChallenge: (xpReward: number) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function MockProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(
    () => getJSON<ProgressState>(StorageKeys.progress) ?? DEFAULT_STATE,
  );

  const update = useCallback((updater: (prev: ProgressState) => ProgressState) => {
    setState((prev) => {
      const next = updater(prev);
      setJSON(StorageKeys.progress, next);
      return next;
    });
  }, []);

  const updateConcept = useCallback(
    (conceptId: string, patch: Partial<ConceptProgress>, xpGain = 0, countsTowardGoal = false) => {
      update((prev) => ({
        ...prev,
        xp: prev.xp + xpGain,
        dailyGoalCompleted: countsTowardGoal
          ? Math.min(prev.dailyGoalCompleted + 1, prev.dailyGoalTarget)
          : prev.dailyGoalCompleted,
        concepts: {
          ...prev.concepts,
          [conceptId]: { ...(prev.concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS), ...patch },
        },
      }));
    },
    [update],
  );

  const getConceptProgress = useCallback(
    (conceptId: string) => state.concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS,
    [state.concepts],
  );

  const addXP = useCallback((amount: number) => update((p) => ({ ...p, xp: p.xp + amount })), [update]);

  const incrementDailyGoal = useCallback(
    () =>
      update((p) => ({
        ...p,
        dailyGoalCompleted: Math.min(p.dailyGoalCompleted + 1, p.dailyGoalTarget),
      })),
    [update],
  );

  const startLesson = useCallback(
    (conceptId: string) => {
      const cur = state.concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS;
      if (cur.lessonStatus === 'not_started') {
        updateConcept(conceptId, { lessonStatus: 'in_progress', lessonCardIndex: 0 });
      }
    },
    [state.concepts, updateConcept],
  );

  const setLessonCardIndex = useCallback(
    (conceptId: string, index: number) => updateConcept(conceptId, { lessonCardIndex: index }),
    [updateConcept],
  );

  const completeLesson = useCallback(
    (conceptId: string, xpReward: number) =>
      updateConcept(conceptId, { lessonStatus: 'completed', lessonCardIndex: 0 }, xpReward, true),
    [updateConcept],
  );

  const startQuiz = useCallback(
    (conceptId: string) => {
      const cur = state.concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS;
      if (cur.quizStatus === 'not_started') {
        updateConcept(conceptId, { quizStatus: 'in_progress' });
      }
    },
    [state.concepts, updateConcept],
  );

  const completeQuiz = useCallback(
    (conceptId: string, score: number, passed: boolean, xpReward: number) => {
      const cur = state.concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS;
      updateConcept(
        conceptId,
        {
          quizStatus: 'completed',
          quizBestScore: Math.max(cur.quizBestScore ?? 0, score),
          quizPassed: cur.quizPassed || passed,
        },
        passed ? xpReward : 0,
        true,
      );
    },
    [state.concepts, updateConcept],
  );

  const completeSimulation = useCallback(
    (conceptId: string, xpReward: number) =>
      updateConcept(conceptId, { simulationStatus: 'completed' }, xpReward, true),
    [updateConcept],
  );

  const markNewsRead = useCallback(
    (newsId: string, xpReward: number) =>
      update((p) =>
        p.readNewsIds.includes(newsId)
          ? p
          : { ...p, xp: p.xp + xpReward, readNewsIds: [...p.readNewsIds, newsId] },
      ),
    [update],
  );

  const completeDailyChallenge = useCallback(
    (xpReward: number) =>
      update((p) =>
        p.dailyChallengeCompleted ? p : { ...p, xp: p.xp + xpReward, dailyChallengeCompleted: true },
      ),
    [update],
  );

  const value = useMemo(
    () => ({
      ...state,
      getConceptProgress,
      addXP,
      incrementDailyGoal,
      startLesson,
      setLessonCardIndex,
      completeLesson,
      startQuiz,
      completeQuiz,
      completeSimulation,
      markNewsRead,
      completeDailyChallenge,
    }),
    [
      state,
      getConceptProgress,
      addXP,
      incrementDailyGoal,
      startLesson,
      setLessonCardIndex,
      completeLesson,
      startQuiz,
      completeQuiz,
      completeSimulation,
      markNewsRead,
      completeDailyChallenge,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useMockProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useMockProgress must be used within MockProgressProvider');
  return ctx;
}
