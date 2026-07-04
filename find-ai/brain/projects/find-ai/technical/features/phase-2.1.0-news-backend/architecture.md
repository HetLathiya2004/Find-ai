# Phase 2.1.0 — Architecture

## Core principle: Config + Handler Registry

```
Layer 1: FastAPI Core (main.py, core/)     — never changes
Layer 2: Config (feeds.yaml, concepts.yaml) — defines feeds + concept keywords
Layer 3: Handlers (handlers/*.py)           — one per RSS format
```

Adding a feed = add a `feeds.yaml` entry (+ handler file if it's a new
format). `core/registry.py` dynamically imports `handlers.{name}` via
`importlib` and dispatches to the configured function. Verified: a
`techcrunch` entry using `generic_rss` worked with zero core edits.

## Request flow

```
GET /api/v1/news/{category}
  → registry.get_handler(category)     (KeyError → 404)
  → handler.fetch_and_parse(url, params, max_articles, trusted_domains)
  → mapper.map_to_concept(title, description)  per article
  → enricher.enrich_article(raw, concept_id, concept_title)
  → NewsFeedResponse (sorted by published_at desc)
```

`GET /api/v1/news` runs all categories with `asyncio.gather`, dedupes by
article id, and returns category `"all"`.

## Handler contract

```python
async def fetch_and_parse(url, params, max_articles, trusted_domains) -> list[RawArticle]
```

Rules: pure function (no FastAPI/core/other-handler imports), never crashes
(returns `[]` + logs on failure), strips HTML, dedupes by link, filters by
`trusted_domains` (empty list = allow all), caps at `max_articles`,
normalizes dates to `YYYY-MM-DD`.

## Key decisions

| Decision | Rationale |
|----------|-----------|
| `curl_cffi` over httpx/requests | Google News blocks by TLS/JA3 fingerprint; `impersonate="chrome"` mimics a real browser below the header level |
| `xml.etree.ElementTree` over feedparser | Stdlib, fewer deps, Google News RSS is plain RSS 2.0 |
| Article id = sha256(link)[:16] | Deterministic, dedupe-friendly, no DB needed |
| Longest-keyword-first + masking in mapper | "compound interest" must win over "interest rate"; matched phrases are blanked out so substrings can't double-count |
| Handler errors → `status: "error"` + empty list, HTTP 200 | The app must never crash on feed failures; only unknown categories get 404 |
| Config validated at import time | Missing feeds.yaml / handler module fails startup loudly, not at request time |
| Google News query gets `after:/before:` appended | Restricts results to ~last 24h per spec |

## Concept mapping algorithm (`core/mapper.py`)

1. Lowercase title + description into one string
2. All (keyword, concept) pairs sorted by keyword length descending
3. Each match counts a hit for its concept and is masked from the text
4. Highest hit count wins; ties → earlier concept in concepts.yaml
5. Zero hits everywhere → `c_default` ("Financial Literacy")
