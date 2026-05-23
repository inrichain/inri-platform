# iUSD Bridge clean restore

This package is based on the clean original site ZIP and does only two things:

1. Restores the original Home/Header/Footer files from the original site package.
2. Adds a real Next route at `/bridge/` with the iUSD bridge UI.

It does not modify contracts, bridge server, watchers, PM2, claims or releases.

Important validation before push:

```bash
pnpm install --no-frozen-lockfile
CUSTOM_DOMAIN=platform.inri.life GITHUB_ACTIONS=true pnpm build
ls -la out/bridge/index.html
```

Do not push if `out/bridge/index.html` does not exist.
