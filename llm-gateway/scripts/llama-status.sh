#!/usr/bin/env bash
# Status for llama.cpp + OTEL gateway
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

echo "=== systemd ==="
systemctl --user --no-pager status llama-server.service llama-gateway.service || true
echo
echo "=== health (gateway :8080) ==="
curl -sS http://127.0.0.1:8080/health || echo fail
echo
echo "=== upstream (llama :18080) ==="
curl -sS http://127.0.0.1:18080/health || echo fail
echo
echo "=== metrics (llama) ==="
curl -sS http://127.0.0.1:18080/metrics 2>/dev/null | head -5 || echo no_metrics
echo
echo "Public: http://100.64.0.1:8080  |  SigNoz service: llama-server"
