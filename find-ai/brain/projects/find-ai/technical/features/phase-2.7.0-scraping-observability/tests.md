# Phase 2.7.0 — Tests / Verification

## Scraping service

- [x] `GET http://100.64.0.1:8100/health` → `{"ok":true,...}`
- [x] Headed CloakBrowser TOI startups page captures ~500KB HTML
- [x] Multi-tab (5) in **one** Chrome window via `BrowserContext`
- [x] Settle 2s + scroll before capture
- [x] `POST /scrape` accepts url / urls (max 5)
- [x] User systemd restart survives; `~/bin/scrape-*` scripts work

## LLM gateway

- [x] `GET http://100.64.0.1:8080/health` → llama status ok through gateway
- [x] `POST /v1/chat/completions` streams/returns completion
- [x] Upstream only on `127.0.0.1:18080`
- [x] `~/bin/llama-*` start/stop/status

## SigNoz / OTEL

- [x] UI health `http://100.64.0.1:3301/api/v1/health` → `{"status":"ok"}`
- [x] OTLP `:4317` accepting connections
- [x] Smoke span export from scraper host succeeds
- [x] Fixed: do not exclude `/health`; do not use `BaseHTTPMiddleware` (breaks spans)
- [x] Services expected in UI: `scrapping-service`, `llama-server`
- [ ] Operator confirms traces visible in SigNoz Traces (Last 15m)

## Layout / hygiene

- [x] Removed accidental `scrapping-service/phinex@100.64.0.1`
- [x] Scripts split: scraper / llm-gateway / observability
- [x] `.gitignore` at root + `scrapping-service` + `llm-gateway` + `observability`

## Manual checks

```bash
curl -s http://100.64.0.1:8100/health
curl -s http://100.64.0.1:8080/health
curl -s http://100.64.0.1:3301/api/v1/health

# On host
export PATH=/usr/bin:/bin:$HOME/bin:$PATH
scrape-status
llama-status
signoz-status
```
