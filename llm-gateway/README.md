# LLM Gateway

OTEL reverse proxy in front of llama.cpp.

```
Clients → :8080 (this gateway) → 127.0.0.1:18080 (llama.cpp)
              ↓
        SigNoz service: llama-server
```

## Layout

```
llm-gateway/
  main.py, otel_setup.py
  scripts/     # start/stop/status + systemd units (this stack only)
```

## Scripts

```bash
./scripts/llama-start.sh
./scripts/llama-stop.sh
./scripts/llama-restart.sh
./scripts/llama-status.sh
```

On the host: `~/bin/llama-start` etc.
