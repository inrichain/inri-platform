import type { ReactNode } from 'react'
import { ExternalLink, ShieldCheck, Sparkles } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

const factoryAddress = '0x1D760E78D92aA5B46b484bc054Bbfae11198B751'

type NoteCard = {
  title: string
  text: string
  icon: ReactNode
}

const notes: NoteCard[] = [
  {
    title: 'Official route',
    text: 'Launch an INRI token from the live mainnet factory using the wallet connected in the top header.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'Wallet first',
    text: 'Connect the wallet in the header, confirm INRI CHAIN and then review the token details before sending.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
]

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`inri-section-surface rounded-[2rem] ${className}`}>{children}</div>
}

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_20%),linear-gradient(180deg,#02070c_0%,#000000_48%,#03111d_100%)]">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-10 lg:py-12">
            <div className="mx-auto grid max-w-[1180px] gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-end">
              <div>
                <div className="inline-flex items-center rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  INRI Token Factory
                </div>
                <h1 className="mt-5 max-w-[900px] text-4xl font-black leading-[0.96] text-white sm:text-5xl lg:text-[3.7rem]">
                  Create a token on INRI from the official launch route.
                </h1>
                <p className="mt-5 max-w-[760px] text-base leading-8 text-white/66 sm:text-lg">
                  Use the wallet button in the top header, switch to INRI CHAIN and launch from one cleaner factory panel.
                </p>
              </div>

              <div className="grid gap-4">
              <Surface className="p-5 sm:p-6">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Factory contract</div>
                <div className="mt-3 break-all font-mono text-sm font-bold text-white">{factoryAddress}</div>
                <a
                  href={`https://explorer.inri.life/address/${factoryAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
                >
                  Open on explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Surface>

              <div className="grid gap-3">
                {notes.map((note) => (
                  <Surface key={note.title} className="p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
                      {note.icon}
                    </div>
                    <div className="mt-4 text-lg font-black text-white">{note.title}</div>
                    <p className="mt-2 text-sm leading-7 text-white/62">{note.text}</p>
                  </Surface>
                ))}
              </div>
            </div>
            </div>

            <div className="mx-auto mt-8 max-w-[1180px]">
              <InriTokenFactoryClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
