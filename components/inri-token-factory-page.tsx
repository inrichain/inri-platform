import { ExternalLink } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

const factoryAddress = '0x1D760E78D92aA5B46b484bc054Bbfae11198B751'

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_20%),linear-gradient(180deg,#02070c_0%,#000000_48%,#03111d_100%)]">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-10 lg:py-12">
            <div className="mx-auto max-w-[1240px]">
              <div className="max-w-[900px]">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inri-chip text-primary">INRI Token Factory</span>
                  <span className="inri-chip">Launch route</span>
                  <span className="inri-chip">Wallet first</span>
                </div>
                <h1 className="mt-6 text-4xl font-black leading-[0.96] text-white sm:text-5xl lg:text-[4rem]">
                  Launch tokens on INRI from one cleaner factory panel.
                </h1>
                <p className="mt-5 max-w-[760px] text-base leading-8 text-white/66 sm:text-lg">
                  Connect the wallet in the top header, switch to INRI CHAIN and review the token details inside one focused launch surface with less clutter and better spacing.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={`https://explorer.inri.life/address/${factoryAddress}`} target="_blank" rel="noreferrer" className="inri-button-secondary">
                    Factory contract
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="mt-8">
                <InriTokenFactoryClient />
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
