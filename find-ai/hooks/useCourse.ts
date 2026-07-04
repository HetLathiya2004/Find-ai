import { useCallback, useEffect, useState } from 'react';
import { API_V1 } from '@/constants/api';
import type { ApiCourseDetail, ApiCourseResponse } from '@/types/api';

const FETCH_TIMEOUT_MS = 10_000;

/**
 * Single course (modules + concept summaries) from
 * GET /api/v1/courses/{course_id}. Pass null to skip fetching until the
 * course id is known. No mock fallback — callers render ErrorState + retry().
 */
export function useCourse(courseId: string | null) {
  const [course, setCourse] = useState<ApiCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!courseId) {
      setCourse(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    setLoading(true);
    setError(false);

    (async () => {
      try {
        const res = await fetch(`${API_V1}/courses/${courseId}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ApiCourseResponse;
        if (!cancelled) setCourse(data.course);
      } catch {
        if (!cancelled) {
          setCourse(null);
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
  }, [courseId, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { course, loading, error, retry };
}
