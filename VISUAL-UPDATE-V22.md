# INRI Platform Visual Update V22

This package applies a stronger, unified visual system across the INRI site.

## Main changes

- Added `components/inri-design-system.tsx` with shared hero, feature cards, section headers and panel wrappers.
- Rebuilt the Home, Mining, Pool, Staking, Token Factory, P2P and generic template pages around the same layout language.
- Added the V22 CSS layer in `src/app/globals.css` for stronger glass panels, cleaner squared buttons, better contrast and mobile-first spacing.
- Updated the header navigation glass style so the whole site feels closer to one premium product instead of separate pages.
- Preserved the functional clients for Pool, Staking, Token Factory and P2P; they are now wrapped in the new shared panels.

## Files changed most

- `components/inri-design-system.tsx`
- `components/inri-homepage.tsx`
- `components/inri-page-template.tsx`
- `components/inri-mining-page.tsx`
- `components/inri-pool-page.tsx`
- `components/inri-staking-page.tsx`
- `components/inri-token-factory-page.tsx`
- `components/inri-p2p-page.tsx`
- `components/inri-site-shell.tsx`
- `src/app/globals.css`

## Deploy

Use the same GitHub/Next deploy flow you were already using. After replacing the files, run:

```bash
pnpm install
pnpm build
```

Then push/deploy normally.
