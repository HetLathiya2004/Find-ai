import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { LeaderboardResponse } from '@/types/api';

/**
 * Leaderboard from GET /api/v1/leaderboard. `refresh()` refetches silently
 * once data has loaded (no loading flash), so screens can re-sync on focus
 * and rank changes appear without UI churn.
 */
export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const hasDataRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    if (!hasDataRef.current) setLoading(true);
    setError(false);

    apiGet<LeaderboardResponse>('/leaderboard')
      .then((data) => {
        if (cancelled) return;
        hasDataRef.current = true;
        setLeaderboard(data);
      })
      .catch(() => {
        // Keep stale data on silent refreshes; only surface the error state
        // when there is nothing to show.
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

  return { leaderboard, loading, error, refresh };
}
