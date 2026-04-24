import {
  Activity,
  Blocks,
  Coins,
  Cpu,
  Factory,
  FileText,
  Layers3,
  Pickaxe,
  ShieldCheck,
  Trophy,
  Wallet,
  Zap,
} from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { NetworkPulse } from '@/components/network-pulse'
import { InriFeatureGrid, InriPageHero, InriSectionHeader } from '@/components/inri-design-system'

const primaryRoutes = [
  { title: 'Wallet', text: 'Open the official wallet and connect to INRI.', href: 'https://wallet.inri.life', icon: Wallet, external: true },
  { title: 'Explorer', text: 'Search blocks, transactions, tokens and contracts.', href: 'https://explorer.inri.life', icon: Blocks, external: true },
  { title: 'Mining', text: 'Start mining with Windows, Ubuntu or pool routes.', href: '/mining', icon: Pickaxe },
  { title: 'Token Factory', text: 'Create tokens directly on INRI Chain 3777.', href: '/token-factory', icon: Factory },
  { title: 'Staking', text: 'Stake INRI and manage positions.', href: '/staking', icon: ShieldCheck },
  { title: 'P2P Market', text: 'Trade INRI through the escrow market.', href: '/p2p', icon: Coins },
]

const stats = [
  { label: 'Chain', value: '3777', text: 'INRI Mainnet' },
  { label: 'Consensus', value: 'PoW', text: 'Open mining' },
  { label: 'Runtime', value: 'EVM', text: 'Smart contracts' },
  { label: 'Status', value: 'Mainnet', text: 'Live ecosystem' },
]

const campaignCards = [
  { title: '150,000 INRI', text: 'Total reward campaign for solo miners.', href: '/mining-championship/', icon: Trophy },
  { title: '0.20 INRI', text: 'Per valid solo-mined block during the campaign.', href: '/mining-championship/', icon: Pickaxe },
  { title: 'CPU valid', text: 'Legitimate solo blocks qualify for the public ranking.', href: '/mining-championship/', icon: Cpu },
]

const ecosystemCards = [
  { title: 'Mining Pool', text: 'Track pool modes, payouts, blocks and miner lookup.', href: '/pool', icon: Layers3 },
  { title: 'Mining Championship', text: 'Solo mining rewards, ranking and campaign status.', href: '/mining-championship/', icon: Trophy },
  { title: 'Whitepaper', text: 'Read the structure, token model and direction of INRI.', href: '/whitepaper', icon: FileText },
  { title: 'Windows Mining', text: 'Mining setup for Windows users.', href: '/mining-windows', icon: Cpu },
  { title: 'Ubuntu Mining', text: 'Server/VPS mining route for Ubuntu.', href: '/mining-ubuntu', icon: Activity },
  { title: 'Swap', text: 'Prepared route for the INRI liquidity layer.', href: '/swap', icon: Zap },
]

export function InriHomepage() {
  return (
    <InriShell>
      <main className="inri-site-v2 overflow-hidden">
        <InriPageHero
          eyebrow="INRI V2 Interface"
          title="The INRI mainnet control room."
          description="Wallet, explorer, mining, staking, token launch, pool, whitepaper and P2P trading in one stronger network interface built with a consistent premium visual standard."
          actions={[
            { label: 'Open INRI Wallet', href: 'https://wallet.inri.life', external: true },
            { label: 'Explore Chain', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
            { label: 'Championship', href: '/mining-championship/', variant: 'secondary' },
          ]}
          stats={stats}
          features={primaryRoutes}
          visualEyebrow="Network routes"
          visualTitle="Everything users need, presented like a real product."
          visualText="The home now works as the official command center: fast actions first, clear ecosystem cards second and the same design language used by the internal pages."
        />

        <section className="inri-section-band border-y border-white/10 py-12 sm:py-16">
          <div className="inri-page-container">
            <InriSectionHeader
              eyebrow="Active campaign"
              title="Mining Championship is live on the INRI home."
              description="The campaign remains visible from the main page with direct routing, cleaner cards and mobile-friendly reward information."
              action={{ label: 'Open Championship', href: '/mining-championship/' }}
            />
            <InriFeatureGrid items={campaignCards} />
          </div>
        </section>

        <NetworkPulse />

        <section className="inri-section-band border-t border-white/10 py-12 sm:py-16 lg:py-20">
          <div className="inri-page-container">
            <InriSectionHeader
              eyebrow="Ecosystem"
              title="Official INRI routes with the same premium standard."
              description="Wallet, mining, pool, staking, token creation, P2P, swap and documentation now read like one platform instead of separated pages."
            />
            <InriFeatureGrid items={ecosystemCards} />
          </div>
        </section>
      </main>
    </InriShell>
  )
}
