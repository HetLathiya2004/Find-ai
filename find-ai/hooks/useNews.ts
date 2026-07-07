import { useCallback, useEffect, useRef, useState } from 'react';
import { MOCK_NEWS, MockNewsArticle } from '@/constants/mock-data';
import { apiFetch } from '@/lib/api';

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
    const base = category === 'all' ? '/news' : `/news/${category}`;
    // apiFetch attaches the Bearer token — the news API requires auth now.
    const res = await apiFetch(`${base}?page=${page}&limit=20`, { signal: controller.signal });
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
  return [...existing, ...fresh];
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
  const [refreshing, setRefreshing] = useState(false);
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

  /**
   * Pull-to-refresh: reset to page 1 and re-fetch from scratch, discarding
   * previously appended pages. Mirrors the mount fetch, including the mock
   * fallback, and re-arms infinite scroll from the fresh page 1 response.
   */
  const refresh = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setRefreshing(true);
    pageRef.current = 1;

    try {
      const data = await fetchPage(category, 1);
      if (data.status === 'ok' && data.articles.length > 0) {
        setArticles(data.articles);
        setIsLive(true);
        liveRef.current = true;
        setHasMore(data.has_more);
        hasMoreRef.current = data.has_more;
      } else {
        setArticles(MOCK_NEWS);
        setIsLive(false);
        liveRef.current = false;
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch {
      setArticles(MOCK_NEWS);
      setIsLive(false);
      liveRef.current = false;
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      busyRef.current = false;
      setRefreshing(false);
    }
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
        let addedNew = false;
        if (data.articles.length > 0) {
          setArticles((prev) => {
            const merged = mergeDeduped(prev, data.articles);
            addedNew = merged.length > prev.length;
            return merged;
          });
        }
        const more = data.has_more && addedNew;
        setHasMore(more);
        hasMoreRef.current = more;
      }
    } catch {
      // Keep hasMore as-is; the next onEndReached will retry this page.
    } finally {
      busyRef.current = false;
      setLoadingMore(false);
    }
  }, [category]);

  return { articles, loading, loadingMore, refreshing, hasMore, isLive, loadMore, refresh };
}
