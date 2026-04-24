import { MonitorSmartphone, Pickaxe, Terminal, Wallet } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriCard, InriCardGrid, InriHero, InriSection } from '@/components/inri-premium-model'

export function InriMiningWindowsPage() {
  return (
    <InriShell>
      <main>
        <InriHero
          eyebrow="Windows Mining"
          title="Windows mining setup under the approved INRI premium model."
          description="A clear Windows mining route with the same dark-blue containers, buttons and route structure as the rest of the INRI platform."
          actions={[
            { label: 'Mining Hub', href: '/mining' },
            { label: 'Pool Dashboard', href: '/pool', variant: 'secondary' },
            { label: 'Open Wallet', href: 'https://wallet.inri.life', external: true, variant: 'secondary' },
          ]}
          stats={[
            { label: 'Guide', value: 'Windows' },
            { label: 'Network', value: 'INRI' },
            { label: 'Chain', value: '3777' },
            { label: 'Mode', value: 'Mining' },
          ]}
          sideTitle="Setup route with the same visual standard."
          sideText="This page follows the same premium INRI model as Home, Pool, Staking, P2P and Championship."
        />
        <InriSection eyebrow="Setup steps" title="Start mining with the correct route.">
          <InriCardGrid cols={3}>
            <InriCard title="Prepare wallet" text="Create or open your INRI wallet and keep your seed phrase safe." icon={<Wallet className="h-5 w-5" />} />
            <InriCard title="Configure miner" text="Use the official mining route and connect to the correct pool or solo configuration." icon={<MonitorSmartphone className="h-5 w-5" />} />
            <InriCard title="Monitor activity" text="Check your miner, blocks and pool activity from the official INRI routes." icon={<Pickaxe className="h-5 w-5" />} />
          </InriCardGrid>
        </InriSection>
      </main>
    </InriShell>
  )
}
