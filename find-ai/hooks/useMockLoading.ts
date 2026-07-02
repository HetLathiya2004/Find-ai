import { useEffect, useState } from 'react';

/**
 * Simulates a brief network load so skeleton states are exercised in Phase 1.
 * Phase 2 will replace this with real query loading flags.
 */
export function useMockLoading(durationMs = 600): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return loading;
}
