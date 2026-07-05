import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { LeaderboardResponse } from '@/types/api';

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    apiGet<LeaderboardResponse>('/leaderboard')
      .then((data) => {
        if (!cancelled) setLeaderboard(data);
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

  return { leaderboard, loading, error, refresh };
}
