# iUSD Bridge Direct 404 Fix

This package fixes the live `/bridge/` 404 by replacing the bridge route with a self-contained page at:

```txt
src/app/bridge/page.tsx
```

It does not touch contracts, watchers, PM2, claims, releases, bridge server files or wallets.

## Apply

```bash
cd /path/to/inri-platform-main
cp -a . "/root/inri-platform-before-bridge-direct-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
# copy/replace the files from this package into the repository
pnpm install --no-frozen-lockfile
CUSTOM_DOMAIN=platform.inri.life GITHUB_ACTIONS=true pnpm build
ls -la out/bridge/index.html
```

If `out/bridge/index.html` does not exist, the deploy must not continue. The GitHub Action now checks this automatically.

## Test after deploy

```txt
https://platform.inri.life/bridge/
https://platform.inri.life/bridge.html
```
