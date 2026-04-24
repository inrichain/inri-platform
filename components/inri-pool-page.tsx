import { Activity, Pickaxe, RadioTower, ShieldCheck } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriPoolClient } from '@/components/inri-pool-client'
import { InriUnifiedClientFrame, InriUnifiedHero } from '@/components/inri-unified'

export function InriPoolPage() {
  return (
    <InriShell>
      <main className="inri-v26-main">
        <InriUnifiedHero
          eyebrow="INRI MINING POOL"
          title="Professional pool dashboard for miners, blocks and payouts."
          description="Pool stats, recent blocks, payments and miner lookup are preserved inside the unified INRI premium layout."
          actions={[
            { label: 'Mining Hub', href: '/mining' },
            { label: 'Championship', href: '/mining-championship/', variant: 'secondary' },
            { label: 'Explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
          ]}
          stats={[
            { label: 'Modes', value: 'PPLNS / SOLO', note: 'Pool routes' },
            { label: 'Data', value: 'Live', note: 'Stats and miners' },
            { label: 'Network', value: 'INRI', note: 'Chain 3777' },
          ]}
          sideTitle="Pool interface, not a random page."
          sideText="The live pool client stays functional, but now sits inside the same INRI premium shell as the rest of the platform."
          sideItems={[
            { title: 'Miner lookup', text: 'Search miners and activity in the same page.', icon: <Pickaxe className="h-4 w-4" /> },
            { title: 'Live-style stats', text: 'Show pool data with stronger visual hierarchy.', icon: <Activity className="h-4 w-4" /> },
            { title: 'Official frame', text: 'Dashboard panels match the network brand.', icon: <RadioTower className="h-4 w-4" /> },
          ]}
        />
        <InriUnifiedClientFrame>
          <InriPoolClient />
        </InriUnifiedClientFrame>
      </main>
    </InriShell>
  )
}
