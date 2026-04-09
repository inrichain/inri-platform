import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Cpu, Download, MonitorSmartphone, Pickaxe, Server, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const entryCards = [
  {
    title: 'Mining Windows',
    text: 'One-file installer, wallet prompt, genesis, init and ready-to-use mining batches for C:\\INRI.',
    href: '/mining/windows',
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
  {
    title: 'Mining Ubuntu',
    text: 'Download the Linux installer script with systemd service, helper commands and clean command-line setup.',
    href: '/mining/ubuntu',
    icon: <Server className="h-5 w-5" />,
  },
  {
    title: 'Pool',
    text: 'Open the pool page to compare PPLNS and SOLO, read live stats and look up miner addresses.',
    href: '/pool',
    icon: <Pickaxe className="h-5 w-5" />,
  },
]

const quickFacts = [
  ['Chain', 'INRI CHAIN'],
  ['Chain ID', '3777'],
  ['Consensus', 'Proof-of-Work'],
  ['Algorithm', 'Ethash'],
  ['Fork reminder', 'Block 6000000'],
  ['Setup goal', 'Less friction'],
] as const

const highlightCards = [
  {
    title: 'Windows installer',
    text: 'The site now offers a real one-file Windows installer path instead of forcing the user to build the mining setup manually.',
    icon: <Download className="h-5 w-5" />,
  },
  {
    title: 'Ubuntu installer',
    text: 'The Ubuntu route exposes the installer script directly so Linux users can download it or run the quick-start command.',
    icon: <Server className="h-5 w-5" />,
  },
  {
    title: 'Wallet first',
    text: 'The mining routes assume the user already has an INRI-compatible payout address ready before launching the miner.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Pool ready',
    text: 'After the miner is running, users can jump to the pool page to compare modes and search miner addresses.',
    icon: <Cpu className="h-5 w-5" />,
  },
] as const

function FeatureCard({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return (
    <div className="rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/66">{text}</p>
    </div>
  )
}

export function InriMiningPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(19,164,255,0.09),transparent_26%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 xl:py-20">
            <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.08fr)_430px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  Mining hub
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.45rem]">
                  Start mining on <span className="text-primary">INRI CHAIN</span> with a cleaner route for Windows, Ubuntu and pool access.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  This hub now focuses on real entry points: a one-file installer for Windows, a downloadable shell installer for Ubuntu and the pool page for live activity and miner lookup.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href="/mining/windows">Mining Windows</InriLinkButton>
                  <InriLinkButton href="/mining/ubuntu" variant="secondary">Mining Ubuntu</InriLinkButton>
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

              <div className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Pick your route</p>
                <h2 className="mt-3 text-2xl font-black text-white">Choose the setup that matches your machine.</h2>
                <div className="mt-5 grid gap-3">
                  {entryCards.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group rounded-[1.35rem] border border-white/12 bg-white/[0.035] p-4 transition hover:border-primary/40 hover:bg-primary/[0.08]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/24 bg-primary/10 text-primary">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-base font-black text-white">
                            {item.title}
                            <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-white/64">{item.text}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {highlightCards.map((card) => (
                <FeatureCard key={card.title} title={card.title} text={card.text} icon={card.icon} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/8 py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Before you mine</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="text-lg font-black text-white">1. Prepare your wallet</h3>
                    <p className="mt-2 text-sm leading-7 text-white/66">You need an INRI-compatible wallet address before starting the miner or joining the pool.</p>
                    <div className="mt-4">
                      <InriLinkButton href="/wallets" variant="secondary">Open Wallets</InriLinkButton>
                    </div>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="text-lg font-black text-white">2. Stay on the right fork</h3>
                    <p className="mt-2 text-sm leading-7 text-white/66">Use only the official fork 6000000 package and the current genesis settings for INRI CHAIN.</p>
                    <div className="mt-4">
                      <InriLinkButton href="/whitepaper" variant="secondary">Open Whitepaper</InriLinkButton>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Useful routes</p>
                <div className="mt-4 grid gap-3">
                  {[
                    { title: 'Pool', text: 'Use PPLNS or SOLO and inspect miner activity.', href: '/pool' },
                    { title: 'Explorer', text: 'Verify network blocks and addresses.', href: '/explorer' },
                    { title: 'Mining Windows', text: 'Run the one-file Windows installer route.', href: '/mining/windows' },
                    { title: 'Mining Ubuntu', text: 'Use the Linux installer and service flow.', href: '/mining/ubuntu' },
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
