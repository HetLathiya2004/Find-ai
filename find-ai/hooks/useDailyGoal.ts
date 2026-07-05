import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { DailyGoalResponse } from '@/types/api';

export function useDailyGoal() {
  const [target, setTarget] = useState(3);
  const [completed, setCompleted] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    apiGet<DailyGoalResponse>('/me/daily-goal')
      .then((data) => {
        if (!cancelled) {
          setTarget(data.target);
          setCompleted(data.completed);
          setXpEarned(data.xp_earned);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
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
