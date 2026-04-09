import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, MonitorSmartphone, Pickaxe, Server, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const entryCards = [
  {
    title: 'Mining Windows',
    text: 'Premium version of the classic Windows mining guide, now cleaner and easier to follow.',
    href: '/mining-windows',
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
  {
    title: 'Mining Ubuntu',
    text: 'Premium version of the Ubuntu route with the current installer download kept available.',
    href: '/mining-ubuntu',
    icon: <Server className="h-5 w-5" />,
  },
  {
    title: 'Pool',
    text: 'Open PPLNS and SOLO stats, recent blocks, payments and miner lookup by address.',
    href: '/pool',
    icon: <Pickaxe className="h-5 w-5" />,
  },
] as const

const facts = [
  ['Chain', 'INRI CHAIN'],
  ['Chain ID', '3777'],
  ['Consensus', 'PoW · Ethash'],
  ['Fork reminder', 'Block 6000000'],
] as const

function FeatureCard({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return (
    <div className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
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
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.14),transparent_24%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 xl:py-20">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.06fr)_420px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  Mining hub
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.35rem]">
                  Premium mining pages with the <span className="text-primary">classic INRI routes</span> kept intact.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  This hub keeps the familiar Windows and Ubuntu paths while presenting them in a cleaner, stronger layout that matches the rest of the site.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href="/mining-windows">Open Mining Windows</InriLinkButton>
                  <InriLinkButton href="/mining-ubuntu" variant="secondary">Open Mining Ubuntu</InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">Open Pool</InriLinkButton>
                </div>
                <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
                  {facts.map(([label, value]) => (
                    <div key={label} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">
                      <span className="text-white/45">{label}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Choose your route</p>
                <div className="mt-5 grid gap-3">
                  {entryCards.map((item) => (
                    <Link key={item.title} href={item.href} className="group rounded-[1.35rem] border border-white/12 bg-white/[0.035] p-4 transition hover:border-primary/40 hover:bg-primary/[0.08]">
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
              <FeatureCard title="Windows first" text="The Windows page follows the same classic step order from the old site: clean folders, create mining account, place files, add chaindata and start mining." icon={<MonitorSmartphone className="h-5 w-5" />} />
              <FeatureCard title="Ubuntu kept simple" text="The Ubuntu page stays lighter, closer to the old route, but adds a premium layout and keeps the installer script available." icon={<Server className="h-5 w-5" />} />
              <FeatureCard title="Wallet before mining" text="Users should always prepare the payout address first, then move to the mining setup that matches their machine." icon={<ShieldCheck className="h-5 w-5" />} />
              <FeatureCard title="Pool after setup" text="Once the miner is live, the pool page becomes the operational place to watch activity and search miner addresses." icon={<Pickaxe className="h-5 w-5" />} />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
