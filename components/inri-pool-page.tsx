import { Layers3, Pickaxe, RadioTower } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriPoolClient } from '@/components/inri-pool-client'

export function InriPoolPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="relative border-b border-cyan-300/15 bg-[radial-gradient(circle_at_18%_14%,rgba(0,174,255,0.45),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(122,232,255,0.22),transparent_34rem),linear-gradient(135deg,#071a32_0%,#02040a_42%,#000_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute -left-28 top-20 h-[30rem] w-[30rem] rounded-full bg-cyan-400/18 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[440px] flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                Mining Pool
              </div>

              <h1 className="mt-8 max-w-5xl text-[3rem] font-black leading-[0.86] tracking-[-0.075em] text-white sm:text-[4.8rem] xl:text-[6.5rem]">
                Monitor the INRI pool with a stronger dashboard frame.
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-9 text-cyan-50/72">
                Pool stats, recent blocks, payments and miner lookup now live inside the same premium page structure.
              </p>

              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">

              </div>
            </div>

            <div className="grid content-center gap-4">
                <div className="rounded-[22px] border border-cyan-300/16 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-white">PPLNS / SOLO</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">Follow pool modes from one route.</p>
                </div>
                <div className="rounded-[22px] border border-cyan-300/16 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
                    <Pickaxe className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-white">Miner lookup</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">Search miners and payout status.</p>
                </div>
                <div className="rounded-[22px] border border-cyan-300/16 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
                    <RadioTower className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-white">Live-style stats</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">Keep mining data in a polished mainnet view.</p>
                </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#02040a] py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-[1560px] px-4 sm:px-8 xl:px-12">
            <div className="rounded-[24px] border border-cyan-300/18 bg-white/[0.045] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-6 lg:p-8">
              <InriPoolClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
