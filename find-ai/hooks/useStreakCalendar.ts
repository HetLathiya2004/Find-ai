import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { StreakCalendarResponse, StreakDay } from '@/types/api';

export function useStreakCalendar() {
  const [history, setHistory] = useState<StreakDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
  }, []);

  return { history, loading, error };
}
