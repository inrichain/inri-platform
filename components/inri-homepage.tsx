'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Blocks, Coins, Factory, Pickaxe, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { NetworkPulse } from '@/components/network-pulse'

type Mode = 'use' | 'mine' | 'verify'

type HeroMode = {
  title: string
  text: string
  chips: string[]
  primary: { label: string; href: string; external?: boolean }
  secondary: { label: string; href: string; external?: boolean }
  bullets: Array<{ label: string; value: string }>
}

const modes: Record<Mode, HeroMode> = {
  use: {
    title: 'Use the chain with less friction and more confidence.',
    text: 'Lead new visitors into the wallet, explorer, swap and staking without forcing them to decode the site first.',
    chips: ['Wallet first', 'Low friction', 'Fast entry'],
    primary: { label: 'Open INRI Wallet', href: 'https://wallet.inri.life', external: true },
    secondary: { label: 'View Wallets', href: '/wallets' },
    bullets: [
      { label: 'Main route', value: 'Official wallet' },
      { label: 'Proof', value: 'Open explorer fast' },
      { label: 'Next step', value: 'Stake or swap' },
    ],
  },
  mine: {
    title: 'Put Proof-of-Work in the center of the homepage.',
    text: 'Mining should feel alive from the first screen: guides, pool access, chain pulse and real participation signals.',
    chips: ['Windows', 'Ubuntu', 'Pool'],
    primary: { label: 'Start Mining', href: '/mining' },
    secondary: { label: 'Open Pool', href: '/pool' },
    bullets: [
      { label: 'Entry', value: 'Mining routes' },
      { label: 'Signal', value: 'Live pulse' },
      { label: 'Access', value: 'Pool + solo path' },
    ],
  },
  verify: {
    title: 'Show proof before promises and routes before noise.',
    text: 'A premium homepage proves the network is alive early: blocks, fees, activity, miners and direct explorer access.',
    chips: ['Explorer', 'Blocks', 'Activity'],
    primary: { label: 'Open Explorer', href: 'https://explorer.inri.life', external: true },
    secondary: { label: 'Read Whitepaper', href: '/whitepaper' },
    bullets: [
      { label: 'Trust', value: 'Live chain data' },
      { label: 'Proof', value: 'Recent blocks' },
      { label: 'Context', value: 'Chain 3777' },
    ],
  },
}

const proofCards = [
  {
    title: 'Wallet route',
    text: 'Open the official wallet and enter INRI in one clear action.',
    icon: Wallet,
  },
  {
    title: 'Explorer proof',
    text: 'Make blocks, txs and addresses visible fast for trust.',
    icon: Blocks,
  },
  {
    title: 'Mining route',
    text: 'Show miners the path without hiding it deep in the site.',
    icon: Pickaxe,
  },
  {
    title: 'Real utility',
    text: 'Pool, staking, P2P and token factory should feel reachable.',
    icon: ShieldCheck,
  },
]

const utilityCards = [
  {
    title: 'Wallet',
    text: 'Official route into INRI and the easiest first step for new users.',
    href: 'https://wallet.inri.life',
    external: true,
    icon: Wallet,
  },
  {
    title: 'Mining',
    text: 'Windows, Ubuntu and pool routes with a stronger PoW presentation.',
    href: '/mining',
    icon: Pickaxe,
  },
  {
    title: 'Explorer',
    text: 'Blocks, transactions and address verification without friction.',
    href: 'https://explorer.inri.life',
    external: true,
    icon: Blocks,
  },
  {
    title: 'Staking',
    text: 'Longer-term utility and clearer participation routes on the site.',
    href: '/staking',
    icon: Coins,
  },
  {
    title: 'Factory',
    text: 'Token creation should look like part of a real ecosystem, not an extra link.',
    href: '/token-factory',
    icon: Factory,
  },
  {
    title: 'Whitepaper',
    text: 'The network story and technical direction should stay one click away.',
    href: '/whitepaper',
    icon: ShieldCheck,
  },
]

const valuePills = ['Low fees', 'Community mining', 'EVM compatible', 'Visible utility']

function GlowFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.75rem] border-[1.25px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] shadow-[0_24px_78px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  )
}

