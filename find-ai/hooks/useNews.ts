import { useCallback, useEffect, useRef, useState } from 'react';
import { API_V1 } from '@/constants/api';
import { MOCK_NEWS, MockNewsArticle } from '@/constants/mock-data';

interface NewsFeedResponse {
  status: string;
  category: string;
  category_name: string;
  count: number;
  page: number;
  has_more: boolean;
  articles: MockNewsArticle[];
}

type NewsCategory = 'all' | 'finance' | 'startups' | 'global';

const FETCH_TIMEOUT_MS = 10_000;

async function fetchPage(category: NewsCategory, page: number): Promise<NewsFeedResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const base = category === 'all' ? `${API_V1}/news` : `${API_V1}/news/${category}`;
    const res = await fetch(`${base}?page=${page}&limit=20`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as NewsFeedResponse;
  } finally {
    clearTimeout(timeout);
  }
}

function mergeDeduped(
  existing: MockNewsArticle[],
  incoming: MockNewsArticle[],
): MockNewsArticle[] {
  const seen = new Set(existing.map((a) => a.id));
  const fresh = incoming.filter((a) => !seen.has(a.id));
  return fresh.length > 0 ? [...existing, ...fresh] : existing;
}

/**
 * Live news feed with infinite scroll. Page 1 comes from the Phase 2.1
 * backend (falls back to Phase 1 mock articles when unreachable or empty);
 * loadMore() fetches progressively older articles.
 */
export function useNews(category: NewsCategory = 'all') {
  const [articles, setArticles] = useState<MockNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const liveRef = useRef(false);
  const hasMoreRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    pageRef.current = 1;
    busyRef.current = true;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchPage(category, 1);
        if (cancelled) return;
        if (data.status === 'ok' && data.articles.length > 0) {
          setArticles(data.articles);
          setIsLive(true);
          liveRef.current = true;
          setHasMore(data.has_more);
          hasMoreRef.current = data.has_more;
        } else {
          setArticles(MOCK_NEWS);
        }
      } catch {
        if (!cancelled) setArticles(MOCK_NEWS);
      } finally {
        busyRef.current = false;
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category]);

  const loadMore = useCallback(async () => {
    if (busyRef.current || !liveRef.current || !hasMoreRef.current) return;
    busyRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = pageRef.current + 1;
      const data = await fetchPage(category, nextPage);
      if (data.status === 'ok') {
        pageRef.current = nextPage;
        setArticles((prev) => mergeDeduped(prev, data.articles));
        setHasMore(data.has_more);
        hasMoreRef.current = data.has_more;
      }
    } catch {
      // Keep hasMore as-is; the next onEndReached will retry this page.
    } finally {
      busyRef.current = false;
      setLoadingMore(false);
    }
  }, [category]);

  return { articles, loading, loadingMore, hasMore, isLive, loadMore };
}
