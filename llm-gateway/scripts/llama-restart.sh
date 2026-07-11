#!/usr/bin/env bash
# Restart llama.cpp + OTEL gateway
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

systemctl --user restart llama-server.service
sleep 2
systemctl --user restart llama-gateway.service
sleep 1
systemctl --user --no-pager status llama-server.service llama-gateway.service || true
curl -sS http://127.0.0.1:8080/health || true
echo
