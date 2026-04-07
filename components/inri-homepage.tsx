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

const productCards = [
  { title: 'INRI Wallet', description: 'Official wallet access, ecosystem entry points and the first stop for new users.', href: '/inri-wallet', icon: Wallet },
  { title: 'Wallets', description: 'A hub for wallets that support the INRI network, onboarding and future setup guides.', href: '/wallets', icon: Wallet },
  { title: 'Swap', description: 'A clean destination for future swaps, liquidity access and ecosystem trading flows.', href: '/swap', icon: Shuffle },
  { title: 'Token Factory', description: 'A dedicated creation hub for launching tokens directly inside the INRI ecosystem.', href: '/token-factory', icon: Factory },
  { title: 'P2P', description: 'A future layer for peer-to-peer activity, discovery and direct community interaction.', href: '/p2p', icon: HandCoins },
  { title: 'Whitepaper', description: 'Read the official project overview and understand the direction of INRI CHAIN.', href: '/whitepaper', icon: BookOpenText },
]

const networkCards = [
  { title: 'Mining Windows', description: 'Step-by-step Windows CPU mining route in the same visual standard as the new site.', href: '/mining/windows', icon: Hammer },
  { title: 'Mining Ubuntu', description: 'Ubuntu mining path for Linux users joining the INRI network.', href: '/mining/ubuntu', icon: Pickaxe },
  { title: 'Pool', description: 'Direct access to pool participation, mining information and ecosystem support.', href: '/pool', icon: Layers3 },
  { title: 'Staking', description: 'A dedicated staking section in the same premium visual system.', href: '/staking', icon: Shield },
  { title: 'Explorer', description: 'Inspect blocks, addresses, transactions and network activity.', href: 'https://explorer.inri.life', icon: Blocks, external: true },
]

const quickStats = [
  { value: '3777', label: 'Chain ID' },
  { value: 'PoW', label: 'Consensus' },
  { value: 'Wallets', label: 'Ecosystem path' },
  { value: 'Explorer', label: 'Live route' },
]

const benefits = [
  {
    title: 'Clear mission first',
    text: 'The homepage now leads with a simple mission statement and fewer distractions, instead of feeling like a dense list of links.',
  },
  {
    title: 'Products before clutter',
    text: 'INRI Wallet, Swap, Token Factory and P2P are promoted as ecosystem products, not hidden behind scattered navigation.',
  },
  {
    title: 'Network proof points',
    text: 'Mining, pool, staking and explorer are grouped as network access routes so the site reads like a real chain platform.',
  },
]

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary/80">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm leading-8 text-white/70 sm:text-base">{text}</p>
    </div>
  )
}

function HomeGrid({ cards }: { cards: Array<{ title: string; description: string; href: string; icon: any; external?: boolean }> }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Link
            key={card.title}
            href={card.href}
            {...(card.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm transition hover:border-primary/40 hover:bg-white/[0.07]"
          >
            <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
              <Icon className="h-6 w-6" />
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
  )
}

export function InriHomepage() {
  return (
    <InriShell>
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,173,255,0.18),transparent_20%),radial-gradient(circle_at_82%_12%,rgba(0,99,204,0.24),transparent_24%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                  <Zap className="h-4 w-4" />
                  Fork on block 6000000
                </div>

                <h1 className="mt-6 max-w-5xl text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
                  A clearer, stronger front page for the INRI ecosystem.
                </h1>

                <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
                  INRI CHAIN is a community-driven Proof-of-Work Layer 1 focused on decentralization, low fees and practical ecosystem access. This version reorganizes the project into a cleaner experience inspired by how stronger networks present products, network routes and trust signals.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="/inri-wallet">Open INRI Wallet</InriLinkButton>
                  <InriLinkButton href="/wallets" variant="secondary">Wallets</InriLinkButton>
                  <InriLinkButton href="/swap" variant="secondary">Swap</InriLinkButton>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <InriLinkButton href="https://wallet.inri.life" external>
                    INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
                    Explorer
                  </InriLinkButton>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {quickStats.map((item) => (
                    <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                      <p className="text-3xl font-bold text-white">{item.value}</p>
                      <p className="mt-2 text-sm text-white/60">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle,rgba(0,128,255,0.18),transparent_70%)] blur-2xl" />
                <div className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary/90">INRI overview</p>
                      <h2 className="mt-2 text-2xl font-bold">One cleaner control surface</h2>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      live ready
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4">
                    {[
                      ['Products', 'INRI Wallet, Swap, Token Factory, P2P'],
                      ['Network', 'Mining, Pool, Staking, Explorer'],
                      ['Wallet access', 'Connect and enter the ecosystem'],
                      ['Docs', 'Whitepaper and support routes'],
                    ].map(([title, subtitle]) => (
                      <div key={title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#081424] px-4 py-4">
                        <div>
                          <p className="font-bold text-white">{title}</p>
                          <p className="text-sm text-white/60">{subtitle}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-7 text-cyan-50/90">
                    Built to feel more like a serious chain platform and less like a crowded link list.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="products">
          <SectionIntro
            eyebrow="Products"
            title="Product pages that make INRI feel like a bigger network."
            text="The strongest chain sites usually separate products from infrastructure. This section gives INRI Wallet, Wallets, Swap, Token Factory and P2P their own visual weight instead of burying them in navigation."
          />
          <HomeGrid cards={productCards} />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" id="network">
          <SectionIntro
            eyebrow="Network"
            title="Core network routes presented like real platform entry points."
            text="Mining, pool, staking and explorer now sit together as network access routes. That makes the site easier to scan and easier to trust for first-time visitors."
          />
          <HomeGrid cards={networkCards} />
        </section>

        <NetworkPulse />

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Why this works"
            title="Less clutter, stronger hierarchy, better first impression."
            text="The best network homepages tend to do three things well: explain the mission fast, organize products clearly, and back it up with visible network routes and proof points."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {benefits.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 backdrop-blur-sm">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary/80">Highlight</p>
                <h3 className="mt-4 text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </InriShell>
  )
}
