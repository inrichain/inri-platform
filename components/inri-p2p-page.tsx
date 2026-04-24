import { Coins, ShieldCheck, Store, Wallet } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriP2PClient } from '@/components/inri-p2p-client'

export function InriP2PPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">P2P Escrow</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Trade INRI through a cleaner market.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">Use the same wallet from the top header, sync the market and manage offers from the same INRI control-room interface.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="https://wallet.inri.life" external>Open Wallet</InriLinkButton>
                <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Explorer</InriLinkButton>
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Store className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Escrow market</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Create offers, accept, mark paid and release.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Wallet className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Header wallet</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">No second wallet style inside the page.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><ShieldCheck className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Protected flow</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Disputes and release actions remain inside the route.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#02040a] py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-[1560px] px-4 sm:px-8 xl:px-12">
            <div className="inri-v20-panel p-4 sm:p-6 lg:p-8">
              <InriP2PClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
