# INRI Championship Automation

This patch updates the mining championship page automatically without creating another server.

## What it adds

- `scripts/build-championship.mjs`
- `.github/data/mining-championship-cache.json`
- `.github/workflows/deploy-pages.yml`

## How it works

1. GitHub Actions runs on every push, on manual dispatch, and every 10 minutes.
2. `node scripts/build-championship.mjs` reads the INRI RPC and updates `public/mining-championship.json`.
3. The workflow commits the updated feed/cache back to the repo.
4. The same workflow builds and deploys the site to GitHub Pages.

## Optional Repository Variables

Open **Settings -> Secrets and variables -> Actions -> Variables** and create these if you want custom values:

- `CHAMPIONSHIP_RPC_URL`
- `CHAMPIONSHIP_POOLS_API_URL`
- `CHAMPIONSHIP_POOL_ID`
- `CHAMPIONSHIP_POOL_PAYOUT_ADDRESS`
- `CHAMPIONSHIP_START_BLOCK`
- `CHAMPIONSHIP_END_BLOCK`
- `CHAMPIONSHIP_BASE_REWARD_PER_BLOCK`
- `CHAMPIONSHIP_MAX_BLOCKS_PER_RUN`
- `CHAMPIONSHIP_POOL_PAGES_PER_RUN`
- `CHAMPIONSHIP_POOL_PAGE_SIZE`
- `CHAMPIONSHIP_REQUEST_DELAY_MS`
- `CHAMPIONSHIP_DEBUG`

If you do not create them, the script uses built-in defaults.

## Recommended first run

1. Upload these files into the repo root.
2. Commit and push.
3. Open **Actions**.
4. Run **Deploy Next.js to GitHub Pages** manually.
5. Mark `reset_championship_cache = true` only on the first run if you want a full rebuild from block 1,000,000.
6. Wait for the workflow to finish.
7. Open `/mining-championship/`.

## Important note about pool SOLO attribution

The script tries to read SOLO pool block data from the pool API. If the pool endpoint returns miner addresses, the championship can attribute SOLO-pool blocks to the correct wallet. If not, the script still works with direct chain miner addresses and keeps the site live.
