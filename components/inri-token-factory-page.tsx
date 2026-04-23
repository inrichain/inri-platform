import { ArrowRight, ExternalLink, Rocket, ShieldCheck, Wallet } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

const factoryAddress = '0x1D760E78D92aA5B46b484bc054Bbfae11198B751'

const factoryPoints = [
  { title: 'Wallet-first launch', text: 'Connect once in the header and create tokens from the official INRI surface.', icon: Wallet },
  { title: 'Factory route', text: 'A cleaner path for community tokens, ecosystem assets and launch experiments.', icon: Rocket },
  { title: 'Review before sending', text: 'Preview name, symbol, decimals and supply before you submit the transaction.', icon: ShieldCheck },
]

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_20%),linear-gradient(180deg,#02070c_0%,#000000_48%,#03111d_100%)]">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-12 sm:py-14 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.55fr)] lg:items-end">
              <div>
                <div className="flex flex-wrap gap-2.5">
                  <span className="inri-chip text-primary">INRI Token Factory</span>
                  <span className="inri-chip">Official launch route</span>
                  <span className="inri-chip">Chain 3777</span>
                </div>
                <h1 className="mt-6 max-w-5xl text-balance text-4xl font-black leading-[0.98] text-white sm:text-5xl lg:text-[4.8rem]">
                  Create tokens on INRI with a cleaner launch experience.
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  A focused factory page inspired by professional ecosystem portals: one strong entry, one clear action surface and no duplicated wallet connection inside the page.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={`https://explorer.inri.life/address/${factoryAddress}`} target="_blank" rel="noreferrer" className="inri-button-secondary">
                    Open factory contract
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a href="#launch-panel" className="inri-button-primary">
                    Start launch
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="rounded-[2rem] border border-primary/18 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.14),transparent_30%),linear-gradient(180deg,rgba(7,16,29,0.98),rgba(2,7,14,0.98))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Factory contract</p>
                <p className="mt-4 break-all font-mono text-sm leading-7 text-white/76">{factoryAddress}</p>
                <div className="mt-5 grid gap-3">
                  {factoryPoints.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className="rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex rounded-xl border border-primary/25 bg-primary/[0.10] p-2 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <h3 className="text-sm font-black text-white">{item.title}</h3>
                            <p className="mt-1 text-xs leading-6 text-white/58">{item.text}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="launch-panel" className="border-t border-white/[0.08] bg-black/40 pb-16 pt-8 sm:pb-20 sm:pt-10">
          <div className="inri-page-container">
            <InriTokenFactoryClient />
          </div>
        </section>
      </main>
    </InriShell>
  )
}
