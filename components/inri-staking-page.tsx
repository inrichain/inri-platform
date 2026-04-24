import { LockKeyhole, ShieldCheck, Wallet2 } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriStakingClient } from '@/components/inri-staking-client'

export function InriStakingPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Staking</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Stake INRI from the same interface.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">Manage staking positions, claims and unstaking actions without leaving the standard INRI visual system.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="https://wallet.inri.life" external>Open Wallet</InriLinkButton>
                <InriLinkButton href="https://explorer.inri.life/address/0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9" external variant="secondary">View Contract</InriLinkButton>
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Wallet2 className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Header wallet</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Connect from the top and use the panel below.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><LockKeyhole className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Position control</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Stake, claim, restake or unstake.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><ShieldCheck className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Verified route</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Contract remains visible through the explorer.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#02040a] py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-[1560px] px-4 sm:px-8 xl:px-12">
            <div className="inri-v20-panel p-4 sm:p-6 lg:p-8">
              <InriStakingClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
