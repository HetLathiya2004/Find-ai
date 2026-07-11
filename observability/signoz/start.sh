#!/usr/bin/env bash
# Start SigNoz (Docker Compose)
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

SIGNOZ_DIR="${SIGNOZ_DIR:-$HOME/signoz/pours/deployment}"
cd "$SIGNOZ_DIR"

docker compose up -d
sleep 2
docker compose ps
echo
curl -sS http://127.0.0.1:3301/api/v1/health || curl -sS http://127.0.0.1:8080/api/v1/health || true
echo
echo "SigNoz UI: http://100.64.0.1:3301"
