import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Blocks,
  Cpu,
  Factory,
  Gem,
  HandCoins,
  Pickaxe,
  Shield,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { NetworkPulse } from '@/components/network-pulse'

type UtilityCard = {
  value: string
  label: string
}

type RouteItem = {
  title: string
  text: string
  href: string
  icon: LucideIcon
  external?: boolean
  tag: string
}

type InteractivePanel = {
  value: string
  label: string
  title: string
  text: string
  actions: Array<{ label: string; href: string; external?: boolean }>
  bullets: string[]
}

const heroProof: UtilityCard[] = [
  { value: 'PoW', label: 'community mining' },
  { value: 'EVM', label: 'wallet and token compatibility' },
  { value: '3777', label: 'official chain ID' },
  { value: 'Live', label: 'network surfaced on homepage' },
]

const interactivePanels: InteractivePanel[] = [
  {
    value: 'use',
    label: 'Use INRI',
    title: 'Make the first click useful, not just beautiful.',
    text: 'The home page should send people into real usage immediately: wallet, explorer and the core routes that prove the chain already has utility.',
    actions: [
      { label: 'Open Wallet', href: 'https://wallet.inri.life', external: true },
      { label: 'Open Explorer', href: 'https://explorer.inri.life', external: true },
      { label: 'View Wallets', href: '/wallets' },
    ],
    bullets: ['Simple entry to wallets', 'Clear path to explorer', 'Low-friction first action'],
  },
  {
    value: 'mine',
    label: 'Mine INRI',
    title: 'Mining has to feel like part of the brand.',
    text: 'INRI is a Proof-of-Work network, so the homepage should make mining visible and easy to start from the first screen.',
    actions: [
      { label: 'Mining Windows', href: '/mining/windows' },
      { label: 'Mining Ubuntu', href: '/mining/ubuntu' },
      { label: 'Open Pool', href: '/pool' },
    ],
    bullets: ['Windows and Ubuntu routes', 'Pool access visible', 'Participation before speculation'],
  },
  {
    value: 'build',
    label: 'Build on INRI',
    title: 'Show that the chain is meant to be used long term.',
    text: 'Builders need to see the network as a place for products, tokens and community utility, not only as a static landing page.',
    actions: [
      { label: 'Token Factory', href: '/token-factory' },
      { label: 'Swap', href: '/swap' },
      { label: 'Whitepaper', href: '/whitepaper' },
    ],
    bullets: ['EVM-compatible route', 'Future products visible', 'Whitepaper close to execution'],
  },
]

const ecosystemRoutes: RouteItem[] = [
  {
    title: 'Official Wallet',
    text: 'The wallet should be one of the first actions people see, because it is the fastest route into the ecosystem.',
    href: 'https://wallet.inri.life',
    icon: Wallet,
    external: true,
    tag: 'Real usage',
  },
  {
    title: 'Explorer',
    text: 'Blocks, addresses and transactions need to be one click away so visitors can verify that the chain is active.',
    href: 'https://explorer.inri.life',
    icon: Blocks,
    external: true,
    tag: 'Network proof',
  },
  {
    title: 'Mining',
    text: 'Keep mining visible on the homepage, with direct routes for Windows and Ubuntu instead of hiding participation deeper in the site.',
    href: '/mining',
    icon: Pickaxe,
    tag: 'Participation',
  },
  {
    title: 'Pool',
    text: 'Turn curiosity into active mining by making the pool feel like a core product, not a side page.',
    href: '/pool',
    icon: Cpu,
    tag: 'Actionable',
  },
  {
    title: 'Staking',
    text: 'Show that INRI offers more than mining by giving staking a premium route with proper visibility.',
    href: '/staking',
    icon: Shield,
    tag: 'Retention',
  },
  {
    title: 'Token Factory',
    text: 'If people can create and launch inside the chain, that utility needs to be visible from the main page.',
    href: '/token-factory',
    icon: Factory,
    tag: 'Builders',
  },
]

const valuePoints = [
  {
    title: 'Real entry points',
    text: 'A homepage for a blockchain should not stop at branding. It should move people into wallets, mining, staking and explorer immediately.',
    icon: Gem,
  },
  {
    title: 'Visible chain activity',
    text: 'Live data makes the network feel trustworthy because users can see that blocks, fees and recent activity are happening right now.',
    icon: Sparkles,
  },
  {
    title: 'Clear utility path',
    text: 'People stay longer when the value is obvious: use the wallet, verify the network, mine, stake or build.',
    icon: HandCoins,
  },
]

