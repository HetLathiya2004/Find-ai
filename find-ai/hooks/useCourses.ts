import { useCallback, useEffect, useState } from 'react';
import { API_V1 } from '@/constants/api';
import type { ApiCourseSummary, ApiCoursesResponse } from '@/types/api';

const FETCH_TIMEOUT_MS = 10_000;

/**
 * Published courses from GET /api/v1/courses. No mock fallback — on failure
 * the caller renders ErrorState and wires retry() to its "Try Again" button.
 */
export function useCourses() {
  const [courses, setCourses] = useState<ApiCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    setLoading(true);
    setError(false);

    (async () => {
      try {
        const res = await fetch(`${API_V1}/courses`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ApiCoursesResponse;
        if (!cancelled) setCourses(data.courses);
      } catch {
        if (!cancelled) {
          setCourses([]);
          setError(true);
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { courses, loading, error, retry };
}
