#!/usr/bin/env bash
# Status + health for SigNoz
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

SIGNOZ_DIR="${SIGNOZ_DIR:-$HOME/signoz/pours/deployment}"
cd "$SIGNOZ_DIR"

echo "=== docker compose ps ==="
docker compose ps -a || true
echo
echo "=== health ==="
curl -sS http://127.0.0.1:3301/api/v1/health || echo "UI not responding on :3301"
echo
echo "=== OTLP ports ==="
ss -tlnp 2>/dev/null | grep -E ':4317|:4318|:3301' || true
echo
echo "SigNoz UI: http://100.64.0.1:3301"
echo "OTLP gRPC: 127.0.0.1:4317"
