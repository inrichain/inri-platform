# Bridge final único

Este pacote é o site completo com a página `/bridge/` profissional.

Arquivos principais alterados:

- `src/app/bridge/page.tsx`
- `components/inri-bridge-page.tsx`
- `components/inri-site-shell.tsx`
- `package.json`

O fluxo do site fica:

- Buy iUSD: Approve/Deposit -> Check -> Claim iUSD
- Sell iUSD: Burn iUSD -> Check -> Claim USDT

Para venda ficar 100% automática depois do burn, o servidor do bridge também precisa aceitar `burnTxHash` em `/api/release/:id`. O script seguro está incluído em:

- `iusd-bridge-release-resolver-safe.sh`

Não rode o script no GitHub. Ele é apenas para o servidor `/opt/iusd-bridge` se necessário.
