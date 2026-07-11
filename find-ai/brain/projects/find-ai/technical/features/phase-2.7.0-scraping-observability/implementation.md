# Phase 2.7.0 — Implementation

## Repos / paths

| Component | Path |
|-----------|------|
| Scraper | `scrapping-service/` |
| LLM gateway | `llm-gateway/` |
| Observability docs/scripts | `observability/` |
| News backend (unchanged primary) | `find-ai-backend/` |

## Scraping service files

| File | Role |
|------|------|
| `main.py` | FastAPI app: `/health`, `/scrape`, `/traffic` |
| `scraper.py` | Thin wrapper → `TabManager` |
| `tab_manager.py` | Single-window multi-tab CloakBrowser |
| `otel_setup.py` | OTLP → SigNoz |
| `traffic.py` | In-memory in/out event ring buffer |
| `scripts/*.sh` | Ops + user systemd unit |
| `test_toi.py` | Local headed multi-tab experiment |

### Scrape behaviour

1. `page.goto(url, wait_until="load")`
2. `wait_for_load_state("networkidle")` (fallback: `load`)
3. Sleep `SCRAPE_SETTLE_SECONDS` (default 2)
4. Scroll page in steps (lazy content)
5. Sleep again
6. Return `page.content()` + `final_url`

Env: `SCRAPE_API_KEY`, `SCRAPE_HEADLESS`, `OTEL_*` — see `.env.example`.

## LLM gateway files

| File | Role |
|------|------|
| `main.py` | Streaming proxy + `llama.proxy` spans |
| `otel_setup.py` | OTEL service name `llama-server` |
| `scripts/llama-server.service` | llama on `127.0.0.1:18080 --metrics` |
| `scripts/llama-gateway.service` | uvicorn public `:8080` |

## Observability

- Foundry install: `observability/signoz/install.sh`
- Data dir on host: `~/signoz/pours/deployment`
- UI bind change in compose: `- 3301:8080`

## Deployed units (user systemd on phinex)

| Unit | Port |
|------|------|
| `scrapping-service.service` | 8100 |
| `llama-server.service` | 18080 (localhost) |
| `llama-gateway.service` | 8080 |
| SigNoz compose | 3301, 4317, 4318 |
| `uptime-kuma` docker | 3001 |

## Follow-ups (not done)

1. `find-ai-backend/core/scraper.py`: try curl_cffi → else `POST http://100.64.0.1:8100/scrape`
2. Decouple LLM enrichment into a queue consumer
3. Optional: scrape Prometheus `/metrics` from llama into SigNoz
