// Real progress backed by the authenticated /api/v1/me endpoints. Replaces
// the Phase 1 mock progress provider while keeping the exact same context
// interface, so player screens and dashboards are unchanged.
//
// Phase 2.4: the backend split progress into three tables
// (user_lesson_progress, user_quiz_progress, user_simulation_progress).
// GET /me/progress returns { lessons, quizzes, simulations } and
// POST /me/progress routes by activity_type — so lesson resume position,
// quiz best score/passed, and sim completion are all server-backed now.
//
// Split of responsibilities:
//   Server (source of truth): total XP, streaks, lesson/quiz/sim progress
//     per concept, and the activity log.
//   Device-local (MMKV): read news ids, daily goal/challenge, and bonus XP
//     from news/challenges (not modeled server-side), plus a cached copy of
//     server state for offline rendering.
//
// Writes are optimistic: local state updates immediately, the API call runs
// in the background (fire-and-forget for progress), and profile responses
// re-sync XP/streaks.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { getJSON, setJSON, StorageKeys } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import type {
  ActivityAction,
  ApiProgressIn,
  ApiProgressListResponse,
  ApiUserProfile,
  ApiUserProfileResponse,
} from '@/types/api';

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

/** Everything persisted locally, including the last-known server profile so
 * the app renders sensible numbers while offline. */
interface StoredProgress {
  serverXp: number;
  streakCount: number;
  streakBest: number;
  xpBonus: number; // news/daily-challenge XP the backend doesn't track
  dailyGoalCompleted: number;
  dailyGoalTarget: number;
  lastGoalDate: string | null; // device-local date the daily goal was last touched
  concepts: Record<string, ConceptProgress>;
  readNewsIds: string[];
  dailyChallengeCompleted: boolean;
}

const DEFAULT_STORED: StoredProgress = {
  serverXp: 0,
  streakCount: 0,
  streakBest: 0,
  xpBonus: 0,
  dailyGoalCompleted: 0,
  dailyGoalTarget: 5,
  lastGoalDate: null,
  concepts: {},
  readNewsIds: [],
  dailyChallengeCompleted: false,
};

function todayKey(): string {
  return new Date().toDateString();
}

/** Reset the daily goal counter when the device date rolls over. */
function withDailyReset(prev: StoredProgress): StoredProgress {
  const today = todayKey();
  if (prev.lastGoalDate === today) return prev;
  return {
    ...prev,
    dailyGoalCompleted: 0,
    lastGoalDate: today,
  };
}

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

