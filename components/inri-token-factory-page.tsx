import type { ReactNode } from 'react'
import { ExternalLink, Flame, ShieldCheck, Sparkles } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

const factoryAddress = '0x1D760E78D92aA5B46b484bc054Bbfae11198B751'

type NoteCard = {
  title: string
  text: string
  icon: ReactNode
}

const notes: NoteCard[] = [
  {
    title: 'Live factory',
    text: 'The app sends the transaction directly to the live INRI factory contract from the same screen.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'One-time mint',
    text: 'The created token sends 100% of the initial supply to the connected wallet at launch.',
    icon: <Flame className="h-5 w-5" />,
  },
  {
    title: 'Ownership tools',
    text: 'The generated token includes approvals, ownership transfer, renounce ownership and burn.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
]

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,15,26,0.96),rgba(2,8,15,0.985))] shadow-[0_24px_80px_rgba(0,0,0,0.34)] ${className}`}>
      {children}
    </div>
  )
}

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_20%),linear-gradient(180deg,#02070c_0%,#000000_48%,#03111d_100%)]">
        <section className="border-b border-white/8">
          <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-[1100px] text-center">
              <div className="inline-flex items-center rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                INRI Token Factory
              </div>
              <h1 className="mx-auto mt-5 max-w-[980px] text-4xl font-black leading-[0.96] text-white sm:text-5xl lg:text-[4rem]">
                Create a token on INRI with a cleaner, more professional launch screen.
              </h1>
              <p className="mx-auto mt-5 max-w-[860px] text-base leading-8 text-white/66 sm:text-lg">
                Connect the wallet, switch to INRI CHAIN, fill the token details and launch from one centered app panel.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                  Open INRI Wallet
                </InriLinkButton>
                <InriLinkButton href={`https://explorer.inri.life/address/${factoryAddress}`} external variant="secondary" noTranslate>
                  View factory
                </InriLinkButton>
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-[1180px]">
              <InriTokenFactoryClient />
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

            <div className="mx-auto mt-6 max-w-[1180px]">
              <Surface className="p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Factory contract</div>
                    <div className="mt-2 break-all font-mono text-sm font-bold text-white">{factoryAddress}</div>
                  </div>
                  <a
                    href={`https://explorer.inri.life/address/${factoryAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
                  >
                    Open on explorer
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </Surface>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
