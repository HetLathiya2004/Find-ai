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

## Phase 2.2 swap points

- `core/enricher.py` → LLM summary + why_it_matters
- Add cache layer in `_fetch_category` (main.py) or a `core/cache.py`
- App side: `constants/api.ts` with `API_BASE = http://152.67.178.243:3000/api/v1`
