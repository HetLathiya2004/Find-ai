# Phase 2.7.0 — Scraping Service + Observability (Intent)

## Goal

Add a **standalone CloakBrowser scraping service** for full-page HTML capture when RSS + `curl_cffi` is not enough, plus an open-source **observability stack** (SigNoz + OpenTelemetry) for request-level visibility across the scraper and the llama.cpp inference engine.

## Motivation

- Phase 2.1 news path uses RSS + `curl_cffi` regex extraction. That fails on JS-heavy / bot-walled finance pages and Google News redirects.
- Enrichment (LLM summary) was tightly coupled in the FastAPI scheduler loop — scrape failures and LLM latency share one cycle.
- Need a **separate deployable scraper** that only returns fully loaded page HTML (no preprocessing). Downstream handlers own extract / queue / LLM / DB.
- Need real observability (incoming + outgoing requests), not just uptime pings.

## Scope (IN)

| Area | Included |
|------|----------|
| Scraping service | FastAPI `POST /scrape`, `GET /health`, `GET /traffic` |
| Browser | CloakBrowser — full load + settle (2s) + scroll; multi-tab in one window |
| Deploy host | Tailscale `phinex@100.64.0.1` (archcraft), user systemd |
| LLM gateway | OTEL reverse proxy `:8080` → llama.cpp `127.0.0.1:18080` |
| Observability | SigNoz (UI `:3301`, OTLP `:4317`) + OpenTelemetry on scraper + LLM gateway |
| Scripts layout | Separation of concerns: each service owns `scripts/`; shared ops in `observability/` |

## Out of scope

- Wiring scraper fallback into `find-ai-backend` scheduler (next)
- Redis / proper queue worker for LLM enrichment (planned)
- Text extraction / summarization inside the scraping service
- Changing Oracle VM news backend deploy in this phase
- HTTPS

## Constraints

- Scraper returns **raw fully loaded HTML only** — no extract/clean/summarize
- Keep RSS + `curl_cffi` as primary; CloakBrowser is fallback / hard sites
- Public LLM URL stays `http://100.64.0.1:8080` (gateway in front of llama)
- SigNoz UI on **3301** because llama/gateway owns **8080**
- Remote non-interactive SSH `PATH` is broken (`/usr/share/archcraft/scripts` only) — scripts export a full PATH

## Success criteria

- [x] `scrapping-service` runs on `:8100` with `/health` + `/scrape`
- [x] CloakBrowser headed multi-tab experiment on TOI succeeded
- [x] SigNoz deployed; OTEL traces from `scrapping-service` and `llama-server`
- [x] llama.cpp behind OTEL gateway; start/stop scripts
- [x] Folder layout: `scrapping-service/scripts/`, `llm-gateway/scripts/`, `observability/`
- [ ] Backend calls scraper when `curl_cffi` returns empty
- [ ] Queue-based LLM worker consumes scraped payloads

## Related

- **Code:** `/Users/chpatel/FinBro/scrapping-service`, `llm-gateway`, `observability`
- **Host:** `phinex@100.64.0.1` (Tailscale)
- **Previous:** Phase 2.1 News Backend (`../phase-2.1.0-news-backend/`)
- **LLM:** llama.cpp Qwen3-8B on same host (`llama-server.service`)
