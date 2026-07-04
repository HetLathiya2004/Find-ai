# Phase 2.1.0 — Tests & Validation

All tests run locally (cloud VM, Python 3.12, uvicorn on port 3000) on
2026-07-03 against live Google News RSS.

## Verification checklist results

| Check | Result |
|-------|--------|
| `GET /health` → `{"status": "ok"}` | PASS |
| `GET /api/v1/categories` → 3 categories | PASS |
| `GET /api/v1/news/finance` correct shape | PASS (6 live articles) |
| `GET /api/v1/news/startups` correct shape | PASS (1 live article) |
| `GET /api/v1/news/global` correct shape | PASS (1 live article) |
| `GET /api/v1/news` combined | PASS (8 articles, ~0.5s parallel fetch) |
| `GET /api/v1/news/nonexistent` → 404 + available list | PASS |
| Every article has concept_id + concept_title | PASS (asserted) |
| Sorted by published_at desc | PASS (asserted) |
| No duplicate URLs/ids per response | PASS (asserted) |
| Shape matches MockNewsArticle keys exactly | PASS (asserted key set) |
| New feeds.yaml entry works without core changes | PASS (techcrunch + generic_rss, then removed) |
| Logs show category, handler, count, timing | PASS (`category=... handler=... articles=... time=...ms`) |
| Codebase under 500 lines | PASS (499) |
| Server on Oracle VM port 3000 | NOT DONE — no SSH key in cloud VM (see below) |

## Mapper unit checks (6/6 pass)

| Headline | Expected | Got |
|----------|----------|-----|
| "RBI announces repo rate cut of 25 basis points" | c7 Interest Rates | c7 |
| "How compound interest rate on your fixed deposit works" | c2 (longest-first beats c7) | c2 |
| "Ather Energy IPO debut: shares list at premium" | c9 IPO | c9 |
| "India CPI inflation eases to 4.1%..." | c3 Inflation | c3 |
| "Sensex hits all-time high as bull market rally..." | c8 Bull/Bear | c8 |
| "Random cricket match report" | c_default | c_default |

## Not validated

- [ ] Deployment on Oracle VM (`~/.ssh/orecal.key` not present in this
  environment — deploy manually or add the key as a Cloud Agent secret)
- [ ] Behavior under Google News rate limiting / long-term blocking
- [ ] App-side integration (separate task)