function loadStored(): StoredProgress {
  return withDailyReset({
    ...DEFAULT_STORED,
    ...(getJSON<Partial<StoredProgress>>(StorageKeys.progress) ?? {}),
  });
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userId } = useAuth();
  const [stored, setStored] = useState<StoredProgress>(loadStored);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const update = useCallback((updater: (prev: StoredProgress) => StoredProgress) => {
    setStored((prev) => {
      const next = updater(withDailyReset(prev));
      setJSON(StorageKeys.progress, next);
      return next;
    });
  }, []);

  const applyProfile = useCallback(
    (profile: ApiUserProfile) => {
      update((prev) => ({
        ...prev,
        serverXp: profile.total_xp,
        streakCount: profile.current_streak,
        streakBest: profile.longest_streak,
      }));
    },
    [update],
  );

  // Sync from the server whenever a user session becomes available. Merges
  // all three progress types (keyed by concept_id) over the local snapshot.
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        const [{ user }, { lessons, quizzes, simulations }] = await Promise.all([
          apiGet<ApiUserProfileResponse>('/me'),
          apiGet<ApiProgressListResponse>('/me/progress'),
        ]);
        if (cancelled) return;
        update((prev) => {
          const concepts = { ...prev.concepts };
          const conceptFor = (conceptId: string) =>
            concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS;

          for (const row of lessons) {
            const existing = conceptFor(row.concept_id);
            concepts[row.concept_id] = {
              ...existing,
              lessonStatus: row.status === 'completed' ? 'completed' : 'in_progress',
              // Keep the furthest resume position between device and server.
              lessonCardIndex:
                row.status === 'completed'
                  ? 0
                  : Math.max(existing.lessonCardIndex, row.card_index),
            };
          }
          for (const row of quizzes) {
            const existing = conceptFor(row.concept_id);
            concepts[row.concept_id] = {
              ...existing,
              quizStatus: row.status === 'completed' ? 'completed' : 'in_progress',
              quizBestScore: Math.max(existing.quizBestScore ?? 0, row.best_score),
              quizPassed: existing.quizPassed || row.passed,
            };
          }
          for (const row of simulations) {
            const existing = conceptFor(row.concept_id);
            concepts[row.concept_id] = {
              ...existing,
              simulationStatus: row.status === 'completed' ? 'completed' : 'in_progress',
            };
          }

          return {
            ...prev,
            serverXp: user.total_xp,
            streakCount: user.current_streak,
            streakBest: user.longest_streak,
            concepts,
          };
        });
      } catch {
        // Offline — keep the cached snapshot.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId, update]);

  // Clear per-user progress on sign-out so the next account starts clean.
  useEffect(() => {
    if (!isAuthenticated) {
      setStored(DEFAULT_STORED);
      setJSON(StorageKeys.progress, DEFAULT_STORED);
    }
  }, [isAuthenticated]);

  /** Fire-and-forget upsert into the per-type progress table (Phase 2.4). */
  const postProgress = useCallback((payload: ApiProgressIn) => {
    apiPost('/me/progress', payload).catch(() => {
      // Offline tolerance is intentional — will re-sync on the next fetch.
    });
  }, []);

  const postActivity = useCallback(
    (action: ActivityAction, xpEarned: number) => {
      apiPost<ApiUserProfileResponse>(`/me/activity`, { action, xp_earned: xpEarned })
        .then(({ user }) => {
          // Ignore responses that arrive after switching accounts.
          if (userIdRef.current === user.id) applyProfile(user);
        })
        .catch(() => {});
    },
    [applyProfile],
  );

  const updateConcept = useCallback(
    (conceptId: string, patch: Partial<ConceptProgress>, xpGain = 0, countsTowardGoal = false) => {
      update((prev) => ({
        ...prev,
        // Optimistic bump — overwritten by the profile in the activity response.
        serverXp: prev.serverXp + xpGain,
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
    (conceptId: string) => stored.concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS,
    [stored.concepts],
  );

  const addXP = useCallback(
    (amount: number) => update((p) => ({ ...p, xpBonus: p.xpBonus + amount })),
    [update],
  );

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
      const cur = stored.concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS;
      if (cur.lessonStatus === 'not_started') {
        updateConcept(conceptId, { lessonStatus: 'in_progress', lessonCardIndex: 0 });
        postProgress({
          activity_type: 'lesson',
          concept_id: conceptId,
          status: 'in_progress',
          xp_earned: 0,
          card_index: 0,
        });
      }
    },
    [stored.concepts, updateConcept, postProgress],
  );

  const setLessonCardIndex = useCallback(
    (conceptId: string, index: number) => {
      updateConcept(conceptId, { lessonCardIndex: index });
      // Persist the resume position so it survives reinstall.
      postProgress({
        activity_type: 'lesson',
        concept_id: conceptId,
        status: 'in_progress',
        xp_earned: 0,
        card_index: index,
      });
    },
    [updateConcept, postProgress],
  );

  const completeLesson = useCallback(
    (conceptId: string, xpReward: number) => {
      const cur = stored.concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS;
      updateConcept(conceptId, { lessonStatus: 'completed', lessonCardIndex: 0 }, xpReward, true);
      postProgress({
        activity_type: 'lesson',
        concept_id: conceptId,
        status: 'completed',
        xp_earned: xpReward,
        card_index: cur.lessonCardIndex,
      });
      postActivity('lesson_complete', xpReward);
    },
    [stored.concepts, updateConcept, postProgress, postActivity],
  );

  const startQuiz = useCallback(
    (conceptId: string) => {
      const cur = stored.concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS;
      if (cur.quizStatus === 'not_started') {
        updateConcept(conceptId, { quizStatus: 'in_progress' });
      }
    },
    [stored.concepts, updateConcept],
  );

  const completeQuiz = useCallback(
    (conceptId: string, score: number, passed: boolean, xpReward: number) => {
      const cur = stored.concepts[conceptId] ?? EMPTY_CONCEPT_PROGRESS;
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
      postProgress({
        activity_type: 'quiz',
        concept_id: conceptId,
        status: 'completed',
        best_score: score,
        passed,
        xp_earned: passed ? xpReward : 0,
      });
      postActivity('quiz_complete', passed ? xpReward : 0);
    },
    [stored.concepts, updateConcept, postProgress, postActivity],
  );

  const completeSimulation = useCallback(
    (conceptId: string, xpReward: number) => {
      updateConcept(conceptId, { simulationStatus: 'completed' }, xpReward, true);
      postProgress({
        activity_type: 'simulation',
        concept_id: conceptId,
        status: 'completed',
        xp_earned: xpReward,
      });
      postActivity('sim_complete', xpReward);
    },
    [updateConcept, postProgress, postActivity],
  );

  const markNewsRead = useCallback(
    (newsId: string, xpReward: number) =>
      update((p) =>
        p.readNewsIds.includes(newsId)
          ? p
          : { ...p, xpBonus: p.xpBonus + xpReward, readNewsIds: [...p.readNewsIds, newsId] },
      ),
    [update],
  );

  const completeDailyChallenge = useCallback(
    (xpReward: number) =>
      update((p) =>
        p.dailyChallengeCompleted
          ? p
          : { ...p, xpBonus: p.xpBonus + xpReward, dailyChallengeCompleted: true },
      ),
    [update],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      xp: stored.serverXp + stored.xpBonus,
      streakCount: stored.streakCount,
      streakBest: stored.streakBest,
      streakFreezes: 0, // not modeled server-side yet
      dailyGoalCompleted: stored.dailyGoalCompleted,
      dailyGoalTarget: stored.dailyGoalTarget,
      concepts: stored.concepts,
      readNewsIds: stored.readNewsIds,
      dailyChallengeCompleted: stored.dailyChallengeCompleted,
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
      stored,
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

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
