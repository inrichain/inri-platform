# Bridge V7 - Auto Release Flow

Este pacote deixa o fluxo de venda mais fácil para usuário comum.

## Correção principal

Depois do burn iUSD, o site usa o burn transaction hash para consultar `/api/release/:id`.
O servidor já resolve esse burnTxHash para o releaseId correto.

Resultado: o usuário não precisa copiar release ID.

## Fluxo esperado

Buy iUSD:
Connect wallet -> Approve/Deposit USDT -> Auto claim iUSD -> Done

Sell iUSD:
Connect wallet -> Burn iUSD -> Auto release USDT -> Claim USDT -> Done

## Arquivos principais

- components/inri-bridge-page.tsx
- src/app/bridge/page.tsx
- components/inri-site-shell.tsx
- package.json

Não mexe em contratos, watchers ou PM2.
