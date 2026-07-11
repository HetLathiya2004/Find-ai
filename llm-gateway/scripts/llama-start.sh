#!/usr/bin/env bash
# Start llama.cpp (localhost:18080) + OTEL gateway (public:8080)
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

systemctl --user start llama-server.service
systemctl --user start llama-gateway.service
sleep 1
systemctl --user --no-pager status llama-server.service llama-gateway.service || true
curl -sS http://127.0.0.1:8080/health || true
echo
echo "Public LLM API: http://100.64.0.1:8080"
echo "SigNoz traces:  service name = llama-server"
