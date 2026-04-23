import Link from 'next/link'
import { ArrowRight, MonitorSmartphone, Pickaxe, Server, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const entryCards = [
  { title: 'Mining Windows', text: 'Start mining on Windows with the official INRI route.', href: '/mining-windows', icon: MonitorSmartphone },
  { title: 'Mining Ubuntu', text: 'Use the Ubuntu setup route for server and VPS miners.', href: '/mining-ubuntu', icon: Server },
  { title: 'Pool', text: 'Open PPLNS/SOLO stats, blocks, payouts and miner lookup.', href: '/pool', icon: Pickaxe },
  { title: 'Championship', text: 'Follow the active mining championship and prize ladder.', href: '/mining-championship/', icon: ShieldCheck },
]

const facts = [
  ['Consensus', 'PoW · Ethash'],
  ['Chain ID', '3777'],
  ['Mainnet', 'INRI CHAIN'],
  ['Fork reminder', 'Block 6000000'],
]

export function InriMiningPage() {
  return (
    <InriShell>
      <main className="inri-page-shell">
        <section className="inri-hero-showcase">
          <div className="inri-page-container py-10 sm:py-12 lg:py-16">
            <div className="inri-glass-hero p-5 sm:p-7 lg:p-10">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.45fr)] xl:items-end">
                <div>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="inri-tag text-primary">Mining</span>
                    <span className="inri-tag">Proof-of-Work</span>
                    <span className="inri-tag">INRI mainnet</span>
                  </div>
                  <h1 className="mt-6 max-w-5xl text-balance text-[2.4rem] font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-[3.4rem] lg:text-[5rem]">
                    Mine INRI from one clear command center.
                  </h1>
                  <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg sm:leading-9">
                    Choose Windows, Ubuntu, pool mining or the active championship from a cleaner page with fewer distractions and stronger route cards.
                  </p>
                  <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                    <InriLinkButton href="/mining-windows">Windows setup</InriLinkButton>
                    <InriLinkButton href="/mining-ubuntu" variant="secondary">Ubuntu setup</InriLinkButton>
                    <InriLinkButton href="/mining-championship/" variant="secondary">Championship</InriLinkButton>
                  </div>
                </div>

                <div className="inri-dashboard-card p-5 sm:p-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Network facts</p>
                  <div className="mt-5 grid gap-3">
                    {facts.map(([label, value]) => (
                      <div key={label} className="inri-data-box flex items-center justify-between gap-4 px-4 py-3">
                        <span className="text-sm text-white/52">{label}</span>
                        <span className="text-sm font-black text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {entryCards.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group inri-dashboard-card block p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/[0.06]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <h2 className="text-xl font-black text-white">{item.title}</h2>
                      <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
