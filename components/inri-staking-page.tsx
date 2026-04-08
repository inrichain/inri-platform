import type { ReactNode } from 'react'
import { ArrowRight, Layers3, ShieldCheck, Wallet2 } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriStakingClient } from '@/components/inri-staking-client'

const stakingAddress = '0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9'

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[2rem] border-[1.5px] border-white/12 bg-[linear-gradient(180deg,rgba(7,15,26,0.97),rgba(2,8,15,0.985))] shadow-[0_28px_90px_rgba(0,0,0,0.34)] ${className}`}
    >
      {children}
    </div>
  )
}

export function InriStakingPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.15),_transparent_22%),linear-gradient(180deg,#02070c_0%,#000000_52%,#03111d_100%)]">
        <section className="border-b border-white/8">
          <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="mx-auto max-w-[1260px] space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                <div>
                  <div className="inline-flex items-center rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                    INRI staking
                  </div>
                  <h1 className="mt-5 max-w-[760px] text-4xl font-black leading-[0.95] text-white sm:text-5xl lg:text-[3.8rem]">
                    Staking that feels closer to a premium mining app.
                  </h1>
                  <p className="mt-4 max-w-[760px] text-base leading-8 text-white/64 sm:text-lg">
                    Clean plans, clear rewards, direct actions and a stronger layout for stake, claim, restake and unstake from the same screen.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                      Open INRI Wallet
                    </InriLinkButton>
                    <InriLinkButton href={`https://explorer.inri.life/address/${stakingAddress}`} external variant="secondary" noTranslate>
                      View contract
                    </InriLinkButton>
                  </div>
                </div>

                <Surface className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Program snapshot</div>
                      <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-[2rem]">
                        Three lock plans. One simpler control panel.
                      </h2>
                    </div>
                    <div className="rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                      Live contract
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
                        <Layers3 className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-lg font-black text-white">3 lock plans</div>
                      <p className="mt-2 text-sm leading-7 text-white/56">90, 180 and 360 days with increasing effective weight.</p>
                    </div>
                    <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
                        <Wallet2 className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-lg font-black text-white">Native INRI</div>
                      <p className="mt-2 text-sm leading-7 text-white/56">Stake and manage positions directly from the connected wallet.</p>
                    </div>
                    <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-lg font-black text-white">Clear limits</div>
                      <p className="mt-2 text-sm leading-7 text-white/56">100 INRI minimum, 10,000 per plan and a 1-day claim cooldown.</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-white/10 bg-black/30 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">Staking contract</div>
                      <div className="mt-2 break-all font-mono text-sm font-semibold text-white">{stakingAddress}</div>
                    </div>
                    <a
                      href={`https://explorer.inri.life/address/${stakingAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-5 text-sm font-black text-white transition hover:border-primary/55 hover:bg-primary/10"
                    >
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
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
