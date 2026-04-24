import { Cpu, MonitorSmartphone, Pickaxe, Server, Trophy } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriUnifiedCard, InriUnifiedHero, InriUnifiedSection } from '@/components/inri-unified'

const miningRoutes = [
  {
    title: 'Windows Mining',
    text: 'Mining setup route for Windows users with a cleaner official flow.',
    href: '/mining-windows',
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
  {
    title: 'Ubuntu Mining',
    text: 'Server/VPS mining setup route for Ubuntu and Linux operators.',
    href: '/mining-ubuntu',
    icon: <Server className="h-5 w-5" />,
  },
  {
    title: 'Pool Dashboard',
    text: 'Open the pool dashboard, miner lookup, blocks and payment activity.',
    href: '/pool',
    icon: <Pickaxe className="h-5 w-5" />,
  },
  {
    title: 'Mining Championship',
    text: 'Open the solo mining campaign page and ranking/search interface.',
    href: '/mining-championship/',
    icon: <Trophy className="h-5 w-5" />,
  },
] as const

export function InriMiningPage() {
  return (
    <InriShell>
      <main className="inri-v26-main">
        <InriUnifiedHero
          eyebrow="INRI MINING HUB"
          title="Mining routes organized like a serious network product."
          description="Windows, Ubuntu, pool mining and championship pages share the same premium INRI interface so miners do not feel like they are jumping between different websites."
          actions={[
            { label: 'Windows Setup', href: '/mining-windows' },
            { label: 'Ubuntu Setup', href: '/mining-ubuntu', variant: 'secondary' },
            { label: 'Pool Dashboard', href: '/pool', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Consensus', value: 'PoW', note: 'Open mining' },
            { label: 'Guides', value: 'Windows / Ubuntu', note: 'Setup routes' },
            { label: 'Campaign', value: 'Solo', note: 'Championship route' },
          ]}
          sideTitle="Mining deserves a premium hub."
          sideText="The miner journey now uses the same hierarchy, CTAs and cards as the rest of the INRI ecosystem."
          sideItems={[
            { title: 'Clear start', text: 'Users see the right setup path immediately.', icon: <Cpu className="h-4 w-4" /> },
            { title: 'Pool integration', text: 'Pool and miner routes stay connected.', icon: <Pickaxe className="h-4 w-4" /> },
            { title: 'Campaign ready', text: 'Championship links stay visible.', icon: <Trophy className="h-4 w-4" /> },
          ]}
        />
        <InriUnifiedSection
          eyebrow="Mining paths"
          title="Choose the right mining route."
          description="All mining pages are connected by the same design system and action language."
        >
          <div className="inri-v26-card-grid inri-v26-card-grid-4">
            {miningRoutes.map((route) => (
              <InriUnifiedCard key={route.title} {...route} cta="Open" />
            ))}
          </div>
        </InriUnifiedSection>
      </main>
    </InriShell>
  )
}
