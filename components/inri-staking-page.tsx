import type { ReactNode } from 'react'
import { ArrowRight, Layers3, ShieldCheck, Wallet2 } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriStakingClient } from '@/components/inri-staking-client'

const stakingAddress = '0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9'
const explorerUrl = `https://explorer.inri.life/address/${stakingAddress}`

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`inri-section-surface overflow-hidden rounded-[2rem] ${className}`}>
      {children}
    </div>
  )
}

export function InriStakingPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.15),_transparent_24%),linear-gradient(180deg,#02070c_0%,#000000_52%,#03111d_100%)]">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-10 lg:py-12">
            <div className="mx-auto max-w-[1360px] space-y-7">
              <div className="grid gap-7 xl:grid-cols-[minmax(0,1.08fr)_390px] xl:items-stretch">
                <div className="rounded-[2.1rem] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.14),transparent_28%),linear-gradient(180deg,rgba(6,17,28,0.98),rgba(2,7,13,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:p-7 lg:p-8">
                  <div className="inline-flex items-center rounded-full border border-primary/24 bg-primary/[0.10] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                    Official staking route
                  </div>
                  <h1 className="mt-5 max-w-[780px] text-4xl font-black leading-[0.95] text-white sm:text-5xl xl:text-[4rem]">
                    Official staking on INRI with the same premium interface used across the site.
                  </h1>
                  <p className="mt-5 max-w-[760px] text-base leading-8 text-white/66 sm:text-lg">
                    Use the wallet button in the top header, switch to INRI CHAIN, choose a plan and manage staking from one cleaner premium panel.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                      Open INRI Wallet
                    </InriLinkButton>
                    <InriLinkButton href={explorerUrl} external variant="secondary" noTranslate>
                      Open official explorer
                    </InriLinkButton>
                  </div>

                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    <div className="inri-subcard rounded-[1.45rem] p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
                        <Layers3 className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-lg font-black text-white">3 staking plans</div>
                      <p className="mt-2 text-sm leading-7 text-white/58">90, 180 and 360 days with increasing effective weight.</p>
                    </div>
                    <div className="inri-subcard rounded-[1.45rem] p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
                        <Wallet2 className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-lg font-black text-white">Any compatible EVM wallet</div>
                      <p className="mt-2 text-sm leading-7 text-white/58">INRI Wallet, MetaMask, Rabby, OKX and similar wallets can add INRI CHAIN.</p>
                    </div>
                    <div className="inri-subcard rounded-[1.45rem] p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-lg font-black text-white">Cleaner actions</div>
                      <p className="mt-2 text-sm leading-7 text-white/58">Stake, claim, restake and unstake now sit inside one clearer action block.</p>
                    </div>
                  </div>
                </div>

                <Surface className="p-6 sm:p-7">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Contract snapshot</p>
                  <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-[2rem]">
                    Open the contract directly in the official explorer.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/64">
                    No internal explorer detour. Every explorer action now goes to the official public explorer route.
                  </p>

                  <div className="mt-5 grid gap-3">
                    {[
                      ['Minimum stake', '100 INRI'],
                      ['Maximum per plan', '10,000 INRI'],
                      ['Claim cooldown', '1 day'],
                    ].map(([label, value]) => (
                      <div key={label} className="inri-subcard rounded-[1.3rem] p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">{label}</div>
                        <div className="mt-2 text-xl font-black text-white">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.35rem] border border-white/12 bg-black/28 p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Staking contract</div>
                    <div className="mt-2 break-all font-mono text-sm font-semibold text-white">{stakingAddress}</div>
                  </div>

                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inri-button-secondary mt-5 w-full"
                  >
                    View contract in explorer
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Surface>
              </div>

              <InriStakingClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
