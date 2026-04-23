import { Layers3, Pickaxe, RadioTower } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriPoolClient } from '@/components/inri-pool-client'

const poolHighlights = [
  { title: 'PPLNS / SOLO', text: 'Track the pool routes with a cleaner official page shell.', icon: Layers3 },
  { title: 'Miner lookup', text: 'Search miners, payouts and current pool participation.', icon: Pickaxe },
  { title: 'Live-style data', text: 'Keep stats inside a polished INRI mainnet surface.', icon: RadioTower },
]

export function InriPoolPage() {
  return (
    <InriShell>
      <main className="inri-page-shell">
        <section className="inri-hero-showcase">
          <div className="inri-page-container py-10 sm:py-12 lg:py-14">
            <div className="inri-glass-hero p-5 sm:p-7 lg:p-9">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.5fr)] xl:items-end">
                <div>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="inri-tag text-primary">Pool</span>
                    <span className="inri-tag">Mining stats</span>
                    <span className="inri-tag">Chain 3777</span>
                  </div>
                  <h1 className="mt-6 max-w-5xl text-balance text-[2.4rem] font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-[3.4rem] lg:text-[4.7rem]">
                    Pool dashboard inside the INRI network surface.
                  </h1>
                  <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg sm:leading-9">
                    Monitor PPLNS, SOLO, payments, recent blocks and miner lookup from a cleaner page frame that matches the rest of the official site.
                  </p>
                </div>

                <div className="grid gap-3">
                  {poolHighlights.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className="inri-data-box flex gap-4 p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="font-black text-white">{item.title}</h2>
                          <p className="mt-1 text-sm leading-6 text-white/58">{item.text}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 sm:py-8 lg:py-10">
          <div className="inri-page-container">
            <div className="inri-dashboard-card p-4 sm:p-6 lg:p-8">
              <InriPoolClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
