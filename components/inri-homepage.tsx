import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Blocks,
  BookOpenText,
  Cpu,
  Factory,
  Globe2,
  Hammer,
  HandCoins,
  Layers3,
  Pickaxe,
  Shield,
  Shuffle,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { HomepagePathways } from '@/components/homepage-pathways'
import { NetworkPulse } from '@/components/network-pulse'

const heroHighlights = [
  'Proof-of-Work Layer 1',
  'Chain ID 3777',
  'EVM compatible',
  'Live network surface',
]

const proofStrip = [
  { value: 'Live RPC', label: 'real-time homepage data' },
  { value: 'Wallet + Explorer', label: 'clear ecosystem entry points' },
  { value: 'Mining + Pool', label: 'participation surfaced properly' },
  { value: 'Modern UI', label: 'cleaner, more premium structure' },
]

const experienceCards: Array<{ title: string; text: string; icon: LucideIcon }> = [
  {
    title: 'One clear message first',
    text: 'The strongest chain sites lead with a single positioning statement instead of making users decode a large grid of buttons.',
    icon: Sparkles,
  },
  {
    title: 'Live proof near the hero',
    text: 'Network legitimacy increases when visitors immediately see blocks, peers, fees and recent activity updating live.',
    icon: Globe2,
  },
  {
    title: 'Different journeys by audience',
    text: 'Users, miners and builders should each get a dedicated route instead of one generic landing page for everyone.',
    icon: Cpu,
  },
]

const ecosystemCards: Array<{ title: string; description: string; href: string; icon: LucideIcon; external?: boolean; tag: string }> = [
  {
    title: 'INRI Wallet',
    description: 'Official wallet access for onboarding, transactions and ecosystem entry.',
    href: 'https://wallet.inri.life',
    icon: Wallet,
    external: true,
    tag: 'Official app',
  },
  {
    title: 'Explorer',
    description: 'Inspect addresses, blocks and live chain activity directly on the network explorer.',
    href: 'https://explorer.inri.life',
    icon: Blocks,
    external: true,
    tag: 'Live data',
  },
  {
    title: 'Pool',
    description: 'Turn mining interest into participation with a clearer entry point for the pool.',
    href: '/pool',
    icon: Layers3,
    tag: 'Mining access',
  },
  {
    title: 'Mining',
    description: 'Keep Windows and Ubuntu mining flows visible as first-class network actions.',
    href: '/mining',
    icon: Pickaxe,
    tag: 'Participation',
  },
  {
    title: 'Staking',
    description: 'Position staking as an ecosystem action with the same premium visual treatment.',
    href: '/staking',
    icon: Shield,
    tag: 'Yield route',
  },
  {
    title: 'Token Factory',
    description: 'A dedicated creation hub for future builders launching assets inside the ecosystem.',
    href: '/token-factory',
    icon: Factory,
    tag: 'Builder surface',
  },
  {
    title: 'Swap',
    description: 'A clean route for future liquidity flows, bridging and ecosystem conversion paths.',
    href: '/swap',
    icon: Shuffle,
    tag: 'Liquidity',
  },
  {
    title: 'P2P',
    description: 'A place for peer-to-peer activity and future community utility inside INRI.',
    href: '/p2p',
    icon: HandCoins,
    tag: 'Expansion',
  },
  {
    title: 'Whitepaper',
    description: 'Project direction, monetary design and network context in the official long-form route.',
    href: '/whitepaper',
    icon: BookOpenText,
    tag: 'Research',
  },
]

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-bold uppercase tracking-[0.20em] text-primary/80 sm:tracking-[0.28em]">{eyebrow}</p>
        <h2 className="mt-3 text-balance text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm leading-8 text-white/70 sm:text-base">{text}</p>
    </div>
  )
}

export function InriHomepage() {
  return (
    <InriShell>
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(0,173,255,0.22),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(0,99,204,0.26),transparent_24%),linear-gradient(180deg,rgba(5,15,27,0.7),rgba(5,12,24,0.96))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:52px_52px] opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.20em] text-cyan-200 sm:tracking-[0.24em]">
                  <Zap className="h-4 w-4" />
                  Modernized INRI homepage direction
                </div>

                <h1 className="mt-6 max-w-5xl text-balance text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
                  A more premium, technological and interactive front page for INRI CHAIN.
                </h1>

                <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                  The next version of the site should feel less like a simple landing page and more like a real blockchain platform: stronger hero messaging, live network proof, cleaner product routes and better interaction for users, miners and builders.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="https://wallet.inri.life" external>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
                    Explorer
                  </InriLinkButton>
                  <InriLinkButton href="/whitepaper" variant="secondary">
                    Whitepaper
                  </InriLinkButton>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {heroHighlights.map((item) => (
                    <span
                      key={item}
                      className="inline-flex rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/82"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle,rgba(0,153,255,0.20),transparent_68%)] blur-3xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_120px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {proofStrip.map((item) => (
                      <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-[#081527]/88 p-5">
                        <p className="text-2xl font-bold text-white sm:text-3xl">{item.value}</p>
                        <p className="mt-2 text-sm leading-7 text-white/62">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-primary/15 bg-primary/10 p-5">
                    <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">
                      <Hammer className="h-4 w-4" />
                      Design goal
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/78">
                      Make INRI feel like a serious network product: fewer weak sections, stronger rhythm, clearer hierarchy and real-time proof that the chain is active.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="What changes the perception"
            title="The homepage needs to feel like a network, not just a list of pages."
            text="This is where the strongest blockchain sites win: they simplify the story, create trust early and guide each type of visitor into the right product or action."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {experienceCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm"
                >
                  <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/70">{card.text}</p>
                </div>
              )
            })}
          </div>
        </section>

        <HomepagePathways />

        <NetworkPulse />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Ecosystem surfaces"
            title="Give every important INRI route a stronger visual system."
            text="Instead of equal-weight links across the site, turn the ecosystem into a curated grid of product and participation surfaces with tags, hierarchy and cleaner calls to action."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ecosystemCards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  {...(card.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="group rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm transition hover:border-primary/35 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/70">{card.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Open section
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(6,14,24,0.9),rgba(4,10,18,1))]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary/85">Next design move</p>
                <h2 className="mt-3 max-w-4xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  After the homepage, the same premium system should expand to mining, pool, staking and token creation.
                </h2>
                <p className="mt-5 max-w-3xl text-sm leading-8 text-white/70 sm:text-base">
                  That is how the site becomes consistent: homepage first, then turn the internal routes into the same visual language with stronger cards, better spacing, clearer tables and live status surfaces where it matters.
                </p>
              </div>

              <div className="rounded-[2rem] border border-primary/15 bg-primary/10 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.18)] sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.20em] text-primary">Recommended rollout</p>
                <div className="mt-6 grid gap-4">
                  {[
                    '1. Finalize homepage with live RPC and better hierarchy.',
                    '2. Redesign Pool and Mining pages with stronger operational visuals.',
                    '3. Upgrade Staking and Token Factory into product-grade pages.',
                  ].map((item) => (
                    <div key={item} className="rounded-[1.2rem] border border-white/10 bg-black/10 px-4 py-4 text-sm leading-7 text-white/82">
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
