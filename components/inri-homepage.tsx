import {
  Coins,
  Factory,
  FileText,
  Globe2,
  Pickaxe,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
} from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriCard, InriCardGrid, InriHero, InriSection } from '@/components/inri-unified'
import { NetworkPulse } from '@/components/network-pulse'

const routes = [
  {
    title: 'INRI Wallet',
    text: 'Official wallet route for users to create, connect and use INRI ecosystem tools.',
    href: 'https://wallet.inri.life',
    external: true,
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    title: 'Explorer',
    text: 'Inspect blocks, transactions, addresses and contracts on the INRI network.',
    href: 'https://explorer.inri.life',
    external: true,
    icon: <Globe2 className="h-5 w-5" />,
  },
  {
    title: 'Mining',
    text: 'Windows, Ubuntu, pool mining and solo competition routes in one mining hub.',
    href: '/mining',
    icon: <Pickaxe className="h-5 w-5" />,
  },
  {
    title: 'Staking',
    text: 'Open the staking route and manage participation through the official interface.',
    href: '/staking',
    icon: <Coins className="h-5 w-5" />,
  },
  {
    title: 'Token Factory',
    text: 'Launch tokens on INRI with a cleaner, professional product flow.',
    href: '/token-factory',
    icon: <Factory className="h-5 w-5" />,
  },
  {
    title: 'P2P Market',
    text: 'Use the INRI P2P escrow market inside the same network design system.',
    href: '/p2p',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
] as const

export function InriHomepage() {
  return (
    <InriShell>
      <main>
        <InriHero
          eyebrow="INRI CHAIN OFFICIAL"
          title="A premium Proof-of-Work EVM network interface."
          description="Wallet, explorer, mining, staking, token factory, P2P and campaign pages follow one professional INRI dark-blue visual standard."
          actions={[
            { label: 'Open INRI Wallet', href: 'https://wallet.inri.life', external: true },
            { label: 'Explore Chain', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
            { label: 'Start Mining', href: '/mining', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Chain ID', value: '3777', note: 'INRI mainnet' },
            { label: 'Runtime', value: 'EVM', note: 'Compatible' },
            { label: 'Consensus', value: 'PoW', note: 'Open mining' },
            { label: 'Interface', value: 'Unified', note: 'One standard' },
          ]}
          sideTitle="Built like a serious blockchain product."
          sideText="The interface uses INRI blue identity, premium dark cards, stronger hierarchy and clear action areas."
          sideItems={[
            { title: 'Consistent pages', text: 'Every main page uses the same hero, card and CTA language.', icon: <Sparkles className="h-4 w-4" /> },
            { title: 'Functions preserved', text: 'Pool, staking, P2P, token factory and championship remain active.', icon: <ShieldCheck className="h-4 w-4" /> },
            { title: 'Campaign-ready', text: 'A stronger look for mining, staking and social growth.', icon: <Trophy className="h-4 w-4" /> },
          ]}
        />

        <InriSection
          eyebrow="Main ecosystem"
          title="Official routes, one INRI standard."
          description="A professional blockchain site needs clear paths, premium surfaces and strong CTAs across every route."
        >
          <InriCardGrid>
            {routes.map((route) => (
              <InriCard
                key={route.title}
                title={route.title}
                text={route.text}
                href={route.href}
                external={'external' in route ? route.external : false}
                icon={route.icon}
                cta="Open route"
              />
            ))}
          </InriCardGrid>
        </InriSection>

        <NetworkPulse />

        <InriSection
          eyebrow="Active campaign"
          title="Mining Championship visible from the home."
          description="The campaign entry looks official and connects directly to the full ranking/search page."
        >
          <div className="rounded-[28px] border border-cyan-300/12 bg-[radial-gradient(circle_at_top_left,rgba(25,168,255,0.10),transparent_28rem),linear-gradient(180deg,rgba(10,18,31,0.94),rgba(4,9,17,0.98))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.05)] lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex w-fit items-center rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.20em] text-cyan-200">
                  150,000 INRI Rewards
                </div>
                <h2 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white lg:text-6xl">
                  Solo mining campaign with official ecosystem visibility.
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">
                  Promote the championship with stronger visual credibility while keeping the full ranking/search functionality on the dedicated page.
                </p>
              </div>
              <a
                href="/mining-championship/"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[16px] border border-cyan-200/70 bg-[linear-gradient(180deg,#7ddcff_0%,#27baff_48%,#0c92e8_100%)] px-5 text-sm font-black text-[#031019] shadow-[0_18px_44px_rgba(25,168,255,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:-translate-y-px hover:brightness-105"
              >
                Open Championship
              </a>
            </div>
          </div>
        </InriSection>
      </main>
    </InriShell>
  )
}
