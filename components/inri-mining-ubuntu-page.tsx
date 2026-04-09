import Link from 'next/link'
import { ArrowRight, CheckCircle2, Copy, Cpu, Download, MonitorCheck, Server, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const scriptDownload = '/downloads/mining/ubuntu/inri-ubuntu-miner-installer.sh'
const quickStart = String.raw`curl -fsSL https://www.inri.life/downloads/mining/ubuntu/inri-ubuntu-miner-installer.sh -o /tmp/inri-ubuntu-miner-installer.sh
sudo bash /tmp/inri-ubuntu-miner-installer.sh`

const installerScript = String.raw`sudo bash -c '
set -euo pipefail
# Full installer available in the download file below.
# It downloads the official geth package, writes genesis,
# initializes the chain, creates start-miner.sh,
# creates the systemd service and helper commands.
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
    text: 'The installer asks for the mining wallet address and lets the user choose the thread count, defaulting to the detected CPU threads.',
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    title: 'Systemd service',
    text: 'The route writes /etc/systemd/system/inri-miner.service and enables automatic restarts through systemd.',
    icon: <Server className="h-5 w-5" />,
  },
  {
    title: 'Live monitoring',
    text: 'The helper commands let miners check service status, follow logs and monitor the node without guesswork.',
    icon: <MonitorCheck className="h-5 w-5" />,
  },
] as const

function CodeCard({ title, code, note }: { title: string; code: string; note?: string }) {
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
                  Mining Ubuntu
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.35rem]">
                  Ubuntu miner installer with <span className="text-primary">one script</span>, systemd and live monitoring.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  This Linux route now exposes the full installer as a downloadable shell script and a quick-start command.
                  It prepares the official package, genesis, data directory, launcher and service without forcing the user to build the flow by hand.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href={scriptDownload}>Download .sh installer</InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">Open Pool</InriLinkButton>
                  <InriLinkButton href="/mining/windows" variant="secondary">Windows route</InriLinkButton>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Install dir: /opt/inri</div>
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Data dir: /var/lib/inri</div>
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Service: inri-miner</div>
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">What the installer does</p>
                <div className="mt-5 grid gap-3">
                  {[
                    'Installs curl and unzip if they are missing.',
                    'Prompts for a valid 0x mining wallet address.',
                    'Detects CPU threads and lets the user override them.',
                    'Writes genesis, initializes the chain and creates the service.',
                    'Creates inri-status, inri-live and inri-monitor helper commands.',
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
                <CodeCard
                  title="Quick start"
                  code={quickStart}
                  note="Use these two lines on Ubuntu to download the prepared installer and run it with sudo."
                />
                <CodeCard
                  title="Installer summary"
                  code={installerScript}
                  note="The full shell file is available in the download button above and is based on the installer route you provided."
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
                      { title: 'Pool', text: 'Use PPLNS or SOLO and inspect miner activity.', href: '/pool' },
                      { title: 'Wallets', text: 'Prepare the payout address before mining.', href: '/wallets' },
                      { title: 'Windows route', text: 'Open the one-file Windows installer path.', href: '/mining/windows' },
                      { title: 'Explorer', text: 'Watch blocks and addresses on-chain.', href: '/explorer' },
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
