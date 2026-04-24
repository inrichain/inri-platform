import { Factory, Rocket, Sparkles } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'
import { InriClientFrame, InriHero } from '@/components/inri-unified'

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main>
        <InriHero
          eyebrow="INRI TOKEN FACTORY"
          title="Launch tokens on INRI with a product-grade creation interface."
          description="The token factory client is preserved and framed as a premium INRI product route for builders and communities."
          actions={[
            { label: 'Connect Wallet', href: 'https://wallet.inri.life', external: true },
            { label: 'Explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
            { label: 'P2P Market', href: '/p2p', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Tool', value: 'Factory', note: 'Token launcher' },
            { label: 'Network', value: 'INRI', note: 'Chain 3777' },
            { label: 'Users', value: 'Builders', note: 'Creator route' },
          ]}
          sideTitle="A real launch product."
          sideText="Token creation should feel like a premium feature, not a utility hidden inside an unfinished page."
          sideItems={[
            { title: 'Launch panel', text: 'Keep the full factory client available.', icon: <Factory className="h-4 w-4" /> },
            { title: 'Builder appeal', text: 'Premium visuals help sell the creator tool.', icon: <Rocket className="h-4 w-4" /> },
            { title: 'Brand trust', text: 'One interface increases confidence.', icon: <Sparkles className="h-4 w-4" /> },
          ]}
        />
        <InriClientFrame>
          <InriTokenFactoryClient />
        </InriClientFrame>
      </main>
    </InriShell>
  )
}
