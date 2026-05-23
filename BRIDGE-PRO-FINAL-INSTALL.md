# iUSD Bridge Professional Page — Final Patch

This patch adds a real professional bridge route inside the official site:

- `/bridge/` — Next.js route with the same INRI visual system.
- `/bridge` — static fallback redirect for GitHub Pages/custom-domain deployments.
- Header, home hero, home route card and footer now expose the iUSD Bridge.

## What was changed

```txt
components/inri-bridge-page.tsx
src/app/bridge/page.tsx
src/app/not-found.tsx
public/bridge.html
components/inri-site-shell.tsx
components/inri-homepage.tsx
```

## What was not touched

```txt
No contract changes
No PM2 changes
No watcher changes
No bridge-server changes
No claim/release database changes
```

## Features

- Same wallet state as the existing site header.
- Buy iUSD: Polygon USDT approve/deposit into the lockbox.
- Sell iUSD: INRI iUSD burn using the ERC20 burn(uint256) selector.
- Automatic receipt log scan to discover likely bytes32 bridge IDs.
- Automatic polling of `/api/claim/:id` and `/api/release/:id`.
- Claim transaction support if the API returns `{ to, data, value? }` or equivalent nested calldata.
- Safe recovery fallback to the existing bridge claim page when calldata is not exposed by the API.
- Local browser history.

## Deploy

```bash
pnpm install --no-frozen-lockfile
pnpm build

git add .
git commit -m "Add professional iUSD bridge page"
git push
```

Then test:

```txt
https://platform.inri.life/bridge/
https://platform.inri.life/bridge
```

Use a small value first.