export function InriHomepage() {
  const [mode, setMode] = useState<Mode>('use')
  const active = modes[mode]

  return (
    <InriShell>
      <main>
        <section className="relative overflow-hidden border-b border-white/[0.12]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(19,164,255,0.22),transparent_28%),radial-gradient(circle_at_84%_14%,rgba(19,164,255,0.12),transparent_24%),radial-gradient(circle_at_58%_100%,rgba(19,164,255,0.08),transparent_26%),linear-gradient(180deg,rgba(0,0,0,0.94),rgba(0,0,0,0.99))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(19,164,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(19,164,255,0.06)_1px,transparent_1px)] bg-[size:58px_58px] opacity-35" />
          <div className="absolute left-0 top-0 h-px w-full bg-[linear-gradient(90deg,rgba(19,164,255,0),rgba(19,164,255,0.9),rgba(19,164,255,0))]" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-[0_0_30px_rgba(19,164,255,0.10)]">
              <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_16px_rgba(19,164,255,0.95)]" />
              INRI CHAIN
              <span className="text-white/28">•</span>
              Proof-of-Work
              <span className="text-white/28">•</span>
              Chain 3777
            </div>

            <div className="mt-9 grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {valuePills.map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-white/[0.14] bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70"
                    >
                      {pill}
                    </span>
                  ))}
                </div>

                <h1 className="mt-8 max-w-4xl text-balance text-4xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                  Proof-of-Work with visible value and a stronger presence.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                  INRI should look like a real network from the first screen: wallet, explorer, mining, pool, staking and live proof in a cleaner blue-on-black system.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="https://wallet.inri.life" external>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
                    Open Explorer
                  </InriLinkButton>
                  <InriLinkButton href="/mining" variant="secondary">
                    Start Mining
                  </InriLinkButton>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:max-w-3xl">
                  {proofCards.map((item) => {
                    const Icon = item.icon
                    return (
                      <GlowFrame key={item.title} className="p-4 backdrop-blur-sm">
                        <div className="inline-flex rounded-2xl border border-primary/30 bg-primary/12 p-2.5 text-primary shadow-[0_0_22px_rgba(19,164,255,0.14)]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="mt-4 text-base font-bold text-white">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
                      </GlowFrame>
                    )
                  })}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle,rgba(19,164,255,0.20),transparent_58%)] blur-3xl" />
                <div className="relative overflow-hidden rounded-[2.3rem] border-[1.3px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(5,10,16,0.98),rgba(0,0,0,0.98))] p-5 shadow-[0_36px_130px_rgba(0,0,0,0.54),0_0_0_1px_rgba(19,164,255,0.06)] sm:p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_36%),linear-gradient(rgba(19,164,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(19,164,255,0.05)_1px,transparent_1px)] bg-[size:auto,42px_42px,42px_42px] opacity-40" />

                  <div className="relative flex items-center justify-between gap-4 rounded-[1.45rem] border-[1.2px] border-white/[0.18] bg-white/[0.045] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">INRI utility console</p>
                      <p className="mt-1 text-sm text-white/58">Bigger structure, thicker borders and less visual noise.</p>
                    </div>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      Main routes
                    </span>
                  </div>

                  <div className="relative mt-5 flex flex-wrap gap-2">
                    {(
                      [
                        { key: 'use', label: 'Use' },
                        { key: 'mine', label: 'Mine' },
                        { key: 'verify', label: 'Verify' },
                      ] as Array<{ key: Mode; label: string }>
                    ).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setMode(item.key)}
                        className={`rounded-full border px-4 py-2.5 text-sm font-bold uppercase tracking-[0.14em] transition ${
                          mode === item.key
                            ? 'border-primary/50 bg-primary text-black shadow-[0_14px_40px_rgba(19,164,255,0.24)]'
                            : 'border-white/[0.14] bg-white/[0.03] text-white/72 hover:border-primary/40 hover:bg-primary/10 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-5 rounded-[1.9rem] border-[1.3px] border-white/[0.18] bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.14),transparent_34%),linear-gradient(180deg,rgba(2,6,11,0.98),rgba(0,0,0,1))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6">
                    <div className="flex flex-wrap gap-2">
                      {active.chips.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/[0.14] bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/68"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <h2 className="mt-5 text-3xl font-bold text-white sm:text-[2.35rem] sm:leading-[1.02]">{active.title}</h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/64 sm:text-base">{active.text}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {active.bullets.map((item) => (
                        <GlowFrame key={item.label} className="bg-white/[0.03] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{item.label}</p>
                          <p className="mt-3 text-sm font-semibold text-white">{item.value}</p>
                        </GlowFrame>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <InriLinkButton href={active.primary.href} external={active.primary.external}>
                        {active.primary.label}
                      </InriLinkButton>
                      <InriLinkButton href={active.secondary.href} external={active.secondary.external} variant="secondary">
                        {active.secondary.label}
                      </InriLinkButton>
                    </div>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                      <GlowFrame className="p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Why this feels stronger</p>
                        <p className="mt-3 text-sm leading-7 text-white/60">
                          One big live section, thicker borders, better spacing and more obvious utility routes keep the page premium without feeling exaggerated.
                        </p>
                      </GlowFrame>
                      <GlowFrame className="p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">What the user should feel</p>
                        <p className="mt-3 text-sm leading-7 text-white/60">
                          “This looks real, active and worth exploring” — not just another static landing page with crypto buzzwords.
                        </p>
                      </GlowFrame>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <NetworkPulse />

        <section className="border-t border-white/[0.12] bg-[linear-gradient(180deg,rgba(0,0,0,0.98),rgba(0,0,0,1))]">
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Core routes</p>
                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Every important route should feel like part of the same product.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                Real value comes from use: open the wallet, verify the chain, mine, join the pool, stake or launch tokens.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {utilityCards.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="group rounded-[1.85rem] border-[1.25px] border-white/[0.18] bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 transition hover:border-primary/50 hover:bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_34%),linear-gradient(180deg,rgba(19,164,255,0.08),rgba(255,255,255,0.02))] hover:shadow-[0_18px_50px_rgba(19,164,255,0.12)]"
                  >
                    <div className="inline-flex rounded-2xl border border-primary/30 bg-primary/12 p-3 text-primary shadow-[0_0_22px_rgba(19,164,255,0.14)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.12] bg-black">
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
            <GlowFrame className="overflow-hidden rounded-[2.1rem] p-7 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
                    <Sparkles className="h-4 w-4" />
                    Final direction
                  </p>
                  <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Black, electric blue and a homepage that feels worth staying on.</h2>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                    The right balance is not “more effects everywhere”. It is stronger contrast, thicker borders, more deliberate glow, clearer utility and enough live proof to keep people exploring.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Pure black base with more visible blue light and thicker outlines',
                    'One major command-center section instead of loose cards fighting each other',
                    'Shorter wording so the layout survives translation better',
                    'A global-view area ready for real analytics when you want to wire it in',
                  ].map((item) => (
                    <GlowFrame key={item} className="bg-black/60 p-4 text-sm leading-7 text-white/72">
                      {item}
                    </GlowFrame>
                  ))}
                </div>
              </div>
            </GlowFrame>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
