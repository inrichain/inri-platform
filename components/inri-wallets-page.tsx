import { Layers3, Shield, Wallet2 } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

export function InriWalletsPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Wallets</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Choose a wallet and add INRI Chain.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">Download a compatible EVM wallet, add the official INRI network values and move directly into the ecosystem from one consistent page.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="https://wallet.inri.life" external>Open INRI Wallet</InriLinkButton>
                <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Open Explorer</InriLinkButton>
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Wallet2 className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Wallet route</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Use INRI Wallet or another compatible EVM wallet.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Layers3 className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Network ready</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">RPC, chain ID and explorer values stay visible.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Shield className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Secure setup</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Create your wallet and save your seed phrase safely.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </InriShell>
  )
}
