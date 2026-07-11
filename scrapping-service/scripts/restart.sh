#!/usr/bin/env bash
# Restart scrapping-service (user systemd)
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

systemctl --user restart scrapping-service.service
sleep 1
systemctl --user --no-pager status scrapping-service.service
curl -sS http://127.0.0.1:8100/health || true
echo
