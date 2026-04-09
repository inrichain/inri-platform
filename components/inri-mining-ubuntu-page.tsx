import Link from 'next/link'
import { ArrowRight, CheckCircle2, Download, Server, ShieldCheck, TerminalSquare } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const scriptDownload = '/downloads/mining/ubuntu/inri-ubuntu-miner-installer.sh'

const quickFacts = [
  ['Route', 'Mining Ubuntu'],
  ['Chain', '3777'],
  ['Consensus', 'PoW · Ethash'],
  ['Fork reminder', 'Block 6000000'],
] as const

const quickStart = String.raw`curl -fsSL https://www.inri.life/downloads/mining/ubuntu/inri-ubuntu-miner-installer.sh -o /tmp/inri-ubuntu-miner-installer.sh
chmod +x /tmp/inri-ubuntu-miner-installer.sh
sudo /tmp/inri-ubuntu-miner-installer.sh`

const cards = [
  {
    title: 'Classic Ubuntu route, cleaner layout',
    text: 'The old Ubuntu page was much lighter than the Windows guide. This version keeps that simpler feel while fitting the premium style of the new site.',
    icon: <Server className="h-5 w-5" />,
  },
  {
    title: 'Installer still available',
    text: 'The Ubuntu installer script stays available as a download so Linux users can still move faster when they want a ready command-line path.',
    icon: <Download className="h-5 w-5" />,
  },
  {
    title: 'Wallet-first flow',
    text: 'Prepare the payout wallet before running the installer or any mining command.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Pool-ready after setup',
    text: 'After the miner is online, the pool page becomes the live place to watch stats, payments and miner addresses.',
    icon: <TerminalSquare className="h-5 w-5" />,
  },
] as const

export function InriMiningUbuntuPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.14),transparent_24%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 xl:py-20">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.04fr)_430px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  Ubuntu CPU Miner
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.2rem]">
                  The classic <span className="text-primary">Mining Ubuntu</span> route, kept simple and rebuilt in the site style.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  The old Ubuntu page was intentionally short. This version keeps that lightweight feeling, adds a stronger presentation and still gives Linux miners a direct installer download.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href={scriptDownload}>Download Ubuntu installer</InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">Open Pool</InriLinkButton>
                  <InriLinkButton href="/wallets" variant="secondary">Open Wallets</InriLinkButton>
                </div>
                <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
                  {quickFacts.map(([label, value]) => (
                    <div key={label} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">
                      <span className="text-white/45">{label}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Quick Linux path</p>
                <div className="mt-5 grid gap-3">
                  {[
                    'Keep the fork 6000000 reminder in mind before starting.',
                    'Download the installer script or inspect it first.',
                    'Run the script with sudo so it can prepare directories and service files.',
                    'Use the pool page after setup to monitor mining activity.',
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
              {cards.map((card) => (
                <div key={card.title} className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
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
              <div className="rounded-[1.9rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Quick start command</p>
                <p className="mt-3 text-sm leading-7 text-white/66">This keeps the Ubuntu page useful without turning it into an overly long manual. The user can inspect the script or just run the quick-start path.</p>
                <pre className="mt-4 overflow-x-auto rounded-[1.1rem] border border-white/10 bg-black/45 p-4 text-xs leading-6 text-white/82">{quickStart}</pre>
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Useful routes</p>
                <div className="mt-4 grid gap-3">
                  {[
                    { title: 'Pool', text: 'Use PPLNS or SOLO and track miner activity.', href: '/pool' },
                    { title: 'Mining Windows', text: 'Open the Windows route if you need the classic C:\\INRI flow.', href: '/mining-windows' },
                    { title: 'Wallets', text: 'Prepare the payout address before mining.', href: '/wallets' },
                    { title: 'Explorer', text: 'Verify network blocks and addresses.', href: '/explorer' },
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
        </section>
      </main>
    </InriShell>
  )
}
