import { BadgeDollarSign, ShieldCheck, TrendingUp, Wallet2 } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriStakingClient } from '@/components/inri-staking-client'
import { InriPageHero, InriPanelFrame } from '@/components/inri-design-system'

export function InriStakingPage() {
  return (
    <InriShell>
      <main className="inri-site-v2 overflow-hidden">
        <InriPageHero
          eyebrow="Staking"
          title="Stake INRI inside a cleaner official interface."
          description="Connect a wallet, review the staking route, claim or unstake from a page that now matches the Home, Pool, Token Factory and P2P design standard."
          actions={[
            { label: 'Open staking panel', href: '#staking-panel' },
            { label: 'View contract', href: 'https://explorer.inri.life/address/0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9', external: true, variant: 'secondary' },
          ]}
          stats={[
            { label: 'Pool', value: '5,000,000', text: 'INRI allocation' },
            { label: 'Contract', value: 'Public', text: 'Explorer visible' },
            { label: 'Wallet', value: 'Required', text: 'Connect first' },
            { label: 'Flow', value: 'Claim / Unstake', text: 'Single route' },
          ]}
          features={[
            { title: 'Wallet-first flow', text: 'Users connect once and continue without a disconnected page style.', icon: Wallet2 },
            { title: 'Contract transparency', text: 'Staking contract remains visible through the official explorer.', icon: ShieldCheck },
            { title: 'Reward actions', text: 'Stake, claim and unstake actions stay inside a focused dashboard frame.', icon: BadgeDollarSign },
            { title: 'Premium status layer', text: 'The page now uses stronger cards, clearer labels and better mobile spacing.', icon: TrendingUp },
          ]}
          visualEyebrow="Staking control"
          visualTitle="A serious staking route with the same INRI visual identity."
          visualText="The functional staking client is preserved, but the surrounding page no longer feels separate from the rest of the platform."
        />

        <div id="staking-panel">
          <InriPanelFrame
            eyebrow="Staking panel"
            title="Manage staking from one responsive dashboard."
            description="The staking client remains intact and now sits inside the shared INRI premium panel."
          >
            <InriStakingClient />
          </InriPanelFrame>
        </div>
      </main>
    </InriShell>
  )
}
