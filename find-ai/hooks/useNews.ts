import { useEffect, useState } from 'react';
import { API_V1 } from '@/constants/api';
import { MOCK_NEWS, MockNewsArticle } from '@/constants/mock-data';

interface NewsFeedResponse {
  status: string;
  category: string;
  category_name: string;
  count: number;
  articles: MockNewsArticle[];
}

const FETCH_TIMEOUT_MS = 10_000;

/**
 * Fetches the live news feed from the Phase 2.1 backend.
 * Falls back to Phase 1 mock articles when the API is unreachable or empty,
 * so the News tab always has content.
 */
export function useNews(category: 'all' | 'finance' | 'startups' | 'global' = 'all') {
  const [articles, setArticles] = useState<MockNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    (async () => {
      try {
        const url = category === 'all' ? `${API_V1}/news` : `${API_V1}/news/${category}`;
        const res = await fetch(url, { signal: controller.signal });
        const data: NewsFeedResponse = await res.json();
        if (cancelled) return;
        if (res.ok && data.status === 'ok' && data.articles.length > 0) {
          setArticles(data.articles);
          setIsLive(true);
        } else {
          setArticles(MOCK_NEWS);
        }
      } catch {
        if (!cancelled) setArticles(MOCK_NEWS);
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [category]);

  return { articles, loading, isLive };
}
