import { ArrowRight, Copy, TerminalSquare } from 'lucide-react'
import Link from 'next/link'
import { InriShell, InriLinkButton } from '@/components/inri-site-shell'

const ubuntuScript = String.raw`sudo bash -c '
set -euo pipefail

INSTALL_DIR="/opt/inri"
DATA_DIR="/var/lib/inri"
SERVICE_FILE="/etc/systemd/system/inri-miner.service"
GETH_ZIP_URL="https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip"

line() {
  echo "=================================================="
}

echo
line
echo "           INRI CHAIN MINER INSTALLER"
line
echo

echo "Installing dependencies..."
apt-get update -y
apt-get install -y curl unzip

echo
echo "Preparing directories..."
mkdir -p "$INSTALL_DIR" "$DATA_DIR"

CPU_THREADS="$(nproc 2>/dev/null || echo 4)"

echo
read -r -p "Enter your wallet address: " MINER_WALLET

if ! echo "$MINER_WALLET" | grep -Eq "^0x[a-fA-F0-9]{40}$"; then
  echo
  echo "ERROR: Invalid wallet address."
  echo "Please run the installer again and enter a valid EVM wallet."
  exit 1
fi

echo
read -r -p "Mining threads [$CPU_THREADS]: " MINER_THREADS
MINER_THREADS="\${MINER_THREADS:-$CPU_THREADS}"

if ! echo "$MINER_THREADS" | grep -Eq "^[0-9]+$"; then
  echo
  echo "ERROR: Threads must be a number."
  exit 1
fi

if [ "$MINER_THREADS" -lt 1 ]; then
  echo
  echo "ERROR: Threads must be at least 1."
  exit 1
fi

echo
line
echo "Configuration"
line
echo "Wallet  : $MINER_WALLET"
echo "Threads : $MINER_THREADS"
echo

echo "Downloading official INRI Geth package..."
curl -L --fail -o "$INSTALL_DIR/inri-geth.zip" "$GETH_ZIP_URL"

echo "Extracting package..."
rm -rf "$INSTALL_DIR/INRI-FORK-6000000"
rm -f "$INSTALL_DIR/geth" "$INSTALL_DIR/geth-inri-linux" "$INSTALL_DIR/geth-inri-windows-final.exe"
unzip -o "$INSTALL_DIR/inri-geth.zip" -d "$INSTALL_DIR" >/dev/null

if [ -f "$INSTALL_DIR/INRI-FORK-6000000/geth-inri-linux" ]; then
  cp "$INSTALL_DIR/INRI-FORK-6000000/geth-inri-linux" "$INSTALL_DIR/geth-inri-linux"
  cp "$INSTALL_DIR/INRI-FORK-6000000/geth-inri-linux" "$INSTALL_DIR/geth"
elif [ -f "$INSTALL_DIR/geth-inri-linux" ]; then
  cp "$INSTALL_DIR/geth-inri-linux" "$INSTALL_DIR/geth"
elif [ -f "$INSTALL_DIR/geth" ]; then
  true
else
  echo
  echo "ERROR: Linux binary not found inside the ZIP package."
  echo "ZIP must contain geth-inri-linux either:"
  echo "  - at root"
  echo "  - or inside INRI-FORK-6000000/"
  echo
  echo "Files extracted:"
  find "$INSTALL_DIR" -maxdepth 2 -type f | sort
  exit 1
fi

chmod +x "$INSTALL_DIR/geth" 2>/dev/null || true
chmod +x "$INSTALL_DIR/geth-inri-linux" 2>/dev/null || true

echo "Writing genesis file..."
cat > "$INSTALL_DIR/genesis.json" <<EOF
{
  "config": {
    "chainId": 3777,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "muirGlacierBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "arrowGlacierBlock": 0,
    "grayGlacierBlock": 0,
    "ethash": {}
  },
  "nonce": "0x0000000000000000",
  "timestamp": "0x0",
  "extraData": "0x00",
  "gasLimit": "0x1fffffffffffff",
  "difficulty": "0x1",
  "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "coinbase": "0x0000000000000000000000000000000000000000",
  "alloc": {
    "0x0cec4852f2141aeea1111583e788009a3b18e705": { "balance": "20000000000000000000000000" }
  },
  "number": "0x0",
  "gasUsed": "0x0",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
}
EOF

echo "Stopping previous miner service if it exists..."
systemctl stop inri-miner 2>/dev/null || true

echo "Cleaning old chain data..."
rm -rf \
  "$DATA_DIR/geth" \
  "$DATA_DIR/geth.ipc" \
  "$DATA_DIR/history" \
  "$DATA_DIR/transactions.rlp" \
  "$DATA_DIR/nodes" \
  "$DATA_DIR/ethash"

echo "Initializing chain..."
"$INSTALL_DIR/geth" --datadir "$DATA_DIR" init "$INSTALL_DIR/genesis.json"

echo "Opening firewall ports if UFW is installed..."
if command -v ufw >/dev/null 2>&1; then
  ufw allow 30303/tcp >/dev/null 2>&1 || true
  ufw allow 30303/udp >/dev/null 2>&1 || true
fi

echo "Creating miner launcher..."
cat > "$INSTALL_DIR/start-miner.sh" <<EOF
#!/usr/bin/env bash
exec "$INSTALL_DIR/geth" \
  --datadir "$DATA_DIR" \
  --networkid 3777 \
  --port 30303 \
  --bootnodes enode://453d847d192861e020ae9bd44734c6d985f07786af3f2543c1a4a4578405c5232215852d02cab335f86376bfed4fb4fe8065f122cf36f41e5c7c805a04d7dc2b@134.199.203.8:30303,enode://5480948164d342bd728bf8a26fae74e8282c5f3fb905b03e25ab708866ea38cb0ec7015211623f0bc6f83aa7afa2dd7ae6789fdda788c5234564a794a938e15f@170.64.222.34:30303 \
  --syncmode full \
  --snapshot=false \
  --maxpeers 100 \
  --cache 1024 \
  --mine \
  --miner.threads $MINER_THREADS \
  --miner.etherbase $MINER_WALLET \
  --http \
  --http.addr 0.0.0.0 \
  --http.port 8545 \
  --http.api eth,net,web3,txpool,miner \
  --allow-insecure-unlock \
  --verbosity 3
EOF
chmod +x "$INSTALL_DIR/start-miner.sh"

echo "Creating systemd service..."
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=INRI CHAIN Public Miner
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
Restart=always
RestartSec=5
LimitNOFILE=65535
ExecStart=$INSTALL_DIR/start-miner.sh

[Install]
WantedBy=multi-user.target
EOF

echo "Creating helper commands..."
cat > /usr/local/bin/inri-status <<EOF
#!/usr/bin/env bash
systemctl --no-pager --full status inri-miner
EOF
chmod +x /usr/local/bin/inri-status

cat > /usr/local/bin/inri-live <<EOF
#!/usr/bin/env bash
journalctl -u inri-miner -f
EOF
chmod +x /usr/local/bin/inri-live

cat > /usr/local/bin/inri-monitor <<EOF
#!/usr/bin/env bash
watch -n 2 "systemctl is-active inri-miner; echo; journalctl -u inri-miner -n 20 --no-pager"
EOF
chmod +x /usr/local/bin/inri-monitor

echo "Enabling and starting miner service..."
systemctl daemon-reload
systemctl enable inri-miner >/dev/null 2>&1
systemctl restart inri-miner

echo
line
echo "INRI miner installed successfully"
line
echo "Wallet  : $MINER_WALLET"
echo "Threads : $MINER_THREADS"
echo
echo "Useful commands:"
echo "  inri-status"
echo "  inri-live"
echo "  inri-monitor"
echo "  sudo systemctl restart inri-miner"
echo "  sudo systemctl stop inri-miner"
echo "  sudo systemctl start inri-miner"
echo
echo "Installed binary:"
ls -lh "$INSTALL_DIR/geth" "$INSTALL_DIR/geth-inri-linux" 2>/dev/null || true
echo
echo "Opening live logs now..."
echo "Press CTRL+C to exit logs without stopping the miner."
sleep 2
journalctl -u inri-miner -f
'`

