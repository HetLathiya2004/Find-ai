#!/usr/bin/env bash
# Stop scrapping-service (user systemd)
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

systemctl --user stop scrapping-service.service
systemctl --user --no-pager status scrapping-service.service || true