function RouteCard({ item }: { item: RouteItem }) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-6 transition hover:border-primary/35 hover:bg-[linear-gradient(180deg,rgba(19,164,255,0.12),rgba(255,255,255,0.035))]"
    >
      <div className="inline-flex rounded-2xl border border-primary/18 bg-primary/10 p-3 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-white">{item.title}</h3>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/58">
          {item.tag}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-white/66">{item.text}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
        Open route <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

export function InriHomepage() {
  return (
    <InriShell>
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(19,164,255,0.18),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(19,164,255,0.12),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(13,91,163,0.18),transparent_30%),linear-gradient(180deg,#08111c_0%,#07111f_42%,#06111d_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25" />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/15 bg-primary/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.20em] text-primary">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_rgba(19,164,255,0.95)]" />
              INRI CHAIN · Building the Future of PoW
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/58">A fair, community-driven Layer 1</p>
                <h1 className="mt-5 max-w-4xl text-balance text-4xl font-bold leading-[0.96] text-white sm:text-6xl lg:text-7xl">
                  Proof-of-Work with real utility.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                  INRI should feel like a chain people can actually use: open the wallet, verify the explorer, start mining, join the pool, stake, and build on an EVM-compatible network with low fees.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="https://wallet.inri.life" external>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="/mining" variant="secondary">
                    Start Mining
                  </InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
                    Open Explorer
                  </InriLinkButton>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {heroProof.map((item) => (
                    <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm">
                      <p className="text-2xl font-bold text-white">{item.value}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/52">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-[2.4rem] bg-[radial-gradient(circle,rgba(19,164,255,0.18),transparent_62%)] blur-3xl" />
                <div className="relative rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,20,35,0.95),rgba(8,16,28,0.95))] p-5 shadow-[0_28px_120px_rgba(0,0,0,0.35)] sm:p-6">
                  <div className="flex items-center justify-between gap-3 rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/85">Interactive entry</p>
                      <p className="mt-1 text-sm text-white/62">One cleaner panel instead of many competing boxes.</p>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                      INRI style
                    </span>
                  </div>

                  <Tabs defaultValue="use" className="mt-5">
                    <TabsList className="grid h-auto w-full grid-cols-3 rounded-[1.25rem] border border-white/10 bg-[#091321] p-1">
                      {interactivePanels.map((item) => (
                        <TabsTrigger
                          key={item.value}
                          value={item.value}
                          className="rounded-[1rem] px-4 py-3 text-sm font-bold data-[state=active]:border-primary/25 data-[state=active]:bg-primary/12 data-[state=active]:text-white"
                        >
                          {item.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {interactivePanels.map((panel) => (
                      <TabsContent key={panel.value} value={panel.value} className="mt-4">
                        <div className="rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.10),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
                          <h2 className="max-w-xl text-3xl font-bold text-white">{panel.title}</h2>
                          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">{panel.text}</p>

                          <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            {panel.actions.map((action) => (
                              <Link
                                key={action.label}
                                href={action.href}
                                {...(action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                                className="rounded-[1.15rem] border border-white/10 bg-[#091322] px-4 py-4 text-sm font-bold text-white transition hover:border-primary/35 hover:bg-primary/10"
                              >
                                {action.label}
                              </Link>
                            ))}
                          </div>

                          <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            {panel.bullets.map((item) => (
                              <div key={item} className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/72">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </section>

        <NetworkPulse />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary/80">Real routes</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                The value of the network should be visible in one screen.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-8 text-white/68 sm:text-base">
              Instead of a homepage full of disconnected buttons, INRI should present a small set of strong, useful routes that show what people can actually do inside the ecosystem.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ecosystemRoutes.map((item) => (
              <RouteCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.12),transparent_28%),linear-gradient(180deg,rgba(8,18,31,0.95),rgba(6,12,22,0.95))] p-6 sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/80">Why this direction works</p>
                  <h2 className="mt-4 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
                    Cleaner, stronger and more credible for real users.
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-8 text-white/68 sm:text-base">
                    The design should feel more like a modern onchain product: one dominant hero, one refined live section, clear entry points and stronger emphasis on network utility.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {valuePoints.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-5">
                        <div className="inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-white/66">{item.text}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