export function InriMiningUbuntuPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-black text-white">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(17,143,240,0.22),transparent_36%),linear-gradient(180deg,#07111e_0%,#04070d_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-4xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-primary/90">Mining Ubuntu</p>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Ubuntu CPU Miner</h1>
              <p className="mt-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.22em] text-primary">
                Fork at block 6000000
              </p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                This page is only one thing: copy the command, paste it on Ubuntu and start the mining setup flow.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InriLinkButton href="/pool">Pool</InriLinkButton>
                <InriLinkButton href="/explorer" variant="secondary">
                  Explorer
                </InriLinkButton>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[0.9fr,1.1fr] lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[#091425] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] sm:p-8">
              <div className="inline-flex rounded-2xl border border-primary/25 bg-primary/10 p-3 text-primary">
                <TerminalSquare className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-3xl font-black text-white">Copy and paste</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-white/72">
                <p>Paste the full command below into Ubuntu.</p>
                <p>It installs dependencies, downloads the official INRI geth package, writes genesis, initializes the chain and starts the miner service.</p>
                <p>When asked, enter your wallet address and your thread count.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary/90">Ubuntu command</p>
                  <p className="mt-1 text-sm text-white/60">Use the exact command below.</p>
                </div>
                <div className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-2 text-primary">
                  <Copy className="h-4 w-4" />
                </div>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words px-5 py-5 text-sm leading-7 text-white/78">{ubuntuScript}</pre>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#091425,#060b13)] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary/90">Next step</p>
                  <h2 className="mt-3 text-3xl font-black text-white">After the command starts, follow the prompts and let the miner finish the setup.</h2>
                  <p className="mt-4 text-base leading-8 text-white/72">
                    This Ubuntu route stays direct: one command, one flow, one setup path. When the node is running, use the pool page and explorer to monitor the network.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <InriLinkButton href="/pool">Pool</InriLinkButton>
                  <InriLinkButton href="/mining-windows" variant="secondary">
                    Windows
                  </InriLinkButton>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/mining-windows" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                  Need the Windows page instead?
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
