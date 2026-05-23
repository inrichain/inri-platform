#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "== Static bridge fix: removing broken Next route and keeping /public/bridge/index.html =="
rm -rf src/app/bridge
mkdir -p public/bridge
test -f public/bridge/index.html
echo "OK: public/bridge/index.html exists. Now run: pnpm install --no-frozen-lockfile && CUSTOM_DOMAIN=platform.inri.life GITHUB_ACTIONS=true pnpm build"
