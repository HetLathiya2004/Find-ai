# Find.ai News Backend (Phase 2.1.0)

FastAPI backend that serves the Find.ai News tab. Fetches finance news from
RSS feeds, maps each article to a learning concept via keyword matching, and
returns a JSON feed matching the app's `MockNewsArticle` interface.

## Architecture

```
Layer 1: FastAPI Core (main.py, core/) — never changes
Layer 2: Config (config/feeds.yaml, config/concepts.yaml)
Layer 3: Handlers (handlers/*.py) — one per RSS format
```

Adding a new RSS source = add an entry in `config/feeds.yaml` and (if the feed
uses a new format) drop a handler file in `handlers/`. Zero core changes.

## Layout

| Path | Responsibility |
|------|----------------|
| `main.py` | FastAPI app, endpoints, request logging |
| `config/feeds.yaml` | Feed definitions: URL, handler, params, trusted domains |
| `config/concepts.yaml` | Concept catalog + keyword rules |
| `core/registry.py` | Reads feeds.yaml, dynamically imports handlers |
| `core/mapper.py` | Keyword → concept mapping (longest phrase wins) |
| `core/enricher.py` | Dummy enrichment stub (Phase 2.2: LLM) |
| `handlers/google_news.py` | Google News RSS parser (curl_cffi + ElementTree) |
| `handlers/generic_rss.py` | Standard RSS 2.0 / Atom parser (future feeds) |
| `models/schemas.py` | Pydantic models |

## Handler contract

Every handler exposes:

```python
async def fetch_and_parse(url, params, max_articles, trusted_domains) -> list[RawArticle]
```

Handlers are pure (URL in → articles out), never crash (return `[]` on
failure), strip HTML, dedupe by URL, filter by trusted domains, and use
`curl_cffi.AsyncSession` with `impersonate="chrome"` to avoid TLS-fingerprint
blocking.

## API

| Endpoint | Returns |
|----------|---------|
| `GET /health` | `{"status": "ok"}` |
| `GET /api/v1/categories` | Available categories |
| `GET /api/v1/news/{category}` | Feed for one category (404 if unknown) |
| `GET /api/v1/news` | All categories combined, sorted by date desc |

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 3000
```

## Deploy (Oracle VM)

```bash
ssh -i ~/.ssh/orecal.key ubuntu@152.67.178.243
# on the server:
cd find-ai-backend && uvicorn main:app --host 0.0.0.0 --port 3000
```

Run under `systemd` or `tmux` for restart-on-crash.

## Phase 2.2+ (not built here)

Caching, LLM enrichment (`core/enricher.py` is the swap point), article
content extraction, auth, rate limiting.
