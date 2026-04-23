import { ShieldCheck, Store, Wallet } from 'lucide-react'
import { InriP2PClient } from '@/components/inri-p2p-client'
import { InriShell } from '@/components/inri-site-shell'

const highlights = [
  { title: 'Escrow market', value: 'P2P', text: 'Peer-to-peer trading with escrow protection inside the INRI ecosystem.', icon: Store },
  { title: 'Network', value: 'Chain 3777', text: 'Runs directly on the INRI mainnet using the native contract route.', icon: Wallet },
  { title: 'Trade flow', value: 'Protected', text: 'Create offers, mark payment, release funds and resolve disputes more clearly.', icon: ShieldCheck },
]

export function InriP2PPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(19,164,255,0.08),_transparent_28%),linear-gradient(180deg,#02060b_0%,#000000_100%)]">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-12 sm:py-14 lg:py-16">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_380px] xl:items-end">
              <div className="max-w-4xl">
                <div className="flex flex-wrap gap-3">
                  <span className="inri-chip text-primary">P2P • Escrow Market</span>
                  <span className="inri-chip">INRI mainnet</span>
                  <span className="inri-chip">Chain 3777</span>
                </div>
                <h1 className="mt-6 text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-[4rem]">
                  P2P market with the same premium INRI interface.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
                  Buy and sell INRI through the escrow market with cleaner spacing, better hierarchy and wallet connection handled from the top header of the site.
                </p>
              </div>

              <div className="rounded-[1.8rem] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.08),transparent_30%),linear-gradient(180deg,rgba(7,15,28,0.98),rgba(1,5,10,0.98))] p-5 sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Connection flow</p>
                <h2 className="mt-3 text-2xl font-black text-white">Use Connect Wallet only in the top header.</h2>
                <p className="mt-4 text-sm leading-7 text-white/66">
                  The P2P section now follows the same site standard. Connect your wallet using the button in the top navigation bar, then use the market below.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                    <div className="inline-flex rounded-2xl border border-primary/25 bg-primary/[0.10] p-3 text-primary">
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
