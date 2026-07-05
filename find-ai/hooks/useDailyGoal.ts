import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { DailyGoalResponse } from '@/types/api';

/**
 * Today's goal progress from GET /api/v1/me/daily-goal. `refresh()` refetches
 * silently after the first load so the card updates in place (e.g. when the
 * home tab regains focus after completing a lesson).
 */
export function useDailyGoal() {
  const [target, setTarget] = useState(3);
  const [completed, setCompleted] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const hasDataRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    if (!hasDataRef.current) setLoading(true);
    setError(false);

    apiGet<DailyGoalResponse>('/me/daily-goal')
      .then((data) => {
        if (cancelled) return;
        hasDataRef.current = true;
        setTarget(data.target);
        setCompleted(data.completed);
        setXpEarned(data.xp_earned);
      })
      .catch(() => {
        if (!cancelled && !hasDataRef.current) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const refresh = useCallback(() => setAttempt((a) => a + 1), []);

  return { target, completed, xpEarned, loading, error, refresh };
}
