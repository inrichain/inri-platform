import Link from 'next/link'
import {
  ArrowRight,
  Blocks,
  BookOpenText,
  Factory,
  HandCoins,
  Hammer,
  Layers3,
  Pickaxe,
  Shield,
  Shuffle,
  Wallet,
  Zap,
} from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { NetworkPulse } from '@/components/network-pulse'

type RouteCard = {
  title: string
  description: string
  href: string
  icon: typeof Wallet
  external?: boolean
}

const ecosystemCards: RouteCard[] = [
  {
    title: 'INRI Wallet',
    description: 'The official entry point for users joining the INRI ecosystem.',
    href: 'https://wallet.inri.life',
    icon: Wallet,
    external: true,
  },
  {
    title: 'Swap',
    description: 'A cleaner route for future liquidity and trading experiences.',
    href: '/swap',
    icon: Shuffle,
  },
  {
    title: 'Token Factory',
    description: 'A product page for launching tokens inside the INRI network.',
    href: '/token-factory',
    icon: Factory,
  },
  {
    title: 'P2P',
    description: 'A direct place for peer-to-peer activity and future social utility.',
    href: '/p2p',
    icon: HandCoins,
  },
  {
    title: 'Explorer',
    description: 'Search blocks, transactions and addresses on the live network.',
    href: 'https://explorer.inri.life',
    icon: Blocks,
    external: true,
  },
  {
    title: 'Whitepaper',
    description: 'Read the official INRI CHAIN direction and core fundamentals.',
    href: '/whitepaper',
    icon: BookOpenText,
  },
]

const miningRoutes: RouteCard[] = [
  {
    title: 'Mining Windows',
    description: 'A dedicated onboarding route for Windows CPU miners.',
    href: '/mining/windows',
    icon: Hammer,
  },
  {
    title: 'Mining Ubuntu',
    description: 'A cleaner Linux route for joining the network with Ubuntu.',
    href: '/mining/ubuntu',
    icon: Pickaxe,
  },
  {
    title: 'Pool',
    description: 'A direct path to pool participation, stats and support.',
    href: '/pool',
    icon: Layers3,
  },
  {
    title: 'Staking',
    description: 'A future premium page for staking access and visibility.',
    href: '/staking',
    icon: Shield,
  },
]

const routeHighlights = [
  {
    eyebrow: 'For users',
    title: 'Simple access to wallets, swap and explorer',
    text: 'The homepage should feel easy to enter, not technical before the user even begins.',
    href: 'https://wallet.inri.life',
    linkLabel: 'Open Wallet',
  },
  {
    eyebrow: 'For miners',
    title: 'A route that makes mining feel alive and accessible',
    text: 'Mining needs to be visible as part of the identity of the network, not hidden deep in the site.',
    href: '/mining/windows',
    linkLabel: 'Start Mining',
  },
  {
    eyebrow: 'For builders',
    title: 'Products and docs grouped with more clarity',
    text: 'Token creation, P2P, whitepaper and future tooling should read like an ecosystem, not loose pages.',
    href: '/token-factory',
    linkLabel: 'Explore Products',
  },
]

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text: string
}) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary/85">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{title}</h2>
      <p className="mt-4 text-sm leading-8 text-white/68 sm:text-base">{text}</p>
    </div>
  )
}

function RoutePanel({ card, variant = 'default' }: { card: RouteCard; variant?: 'default' | 'subtle' }) {
  const Icon = card.icon

  return (
    <Link
      href={card.href}
      {...(card.external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={[
        'group rounded-[1.75rem] border p-6 transition',
        variant === 'default'
          ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] hover:border-primary/30 hover:bg-primary/[0.06]'
          : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1" />
      </div>
      <h3 className="mt-5 text-xl font-bold text-white">{card.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/66">{card.description}</p>
    </Link>
  )
}

export function InriHomepage() {
  return (
    <InriShell>
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(19,164,255,0.20),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(19,164,255,0.14),transparent_22%),linear-gradient(180deg,rgba(5,12,20,0.2),transparent_48%)]" />
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/65">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_18px_rgba(19,164,255,0.8)]" />
                  INRI CHAIN
                  <span className="text-white/30">•</span>
                  <span>Proof-of-Work</span>
                  <span className="text-white/30">•</span>
                  <span>Chain ID 3777</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                  <span className="rounded-full border border-white/10 bg-[#071321] px-3 py-1.5">Low fees</span>
                  <span className="rounded-full border border-white/10 bg-[#071321] px-3 py-1.5">Community driven</span>
                  <span className="rounded-full border border-white/10 bg-[#071321] px-3 py-1.5">Built for miners</span>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.20em] text-primary">
                  <Zap className="h-4 w-4" />
                  Building the future of PoW
                </div>

                <h1 className="mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.04] text-white sm:text-5xl lg:text-7xl">
                  A cleaner, stronger and more futuristic home for INRI CHAIN.
                </h1>

                <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
                  The new direction is simple: less visual noise, more brand presence, better hierarchy and live proof of the network. The homepage should feel premium, technological and easy to navigate from the first second.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="https://wallet.inri.life" external>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
                    Open Explorer
                  </InriLinkButton>
                  <InriLinkButton href="/mining/windows" variant="secondary">
                    Start Mining
                  </InriLinkButton>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    { value: '3777', label: 'Chain ID' },
                    { value: 'PoW', label: 'Consensus' },
                    { value: 'Wallet + Mining', label: 'Main routes' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4">
                      <p className="text-2xl font-bold text-white">{item.value}</p>
                      <p className="mt-2 text-sm text-white/58">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 bg-[radial-gradient(circle,rgba(19,164,255,0.18),transparent_62%)] blur-3xl" />
                <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-7">
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/85">Visual direction</p>
                      <h2 className="mt-2 text-2xl font-bold text-white">One hero. One live section. Clear routes.</h2>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                      INRI style
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {routeHighlights.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group rounded-[1.45rem] border border-white/10 bg-[#071321]/90 p-5 transition hover:border-primary/30 hover:bg-primary/[0.06]"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/85">{item.eyebrow}</p>
                        <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-white/64">{item.text}</p>
                        <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                          {item.linkLabel}
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <NetworkPulse />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Primary paths"
            title="The homepage should guide people, not overwhelm them"
            text="The strongest blockchain sites today separate the first experience into clear routes for users, miners or validators, and builders. The INRI home should do the same while keeping the official dark-blue identity consistent."
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {routeHighlights.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-7 transition hover:border-primary/30 hover:bg-primary/[0.06]"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/85">{item.eyebrow}</p>
                <h3 className="mt-4 text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-8 text-white/68">{item.text}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                  {item.linkLabel}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.03),rgba(255,255,255,0.015))]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Ecosystem"
              title="Products and utility should feel like part of one system"
              text="Wallet, explorer, token creation and future products should be presented in one visual language. That is how the site begins to look like a real chain platform instead of a collection of disconnected pages."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {ecosystemCards.map((card) => (
                <RoutePanel key={card.title} card={card} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Mining routes"
            title="Mining deserves a first-class visual position on the site"
            text="INRI is not supposed to feel generic. Mining is part of the brand, so the homepage should naturally lead miners to the right place without making the page feel heavy or disorganized."
          />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {miningRoutes.map((card) => (
                <RoutePanel key={card.title} card={card} variant="subtle" />
              ))}
            </div>
        </section>
      </main>
    </InriShell>
  )
}
