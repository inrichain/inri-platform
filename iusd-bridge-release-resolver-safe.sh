#!/usr/bin/env bash
set -euo pipefail
set +H
cd /opt/iusd-bridge || exit 1

TS="$(date +%Y%m%d-%H%M%S)"
SAFE="/root/iusd-bridge-RELEASE-RESOLVER-BACKUP-$TS"
mkdir -p "$SAFE"

echo "=================================================="
echo " ADD RELEASE RESOLVER: burnTxHash -> releaseId"
echo " MEXE SOMENTE server.js"
echo " NAO MEXE WATCHERS | NAO MEXE CONTRATOS | NAO MEXE DATA"
echo " REINICIA SOMENTE iusd-bridge-claim SE SINTAXE OK"
echo "=================================================="

cp -a server.js "$SAFE/server.js.before"

python3 - <<'PY'
from pathlib import Path
import re, sys
p = Path('server.js')
s = p.read_text()
marker = 'INRI_RELEASE_RESOLVER_BY_BURNTX_V1'
if marker in s:
    print('Resolver ja existe. Nada para inserir.')
    sys.exit(0)

# Insert helper before release route
helper = r'''

// INRI_RELEASE_RESOLVER_BY_BURNTX_V1
function findReleaseByIdOrBurnTx(releases, rawId) {
  const id = String(rawId || "").toLowerCase();
  if (!id) return { id, release: null };
  if (releases[id]) return { id, release: releases[id] };

  for (const [releaseId, release] of Object.entries(releases || {})) {
    const burnTxHash = String((release && release.burnTxHash) || "").toLowerCase();
    const burnId = String((release && release.burnId) || "").toLowerCase();
    if (burnTxHash === id || burnId === id) {
      return { id: String(releaseId).toLowerCase(), release };
    }
  }

  return { id, release: null };
}
'''
route_pos = s.find('app.get("/api/release/:id"')
if route_pos == -1:
    route_pos = s.find("app.get('/api/release/:id'")
if route_pos == -1:
    print('ERRO: rota /api/release/:id nao encontrada')
    sys.exit(1)
s = s[:route_pos] + helper + s[route_pos:]

# Replace const release = releases[id]; with resolver
old = '  const release = releases[id];'
new = '  const found = findReleaseByIdOrBurnTx(releases, id);\n  const release = found.release;\n  const resolvedId = found.id;'
if old not in s:
    print('ERRO: trecho const release = releases[id]; nao encontrado')
    sys.exit(1)
s = s.replace(old, new, 1)

# Add resolved ids to JSON response if possible
old_resp = '    release\n  });'
if old_resp in s:
    s = s.replace(old_resp, '    id: resolvedId,\n    requestedId: id,\n    release\n  });', 1)
else:
    print('AVISO: nao achei bloco final exato para adicionar id/requestedId; resolver ainda funciona')

p.write_text(s)
print('OK: server.js patchado com resolver burnTxHash -> releaseId')
PY

node -c server.js
pm2 restart iusd-bridge-claim --update-env
sleep 2
pm2 status

echo
BURN_TX="0x2524c3dfb7c5a3066392cae906d54e3bc01801a61c10b9dbcd4546c6293ca964"
echo "===== TESTE release por burnTxHash ====="
curl -s -H "Origin: https://platform.inri.life" "https://iusd-bridge.inri.life/api/release/$BURN_TX" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const j=JSON.parse(s);console.log(JSON.stringify({ok:j.ok,id:j.id,requestedId:j.requestedId,status:j.release&&j.release.status,burnTxHash:j.release&&j.release.burnTxHash,amount:j.release&&j.release.amount},null,2));}catch(e){console.log(s.slice(0,500)); process.exit(1)}})'

echo
"echo" "OK: servidor agora aceita Release ID ou Burn TX Hash em /api/release/:id"
echo "Backup em: $SAFE"
