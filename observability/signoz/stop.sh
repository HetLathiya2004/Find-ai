#!/usr/bin/env bash
# Stop SigNoz (Docker Compose) — keeps volumes/data
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

SIGNOZ_DIR="${SIGNOZ_DIR:-$HOME/signoz/pours/deployment}"
cd "$SIGNOZ_DIR"

docker compose stop
docker compose ps -a || true
echo "SigNoz stopped (data volumes preserved)."
