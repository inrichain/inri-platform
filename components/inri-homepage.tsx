'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Blocks, Coins, Factory, Pickaxe, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { NetworkPulse } from '@/components/network-pulse'

type Mode = 'wallet' | 'mining' | 'verify'

type HeroMode = {
  title: string
  text: string
  stats: string[]
  primary: { label: string; href: string; external?: boolean }
  secondary: { label: string; href: string; external?: boolean }
  bullets: Array<{ label: string; value: string }>
}

const modes: Record<Mode, HeroMode> = {
  wallet: {
    title: 'Enter the network in one click.',
    text: 'Open the wallet, add the chain and start using INRI without a confusing homepage.',
    stats: ['Fast entry', 'Wallet first', 'Low friction'],
    primary: { label: 'Open Wallet', href: 'https://wallet.inri.life', external: true },
    secondary: { label: 'View Wallets', href: '/wallets' },
    bullets: [
      { label: 'Main route', value: 'Official wallet' },
      { label: 'Use case', value: 'Send, hold, connect' },
      { label: 'Next step', value: 'Swap, stake, explore' },
    ],
  },
  mining: {
    title: 'Make mining visible from the start.',
    text: 'INRI is Proof-of-Work. The homepage should make that feel alive, useful and easy to start.',
    stats: ['Windows', 'Ubuntu', 'Pool'],
    primary: { label: 'Start Mining', href: '/mining' },
    secondary: { label: 'Open Pool', href: '/pool' },
    bullets: [
      { label: 'Entry', value: 'Mining guides' },
      { label: 'Access', value: 'Pool and solo path' },
      { label: 'Signal', value: 'Real participation' },
    ],
  },
  verify: {
    title: 'Show proof before promises.',
    text: 'Blocks, fees and recent activity should be visible early so users can verify the network instantly.',
    stats: ['Explorer', 'Blocks', 'Activity'],
    primary: { label: 'Open Explorer', href: 'https://explorer.inri.life', external: true },
    secondary: { label: 'Read Whitepaper', href: '/whitepaper' },
    bullets: [
      { label: 'Trust', value: 'Live chain data' },
      { label: 'Proof', value: 'Recent blocks' },
      { label: 'Context', value: 'Chain 3777' },
    ],
  },
}

const utilityCards = [
  {
    title: 'Wallet',
    text: 'Official route into INRI.',
    href: 'https://wallet.inri.life',
    external: true,
    icon: Wallet,
  },
  {
    title: 'Mining',
    text: 'Windows, Ubuntu and pool.',
    href: '/mining',
    icon: Pickaxe,
  },
  {
    title: 'Explorer',
    text: 'Blocks, txs and addresses.',
    href: 'https://explorer.inri.life',
    external: true,
    icon: Blocks,
  },
  {
    title: 'Staking',
    text: 'Longer-term network use.',
    href: '/staking',
    icon: Coins,
  },
  {
    title: 'Factory',
    text: 'Create and launch assets.',
    href: '/token-factory',
    icon: Factory,
  },
  {
    title: 'Security',
    text: 'Transparent network routes.',
    href: '/whitepaper',
    icon: ShieldCheck,
  },
]

const valuePills = ['Low fees', 'Community mining', 'EVM compatible', 'Real network use']

export function InriHomepage() {
  const [mode, setMode] = useState<Mode>('wallet')
  const active = modes[mode]

  return (
    <InriShell>
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(19,164,255,0.18),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(19,164,255,0.10),transparent_22%),linear-gradient(180deg,rgba(0,0,0,0.92),rgba(0,0,0,0.98))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.07]" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_rgba(19,164,255,0.95)]" />
              INRI CHAIN
              <span className="text-white/28">•</span>
              Proof-of-Work
              <span className="text-white/28">•</span>
              Chain 3777
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {valuePills.map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/68"
                    >
                      {pill}
                    </span>
                  ))}
                </div>

                <h1 className="mt-8 max-w-4xl text-balance text-4xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                  Real utility for a Proof-of-Work chain.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                  A cleaner homepage for the things that matter: wallet, explorer, mining, pool, staking and real network activity.
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
                    { label: 'Value', text: 'Use the chain, not just read about it.' },
                    { label: 'Trust', text: 'Show live blocks and recent activity.' },
                    { label: 'Direction', text: 'Lead people into useful routes fast.' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{item.label}</p>
                      <p className="mt-3 text-sm leading-6 text-white/68">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-[2.8rem] bg-[radial-gradient(circle,rgba(19,164,255,0.16),transparent_58%)] blur-3xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(4,8,13,0.98),rgba(2,6,12,0.98))] p-5 shadow-[0_28px_120px_rgba(0,0,0,0.48)] sm:p-6">
                  <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Utility panel</p>
                      <p className="mt-1 text-sm text-white/58">Shorter text. Clearer actions. Better translation behavior.</p>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      Live-ready
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(
                      [
                        { key: 'wallet', label: 'Wallet' },
                        { key: 'mining', label: 'Mining' },
                        { key: 'verify', label: 'Verify' },
                      ] as Array<{ key: Mode; label: string }>
                    ).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setMode(item.key)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          mode === item.key
                            ? 'border border-primary/40 bg-primary text-black'
                            : 'border border-white/10 bg-white/[0.03] text-white/70 hover:border-primary/30 hover:bg-primary/10 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-[#01050a] p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {active.stats.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/62"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <h2 className="mt-5 text-2xl font-bold text-white sm:text-[2rem]">{active.title}</h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/64 sm:text-base">{active.text}</p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <InriLinkButton href={active.primary.href} external={active.primary.external}>
                        {active.primary.label}
                      </InriLinkButton>
                      <InriLinkButton href={active.secondary.href} external={active.secondary.external} variant="secondary">
                        {active.secondary.label}
                      </InriLinkButton>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {active.bullets.map((item) => (
                        <div key={item.label} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{item.label}</p>
                          <p className="mt-3 text-sm font-semibold text-white">{item.value}</p>
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

        <section className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(0,0,0,0.96),rgba(0,0,0,1))]">
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Core routes</p>
                <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Give every visitor a clear next move.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                Real value comes from use: open the wallet, verify the chain, mine, join the pool, stake or build.
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
                    className="group rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-5 transition hover:border-primary/35 hover:bg-[linear-gradient(180deg,rgba(19,164,255,0.10),rgba(255,255,255,0.02))]"
                  >
                    <div className="inline-flex rounded-2xl border border-primary/18 bg-primary/10 p-3 text-primary">
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

        <section className="border-t border-white/10 bg-black">
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
            <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(19,164,255,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-7 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
                    <Sparkles className="h-4 w-4" />
                    Brand direction
                  </p>
                  <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                    Black, blue and cleaner visual hierarchy.
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                    The homepage should feel premium and modern without looking crowded. Fewer words, stronger contrast, better spacing and more useful actions.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Pure black base with electric blue highlights',
                    'Shorter labels that survive translation better',
                    'One strong hero instead of many competing cards',
                    'Live data placed inside a cleaner visual system',
                  ].map((item) => (
                    <div key={item} className="rounded-[1.35rem] border border-white/10 bg-black/60 p-4 text-sm leading-7 text-white/72">
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
