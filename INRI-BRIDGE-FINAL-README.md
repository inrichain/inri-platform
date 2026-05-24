# iUSD Bridge final package

This package keeps the existing INRI site and adds the professional `/bridge/` page with Buy iUSD, Sell iUSD, Check Claim, Claim iUSD, Check Release, and Claim USDT.

Changed files:

- `src/app/bridge/page.tsx`
- `components/inri-bridge-page.tsx`
- `components/inri-site-shell.tsx`
- `package.json`

The frontend uses the existing bridge APIs:

- `https://iusd-bridge.inri.life/api/claim/:id`
- `https://iusd-bridge.inri.life/api/release/:id`

The current server CORS already allows `https://platform.inri.life`.
