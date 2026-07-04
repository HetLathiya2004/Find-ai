# Phase 2.1.0 — News Backend API (Intent)

## Goal

Build the first real data source for Find.ai: a FastAPI backend that fetches
finance news from RSS feeds, maps each article to a learning concept via
keyword matching, and serves a JSON feed matching the app's
`MockNewsArticle` interface exactly — so the News tab can swap mock data for
the API with zero transformation.

## Scope (IN)

| Area | Included |
|------|----------|
| RSS fetching | Google News RSS (finance, startups, global categories) |
| Parsing | RSS 2.0 via ElementTree; HTML stripping; date normalization |
| Concept mapping | Keyword-based, longest-phrase-first, c_default fallback |
| Enrichment | Dummy stub (fixed +10 XP, `why_it_matters: null`) |
| Config-driven | `feeds.yaml` + handler registry — new feeds need zero core changes |
| Endpoints | `/health`, `/api/v1/categories`, `/api/v1/news`, `/api/v1/news/{category}` |

## Out of scope (later phases)

- Article content extraction / scraping (no trafilatura)
- LLM enrichment (Phase 2.2 — `core/enricher.py` is the swap point)
- Caching (Phase 2.2), auth + rate limiting (Phase 2.3)
- Database, push notifications, Google News URL decoding

## Constraints

- Python 3.11+, stateless, no DB
- `curl_cffi` with `impersonate="chrome"` (TLS fingerprint evasion — Google
  News blocks plain httpx/requests)
- Codebase under 500 Python lines (config excluded)
- Deploy target: Oracle VM `152.67.178.243`, port 3000, plain uvicorn

## Related

- **Code:** `/workspace/find-ai-backend`
- **Branch:** `cursor/news-backend-phase-2-1-a34f`
- **Previous:** Phase 1 — Expo UI shells (`../phase-1-expo-ui/`)
- **App integration (separate task):** replace `MOCK_NEWS` in
  `app/(tabs)/news.tsx` with `GET /api/v1/news/finance`
