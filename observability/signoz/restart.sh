#!/usr/bin/env bash
# Restart SigNoz (Docker Compose)
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

SIGNOZ_DIR="${SIGNOZ_DIR:-$HOME/signoz/pours/deployment}"
cd "$SIGNOZ_DIR"

docker compose restart
sleep 2
docker compose ps
curl -sS http://127.0.0.1:3301/api/v1/health || true
echo
echo "SigNoz UI: http://100.64.0.1:3301"
