import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { StreakCalendarResponse, StreakDay } from '@/types/api';

/**
 * 28-day activity calendar from GET /api/v1/me/streak-calendar. Days are
 * ordered oldest -> today (today is always the last entry).
 */
export function useStreakCalendar() {
  const [history, setHistory] = useState<StreakDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    apiGet<StreakCalendarResponse>('/me/streak-calendar')
      .then((data) => {
        if (!cancelled) setHistory(data.streak_history);
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

  return { history, loading, error, refresh };
}
