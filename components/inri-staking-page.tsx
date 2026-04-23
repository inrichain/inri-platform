import { Layers3, LockKeyhole, ShieldCheck, Wallet2 } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriStakingClient } from '@/components/inri-staking-client'

const stakingAddress = '0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9'
const explorerUrl = `https://explorer.inri.life/address/${stakingAddress}`

const stakingPoints = [
  { title: 'Header wallet', text: 'Connect once at the top of the site and use the staking controls below.', icon: Wallet2 },
  { title: 'Staking plans', text: 'Select a plan, stake, claim, restake or unstake inside one cleaner surface.', icon: LockKeyhole },
  { title: 'Mainnet contract', text: 'The official staking contract remains available through the explorer.', icon: ShieldCheck },
]

export function InriStakingPage() {
  return (
    <InriShell>
      <main className="inri-page-shell">
        <section className="inri-hero-showcase">
          <div className="inri-page-container py-10 sm:py-12 lg:py-16">
            <div className="inri-glass-hero p-5 sm:p-7 lg:p-10">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.48fr)] xl:items-end">
                <div>
                  <div className="flex flex-wrap gap-2.5">
                    <span className="inri-tag text-primary">Staking</span>
                    <span className="inri-tag">Official route</span>
                    <span className="inri-tag">Chain 3777</span>
                  </div>
                  <h1 className="mt-6 max-w-5xl text-balance text-[2.4rem] font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-[3.4rem] lg:text-[5rem]">
                    Stake INRI from a cleaner control panel.
                  </h1>
                  <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg sm:leading-9">
                    Use the wallet in the header, switch to INRI CHAIN when needed and manage staking positions inside a more consistent premium page.
                  </p>
                  <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                    <InriLinkButton href={explorerUrl} external variant="secondary" noTranslate>
                      View Contract
                    </InriLinkButton>
                    <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                      Open INRI Wallet
                    </InriLinkButton>
                  </div>
                </div>

                <div className="grid gap-3">
                  {stakingPoints.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className="inri-data-box flex gap-4 p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="font-black text-white">{item.title}</h2>
                          <p className="mt-1 text-sm leading-6 text-white/58">{item.text}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-14 pt-6 sm:pb-18 lg:pb-20">
          <div className="inri-page-container">
            <div className="inri-dashboard-card p-4 sm:p-6 lg:p-8">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Staking controls</p>
                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Manage your position</h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-white/54">
                  This section keeps the functional staking client intact while using the same page rhythm as the rest of INRI.
                </p>
              </div>
              <InriStakingClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
