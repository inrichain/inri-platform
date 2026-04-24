import { Activity, Cpu, HardDriveDownload, Pickaxe, Server, Trophy } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriFeatureGrid, InriPageHero, InriSectionHeader } from '@/components/inri-design-system'

const miningRoutes = [
  { title: 'Windows setup', text: 'Step-by-step route for desktop miners using the official INRI geth build.', href: '/mining-windows', icon: Cpu },
  { title: 'Ubuntu setup', text: 'Server and VPS flow for operators who want a clean Linux miner route.', href: '/mining-ubuntu', icon: Server },
  { title: 'Mining Pool', text: 'Open the pool dashboard, miner lookup, recent blocks and payout status.', href: '/pool', icon: Activity },
  { title: 'Solo Championship', text: 'Follow the active solo mining reward campaign and ranking.', href: '/mining-championship/', icon: Trophy },
  { title: 'Downloads', text: 'Keep users pointed to the official geth package and chain data flow.', href: '/mining-windows', icon: HardDriveDownload },
  { title: 'Mine INRI', text: 'Proof-of-Work participation remains direct, open and visible on-chain.', href: 'https://explorer.inri.life', external: true, icon: Pickaxe },
]

export function InriMiningPage() {
  return (
    <InriShell>
      <main className="inri-site-v2 overflow-hidden">
        <InriPageHero
          eyebrow="Mining"
          title="Mine INRI from one clear control route."
          description="Choose Windows, Ubuntu, pool mining or the active championship inside the same visual language as the Home."
          actions={[
            { label: 'Windows Setup', href: '/mining-windows' },
            { label: 'Ubuntu Setup', href: '/mining-ubuntu', variant: 'secondary' },
            { label: 'Championship', href: '/mining-championship/', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Network', value: 'INRI', text: 'Mainnet' },
            { label: 'Chain ID', value: '3777', text: 'EVM' },
            { label: 'Consensus', value: 'PoW', text: 'Ethash' },
            { label: 'Routes', value: '4+', text: 'Mining flows' },
          ]}
          features={miningRoutes.slice(0, 4)}
          visualEyebrow="Mining command"
          visualTitle="Windows, Ubuntu, pool and solo rewards in one place."
          visualText="This page now behaves like a serious mining hub instead of a simple list of links."
        />

        <section className="inri-section-band border-t border-white/10 py-12 sm:py-16">
          <div className="inri-page-container">
            <InriSectionHeader
              eyebrow="Mining paths"
              title="Pick the route that matches the device."
              description="The same card pattern is used across the whole site so users understand where to click on desktop and mobile."
            />
            <InriFeatureGrid items={miningRoutes} />
          </div>
        </section>
      </main>
    </InriShell>
  )
}
