import Link from 'next/link'
import { ArrowRight, CheckCircle2, Download, Pickaxe, Server, ShieldCheck, TerminalSquare } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const scriptDownload = '/downloads/mining/ubuntu/inri-ubuntu-miner-installer.sh'
const gethZipUrl = 'https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip'

const quickFacts = [
  ['Route', 'Ubuntu CPU Miner'],
  ['Chain ID', '3777'],
  ['Consensus', 'PoW · Ethash'],
  ['Fork reminder', 'Block 6000000'],
] as const

const ubuntuSteps = [
  {
    title: 'Download the installer',
    text: 'Use the ready Ubuntu installer if you want the fastest path. It prepares folders, downloads the official geth package, writes genesis and sets the miner service.',
    icon: <Download className="h-5 w-5" />,
  },
  {
    title: 'Enter wallet and thread count',
    text: 'The installer asks for the payout wallet and the CPU thread count before building the final launch script.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Initialize the chain cleanly',
    text: 'The script writes the INRI genesis file, cleans old data and initializes the local datadir for chain 3777.',
    icon: <Server className="h-5 w-5" />,
  },
  {
    title: 'Run and monitor the miner',
    text: 'The Linux route creates helper commands so the miner can be restarted, monitored and watched in real time.',
    icon: <TerminalSquare className="h-5 w-5" />,
  },
] as const

const quickStart = `curl -fsSL https://www.inri.life/downloads/mining/ubuntu/inri-ubuntu-miner-installer.sh -o /tmp/inri-ubuntu-miner-installer.sh
chmod +x /tmp/inri-ubuntu-miner-installer.sh
sudo /tmp/inri-ubuntu-miner-installer.sh`

const helperCommands = `inri-status
inri-live
inri-monitor
sudo systemctl restart inri-miner`

export function InriMiningUbuntuPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_28%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 xl:py-20">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.04fr)_430px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  Mining Ubuntu
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.15rem]">
                  Ubuntu CPU Miner for <span className="text-primary">INRI CHAIN</span>
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  Keep the Ubuntu route simple and effective: download the installer, enter the wallet, initialize the chain correctly and monitor the miner from the command line.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href={scriptDownload}>Download Ubuntu installer</InriLinkButton>
                  <InriLinkButton href={gethZipUrl} variant="secondary">Official geth ZIP</InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">Open Pool</InriLinkButton>
                </div>
                <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
                  {quickFacts.map(([label, value]) => (
                    <div key={label} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">
                      <span className="text-white/45">{label}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>

              <aside className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Ubuntu flow</p>
                <div className="mt-5 grid gap-3">
                  {[
                    'Prepare the payout wallet before starting the installer.',
                    'Run the script with sudo so it can write folders and service files.',
                    'The installer creates a start script and a systemd service.',
                    'Use the helper commands after installation to watch the miner.',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-white/74">{item}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {ubuntuSteps.map((item) => (
                <div key={item.title} className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">{item.icon}</div>
                  <h2 className="mt-4 text-lg font-black text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/66">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/8 py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-6">
                <div className="rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(5,17,28,0.98),rgba(1,7,12,0.99))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                  <h3 className="text-lg font-black text-white">Quick start</h3>
                  <p className="mt-2 text-sm leading-7 text-white/64">Linux users can use the direct installer path below and then keep monitoring through the helper commands.</p>
                  <pre className="mt-4 overflow-x-auto rounded-[1.15rem] border border-white/10 bg-black/45 p-4 text-xs leading-6 text-white/84">{quickStart}</pre>
                </div>
                <div className="rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(5,17,28,0.98),rgba(1,7,12,0.99))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                  <h3 className="text-lg font-black text-white">Helper commands after install</h3>
                  <p className="mt-2 text-sm leading-7 text-white/64">The installer exposes simple commands so the miner can be checked and restarted without hunting for the service file every time.</p>
                  <pre className="mt-4 overflow-x-auto rounded-[1.15rem] border border-white/10 bg-black/45 p-4 text-xs leading-6 text-white/84">{helperCommands}</pre>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Next routes</p>
                <div className="mt-4 grid gap-3">
                  {[
                    { title: 'Pool', text: 'Open the pool dashboard and miner lookup.', href: '/pool' },
                    { title: 'Wallets', text: 'Prepare the payout wallet first.', href: '/wallets' },
                    { title: 'Mining Windows', text: 'Use the Windows route if you need the C:\\INRI flow.', href: '/mining-windows' },
                    { title: 'Explorer', text: 'Check addresses and chain data.', href: '/explorer' },
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
                <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Pickaxe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-white/68">
                      After the installer finishes, use the pool page and explorer together to verify that the miner is live on the correct network.
                    </p>
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
