# iUSD Bridge static route fix

This fixes the published `/bridge/` 404 by avoiding the broken App Router route and shipping the bridge as a guaranteed static file:

- removes `src/app/bridge/`
- adds `public/bridge/index.html`
- keeps the same official platform style
- does not change contracts, watchers, PM2, claims, releases, or the bridge server

Deploy checklist:

```bash
rm -rf src/app/bridge
unzip -o inri-platform-main-BRIDGE-STATIC-REAL-FIX.zip
cd inri-platform-main
chmod +x APPLY-BRIDGE-STATIC-FIX.sh
./APPLY-BRIDGE-STATIC-FIX.sh
pnpm install --no-frozen-lockfile
CUSTOM_DOMAIN=platform.inri.life GITHUB_ACTIONS=true pnpm build
ls -la out/bridge/index.html
git add -A
git commit -m "Fix iUSD bridge static route"
git push
```

After GitHub Actions finishes, open:

```txt
https://platform.inri.life/bridge/
```
