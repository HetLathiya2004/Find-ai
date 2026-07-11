#!/usr/bin/env bash
# Install SigNoz (Foundry + Docker Compose) on this machine
set -euo pipefail
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/home/phinex/.local/bin:${PATH:-}

SIGNOZ_DIR="${SIGNOZ_DIR:-$HOME/signoz}"
mkdir -p "$SIGNOZ_DIR"
cd "$SIGNOZ_DIR"

if ! command -v foundryctl >/dev/null 2>&1; then
  echo "==> Installing foundryctl"
  curl -fsSL https://signoz.io/foundry.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
fi

# Ensure foundry is on PATH (installer may put it in ~/.local/bin or ~/.foundry/bin)
export PATH="$HOME/.local/bin:$HOME/.foundry/bin:$PATH"
command -v foundryctl

cat > casting.yaml <<'YAML'
apiVersion: v1alpha1
kind: Installation
metadata:
  name: signoz
spec:
  deployment:
    flavor: compose
    mode: docker
YAML

echo "==> Casting SigNoz (this downloads images — may take several minutes)"
foundryctl cast -f casting.yaml

echo
echo "SigNoz UI:     http://100.64.0.1:8080"
echo "OTLP gRPC:     http://127.0.0.1:4317"
echo "OTLP HTTP:     http://127.0.0.1:4318"
echo
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | head -40
