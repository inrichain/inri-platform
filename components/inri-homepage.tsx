import {
  Activity,
  ArrowRight,
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
import {
  InriUnifiedCard,
  InriUnifiedHero,
  InriUnifiedSection,
} from '@/components/inri-unified'
import { NetworkPulse } from '@/components/network-pulse'

const routes = [
  {
    title: 'INRI Wallet',
    text: 'Official wallet entry for users to create, connect and use INRI ecosystem tools.',
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
    text: 'Mining hub with Windows, Ubuntu, pool and solo competition routes.',
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
    text: 'Launch tokens on INRI with a cleaner, official and professional product flow.',
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
      <main className="inri-v26-main">
        <InriUnifiedHero
          eyebrow="INRI CHAIN OFFICIAL"
          title="A premium Proof-of-Work EVM network interface for miners, builders and users."
          description="Wallet, explorer, mining, staking, token factory, P2P and campaign pages now follow one professional INRI dark-blue visual system."
          actions={[
            { label: 'Open INRI Wallet', href: 'https://wallet.inri.life', external: true },
            { label: 'Explore Chain', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
            { label: 'Start Mining', href: '/mining', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Chain ID', value: '3777', note: 'INRI mainnet' },
            { label: 'Runtime', value: 'EVM', note: 'Ethereum-compatible' },
            { label: 'Consensus', value: 'PoW', note: 'Open mining' },
            { label: 'Interface', value: 'Unified', note: 'One visual standard' },
          ]}
          sideTitle="Built like a real blockchain product."
          sideText="The site uses the INRI blue identity with stronger hierarchy, premium cards and consistent action areas across all routes."
          sideItems={[
            { title: 'Consistent pages', text: 'Every main page uses the same hero, card and CTA language.', icon: <Sparkles className="h-4 w-4" /> },
            { title: 'Functional routes preserved', text: 'Pool, staking, P2P, token factory and championship clients remain in place.', icon: <ShieldCheck className="h-4 w-4" /> },
            { title: 'Campaign-ready', text: 'The interface is stronger for mining, staking and social growth campaigns.', icon: <Trophy className="h-4 w-4" /> },
          ]}
        />

        <InriUnifiedSection
          eyebrow="Main ecosystem"
          title="Official routes, one INRI standard."
          description="A top blockchain site needs clear paths, premium surfaces and strong CTAs. These routes now share the same visual model."
        >
          <div className="inri-v26-card-grid">
            {routes.map((route) => (
              <InriUnifiedCard
                key={route.title}
                title={route.title}
                text={route.text}
                href={route.href}
                external={'external' in route ? route.external : false}
                icon={route.icon}
                cta="Open route"
              />
            ))}
          </div>
        </InriUnifiedSection>

        <NetworkPulse />

        <InriUnifiedSection
          eyebrow="Active campaign"
          title="Mining Championship visible from the home experience."
          description="The championship keeps its functional page and data, but the entry point now matches the same professional brand system."
        >
          <div className="inri-v26-feature-band">
            <div>
              <div className="inri-v26-eyebrow">150,000 INRI Rewards</div>
              <h2>Solo mining campaign with official ecosystem visibility.</h2>
              <p>
                Promote the championship with stronger visual credibility while keeping the full ranking/search functionality on the dedicated page.
              </p>
            </div>
            <a href="/mining-championship/" className="inri-v26-button inri-v26-button-primary">
              Open Championship
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </InriUnifiedSection>
      </main>
    </InriShell>
  )
}
