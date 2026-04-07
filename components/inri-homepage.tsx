'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Blocks,
  Coins,
  Factory,
  Pickaxe,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { NetworkPulse } from '@/components/network-pulse'

type Mode = 'use' | 'mine' | 'verify'

type HeroMode = {
  title: string
  text: string
  primary: { label: string; href: string; external?: boolean }
  secondary: { label: string; href: string; external?: boolean }
  tiles: Array<{ label: string; value: string }>
}

const modes: Record<Mode, HeroMode> = {
  use: {
    title: 'Open the network and use it fast.',
    text: 'Wallet, explorer, staking and token tools should feel immediate, not hidden behind a crowded homepage.',
    primary: { label: 'Open INRI Wallet', href: 'https://wallet.inri.life', external: true },
    secondary: { label: 'View Wallets', href: '/wallets' },
    tiles: [
      { label: 'Wallet', value: 'Send, hold, connect' },
      { label: 'Explorer', value: 'Check blocks and txs' },
      { label: 'Staking', value: 'Longer-term utility' },
      { label: 'Factory', value: 'Launch token routes' },
    ],
  },
  mine: {
    title: 'Make Proof-of-Work visible and useful.',
    text: 'Mining should feel like a live route on the homepage, with clear paths for Windows, Ubuntu and pool participation.',
    primary: { label: 'Start Mining', href: '/mining' },
    secondary: { label: 'Open Pool', href: '/pool' },
    tiles: [
      { label: 'Windows', value: 'CPU setup route' },
      { label: 'Ubuntu', value: 'Linux mining route' },
      { label: 'Pool', value: 'Join active mining' },
      { label: 'Explorer', value: 'Verify mined blocks' },
    ],
  },
  verify: {
    title: 'Show proof before promises.',
    text: 'Visitors should see live blocks, recent transactions and direct verification routes without leaving the site too early.',
    primary: { label: 'Open Explorer', href: 'https://explorer.inri.life', external: true },
    secondary: { label: 'Read Whitepaper', href: '/whitepaper' },
    tiles: [
      { label: 'Live blocks', value: 'Recent chain rhythm' },
      { label: 'Transactions', value: 'Latest chain activity' },
      { label: 'Search', value: 'Address, tx or block' },
      { label: 'Chain', value: 'Proof-of-Work 3777' },
    ],
  },
}

const routeCards = [
  {
    title: 'Wallet',
    text: 'Official wallet access for everyday use.',
    href: 'https://wallet.inri.life',
    external: true,
    icon: Wallet,
  },
  {
    title: 'Explorer',
    text: 'Blocks, addresses, transactions and proof.',
    href: 'https://explorer.inri.life',
    external: true,
    icon: Blocks,
  },
  {
    title: 'Mining',
    text: 'Windows and Ubuntu routes for real participation.',
    href: '/mining',
    icon: Pickaxe,
  },
  {
    title: 'Pool',
    text: 'Follow miners, blocks and recent payments.',
    href: '/pool',
    icon: ShieldCheck,
  },
  {
    title: 'Staking',
    text: 'Keep utility inside the INRI ecosystem.',
    href: '/staking',
    icon: Coins,
  },
  {
    title: 'Factory',
    text: 'Create and launch assets inside the network.',
    href: '/token-factory',
    icon: Factory,
  },
]

const valuePills = ['Low fees', 'Community mining', 'EVM compatible', 'Real utility']

export function InriHomepage() {
  const [mode, setMode] = useState<Mode>('use')
  const active = modes[mode]

  return (
    <InriShell>
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(19,164,255,0.18),transparent_28%),radial-gradient(circle_at_88%_14%,rgba(19,164,255,0.10),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.94),rgba(0,0,0,1))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:58px_58px] opacity-[0.06]" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_rgba(19,164,255,0.95)]" />
              INRI CHAIN
              <span className="text-white/28">•</span>
              Proof-of-Work
              <span className="text-white/28">•</span>
              Chain 3777
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {valuePills.map((pill) => (
                    <span key={pill} className="inri-chip">
                      {pill}
                    </span>
                  ))}
                </div>

                <h1 className="mt-8 max-w-4xl text-4xl font-bold leading-[0.96] text-white sm:text-6xl lg:text-7xl">
                  Proof-of-Work with real utility.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                  A cleaner INRI homepage focused on what users actually do: open the wallet, verify the chain, mine, join the pool, stake and build.
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

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Use', text: 'Wallet, staking, swap and token routes.' },
                    { label: 'Verify', text: 'Live blocks, txs and direct proof.' },
                    { label: 'Mine', text: 'Visible paths for real participation.' },
                  ].map((item) => (
                    <div key={item.label} className="inri-card p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{item.label}</p>
                      <p className="mt-3 text-sm leading-6 text-white/68">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-[2.8rem] bg-[radial-gradient(circle,rgba(19,164,255,0.14),transparent_58%)] blur-3xl" />
                <div className="inri-panel-strong relative overflow-hidden p-5 sm:p-6">
                  <div className="flex flex-col gap-4 rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">INRI utility hub</p>
                      <p className="mt-1 text-sm leading-6 text-white/58">
                        Shorter text, stronger layout and cleaner translation behavior.
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      Main routes
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
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
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          mode === item.key
                            ? 'border-primary/40 bg-primary text-black'
                            : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-primary/30 hover:bg-primary/10 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/60 p-5 sm:p-6">
                    <h2 className="max-w-xl text-2xl font-bold leading-tight text-white sm:text-[2rem]">{active.title}</h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/64 sm:text-base">{active.text}</p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <InriLinkButton href={active.primary.href} external={active.primary.external}>
                        {active.primary.label}
                      </InriLinkButton>
                      <InriLinkButton href={active.secondary.href} external={active.secondary.external} variant="secondary">
                        {active.secondary.label}
                      </InriLinkButton>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {active.tiles.map((item) => (
                        <div key={item.label} className="inri-card min-h-[112px] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{item.label}</p>
                          <p className="mt-3 text-sm font-semibold leading-6 text-white/88">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <NetworkPulse />

        <section className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(0,0,0,0.98),rgba(0,0,0,1))]">
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Everything in one place</p>
                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Keep the user inside the INRI ecosystem.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                A strong homepage should not just look modern. It should guide people into real actions and make the network feel alive.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {routeCards.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="group inri-card min-h-[176px] p-5 transition hover:border-primary/35 hover:bg-[linear-gradient(180deg,rgba(19,164,255,0.10),rgba(255,255,255,0.02))]"
                  >
                    <div className="inline-flex rounded-2xl border border-primary/18 bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-black">
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
            <div className="inri-panel p-7 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
                    <Sparkles className="h-4 w-4" />
                    Visual direction
                  </p>
                  <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                    Pure black, electric blue and cleaner hierarchy.
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                    Bigger containers, calmer spacing and shorter labels keep the site cleaner across desktop, mobile and browser translation.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Shorter labels that survive translation better',
                    'Larger containers with stronger alignment',
                    'Live data inside one cleaner visual system',
                    'More utility, less homepage noise',
                  ].map((item) => (
                    <div key={item} className="inri-card p-4 text-sm leading-7 text-white/72">
                      {item}
                    </div>
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
