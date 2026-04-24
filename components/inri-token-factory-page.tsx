import { Factory, Rocket, ShieldCheck, Wallet } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="inri-site-v2">
        <section className="inri-v2-hero">
          <div className="inri-page-container py-10 sm:py-14 lg:py-16">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.52fr)] xl:items-stretch">
              <div className="inri-v2-panel flex min-h-[460px] flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inri-v2-kicker">Token Factory</span>
                  <span className="inri-v2-kicker">INRI mainnet</span>
                  <span className="inri-v2-kicker">Chain 3777</span>
                </div>
                <h1 className="inri-v2-heading mt-8 max-w-5xl text-[2.8rem] sm:text-[4.2rem] lg:text-[5.8rem]">
                  Launch tokens with one clean INRI factory panel.
                </h1>
                <p className="inri-v2-text mt-7 max-w-3xl text-lg">
                  Create ecosystem assets from a stronger, clearer product surface. Connect once in the header, review token details and deploy from the mainnet factory route.
                </p>
                <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                  <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Open Explorer</InriLinkButton>
                  <InriLinkButton href="https://wallet.inri.life" external>Open Wallet</InriLinkButton>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><Wallet className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Header wallet</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Use the same connected wallet across the site.</p>
                </div>
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><ShieldCheck className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Review first</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Check name, ticker, decimals and supply before sending.</p>
                </div>
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><Rocket className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Factory route</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Deploy tokens directly on INRI Chain 3777.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16 pt-6">
          <div className="inri-page-container">
            <div className="inri-v2-panel p-4 sm:p-6 lg:p-8">
              <InriTokenFactoryClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
