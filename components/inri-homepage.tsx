import Link from 'next/link'
import { ArrowRight, Blocks, Factory, Pickaxe, ShieldCheck, Wallet } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { NetworkPulse } from '@/components/network-pulse'

const heroPoints = [
  'Chain ID 3777 mainnet live',
  'Visible blocks, peers and miners',
  'Wallet, explorer, mining and pool connected',
]

const routeCards = [
  {
    title: 'INRI Wallet',
    text: 'Official wallet entry for users and builders.',
    href: '/inri-wallet',
    icon: Wallet,
  },
  {
    title: 'Mining',
    text: 'Windows, Ubuntu and pool onboarding.',
    href: '/mining',
    icon: Pickaxe,
  },
  {
    title: 'Explorer',
    text: 'Blocks, transactions and addresses in one place.',
    href: '/explorer',
    icon: Blocks,
  },
  {
    title: 'Token Factory',
    text: 'Launch tokens inside the INRI ecosystem.',
    href: '/token-factory',
    icon: Factory,
  },
  {
    title: 'Staking',
    text: 'Long-term participation routes and plans.',
    href: '/staking',
    icon: ShieldCheck,
  },
  {
    title: 'Wallets',
    text: 'Supported wallet access and setup options.',
    href: '/wallets',
    icon: Wallet,
  },
]

function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2rem] border-[1.55px] border-white/[0.20] bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] shadow-[0_28px_88px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.05)] ${className}`}>{children}</div>
  )
}

function QuickRoute({ title, text, href, external = false }: { title: string; text: string; href: string; external?: boolean }) {
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

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
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

                <h1 className="mt-8 max-w-4xl text-balance text-4xl font-bold leading-[0.94] text-white sm:text-6xl lg:text-[5.15rem]">
                  Proof-of-Work mainnet with live blocks, active miners and real access.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/66 sm:text-lg">
                  INRI CHAIN keeps wallet, explorer, mining, pool and staking close to real network activity instead of hiding them behind too much interface noise.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="/inri-wallet" noTranslate>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="/mining" variant="secondary">
                    Start Mining
                  </InriLinkButton>
                  <InriLinkButton href="/explorer" variant="secondary" noTranslate>
                    Explorer
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
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Network access</p>
                    <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Open the useful parts of the network fast.</h2>
                  </div>
                  <span className="rounded-full border-[1.35px] border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Main routes
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <QuickRoute title="Wallet" text="Official wallet access" href="/inri-wallet" />
                  <QuickRoute title="Explorer" text="Blocks, txs and addresses" href="/explorer" />
                  <QuickRoute title="Mining" text="Windows, Ubuntu and pool" href="/mining" />
                  <QuickRoute title="Pool" text="Join active miners" href="/pool" />
                </div>

                <div className="mt-5 rounded-[1.55rem] border-[1.45px] border-white/[0.16] bg-black/30 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Home focus</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {['Latest blocks', 'Peer count', 'Pool miners', 'Gas + difficulty'].map((item) => (
                      <div key={item} className="rounded-2xl border-[1.25px] border-white/[0.12] bg-white/[0.02] px-3 py-3 text-sm text-white/74">
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
          <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">More routes</p>
                <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Keep every important route visible without making the page heavy.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                The network feels stronger when users can move from discovery to action without losing the main signals of the chain.
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
