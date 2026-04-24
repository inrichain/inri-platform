import { Layers3, Pickaxe, RadioTower } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriPoolClient } from '@/components/inri-pool-client'

export function InriPoolPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Mining Pool</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Monitor the INRI pool with a stronger frame.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">Pool stats, recent blocks, payments and miner lookup now live inside the same premium page structure.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">

              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Layers3 className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">PPLNS / SOLO</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Follow pool modes from one route.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Pickaxe className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Miner lookup</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Search miners and payout status.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><RadioTower className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Live-style stats</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Keep mining data in a polished mainnet view.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#02040a] py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-[1560px] px-4 sm:px-8 xl:px-12">
            <div className="inri-v20-panel p-4 sm:p-6 lg:p-8">
              <InriPoolClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
