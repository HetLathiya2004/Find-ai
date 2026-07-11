#!/usr/bin/env bash
# Deploy scrapping-service to Tailscale host (phinex@100.64.0.1)
set -euo pipefail

REMOTE="${REMOTE:-phinex@100.64.0.1}"
REMOTE_DIR="${REMOTE_DIR:-/home/phinex/scrapping-service}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH=(ssh -o BatchMode=yes -o IdentitiesOnly=yes -i "${SSH_KEY:-$HOME/.ssh/id_ed25519}")

echo "==> Syncing code to ${REMOTE}:${REMOTE_DIR}"
tar -C "$ROOT" -cf - \
  --exclude '.venv' --exclude 'out' --exclude '__pycache__' --exclude '.git' --exclude '*.html' \
  . | "${SSH[@]}" "$REMOTE" "/bin/mkdir -p ${REMOTE_DIR} && export PATH=/usr/bin:/bin; /bin/tar -xf - -C ${REMOTE_DIR}"

echo "==> Installing deps + enabling user systemd unit"
"${SSH[@]}" "$REMOTE" "export PATH=/usr/bin:/bin:/usr/sbin:/sbin:\$HOME/.local/bin
set -e
cd ${REMOTE_DIR}
uv sync
if [ ! -f .env ]; then cp .env.example .env; echo Created .env; fi
mkdir -p \$HOME/.config/systemd/user
cp scripts/scrapping-service.user.service \$HOME/.config/systemd/user/scrapping-service.service
systemctl --user daemon-reload
systemctl --user enable --now scrapping-service.service
sleep 1
systemctl --user --no-pager status scrapping-service.service || true
curl -sS http://127.0.0.1:8100/health || true
echo
"

echo "==> Deploy done. Health: http://100.64.0.1:8100/health"
