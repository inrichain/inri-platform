import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, ExternalLink, Flame, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

const factoryAddress = '0x1D760E78D92aA5B46b484bc054Bbfae11198B751'

type SimpleCard = {
  eyebrow: string
  title: string
  text: string
  icon: ReactNode
}

const conciseHighlights: SimpleCard[] = [
  {
    eyebrow: 'Live contract',
    title: 'Create from the same screen',
    text: 'The wallet signs the factory transaction directly from the site without redirecting the user into a separate launcher.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    eyebrow: 'Supply model',
    title: 'Full supply at launch',
    text: 'The creator receives the whole initial supply during deployment. There is no extra mint route hidden later in the token contract.',
    icon: <Flame className="h-5 w-5" />,
  },
  {
    eyebrow: 'Control',
    title: 'Ownership and burn included',
    text: 'Created tokens include transfer, approve, transferFrom, ownership transfer, renounce ownership and self-burn support.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
]

const launchFlow: SimpleCard[] = [
  {
    eyebrow: 'Step 1',
    title: 'Connect and switch',
    text: 'Open INRI Wallet or another EVM wallet, connect, then switch to INRI CHAIN before submitting the transaction.',
    icon: <ArrowRight className="h-5 w-5" />,
  },
  {
    eyebrow: 'Step 2',
    title: 'Fill the token details',
    text: 'Enter name, symbol, decimals and a whole-number initial supply. The factory applies 10**decimals internally.',
    icon: <Workflow className="h-5 w-5" />,
  },
  {
    eyebrow: 'Step 3',
    title: 'Create and verify',
    text: 'Approve the transaction, wait for confirmation, then open the new token in the explorer and add it to the wallet.',
    icon: <ExternalLink className="h-5 w-5" />,
  },
]

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-primary/28 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
      {children}
    </div>
  )
}

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2rem] border-[1.5px] border-white/12 bg-[linear-gradient(180deg,rgba(7,15,26,0.95),rgba(2,8,15,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.30)] ${className}`}>
      {children}
    </div>
  )
}

function InfoCard({ eyebrow, title, text, icon }: SimpleCard) {
  return (
    <Surface className="p-5 sm:p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
        {icon}
      </div>
      <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-primary/90">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/64">{text}</p>
    </Surface>
  )
}

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_18%),radial-gradient(circle_at_100%_0%,_rgba(19,164,255,0.08),_transparent_24%),linear-gradient(180deg,#02070c_0%,#000000_46%,#03101c_100%)]">
        <section className="border-b border-white/8">
          <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="mx-auto max-w-[980px] text-center">
              <Eyebrow>INRI Token Factory</Eyebrow>
              <h1 className="mt-6 text-4xl font-black leading-[0.98] text-white sm:text-5xl lg:text-[4.6rem]">
                Create tokens inside the site with a cleaner launch flow.
              </h1>
              <p className="mx-auto mt-6 max-w-[820px] text-base leading-8 text-white/68 sm:text-lg">
                Connect the wallet, switch to INRI CHAIN, fill the token details and send the live factory transaction from one focused panel.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                  Open INRI Wallet
                </InriLinkButton>
                <InriLinkButton
                  href={`https://explorer.inri.life/address/${factoryAddress}`}
                  external
                  variant="secondary"
                  noTranslate
                >
                  View factory on explorer
                </InriLinkButton>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Eyebrow>Chain 3777</Eyebrow>
                <Eyebrow>Factory live</Eyebrow>
                <Eyebrow>No extra mint</Eyebrow>
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-[1180px]">
              <InriTokenFactoryClient />
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-3">
              {conciseHighlights.map((item) => (
                <InfoCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
              <Surface className="p-6 sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Launch flow</p>
                <h2 className="mt-3 text-3xl font-black text-white">Keep the creation journey easy to understand.</h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  {launchFlow.map((item) => (
                    <div key={item.title} className="rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
                        {item.icon}
                      </div>
                      <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-primary/90">{item.eyebrow}</p>
                      <h3 className="mt-2 text-xl font-black text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/64">{item.text}</p>
                    </div>
                  ))}
                </div>
              </Surface>

              <Surface className="p-6 sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Factory contract</p>
                <h2 className="mt-3 text-3xl font-black text-white">Launch on the live contract.</h2>
                <div className="mt-5 rounded-[1.45rem] border border-primary/18 bg-primary/[0.08] p-4">
                  <div className="break-all font-mono text-sm font-bold text-white">{factoryAddress}</div>
                  <Link
                    href={`https://explorer.inri.life/address/${factoryAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
                  >
                    Open contract
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Live function</div>
                    <div className="mt-2 text-base font-black text-white">createToken(name, symbol, decimals, supply)</div>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Supply logic</div>
                    <div className="mt-2 text-base font-black text-white">supply × 10**decimals inside the token constructor</div>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Owner at launch</div>
                    <div className="mt-2 text-base font-black text-white">Connected wallet receives 100% of the initial supply</div>
                  </div>
                </div>
              </Surface>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
