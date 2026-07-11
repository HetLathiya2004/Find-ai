#!/usr/bin/env bash
# Status + recent logs for scrapping-service
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

systemctl --user --no-pager status scrapping-service.service || true
echo "--- recent logs ---"
journalctl --user -u scrapping-service.service -n 50 --no-pager || true
echo "--- health ---"
curl -sS http://127.0.0.1:8100/health || true
echo
