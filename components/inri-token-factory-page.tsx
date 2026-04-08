import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  CircleSlash2,
  Coins,
  ExternalLink,
  Flame,
  HandCoins,
  Layers3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

type QuickFeature = {
  icon: ReactNode
  title: string
  text: string
}

type FunctionCard = {
  title: string
  text: string
  badge: string
}

const factoryAddress = '0x1D760E78D92aA5B46b484bc054Bbfae11198B751'

const quickFeatures: QuickFeature[] = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Create inside the site',
    text: 'Users connect the wallet, fill the form and send the transaction without leaving the INRI website.',
  },
  {
    icon: <Coins className="h-5 w-5" />,
    title: 'Fixed launch supply',
    text: 'The factory mints the full supply once in the constructor and delivers it directly to the creator wallet.',
  },
  {
    icon: <Flame className="h-5 w-5" />,
    title: 'Burn function included',
    text: 'Each token supports self-burn from the holder balance, reducing total supply without a hidden mint route later.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Explorer-first workflow',
    text: 'After creation, users can jump straight to the explorer, verify the token and add it to the wallet.',
  },
]

const functionCards: FunctionCard[] = [
  {
    title: 'transfer / transferFrom',
    badge: 'Transfers',
    text: 'Standard balance transfers and allowance-based transfers are built in from launch.',
  },
  {
    title: 'approve / allowance',
    badge: 'Approvals',
    text: 'The created token works with swaps, routers and other contracts that depend on allowances.',
  },
  {
    title: 'increase / decrease allowance',
    badge: 'UX friendly',
    text: 'Allowance helpers are included so users can manage approvals with cleaner wallet behavior.',
  },
  {
    title: 'burn(amount)',
    badge: 'Deflation option',
    text: 'Any holder can burn their own tokens. There is no burn-from-others backdoor in the token contract you sent.',
  },
  {
    title: 'transferOwnership',
    badge: 'Control',
    text: 'Project creators can move ownership to another wallet or multisig after launch if they want.',
  },
  {
    title: 'renounceOwnership',
    badge: 'Final step',
    text: 'Projects can renounce ownership permanently when they want a cleaner post-launch setup.',
  },
]

function FactPill({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-full border border-primary/28 bg-primary/[0.09] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
      {children}
    </div>
  )
}

function FeatureCard({ icon, title, text }: QuickFeature) {
  return (
    <div className="rounded-[1.6rem] border-[1.45px] border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.09),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_46px_rgba(0,0,0,0.22)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/66">{text}</p>
    </div>
  )
}

function FunctionMiniCard({ title, text, badge }: FunctionCard) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-[#071220] p-4 transition hover:border-primary/28 hover:bg-[#0a1728]">
      <div className="inline-flex rounded-full border border-primary/22 bg-primary/[0.08] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
        {badge}
      </div>
      <h3 className="mt-3 text-base font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/64">{text}</p>
    </div>
  )
}

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.15),_transparent_24%),radial-gradient(circle_at_85%_0%,_rgba(19,164,255,0.08),_transparent_24%),linear-gradient(180deg,#02070b_0%,#000000_44%,#03101d_100%)]">
        <section className="border-b border-white/8">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_520px] xl:items-start">
              <div>
                <div className="flex flex-wrap gap-3">
                  <FactPill>Token Factory</FactPill>
                  <FactPill>Connect wallet</FactPill>
                  <FactPill>Create on chain</FactPill>
                  <FactPill>Chain 3777</FactPill>
                </div>

                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-[4.2rem]">
                  Create a token directly on the INRI site.
                </h1>
                <p className="mt-6 max-w-4xl text-base leading-8 text-white/68 sm:text-lg">
                  Agora sim virou app: the user connects the wallet, fills in name, symbol, decimals and supply,
                  sends the transaction to the live factory contract and gets the new token back on INRI CHAIN.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href={`https://explorer.inri.life/address/${factoryAddress}`} external noTranslate>
                    Open factory on explorer
                  </InriLinkButton>
                  <InriLinkButton href="https://wallet.inri.life" external variant="secondary" noTranslate>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="/swap" variant="ghost" noTranslate>
                    Open swap route
                  </InriLinkButton>
                </div>

                <div className="mt-8 rounded-[1.8rem] border-[1.5px] border-primary/20 bg-primary/[0.08] p-5 shadow-[0_18px_50px_rgba(19,164,255,0.12)]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Factory contract</p>
                      <p className="mt-2 font-mono text-sm font-bold text-white sm:text-base">{factoryAddress}</p>
                    </div>
                    <Link
                      href={`https://explorer.inri.life/address/${factoryAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-black/30 px-4 py-2 text-sm font-bold text-primary transition hover:bg-black/50"
                    >
                      View contract
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Live function</div>
                      <div className="mt-2 text-sm font-bold text-white">createToken(name, symbol, decimals, supply)</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Owner at launch</div>
                      <div className="mt-2 text-sm font-bold text-white">The connected wallet receives 100% of the supply</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Supply logic</div>
                      <div className="mt-2 text-sm font-bold text-white">supply × 10**decimals</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Mint after launch</div>
                      <div className="mt-2 text-sm font-bold text-white">No extra mint function in the token contract</div>
                    </div>
                  </div>
                </div>
              </div>

              <InriTokenFactoryClient />
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {quickFeatures.map((item) => (
                <FeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-8 pb-20">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
              <div className="rounded-[2rem] border-[1.5px] border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.98),rgba(2,7,14,0.98))] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)] sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Contract functions</p>
                <h2 className="mt-3 text-3xl font-black text-white">What every new token already includes.</h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {functionCards.map((item) => (
                    <FunctionMiniCard key={item.title} {...item} />
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.5px] border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.98),rgba(2,7,14,0.98))] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)] sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Launch notes</p>
                <h2 className="mt-3 text-3xl font-black text-white">What gives confidence to users.</h2>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3 text-white">
                      <HandCoins className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-black">No hidden mint button</h3>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      The token contract you sent does not include a later mint function. That makes the supply model easier for users to understand.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3 text-white">
                      <CircleSlash2 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-black">Burn only from self balance</h3>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      The burn function only affects the caller’s own balance, avoiding privileged burns from third-party wallets.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3 text-white">
                      <Layers3 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-black">Ready for the next route</h3>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      After creation, the natural next steps are explorer verification, wallet import and liquidity or pool setup.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3 text-white">
                      <ArrowRight className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-black">Easy to explain publicly</h3>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      Users can understand the token in one sentence: fixed launch supply, normal transfers, approvals, burn and optional ownership handoff.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
