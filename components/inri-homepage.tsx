import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Blocks,
  Cpu,
  Factory,
  FileText,
  Coins,
  Layers3,
  Pickaxe,
  ShieldCheck,
  Trophy,
  Wallet,
} from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { NetworkPulse } from '@/components/network-pulse'

const heroPoints = [
  'Official wallet, explorer, mining and pool routes from one surface',
  'Token Factory, staking and P2P ready inside the same ecosystem',
  'Built for direct use on mobile and desktop without breaking the flow',
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
    text: 'Start with Windows, Ubuntu or pool mining.',
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
    title: 'Fast access',
    text: 'Primary actions stay visible from the first fold so users can move from discovery to action without friction.',
  },
  {
    title: 'Network-first layout',
    text: 'The homepage behaves like a real network surface with routes, status and live references instead of a generic landing page.',
  },
  {
    title: 'Responsive control',
    text: 'Cards, buttons and routing stay clear on mobile and desktop for traffic coming from social media, search and direct visits.',
  },
]

const championshipSignals = [
  {
    title: '150,000 INRI',
    text: 'Total reward pool',
    icon: Trophy,
  },
  {
    title: '0.20 INRI',
    text: 'Per valid solo block',
    icon: Pickaxe,
  },
  {
    title: 'CPU valid',
    text: 'Legitimate solo blocks qualify',
    icon: Cpu,
  },
]

function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`inri-premium-card ${className}`}
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
      className="group inri-premium-tile block px-4 py-4 transition hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/[0.07]"
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
            <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {['Mainnet', 'PoW', 'Chain 3777', 'EVM Compatible'].map((item) => (
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
                  Official gateway to the INRI mainnet.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/66 sm:text-lg">
                  Open the wallet, explore the blockchain, mine, access the pool, launch tokens and follow the mining championship from one official interface.
                </p>

                <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                  <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" external variant="secondary" noTranslate>
                    Open Explorer
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
                      Main routes
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                      Everything users need to use, mine and explore INRI in one place.
                    </h2>
                  </div>
                  <span className="rounded-full border-[1.35px] border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Mainnet live
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
              </Frame>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.10] bg-black">
          <div className="inri-page-container py-10 sm:py-12 lg:py-14">
            <div className="inri-premium-card p-5 sm:p-7">
              <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr] xl:items-center">
                <div>
                  <div className="inline-flex items-center rounded-full border border-primary/24 bg-primary/[0.10] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                    Active campaign
                  </div>
                  <h2 className="mt-5 max-w-4xl text-3xl font-black leading-tight text-white sm:text-4xl xl:text-[3.2rem]">
                    Mining Championship live now on the INRI home page.
                  </h2>
                  <p className="mt-4 max-w-3xl text-sm leading-8 text-white/66 sm:text-base">
                    The competition is live from block 1,000,000 to 1,500,000 with 150,000 INRI in total rewards. Only solo mining counts. CPU miners are valid participants when the block produced is legitimate.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <InriLinkButton href="/mining-championship/">Open Championship</InriLinkButton>
                    <InriLinkButton href="/mining" variant="secondary">
                      Mining Setup
                    </InriLinkButton>
                    <InriLinkButton href="https://explorer.inri.life" external variant="secondary" noTranslate>
                      Verify in Explorer
                    </InriLinkButton>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  {championshipSignals.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.title}
                        className="inri-premium-tile p-4"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="mt-4 text-lg font-black text-white">{item.title}</div>
                        <p className="mt-1 text-sm leading-7 text-white/58">{item.text}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
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
                  Clear sections for the routes that matter most
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                Keep the main INRI routes visible, fast and consistent so the whole site feels like one real mainnet interface.
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
                    className="group inri-premium-card block p-5 transition hover:-translate-y-1 hover:border-primary/45 hover:bg-primary/[0.07]"
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
