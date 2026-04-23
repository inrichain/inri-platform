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
  Zap,
  Activity,
  Globe2,
} from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { NetworkPulse } from '@/components/network-pulse'

const routes = [
  { title: 'Wallet', text: 'Create, connect and use INRI.', href: 'https://wallet.inri.life', icon: Wallet, external: true },
  { title: 'Explorer', text: 'Blocks, transactions and contracts.', href: 'https://explorer.inri.life', icon: Blocks, external: true },
  { title: 'Mining', text: 'Windows, Ubuntu and pool routes.', href: '/mining', icon: Pickaxe },
  { title: 'Token Factory', text: 'Launch tokens on Chain 3777.', href: '/token-factory', icon: Factory },
  { title: 'Staking', text: 'Stake and manage INRI positions.', href: '/staking', icon: ShieldCheck },
  { title: 'P2P', text: 'Escrow market for direct trading.', href: '/p2p', icon: Coins },
]

const stats = [
  ['Network', 'INRI Mainnet'],
  ['Chain ID', '3777'],
  ['Consensus', 'Proof-of-Work'],
  ['Compatibility', 'EVM'],
]

const championship = [
  { title: '150,000 INRI', text: 'Total championship pool', icon: Trophy },
  { title: '0.20 INRI', text: 'Per valid solo block', icon: Pickaxe },
  { title: 'CPU valid', text: 'Legitimate solo blocks qualify', icon: Cpu },
]

export function InriHomepage() {
  return (
    <InriShell>
      <main className="inri-page-shell">
        <section className="inri-hero-showcase">
          <div className="inri-page-container py-10 sm:py-14 lg:py-18">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.7fr)] xl:items-stretch">
              <div className="inri-glass-hero p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inri-tag">Mainnet</span>
                  <span className="inri-tag">PoW</span>
                  <span className="inri-tag">Chain 3777</span>
                  <span className="inri-tag">EVM</span>
                </div>

                <h1 className="mt-8 max-w-5xl text-balance text-[3rem] font-black leading-[0.88] tracking-[-0.065em] text-white sm:text-[4.6rem] lg:text-[6.7rem]">
                  INRI Chain command center.
                </h1>
                <p className="mt-7 max-w-3xl text-lg leading-9 text-white/70 sm:text-xl">
                  One premium surface for wallet access, explorer, mining, pool, staking,
                  token creation and P2P routes on the INRI mainnet.
                </p>

                <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                  <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" external variant="secondary" noTranslate>
                    Open Explorer
                  </InriLinkButton>
                  <InriLinkButton href="/mining-championship/" variant="secondary">
                    Mining Championship
                  </InriLinkButton>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map(([label, value]) => (
                    <div key={label} className="inri-data-box">
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/75">{label}</div>
                      <div className="mt-2 text-lg font-black text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="inri-dashboard-card p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Main routes</p>
                      <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                        Everything important is one click away.
                      </h2>
                    </div>
                    <div className="hidden h-16 w-16 items-center justify-center border border-primary/25 bg-primary/10 text-primary sm:flex">
                      <Activity className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {routes.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                          className="group inri-route-tile"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                              <div className="inri-icon-box">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-black text-white">{item.title}</h3>
                                <p className="mt-1 text-sm leading-6 text-white/58">{item.text}</p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div className="inri-dashboard-card p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Active campaign</p>
                      <h2 className="mt-2 text-3xl font-black text-white">Mining Championship</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-white/62">
                        Live competition route with solo mining rewards, ranking and explorer verification.
                      </p>
                    </div>
                    <InriLinkButton href="/mining-championship/">Open</InriLinkButton>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {championship.map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.title} className="inri-campaign-box">
                          <Icon className="h-5 w-5 text-primary" />
                          <div className="mt-3 text-xl font-black text-white">{item.title}</div>
                          <p className="mt-1 text-sm text-white/58">{item.text}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <NetworkPulse />

        <section className="border-t border-white/[0.08] py-14 sm:py-16 lg:py-20">
          <div className="inri-page-container">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: 'Network first', text: 'The site behaves like an operating surface for the chain, not a simple landing page.', icon: Globe2 },
                { title: 'Builder routes', text: 'Token Factory, P2P and staking are presented as live ecosystem tools.', icon: Factory },
                { title: 'Fast action', text: 'Wallet, explorer, mining and pool actions stay visible and easy to reach.', icon: Zap },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="inri-dashboard-card p-6">
                    <div className="inri-icon-box">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-2xl font-black text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.08] py-14 sm:py-16 lg:py-20">
          <div className="inri-page-container">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Ecosystem</p>
                <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
                  A cleaner path into every INRI product.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-8 text-white/60">
                Wallet, mining, staking, token creation and trading routes share the same design system for desktop and mobile.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {routes.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={`eco-${item.title}`}
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="group inri-product-card"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="inri-icon-box">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
                    </div>
                    <h3 className="mt-6 text-2xl font-black text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
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
