import { LockKeyhole, ShieldCheck, Wallet2 } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriStakingClient } from '@/components/inri-staking-client'

export function InriStakingPage() {
  return (
    <InriShell>
      <main className="inri-site-v2">
        <section className="inri-v2-hero">
          <div className="inri-page-container py-10 sm:py-14 lg:py-16">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.52fr)] xl:items-stretch">
              <div className="inri-v2-panel flex min-h-[460px] flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inri-v2-kicker">Staking</span>
                  <span className="inri-v2-kicker">INRI mainnet</span>
                  <span className="inri-v2-kicker">Chain 3777</span>
                </div>
                <h1 className="inri-v2-heading mt-8 max-w-5xl text-[2.8rem] sm:text-[4.2rem] lg:text-[5.8rem]">
                  Stake INRI from a premium control panel.
                </h1>
                <p className="inri-v2-text mt-7 max-w-3xl text-lg">
                  Manage staking positions, claims and unstaking actions from a unified page that now matches the rest of the official INRI interface.
                </p>
                <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                  <InriLinkButton href="https://wallet.inri.life" external>Open Wallet</InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life/address/0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9" external variant="secondary">View Contract</InriLinkButton>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><Wallet2 className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Header wallet</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Connect once at the top and use the staking panel below.</p>
                </div>
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><LockKeyhole className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Position control</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Stake, claim, restake or unstake from one area.</p>
                </div>
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><ShieldCheck className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Contract route</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Mainnet staking remains verifiable on explorer.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16 pt-6">
          <div className="inri-page-container">
            <div className="inri-v2-panel p-4 sm:p-6 lg:p-8">
              <InriStakingClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
