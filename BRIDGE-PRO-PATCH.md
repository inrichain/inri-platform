# INRI iUSD Bridge Professional Site Patch

This patch adds a professional `/bridge` route to the official INRI site without changing the working bridge backend, contracts, watchers, PM2 processes or wallet deployment.

## Added

- `components/inri-bridge-page.tsx`
- `src/app/bridge/page.tsx`
- Main navigation link: `Bridge`
- Homepage primary route card and hero button: `Open iUSD Bridge`
- Footer links to the new route

## Preserved

- Existing header wallet connection and WalletConnect flow
- Existing bridge engine at `https://iusd-bridge.inri.life`
- Existing buy/sell/claim pages
- Polygon watcher and INRI burn watcher
- Claim/release API endpoints

## Direct integration included

- Reads `window.__INRI_ACTIVE_WALLET__` from the existing header connect wallet button.
- Supports Polygon USDT allowance and approval.
- Supports Polygon lockbox `deposit(uint256)` for Buy iUSD.
- Polls `/api/claim/:id` after deposit.
- If the API exposes raw transaction payload `{ to, data, value? }`, the page can submit the claim transaction from the site.
- If the API does not expose raw transaction payload, it safely falls back to the existing claim page instead of guessing calldata.

## Safe limitation

The uploaded site zip does not include the bridge server code or the exact `burnForPolygonRelease(...)` ABI used by the working sell engine. For safety, the Sell iUSD tab opens the existing live sell engine until the exact burn ABI/API transaction payload is available. This avoids sending a guessed burn transaction that could fail or confuse users.

## Important addresses

- Polygon USDT: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- Polygon Lockbox: `0x7E2e6d4881e1470D541599397b4876b449296071`
- INRI Executor: `0x07DE046e96c33a8E575234282e1CccAC56d3d880`
- INRI iUSD: `0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC`
- Bridge origin: `https://iusd-bridge.inri.life`
