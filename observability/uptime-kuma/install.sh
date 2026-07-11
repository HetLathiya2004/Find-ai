#!/usr/bin/env bash
# Install Uptime Kuma on the Tailscale host for service health / crash monitoring
set -euo pipefail

REMOTE="${REMOTE:-phinex@100.64.0.1}"

ssh "${REMOTE}" bash -s <<'EOF'
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found — installing docker.io..."
  if command -v pacman >/dev/null 2>&1; then
    sudo pacman -Sy --noconfirm docker
  elif command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update && sudo apt-get install -y docker.io
  else
    echo "Install Docker manually, then re-run."; exit 1
  fi
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER" || true
fi

# Create container if missing
if ! sudo docker ps -a --format '{{.Names}}' | grep -qx uptime-kuma; then
  sudo docker run -d \
    --name uptime-kuma \
    --restart=always \
    -p 3001:3001 \
    -v uptime-kuma:/app/data \
    louislam/uptime-kuma:1
else
  sudo docker start uptime-kuma || true
fi

sudo docker ps --filter name=uptime-kuma
echo
echo "Uptime Kuma UI: http://100.64.0.1:3001"
echo "Add monitors:"
echo "  - HTTP: http://100.64.0.1:8100/health  (scrapping-service)"
echo "  - HTTP: any other services you deploy"
echo "  - Docker / Port / Keyword monitors as needed"
EOF
