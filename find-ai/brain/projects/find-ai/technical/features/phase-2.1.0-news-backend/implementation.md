# Phase 2.1.0 — Implementation Summary

## What was built

`/workspace/find-ai-backend` — a stateless FastAPI news backend, 499 Python
lines total, 5 dependencies (fastapi, uvicorn, curl_cffi, pyyaml, pydantic).

## Files

| File | Lines | Responsibility |
|------|-------|----------------|
| `main.py` | ~120 | App wiring, 4 endpoints, request logging, CORS (allow all) |
| `models/schemas.py` | ~43 | RawArticle, NewsArticle, NewsFeedResponse, CategoriesResponse, ErrorResponse |
| `core/registry.py` | ~55 | feeds.yaml loader (cached), dynamic handler import, startup validation |
| `core/mapper.py` | ~65 | concepts.yaml loader, longest-first keyword matcher |
| `core/enricher.py` | ~21 | RawArticle → NewsArticle; id = sha256(link)[:16]; xp fixed 10; why_it_matters null |
| `handlers/google_news.py` | ~97 | Google News RSS: curl_cffi fetch, 24h date window, `<source url>` domain filter |
| `handlers/generic_rss.py` | ~97 | RSS 2.0 + Atom fallback for future feeds (tested against techcrunch.com/feed) |
| `config/feeds.yaml` | — | finance (20 max), startups (15), global (15) — all google_news handler |
| `config/concepts.yaml` | — | 10 concepts + c_default, keyword lists |

## Behavior notes discovered during build

- Google News RSS descriptions are just the linked headline — so `summary`
  ≈ `title` until Phase 2.2 LLM enrichment. Expected, fine for MVP.
- Trusted-domain filtering is aggressive: a 20-article cap can yield ~6
  articles for finance because Google News mixes many untrusted publishers.
- Most articles map to `c_default` since headlines rarely contain concept
  keywords; specific headlines (repo rate, IPO, CPI) map correctly —
  validated with a 6-case mapper test, all passing.
- `<source url="...">` attribute is the publisher homepage; matching is by
  netloc suffix with `www.` stripped.

## Run

```bash
cd find-ai-backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 3000
```

## Deploy (not done from cloud VM — no SSH key available)

```bash
ssh -i ~/.ssh/orecal.key ubuntu@152.67.178.243
# clone/pull repo, then run uvicorn under tmux or systemd
```

## App integration (done 2026-07-03)

Backend is deployed at `http://152.67.178.243` (port 80, behind the VM).
App wiring:

- `constants/api.ts` — `API_BASE = http://152.67.178.243`, `API_V1` helper
- `hooks/useNews.ts` — fetches `/api/v1/news` (10s timeout via AbortController),
  falls back to `MOCK_NEWS` when the API is unreachable, errors, or returns
  zero articles; exposes `{ articles, loading, isLive }`
- `app/(tabs)/news.tsx` — FlatList renders `useNews('all')` instead of
  `MOCK_NEWS`; "Learn this concept" link hidden when `concept_id` has no
  local concept (e.g. `c_default`)
- `app/(tabs)/home.tsx` — top news card reads from `useNews('all')`
- `config/concepts.yaml` — IDs/titles realigned to the app's `MOCK_CONCEPTS`
  catalog (c8 Balance Sheets, c9 Bull/Bear, c10 Index Funds, c11 GDP,
  c12 Cash Flow) so deep links resolve; keywords added for new concepts

Note: plain HTTP — fine in Expo Go/dev; production builds need ATS/cleartext
exceptions or HTTPS on the server.

## Infinite scroll / pagination (added 2026-07-03)

Backend (`?page=1&limit=20` on both news endpoints):

- Each page shifts the fetch window one day into the past. Page 1 =
  `after:yesterday before:tomorrow` (original behavior); page N shifts both
  bounds back by N-1 days. `google_news` passes the window in the query;
  `generic_rss` filters parsed items locally (upper bound exclusive to match
  Google's `before:` semantics).
- Response now includes `page` and `has_more`. `has_more` is true while the
  page returned articles and `page < MAX_PAGES` (30). Adjacent windows
  overlap by design; dedupe happens server-side per response and client-side
  across pages.
- Server upgraded from Python 3.9 to Python 3.12.12 via uv (2026-07-04).
  `from __future__ import annotations` still present but no longer required.

App:

- `useNews` tracks `page`/`hasMore`/`loadingMore` in refs+state, exposes
  `loadMore()`, appends deduped-by-id articles. Mock fallback still applies
  on page-1 failure only (then `hasMore` stays false so no dead requests).
- `news.tsx` FlatList: `onEndReached={loadMore}` with threshold 0.5 and an
  ActivityIndicator footer while fetching.

Deploy note: server layout changed to nginx :80 → uvicorn :8000.

## Server upgrades (2026-07-04)

- **Python 3.12:** Installed via `uv` (`~/.local/bin/uv`). Old 3.9 venv
  replaced with `uv venv --python 3.12` in `~/find-ai-backend/.venv/`.
- **Port 80:** Headscale Docker container stopped. nginx moved from
  port 8080 to port 80. iptables rule added and persisted.
- **Systemd:** `find-ai-backend.service` (Restart=always, port 8000).
  Old `bazaar-brief.service` stopped and disabled.

## Phase 2.2 swap points

- `core/enricher.py` → LLM summary + why_it_matters
- Add cache layer in `_fetch_category` (main.py) or a `core/cache.py`
- `useNews` → React Query once more endpoints exist
- Course content → Phase 2.2 adds Supabase Postgres tables + public/admin APIs
