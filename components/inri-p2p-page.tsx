import { HandCoins, ShieldCheck, Store, Wallet } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriP2PClient } from '@/components/inri-p2p-client'
import { InriPageHero, InriPanelFrame } from '@/components/inri-design-system'

export function InriP2PPage() {
  return (
    <InriShell>
      <main className="inri-site-v2 overflow-hidden">
        <InriPageHero
          eyebrow="P2P Escrow"
          title="Trade INRI through a cleaner P2P market."
          description="Use the same wallet from the top header, sync the market and manage offers from the same INRI control-room interface."
          actions={[
            { label: 'Open market panel', href: '#p2p-market-panel' },
            { label: 'Open Wallet', href: 'https://wallet.inri.life', external: true, variant: 'secondary' },
            { label: 'Explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
          ]}
          stats={[
            { label: 'Market', value: 'Escrow', text: 'Native INRI' },
            { label: 'Actions', value: 'Offer / Accept', text: 'Trade flow' },
            { label: 'Protection', value: 'Disputes', text: 'Moderator flow' },
            { label: 'Wallet', value: 'One header', text: 'No duplicate UI' },
          ]}
          features={[
            { title: 'Escrow market', text: 'Create offers, accept, mark paid and release.', icon: Store },
            { title: 'Header wallet', text: 'No second wallet style inside the page.', icon: Wallet },
            { title: 'Protected flow', text: 'Disputes and release actions remain inside the route.', icon: ShieldCheck },
            { title: 'Trade clarity', text: 'Offer cards and actions now sit inside a more serious market frame.', icon: HandCoins },
          ]}
          visualEyebrow="P2P market"
          visualTitle="A cleaner escrow page for real users."
          visualText="The market keeps the same functions but presents them with the premium INRI visual standard."
        />

        <div id="p2p-market-panel">
          <InriPanelFrame
            eyebrow="Market panel"
            title="Create and manage offers from one responsive interface."
            description="The P2P client is preserved and wrapped in the same design system as staking, pool and token factory."
          >
            <InriP2PClient />
          </InriPanelFrame>
        </div>
      </main>
    </InriShell>
  )
}
