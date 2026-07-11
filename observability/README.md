# Observability

Shared monitoring stack for services on `phinex@100.64.0.1`.  
Not owned by any single app — scrapers/LLM keep their own `scripts/`.

```
observability/
  signoz/         # traces / metrics / logs UI
  uptime-kuma/    # simple up/down checks (optional)
```

## SigNoz

| | |
|--|--|
| UI | http://100.64.0.1:3301 |
| OTLP gRPC | `127.0.0.1:4317` |

```bash
./signoz/install.sh
./signoz/start.sh
./signoz/stop.sh
./signoz/restart.sh
./signoz/status.sh
```

On the host: `~/bin/signoz-start` … (symlinks).

Services exporting traces:
- `scrapping-service` → CloakBrowser scraper (:8100)
- `llama-server` → LLM gateway in front of llama.cpp (:8080)

## Uptime Kuma

```bash
./uptime-kuma/install.sh
```

UI: http://100.64.0.1:3001
