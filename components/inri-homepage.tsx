import Link from 'next/link'
import {
  ArrowRight,
  Blocks,
  Coins,
  Factory,
  Pickaxe,
  ShieldCheck,
  Trophy,
  Wallet,
  Zap,
} from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const primaryRoutes = [
  { title: 'Wallet', text: 'Open the official wallet and connect to INRI.', href: 'https://wallet.inri.life', icon: Wallet, external: true },
  { title: 'Explorer', text: 'Search blocks, transactions, tokens and contracts.', href: 'https://explorer.inri.life', icon: Blocks, external: true },
  { title: 'Mining', text: 'Start mining with Windows, Ubuntu or pool routes.', href: '/mining', icon: Pickaxe },
  { title: 'Token Factory', text: 'Create tokens directly on INRI Chain 3777.', href: '/token-factory', icon: Factory },
  { title: 'Staking', text: 'Stake INRI and manage positions.', href: '/staking', icon: ShieldCheck },
  { title: 'P2P Market', text: 'Trade INRI through the escrow market.', href: '/p2p', icon: Coins },
]

export function InriHomepage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="relative min-h-[calc(100vh-92px)] border-b border-cyan-300/15 bg-[radial-gradient(circle_at_18%_14%,rgba(0,174,255,0.55),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(122,232,255,0.30),transparent_34rem),linear-gradient(135deg,#071a32_0%,#02040a_42%,#000_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.055)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute -left-28 top-28 h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative mx-auto grid min-h-[calc(100vh-92px)] max-w-[1560px] items-center gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] xl:px-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-[10px] border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                INRI V2 Interface
              </div>

              <h1 className="mt-8 max-w-5xl text-[3.4rem] font-black leading-[0.82] tracking-[-0.08em] text-white sm:text-[5.5rem] xl:text-[7.5rem]">
                The INRI mainnet control room.
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-9 text-cyan-50/72 sm:text-xl">
                Wallet, explorer, mining, staking, token launch and P2P trading in one stronger network interface.
              </p>

              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                  Open INRI Wallet
                </InriLinkButton>
                <InriLinkButton href="https://explorer.inri.life" external variant="secondary" noTranslate>
                  Explore Chain
                </InriLinkButton>
                <InriLinkButton href="/mining-championship/" variant="secondary">
                  Championship
                </InriLinkButton>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-4">
                {[
                  ['Chain', '3777'],
                  ['Consensus', 'PoW'],
                  ['Runtime', 'EVM'],
                  ['Status', 'Mainnet'],
                ].map(([label, value]) => (
                  <div key={label} className="border-l-2 border-cyan-300/70 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/70">{label}</div>
                    <div className="mt-2 text-xl font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-cyan-300/20 bg-white/[0.055] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl sm:p-6">
              <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Network routes</p>
                  <h2 className="mt-3 max-w-xl text-4xl font-black leading-tight tracking-[-0.04em] text-white">
                    Everything users need, presented like a real product.
                  </h2>
                </div>
                <div className="hidden h-16 w-16 items-center justify-center rounded-[16px] border border-cyan-300/30 bg-cyan-300/10 text-cyan-300 sm:flex">
                  <Zap className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {primaryRoutes.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="group rounded-[16px] border border-white/12 bg-black/20 p-5 transition hover:-translate-y-1 hover:border-cyan-300/45 hover:bg-cyan-300/[0.08]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-white/58">{item.text}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-cyan-300 transition group-hover:translate-x-1" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[linear-gradient(180deg,#02040a,#04101e)] py-16">
          <div className="mx-auto max-w-[1560px] px-4 sm:px-8 xl:px-12">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Mining Championship', '150,000 INRI reward campaign with solo mining route.', Trophy],
                ['Token Factory', 'Launch community assets directly on INRI.', Factory],
                ['P2P Market', 'Escrow market for direct INRI trades.', Coins],
              ].map(([title, text, Icon]) => (
                <div key={String(title)} className="rounded-[22px] border border-cyan-300/18 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-white">{String(title)}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">{String(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
