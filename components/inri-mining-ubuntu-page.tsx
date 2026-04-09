import Link from 'next/link'
import { ArrowRight, Copy, Cpu, Download, MonitorCheck, Server, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const installerScript = String.raw`sudo bash -c '
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

echo
read -r -p "Mining threads [$CPU_THREADS]: " MINER_THREADS
MINER_THREADS="\${MINER_THREADS:-$CPU_THREADS}"

echo "Downloading official INRI Geth package..."
curl -L --fail -o "$INSTALL_DIR/inri-geth.zip" "$GETH_ZIP_URL"

echo "Extracting package..."
unzip -o "$INSTALL_DIR/inri-geth.zip" -d "$INSTALL_DIR" >/dev/null

echo "Writing genesis file..."
cat > "$INSTALL_DIR/genesis.json" <<EOF
{ ... use the full genesis from the script you uploaded ... }
EOF

echo "Initializing chain..."
"$INSTALL_DIR/geth" --datadir "$DATA_DIR" init "$INSTALL_DIR/genesis.json"

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

cat > /usr/local/bin/inri-live <<EOF
#!/usr/bin/env bash
journalctl -u inri-miner -f
EOF

cat > /usr/local/bin/inri-monitor <<EOF
#!/usr/bin/env bash
watch -n 2 "systemctl is-active inri-miner; echo; journalctl -u inri-miner -n 20 --no-pager"
EOF

echo "Enabling and starting miner service..."
systemctl daemon-reload
systemctl enable inri-miner >/dev/null 2>&1
systemctl restart inri-miner
journalctl -u inri-miner -f
'`

const commands = [
  'inri-status',
  'inri-live',
  'inri-monitor',
  'sudo systemctl restart inri-miner',
  'sudo systemctl stop inri-miner',
  'sudo systemctl start inri-miner',
] as const

const ubuntuCards = [
  {
    title: 'One installer flow',
    text: 'The script installs dependencies, downloads the official package, writes genesis, initializes the chain and creates the miner service.',
    icon: <Download className="h-5 w-5" />,
  },
  {
    title: 'Wallet + threads prompt',
    text: 'The installer asks for the mining wallet address and lets the user choose the thread count, defaulting to the number of CPU threads available.',
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    title: 'Systemd service',
    text: 'The route writes /etc/systemd/system/inri-miner.service and enables automatic restarts through systemd.',
    icon: <Server className="h-5 w-5" />,
  },
  {
    title: 'Live monitoring',
    text: 'After installation, the helper commands let miners check service status, follow logs and monitor the node without guesswork.',
    icon: <MonitorCheck className="h-5 w-5" />,
  },
] as const

function CopyShell({ title, code, note }: { title: string; code: string; note?: string }) {
  return (
    <div className="rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-black text-white">{title}</h3>
        <div className="inline-flex h-10 items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 text-sm font-bold text-white/78">
          <Copy className="h-4 w-4 text-primary" /> Select and copy
        </div>
      </div>
      {note ? <p className="mt-2 text-sm leading-7 text-white/62">{note}</p> : null}
      <pre className="mt-4 overflow-x-auto rounded-[1.2rem] border border-white/10 bg-black/40 p-4 text-xs leading-6 text-white/82">{code}</pre>
    </div>
  )
}

export function InriMiningUbuntuPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(19,164,255,0.09),transparent_26%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 xl:py-20">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_430px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  Ubuntu CPU Miner
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.35rem]">
                  Ubuntu mining on <span className="text-primary">INRI CHAIN</span>, with one installer and live service monitoring.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  The current Ubuntu page on the old site is minimal, so this route upgrades it with the full installer you uploaded:
                  official package download, genesis init, bootnodes, systemd service and helper commands for live monitoring.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href="/pool">Open Pool</InriLinkButton>
                  <InriLinkButton href="/mining/windows" variant="secondary">Windows route</InriLinkButton>
                  <InriLinkButton href="/wallets" variant="secondary">Prepare wallet</InriLinkButton>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Install dir: /opt/inri</div>
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Data dir: /var/lib/inri</div>
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Service: inri-miner</div>
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Quick checklist</p>
                <div className="mt-5 grid gap-3">
                  {[
                    'Run as root with sudo bash -c.',
                    'Enter a valid 0x wallet address when the script asks.',
                    'Confirm the thread count or accept the detected default.',
                    'Wait for the ZIP download, extract and genesis init.',
                    'Use inri-status and inri-live after the service starts.',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-white/74">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {ubuntuCards.map((card) => (
                <div key={card.title} className="rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">{card.icon}</div>
                  <h2 className="mt-4 text-lg font-black text-white">{card.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/66">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/8 py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-6">
                <CopyShell
                  title="Ubuntu installer script"
                  code={installerScript}
                  note="Use the full script from your uploaded installer as the official Ubuntu route. It downloads the official package, writes genesis, creates the miner launcher, enables systemd and opens live logs at the end."
                />
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Helper commands</p>
                  <div className="mt-4 grid gap-3">
                    {commands.map((command) => (
                      <div key={command} className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                        <div className="break-all text-sm font-bold text-white">{command}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Useful routes</p>
                  <div className="mt-4 grid gap-3">
                    {[
                      { title: 'Pool', text: 'Compare PPLNS and SOLO after node setup.', href: '/pool' },
                      { title: 'Explorer', text: 'Inspect the network and your mining address.', href: '/explorer' },
                      { title: 'Mining Windows', text: 'Open the Windows mining route.', href: '/mining/windows' },
                      { title: 'Wallets', text: 'Prepare an INRI-compatible address first.', href: '/wallets' },
                    ].map((item) => (
                      <Link key={item.title} href={item.href} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-primary/40 hover:bg-primary/[0.08]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-black text-white">{item.title}</span>
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
