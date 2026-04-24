import { Layers3, Pickaxe, RadioTower } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriPoolClient } from '@/components/inri-pool-client'

export function InriPoolPage() {
  return (
    <InriShell>
      <main className="inri-site-v2">
        <section className="inri-v2-hero">
          <div className="inri-page-container py-10 sm:py-14 lg:py-16">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.52fr)] xl:items-stretch">
              <div className="inri-v2-panel flex min-h-[460px] flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inri-v2-kicker">Mining Pool</span>
                  <span className="inri-v2-kicker">INRI mainnet</span>
                  <span className="inri-v2-kicker">Chain 3777</span>
                </div>
                <h1 className="inri-v2-heading mt-8 max-w-5xl text-[2.8rem] sm:text-[4.2rem] lg:text-[5.8rem]">
                  Monitor INRI pool activity with a stronger dashboard frame.
                </h1>
                <p className="inri-v2-text mt-7 max-w-3xl text-lg">
                  Open pool stats, recent blocks, payments and miner lookup inside the same upgraded visual system used across the INRI site.
                </p>
                <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                  
                </div>
              </div>

              <div className="grid gap-4">
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><Layers3 className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">PPLNS / SOLO</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Follow pool modes from one dashboard route.</p>
                </div>
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><Pickaxe className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Miner lookup</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Search miners, blocks and payout status.</p>
                </div>
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><RadioTower className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Live-style stats</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Keep mining data in a polished mainnet surface.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16 pt-6">
          <div className="inri-page-container">
            <div className="inri-v2-panel p-4 sm:p-6 lg:p-8">
              <InriPoolClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
