import { Store, Users, Wallet } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriP2PClient } from '@/components/inri-p2p-client'
import { InriClientFrame, InriHero } from '@/components/inri-premium-model'

export function InriP2PPage() {
  return (
    <InriShell>
      <main>
        <InriHero
          eyebrow="INRI P2P Market"
          title="A cleaner escrow marketplace for direct INRI trades."
          description="The P2P client remains active, but now appears inside the same official dark-blue ecosystem interface as staking, pool and token factory."
          actions={[
            { label: 'Open Wallet', href: 'https://wallet.inri.life', external: true },
            { label: 'Explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
            { label: 'Token Factory', href: '/token-factory', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Market', value: 'Escrow' },
            { label: 'Flow', value: 'Offer / Accept' },
            { label: 'Wallet', value: 'INRI' },
            { label: 'Network', value: '3777' },
          ]}
          sideTitle="P2P with official credibility."
          sideText="The marketplace should look safer, cleaner and more aligned with the rest of the ecosystem."
          sideItems={[
            { title: 'Escrow market', text: 'Create, accept and manage offers.', icon: <Store className="h-4 w-4" /> },
            { title: 'User flow', text: 'Keep wallet and market in one route.', icon: <Wallet className="h-4 w-4" /> },
            { title: 'Community trading', text: 'Direct trading needs visual trust.', icon: <Users className="h-4 w-4" /> },
          ]}
        />
        <InriClientFrame>
          <InriP2PClient />
        </InriClientFrame>
      </main>
    </InriShell>
  )
}
