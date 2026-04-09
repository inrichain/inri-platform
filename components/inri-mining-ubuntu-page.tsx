import Link from 'next/link'
import { ArrowRight, CheckCircle2, TerminalSquare } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const ubuntuCommand = `sudo bash -c '
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

const gethZipUrl = 'https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip'

export function InriMiningUbuntuPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_24%),linear-gradient(180deg,#041222_0%,#000000_72%)]">
          <div className="mx-auto max-w-[1460px] px-4 py-14 sm:px-6 lg:px-8 xl:py-18">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.06fr)_400px] xl:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                  Ubuntu CPU Miner
                </div>
                <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.05rem]">
                  Ubuntu mining, with <span className="text-primary">one real command</span> to copy and paste.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  This page stays simple on purpose. Copy the command below, paste it into Ubuntu, enter your wallet and threads when prompted, and the setup starts from there.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href={gethZipUrl} external>
                    Official geth ZIP
                  </InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">
                    Open pool
                  </InriLinkButton>
                  <InriLinkButton href="/wallets" variant="secondary">
                    Open wallets
                  </InriLinkButton>
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.5px] border-white/14 bg-[linear-gradient(180deg,rgba(5,17,28,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.32)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Before you run it</p>
                <div className="mt-5 grid gap-3">
                  {[
                    'Use Ubuntu or another compatible Linux environment with sudo access.',
                    'Paste the full command in one shot. It will ask for wallet address and threads.',
                    'The script downloads the official geth package, writes genesis and starts the miner service.',
                    'After setup, use inri-status, inri-live and inri-monitor to follow the miner.',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-white/74">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1460px] space-y-6 px-4 sm:px-6 lg:px-8">
            <section className="rounded-[1.9rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                  <TerminalSquare className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Single command</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Copy and paste on Ubuntu</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">This is the exact command block you provided for the Ubuntu route. Paste it into the terminal and follow the prompts.</p>
                  <pre className="mt-5 overflow-x-auto rounded-[1rem] border border-white/10 bg-[#020814] p-4 text-xs leading-6 text-white/82">{ubuntuCommand}</pre>
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-4">
              {[
                { title: 'Pool', text: 'Monitor miner activity and compare PPLNS and SOLO after setup.', href: '/pool' },
                { title: 'Wallets', text: 'Prepare the payout wallet before running the command.', href: '/wallets' },
                { title: 'Mining Windows', text: 'Open the Windows page for the full CMD + batch flow.', href: '/mining-windows' },
                { title: 'Explorer', text: 'Check addresses and network blocks on-chain.', href: '/explorer' },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="rounded-[1.4rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 transition hover:border-primary/40 hover:bg-primary/[0.08]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-white">{item.title}</span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/58">{item.text}</p>
                </Link>
              ))}
            </section>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
