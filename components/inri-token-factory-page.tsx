import { Factory, Rocket, ShieldCheck, Wallet } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Token Factory</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Launch tokens from the INRI control room.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">Create tokens on Chain 3777 with the same visual standard as the new Home. Connect once in the header, review details and deploy from the factory panel.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="https://wallet.inri.life" external>Open Wallet</InriLinkButton>
                <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Explorer</InriLinkButton>
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Wallet className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">One wallet flow</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Use the connected wallet from the top header.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><ShieldCheck className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Review before deploy</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Confirm token name, symbol, decimals and supply.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Rocket className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Mainnet factory</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Deploy assets directly on INRI Chain 3777.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#02040a] py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-[1560px] px-4 sm:px-8 xl:px-12">
            <div className="inri-v20-panel p-4 sm:p-6 lg:p-8">
              <InriTokenFactoryClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
