import { Layers3, Pickaxe, RadioTower, Search } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriPoolClient } from '@/components/inri-pool-client'
import { InriPageHero, InriPanelFrame } from '@/components/inri-design-system'

export function InriPoolPage() {
  return (
    <InriShell>
      <main className="inri-site-v2 overflow-hidden">
        <InriPageHero
          eyebrow="Mining Pool"
          title="Monitor the INRI pool with a stronger dashboard frame."
          description="Pool stats, recent blocks, payments and miner lookup now live inside the same premium page structure used by the rest of INRI."
          actions={[
            { label: 'Open pool dashboard', href: '#pool-dashboard' },
            { label: 'Mining setup', href: '/mining', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Modes', value: 'PPLNS / SOLO', text: 'Pool routes' },
            { label: 'Lookup', value: 'Miner', text: 'Address search' },
            { label: 'Blocks', value: 'Live-style', text: 'Pool data' },
            { label: 'Payouts', value: 'Tracked', text: 'Payment view' },
          ]}
          features={[
            { title: 'PPLNS / SOLO', text: 'Follow pool modes from one route.', icon: Layers3 },
            { title: 'Miner lookup', text: 'Search miners and payout status without changing page style.', icon: Search },
            { title: 'Live-style stats', text: 'Keep mining data in a polished mainnet view.', icon: RadioTower },
            { title: 'Reward context', text: 'Connect pool behavior with mining and championship routes.', icon: Pickaxe },
          ]}
          visualEyebrow="Pool analytics"
          visualTitle="The data panel now feels like part of the same INRI product."
          visualText="The old dashboard remains functional, but it is placed inside a cleaner premium shell with stronger visual hierarchy."
        />

        <div id="pool-dashboard">
          <InriPanelFrame
            eyebrow="Pool dashboard"
            title="Stats, miners, blocks and payments in one premium panel."
            description="The functional pool client is preserved and wrapped in the same visual system as staking, token factory and P2P."
          >
            <InriPoolClient />
          </InriPanelFrame>
        </div>
      </main>
    </InriShell>
  )
}
