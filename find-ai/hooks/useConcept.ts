import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { ApiConceptDetail, ApiConceptResponse } from '@/types/api';

const FETCH_TIMEOUT_MS = 10_000;

/**
 * Full concept detail (cards, questions, choices, tags) from
 * GET /api/v1/concepts/{slug}. Feeds the lesson, quiz, and simulation
 * players. Pass null to skip fetching. No mock fallback — callers render
 * ErrorState + retry().
 */
export function useConcept(slug: string | null, include?: string) {
  const [concept, setConcept] = useState<ApiConceptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!slug) {
      setConcept(null);
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
        const url = include
          ? `/concepts/${slug}?include=${include}`
          : `/concepts/${slug}`;
        const res = await apiFetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ApiConceptResponse;
        if (!cancelled) setConcept(data.concept);
      } catch {
        if (!cancelled) {
          setConcept(null);
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
  }, [slug, include, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { concept, loading, error, retry };
}
