# Scraping Service

Standalone CloakBrowser scraper. Returns **fully loaded page HTML** only.

## Layout

```
scrapping-service/
  main.py, scraper.py, tab_manager.py, otel_setup.py, traffic.py
  scripts/          # start/stop/status + systemd unit + deploy (this service only)
```

Shared infra (SigNoz, Uptime Kuma) lives in `../observability/`.
LLM gateway lives in `../llm-gateway/`.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness |
| `POST` | `/scrape` | Scrape URL(s) → full HTML |
| `GET` | `/traffic` | Local request log UI |

```bash
curl -s http://100.64.0.1:8100/health
curl -s -X POST http://100.64.0.1:8100/scrape \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: <key>' \
  -d '{"url":"https://example.com"}'
```

## Local run

```bash
uv sync
cp .env.example .env
uv run uvicorn main:app --host 0.0.0.0 --port 8100
```

## Scripts (this service only)

```bash
./scripts/start.sh
./scripts/stop.sh
./scripts/restart.sh
./scripts/status.sh
./scripts/deploy.sh          # sync to phinex@100.64.0.1
```

On the host: `~/bin/scrape-start` etc. (symlinks into `scripts/`).

## Observability

- SigNoz UI: http://100.64.0.1:3301 (scripts in `../observability/signoz/`)
- OTEL service name: `scrapping-service`
