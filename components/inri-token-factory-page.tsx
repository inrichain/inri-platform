import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  Blocks,
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

type QuickFeature = {
  icon: ReactNode
  title: string
  text: string
}

type ParamField = {
  label: string
  value: string
  note: string
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
    title: 'Simple creation flow',
    text: 'Create a token with only name, symbol, decimals and initial supply through one factory contract.',
  },
  {
    icon: <Coins className="h-5 w-5" />,
    title: 'Fixed supply at launch',
    text: 'The supply is minted once in the constructor and sent directly to the creator wallet that deploys it.',
  },
  {
    icon: <Flame className="h-5 w-5" />,
    title: 'Burn enabled',
    text: 'Holders can burn their own balance, reducing total supply without hidden mint functions later.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Ownership controls',
    text: 'Each new token includes transferOwnership and renounceOwnership for cleaner post-launch management.',
  },
]

const paramFields: ParamField[] = [
  {
    label: 'Name',
    value: 'Example: INRI COMMUNITY TOKEN',
    note: 'The visible token name shown in wallets and explorers.',
  },
  {
    label: 'Symbol',
    value: 'Example: ICT',
    note: 'The short ticker that appears beside balances and transfers.',
  },
  {
    label: 'Decimals',
    value: 'Usually 18',
    note: 'The contract supports custom decimals, but 18 is the most familiar EVM default.',
  },
  {
    label: 'Supply',
    value: 'Human-readable amount',
    note: 'The factory multiplies supply by 10 ** decimals before minting the full total supply.',
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
    text: 'Your token can work with DEXs, routers and other contracts that rely on approvals.',
  },
  {
    title: 'increase / decrease allowance',
    badge: 'UX friendly',
    text: 'Allowance adjustment helpers are included so users do not need to reset values manually every time.',
  },
  {
    title: 'burn(amount)',
    badge: 'Deflation option',
    text: 'Any holder can burn tokens from their own balance. There is no burn-from-others backdoor.',
  },
  {
    title: 'transferOwnership',
    badge: 'Control',
    text: 'Project creators can move ownership to another wallet or multisig when the token is ready.',
  },
  {
    title: 'renounceOwnership',
    badge: 'Final step',
    text: 'Projects can permanently renounce ownership if they want a cleaner, ownerless post-launch setup.',
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

function StepCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-[1.75rem] border-[1.45px] border-white/12 bg-[linear-gradient(180deg,rgba(7,17,28,0.96),rgba(3,8,15,0.98))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/35 bg-primary/[0.11] text-sm font-black text-primary">
        {number}
      </div>
      <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/66">{text}</p>
    </div>
  )
}

function ParamCard({ label, value, note }: ParamField) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">{label}</div>
      <div className="mt-2 text-sm font-bold text-white">{value}</div>
      <p className="mt-2 text-sm leading-6 text-white/60">{note}</p>
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
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_430px] xl:items-start">
              <div>
                <div className="flex flex-wrap gap-3">
                  <FactPill>Token Factory</FactPill>
                  <FactPill>INRI CHAIN</FactPill>
                  <FactPill>Factory live</FactPill>
                  <FactPill>Chain 3777</FactPill>
                </div>

                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-[4.2rem]">
                  Launch a token on INRI CHAIN with a flow that feels easy for real users.
                </h1>
                <p className="mt-6 max-w-4xl text-base leading-8 text-white/68 sm:text-lg">
                  This page turns the factory contract you provided into a clear launch route: what the contract does,
                  what the new token includes, what parameters users should enter and how to publish a token without
                  confusion. The goal is simple onboarding, not technical noise.
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
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Factory write function</div>
                      <div className="mt-2 text-sm font-bold text-white">createToken(name, symbol, decimals, supply)</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Owner at launch</div>
                      <div className="mt-2 text-sm font-bold text-white">The caller wallet receives 100% of the supply</div>
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

              <div className="rounded-[2rem] border-[1.55px] border-white/14 bg-[linear-gradient(180deg,rgba(7,18,29,0.98),rgba(2,8,15,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Launch summary</p>
                <h2 className="mt-3 text-3xl font-black text-white">What users really need to know first.</h2>
                <div className="mt-6 space-y-3">
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Token type</div>
                    <div className="mt-2 text-sm font-bold text-white">INRI standard token with balances, allowances and owner controls</div>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Best default decimals</div>
                    <div className="mt-2 text-sm font-bold text-white">18 decimals for the most familiar EVM experience</div>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Important reminder</div>
                    <div className="mt-2 text-sm font-bold text-white">The initial supply goes entirely to the creator wallet at deployment</div>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Post-launch options</div>
                    <div className="mt-2 text-sm font-bold text-white">Transfer ownership, renounce ownership, add liquidity, verify and distribute</div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-primary/18 bg-primary/[0.07] p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Good practice</p>
                  <p className="mt-3 text-sm leading-7 text-white/72">
                    Test with a small token first, verify the token on explorer, confirm the symbol and decimals look right in wallets,
                    and only then launch the final public version.
                  </p>
                </div>
              </div>
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

        <section className="py-4 sm:py-6">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">How to create</p>
                <h2 className="mt-2 text-3xl font-black text-white sm:text-[2.2rem]">Three simple steps for users.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/62">
                The point of this page is to make token creation feel usable, not scary. These are the steps most users actually care about.
              </p>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <StepCard
                number="01"
                title="Connect and open the factory"
                text="Open INRI Wallet or another compatible wallet, make sure you are on INRI CHAIN, then open the factory contract on Explorer to use the write function."
              />
              <StepCard
                number="02"
                title="Enter the token data"
                text="Choose the final name, symbol, decimals and supply carefully. The contract mints the total supply once during creation and sends it to your wallet."
              />
              <StepCard
                number="03"
                title="Verify and launch"
                text="After creation, open your new token on Explorer, add it to your wallet, verify the decimals and symbol, then move on to distribution, pool creation or liquidity."
              />
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="rounded-[2rem] border-[1.5px] border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.98),rgba(2,7,14,0.98))] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)] sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Parameters</p>
                <h2 className="mt-3 text-3xl font-black text-white">What the user must enter.</h2>
                <p className="mt-3 text-sm leading-7 text-white/66">
                  This factory is intentionally lean. There are only four fields to decide — and each one matters.
                </p>

                <div className="mt-6 grid gap-3">
                  {paramFields.map((field) => (
                    <ParamCard key={field.label} {...field} />
                  ))}
                </div>

                <div className="mt-6 rounded-[1.4rem] border border-primary/18 bg-primary/[0.07] p-5 text-sm leading-7 text-white/74">
                  <strong className="text-white">Example:</strong> if a user enters supply <strong className="text-white">1,000,000</strong> and decimals <strong className="text-white">18</strong>, the token contract will store
                  the total supply as <strong className="text-white">1,000,000 × 10**18</strong> internally.
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.5px] border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.98),rgba(2,7,14,0.98))] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)] sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">What the new token includes</p>
                    <h2 className="mt-2 text-3xl font-black text-white">Useful functions from day one.</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/56">
                    <Blocks className="h-4 w-4 text-primary" />
                    Based on your contract
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {functionCards.map((item) => (
                    <FunctionMiniCard key={item.title} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 pb-20">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
              <div className="rounded-[2rem] border-[1.5px] border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.98),rgba(2,7,14,0.98))] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)] sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Launch notes</p>
                <h2 className="mt-3 text-3xl font-black text-white">What gives confidence to users.</h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
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
                      The burn function only affects the caller’s own balance, which avoids confusion about privileged burns from third-party wallets.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3 text-white">
                      <Layers3 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-black">Good for swap listing</h3>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      Once the token exists, the next natural routes are explorer verification, wallet import and liquidity or pool setup.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3 text-white">
                      <ArrowRight className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-black">Easy public explanation</h3>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      Users can understand the token in one sentence: fixed launch supply, normal transfers, approvals, burn and optional ownership handoff.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.5px] border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.98),rgba(2,7,14,0.98))] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.3)] sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Useful routes</p>
                <h2 className="mt-3 text-3xl font-black text-white">Keep the launch flow inside the INRI site.</h2>

                <div className="mt-6 space-y-3">
                  {[
                    { title: 'INRI Wallet', text: 'Connect and sign transactions.', href: 'https://wallet.inri.life', external: true },
                    { title: 'Explorer', text: 'Open the factory and inspect deployed tokens.', href: '/explorer' },
                    { title: 'Swap', text: 'Move from creation to liquidity later.', href: '/swap' },
                    { title: 'Whitepaper', text: 'Show the broader network context.', href: '/whitepaper' },
                  ] as { title: string; text: string; href: string; external?: boolean }[]).map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="group flex items-center justify-between gap-4 rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-primary/28 hover:bg-primary/[0.07]"
                    >
                      <div>
                        <div className="text-base font-black text-white">{item.title}</div>
                        <div className="mt-1 text-sm text-white/60">{item.text}</div>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
