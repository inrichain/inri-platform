import type { ReactNode } from 'react'
import { ArrowRight, Droplets, ShieldCheck, Sparkles } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriStakingClient } from '@/components/inri-staking-client'

const stakingAddress = '0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9'

type Highlight = {
  title: string
  text: string
  icon: ReactNode
}

const highlights: Highlight[] = [
  {
    title: '3 locking plans',
    text: '90, 180 and 360 day plans with progressive weight multipliers.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'Native INRI staking',
    text: 'Stake and manage directly from the same screen without leaving the site.',
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    title: 'Claim + emergency logic',
    text: 'Daily claim cooldown, early-exit penalties and emergency exit support.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
]

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[2rem] border-[1.35px] border-white/12 bg-[linear-gradient(180deg,rgba(6,15,26,0.98),rgba(2,8,15,0.985))] shadow-[0_24px_80px_rgba(0,0,0,0.34)] ${className}`}
    >
      {children}
    </div>
  )
}

export function InriStakingPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.16),_transparent_22%),linear-gradient(180deg,#02070c_0%,#000000_52%,#03111d_100%)]">
        <section className="border-b border-white/8">
          <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-[1180px]">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                  <div className="inline-flex items-center rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                    INRI staking
                  </div>
                  <h1 className="mt-5 max-w-[720px] text-4xl font-black leading-[0.96] text-white sm:text-5xl lg:text-[4.45rem]">
                    Stake INRI from one cleaner, stronger screen.
                  </h1>
                  <p className="mt-5 max-w-[760px] text-base leading-8 text-white/66 sm:text-lg">
                    Review the program, connect the wallet, choose the plan and manage claim or unstake actions without the clutter.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                      Open INRI Wallet
                    </InriLinkButton>
                    <InriLinkButton href={`https://explorer.inri.life/address/${stakingAddress}`} external variant="secondary" noTranslate>
                      View contract
                    </InriLinkButton>
                  </div>
                </div>

                <Surface className="p-5 sm:p-6">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Program facts</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {highlights.map((item) => (
                      <div key={item.title} className="rounded-[1.55rem] border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
                          {item.icon}
                        </div>
                        <h3 className="mt-4 text-lg font-black text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-white/58">{item.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-black/28 px-4 py-3">
                    <div>
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

              <div className="mt-10">
                <InriStakingClient />
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
