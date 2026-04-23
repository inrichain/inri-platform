import { RefreshCw, ShieldCheck, Store, Wallet } from 'lucide-react'
import { InriP2PClient } from '@/components/inri-p2p-client'
import { InriShell } from '@/components/inri-site-shell'

const highlights = [
  { title: 'Escrow market', value: 'P2P', text: 'Peer-to-peer trading with escrow protection inside the INRI ecosystem.', icon: Store },
  { title: 'Header wallet', value: 'One wallet', text: 'Use the wallet connected at the top of the site to sync the market.', icon: Wallet },
  { title: 'Trade flow', value: 'Protected', text: 'Create offers, mark payment, release funds and resolve disputes clearly.', icon: ShieldCheck },
]

export function InriP2PPage() {
  return (
    <InriShell>
      <main className="inri-premium-main">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-10 sm:py-12 lg:py-16">
            <div className="inri-premium-hero-card p-5 sm:p-7 lg:p-10">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.46fr)] xl:items-end">
                <div>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="inri-chip text-primary">P2P Market</span>
                    <span className="inri-chip">Escrow</span>
                    <span className="inri-chip">Chain 3777</span>
                  </div>
                  <h1 className="mt-6 max-w-5xl text-balance text-[2.4rem] font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-[3.4rem] lg:text-[5rem]">
                    Trade INRI peer-to-peer with a cleaner market surface.
                  </h1>
                  <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg sm:leading-9">
                    The P2P market now lives inside the same premium INRI frame. Connect once in the top header, then sync the market and manage offers below.
                  </p>
                </div>

                <div className="inri-premium-card p-5 sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.24em] text-primary">Wallet sync</p>
                  <h2 className="mt-3 text-2xl font-black text-white">Use the same wallet from the header.</h2>
                  <p className="mt-4 text-sm leading-7 text-white/64">
                    If the market does not bind automatically, use the sync button inside the P2P panel. It will connect the market to the header wallet.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="inri-premium-card p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/45">{item.title}</p>
                    <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-7 text-white/60">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="pb-12 pt-6 sm:pb-16">
          <div className="inri-page-container">
            <InriP2PClient />
          </div>
        </section>
      </main>
    </InriShell>
  )
}
