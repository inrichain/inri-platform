import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  Coins,
  ExternalLink,
  Flame,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

const factoryAddress = '0x1D760E78D92aA5B46b484bc054Bbfae11198B751'

type SimpleCard = {
  eyebrow: string
  title: string
  text: string
  icon: ReactNode
}

const valueCards: SimpleCard[] = [
  {
    eyebrow: 'Live factory',
    title: 'Create directly on INRI CHAIN',
    text: 'The transaction goes from the user wallet to the live factory contract without leaving the site.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    eyebrow: 'Supply model',
    title: 'Full supply at launch',
    text: 'The creator wallet receives the entire initial supply in the constructor. No hidden extra mint route after launch.',
    icon: <Coins className="h-5 w-5" />,
  },
  {
    eyebrow: 'Post-launch control',
    title: 'Burn and ownership tools included',
    text: 'Every token supports approvals, ownership transfer, renounce ownership and self-burn from the holder balance.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
]

const launchSteps: SimpleCard[] = [
  {
    eyebrow: 'Step 1',
    title: 'Connect the wallet',
    text: 'Open INRI Wallet or another EVM wallet, connect, and switch to INRI CHAIN before creating.',
    icon: <ArrowRight className="h-5 w-5" />,
  },
  {
    eyebrow: 'Step 2',
    title: 'Fill the token fields',
    text: 'Enter name, symbol, decimals and the initial whole-number supply you want to launch.',
    icon: <Workflow className="h-5 w-5" />,
  },
  {
    eyebrow: 'Step 3',
    title: 'Confirm and verify',
    text: 'Approve the transaction in the wallet, wait for confirmation, then open the token in the explorer.',
    icon: <ExternalLink className="h-5 w-5" />,
  },
]

const featureGrid: SimpleCard[] = [
  {
    eyebrow: 'Transfers',
    title: 'Standard ERC-20 flow',
    text: 'transfer, approve, allowance and transferFrom are already available in the deployed token.',
    icon: <Coins className="h-5 w-5" />,
  },
  {
    eyebrow: 'Burn',
    title: 'Holder burn function',
    text: 'Any holder can burn from their own balance, reducing total supply without a hidden admin burn-from route.',
    icon: <Flame className="h-5 w-5" />,
  },
  {
    eyebrow: 'Ownership',
    title: 'Transfer or renounce ownership',
    text: 'The project creator can move ownership to a new wallet or renounce permanently after launch.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    eyebrow: 'Explorer',
    title: 'Launch with visibility',
    text: 'After creation the user can jump straight to the explorer, inspect the token and add it to the wallet.',
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

function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[1.9rem] border-[1.5px] border-white/12 bg-[linear-gradient(180deg,rgba(7,15,26,0.96),rgba(2,8,15,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.30)] ${className}`}
    >
      {children}
    </div>
  )
}

function InfoCard({ eyebrow, title, text, icon }: SimpleCard) {
  return (
    <GlassCard className="p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
        {icon}
      </div>
      <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-primary/90">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/64">{text}</p>
    </GlassCard>
  )
}

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.15),_transparent_18%),radial-gradient(circle_at_100%_0%,_rgba(19,164,255,0.08),_transparent_22%),linear-gradient(180deg,#02070c_0%,#000000_46%,#03101c_100%)]">
        <section className="border-b border-white/8">
          <div className="mx-auto max-w-[1480px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_500px] xl:items-start">
              <div>
                <Eyebrow>INRI Token Factory</Eyebrow>

                <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.98] text-white sm:text-5xl lg:text-[4.5rem]">
                  Launch a token with a cleaner app, not a messy dashboard.
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  Connect the wallet, switch to INRI CHAIN, fill the token details and create directly from the
                  site. The flow is simple, the contract is live and the result goes straight to the creator wallet.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href={`https://explorer.inri.life/address/${factoryAddress}`} external variant="secondary" noTranslate>
                    View factory on explorer
                  </InriLinkButton>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Eyebrow>Chain 3777</Eyebrow>
                  <Eyebrow>Factory live</Eyebrow>
                  <Eyebrow>No extra mint</Eyebrow>
                </div>
              </div>

              <InriTokenFactoryClient />
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-10">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-3">
              {valueCards.map((item) => (
                <InfoCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-4 pb-20">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <GlassCard className="p-6 sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Launch flow</p>
                <h2 className="mt-3 text-3xl font-black text-white">Keep the creation journey obvious.</h2>
                <div className="mt-6 space-y-4">
                  {launchSteps.map((item) => (
                    <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/90">{item.eyebrow}</p>
                          <h3 className="mt-2 text-xl font-black text-white">{item.title}</h3>
                          <p className="mt-2 text-sm leading-7 text-white/64">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="space-y-6">
                <GlassCard className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Factory contract</p>
                      <h2 className="mt-3 text-3xl font-black text-white">One contract, one clear launch path.</h2>
                    </div>
                    <Link
                      href={`https://explorer.inri.life/address/${factoryAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
                    >
                      Open on explorer
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-5 rounded-[1.5rem] border border-primary/18 bg-primary/[0.08] p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Factory address</div>
                    <div className="mt-2 break-all font-mono text-sm font-bold text-white sm:text-base">{factoryAddress}</div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Live function</div>
                      <div className="mt-2 text-base font-black text-white">createToken(name, symbol, decimals, supply)</div>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Supply logic</div>
                      <div className="mt-2 text-base font-black text-white">supply × 10**decimals</div>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Ownership</div>
                      <div className="mt-2 text-base font-black text-white">Creator receives ownership at launch</div>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Mint after launch</div>
                      <div className="mt-2 text-base font-black text-white">No extra mint function in the token contract</div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 sm:p-8">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">What the deployed token includes</p>
                  <h2 className="mt-3 text-3xl font-black text-white">Useful defaults for real launches.</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {featureGrid.map((item) => (
                      <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
                          {item.icon}
                        </div>
                        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-primary/90">{item.eyebrow}</p>
                        <h3 className="mt-2 text-lg font-black text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-white/64">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
