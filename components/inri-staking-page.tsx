import type { ReactNode } from 'react'
import { Droplets, ShieldCheck, Sparkles } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriStakingClient } from '@/components/inri-staking-client'

const stakingAddress = '0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9'

type NoteCard = {
  title: string
  text: string
  icon: ReactNode
}

const notes: NoteCard[] = [
  {
    title: '3 weighted plans',
    text: '90, 180 and 360 day plans use 1.00x, 1.30x and 1.60x effective weight for reward distribution.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'Cooldown + penalties',
    text: 'Claims follow a 1 day cooldown and early exits apply a 5%, 7% or 9% penalty unless emergency exit is enabled.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: '5 year program',
    text: 'The contract is funded once with 5,000,000 INRI and emits rewards across five annual eras with decreasing schedules.',
    icon: <Droplets className="h-5 w-5" />,
  },
]

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,15,26,0.96),rgba(2,8,15,0.985))] shadow-[0_24px_80px_rgba(0,0,0,0.34)] ${className}`}>{children}</div>
}

export function InriStakingPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_20%),linear-gradient(180deg,#02070c_0%,#000000_48%,#03111d_100%)]">
        <section className="border-b border-white/8">
          <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-[1100px] text-center">
              <div className="inline-flex items-center rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                INRI Staking
              </div>
              <h1 className="mx-auto mt-5 max-w-[980px] text-4xl font-black leading-[0.96] text-white sm:text-5xl lg:text-[4rem]">
                Stake, claim and unstake directly on the INRI site.
              </h1>
              <p className="mx-auto mt-5 max-w-[900px] text-base leading-8 text-white/66 sm:text-lg">
                This page is built around the live staking contract so users can review the program, connect the wallet, join a plan and manage positions from one cleaner screen.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                  Open INRI Wallet
                </InriLinkButton>
                <InriLinkButton href={`https://explorer.inri.life/address/${stakingAddress}`} external variant="secondary" noTranslate>
                  View contract on explorer
                </InriLinkButton>
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-[1180px]">
              <InriStakingClient />
            </div>
          </div>
        </section>

        <section className="pb-20 pt-8">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-[1180px] gap-4 lg:grid-cols-3">
              {notes.map((item) => (
                <Surface key={item.title} className="p-5 sm:p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
                </Surface>
              ))}
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
