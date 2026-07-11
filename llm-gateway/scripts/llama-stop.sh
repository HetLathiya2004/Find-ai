#!/usr/bin/env bash
# Stop OTEL gateway + llama.cpp
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

systemctl --user stop llama-gateway.service || true
systemctl --user stop llama-server.service || true
systemctl --user --no-pager status llama-server.service llama-gateway.service || true
echo "llama stopped."
