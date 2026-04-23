import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Blocks,
  Factory,
  Pickaxe,
  ShieldCheck,
  Wallet,
  Layers3,
  FileText,
  Coins,
} from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { NetworkPulse } from '@/components/network-pulse'

const heroPoints = [
  'Wallet, explorer, mining and pool in one official flow',
  'Token Factory, staking and P2P ready from the same site',
  'Built for direct access on desktop and mobile',
]

const routeCards: {
  title: string
  text: string
  href: string
  icon: typeof Wallet
  external?: boolean
}[] = [
  {
    title: 'INRI Wallet',
    text: 'Official wallet entry for holders, miners and builders.',
    href: 'https://wallet.inri.life',
    icon: Wallet,
    external: true,
  },
  {
    title: 'Explorer',
    text: 'Track blocks, transactions, addresses and tokens.',
    href: 'https://explorer.inri.life',
    icon: Blocks,
    external: true,
  },
  {
    title: 'Mining',
    text: 'Get started with Windows, Ubuntu or pool mining.',
    href: '/mining',
    icon: Pickaxe,
  },
  {
    title: 'Pool',
    text: 'Join the mining pool and monitor participation.',
    href: '/pool',
    icon: Layers3,
  },
  {
    title: 'Token Factory',
    text: 'Create tokens directly inside the INRI ecosystem.',
    href: '/token-factory',
    icon: Factory,
  },
  {
    title: 'Staking',
    text: 'Open the staking route and follow participation tools.',
    href: '/staking',
    icon: ShieldCheck,
  },
  {
    title: 'P2P',
    text: 'Access the peer-to-peer market route of the network.',
    href: '/p2p',
    icon: Coins,
  },
  {
    title: 'Whitepaper',
    text: 'Read the structure, economics and direction of the chain.',
    href: '/whitepaper',
    icon: FileText,
  },
]

const quickSignals = [
  {
    title: 'Official routes',
    text: 'Wallet, explorer, pool, mining, staking and token creation stay visible from the first screen.',
  },
  {
    title: 'Real network feel',
    text: 'The homepage keeps the chain close to live activity instead of acting like a generic marketing landing page.',
  },
  {
    title: 'Responsive by default',
    text: 'Main actions stay clear on mobile and desktop so onboarding does not break when traffic arrives from social media.',
  },
]

function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[2rem] border-[1.55px] border-white/[0.20] bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] shadow-[0_28px_88px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.05)] ${className}`}
    >
      {children}
    </div>
  )
}

function QuickRoute({
  title,
  text,
  href,
  external = false,
}: {
  title: string
  text: string
  href: string
  external?: boolean
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group rounded-[1.45rem] border-[1.45px] border-white/[0.18] bg-black/32 px-4 py-4 transition hover:border-primary/55 hover:bg-primary/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-white/58">{text}</p>
        </div>
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1" />
      </div>
    </Link>
  )
}

export function InriHomepage() {
  return (
    <InriShell>
      <main>
        <section className="relative overflow-hidden border-b border-white/[0.10]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(19,164,255,0.22),transparent_26%),radial-gradient(circle_at_86%_14%,rgba(19,164,255,0.12),transparent_22%),linear-gradient(180deg,rgba(0,0,0,0.96),rgba(0,0,0,0.99))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(19,164,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(19,164,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px] opacity-28" />

          <div className="relative inri-page-container py-12 sm:py-14 lg:py-18">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {['Mainnet', 'PoW', 'Chain 3777', 'EVM'].map((item) => (
                    <span
                      key={item}
                      translate="no"
                      className="notranslate rounded-full border-[1.35px] border-white/[0.18] bg-white/[0.035] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/72"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <h1 className="mt-7 max-w-4xl text-balance text-[2.2rem] font-bold leading-[0.96] text-white sm:text-[3.6rem] lg:text-[5.15rem]">
                  The official home of the INRI mainnet.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/66 sm:text-lg">
                  Open the wallet, explore the chain, start mining, access the pool, create
                  tokens, enter staking and read the whitepaper from one professional network
                  surface.
                </p>

                <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                  <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" external variant="secondary" noTranslate>
                    Explore Chain
                  </InriLinkButton>
                  <InriLinkButton href="/mining" variant="secondary">
                    Start Mining
                  </InriLinkButton>
                  <InriLinkButton href="/token-factory" variant="secondary">
                    Token Factory
                  </InriLinkButton>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:max-w-3xl">
                  {heroPoints.map((item) => (
                    <Frame key={item} className="min-h-[112px] p-4">
                      <p className="text-sm leading-7 text-white/78">{item}</p>
                    </Frame>
                  ))}
                </div>
              </div>

              <Frame className="overflow-hidden p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                      Official routes
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                      Everything users need to use, mine and explore INRI.
                    </h2>
                  </div>
                  <span className="rounded-full border-[1.35px] border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Main actions
                  </span>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <QuickRoute title="Wallet" text="Official wallet access" href="https://wallet.inri.life" external />
                  <QuickRoute title="Explorer" text="Blocks, transactions and addresses" href="https://explorer.inri.life" external />
                  <QuickRoute title="Mining" text="Windows, Ubuntu and pool routes" href="/mining" />
                  <QuickRoute title="Pool" text="Pool dashboard and mining participation" href="/pool" />
                  <QuickRoute title="Token Factory" text="Launch tokens on INRI" href="/token-factory" />
                  <QuickRoute title="Whitepaper" text="Read the project structure" href="/whitepaper" />
                </div>

                <div className="mt-5 rounded-[1.55rem] border-[1.45px] border-white/[0.16] bg-black/30 p-4 sm:p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    Home priorities
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {['Fast access', 'Clear hierarchy', 'Live network feeling'].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border-[1.25px] border-white/[0.12] bg-white/[0.02] px-3 py-3 text-sm text-white/74"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </Frame>
            </div>
          </div>
        </section>

        <NetworkPulse />

        <section className="border-t border-white/[0.10] bg-black">
          <div className="inri-page-container py-16 lg:py-20">
            <div className="grid gap-4 lg:grid-cols-3">
              {quickSignals.map((item) => (
                <Frame key={item.title} className="p-5 sm:p-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                    {item.title}
                  </p>
                  <p className="mt-4 text-base leading-8 text-white/68">{item.text}</p>
                </Frame>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.10] bg-black">
          <div className="inri-page-container py-18 lg:py-20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  Ecosystem routes
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                  Keep the main INRI routes visible without making the site heavy.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                The site should move users from discovery to action quickly, while keeping the
                network identity clear in every section.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {routeCards.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="group rounded-[1.85rem] border-[1.45px] border-white/[0.20] bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.10),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 transition hover:border-primary/55 hover:bg-primary/10"
                  >
                    <div className="inline-flex rounded-2xl border-[1.25px] border-primary/28 bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/60">{item.text}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
