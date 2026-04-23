import { ArrowRight, Factory, Rocket, ShieldCheck, Wallet } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

const factoryPoints = [
  { title: 'Connect once', text: 'Use the wallet in the header, then create directly from the launch panel.', icon: Wallet },
  { title: 'Review first', text: 'Check name, symbol, decimals and supply before submitting the transaction.', icon: ShieldCheck },
  { title: 'Launch on INRI', text: 'Create ecosystem assets and community tokens on Chain 3777.', icon: Rocket },
]

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="inri-page-shell">
        <section className="inri-hero-showcase">
          <div className="inri-page-container py-10 sm:py-12 lg:py-16">
            <div className="inri-glass-hero p-5 sm:p-7 lg:p-10">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.48fr)] xl:items-center">
                <div>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="inri-tag text-primary">Token Factory</span>
                    <span className="inri-tag">Launch route</span>
                    <span className="inri-tag">Chain 3777</span>
                  </div>
                  <h1 className="mt-6 max-w-5xl text-balance text-[2.4rem] font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-[3.4rem] lg:text-[5rem]">
                    Launch tokens on INRI with a cleaner factory flow.
                  </h1>
                  <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg sm:leading-9">
                    A focused creation page for deploying tokens on the INRI mainnet. Connect from the header, review the parameters and submit from one polished launch panel.
                  </p>
                </div>

                <div className="inri-dashboard-card p-5 sm:p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                    <Factory className="h-6 w-6" />
                  </div>
                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.24em] text-primary">Factory status</p>
                  <h2 className="mt-3 text-2xl font-black text-white">Ready for mainnet creation.</h2>
                  <p className="mt-4 text-sm leading-7 text-white/64">
                    Keep the connection in the top navigation. The page below is only for token settings and transaction review.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {factoryPoints.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="inri-dashboard-card p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/62">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-10 lg:py-12">
          <div className="inri-page-container">
            <div className="inri-dashboard-card p-4 sm:p-6 lg:p-8">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Launch panel</p>
                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Create your token</h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-white/54">
                  The form is intentionally compact so the creation flow feels more like a professional product surface and less like a technical debug page.
                </p>
              </div>
              <InriTokenFactoryClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
