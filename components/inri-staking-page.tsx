import { Coins, LockKeyhole, ShieldCheck, Wallet2 } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriStakingClient } from '@/components/inri-staking-client'
import { InriUnifiedClientFrame, InriUnifiedHero } from '@/components/inri-unified'

export function InriStakingPage() {
  return (
    <InriShell>
      <main className="inri-v26-main">
        <InriUnifiedHero
          eyebrow="INRI STAKING"
          title="Stake INRI inside a stronger official ecosystem interface."
          description="The staking app remains fully functional and is now presented with the same premium card, button and container standard as the rest of INRI."
          actions={[
            { label: 'Open Wallet', href: 'https://wallet.inri.life', external: true },
            { label: 'Explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
            { label: 'Whitepaper', href: '/whitepaper', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Program', value: 'Staking', note: 'Official route' },
            { label: 'Wallet', value: 'Connect', note: 'Header + app flow' },
            { label: 'Contract', value: 'On-chain', note: 'Explorer visible' },
          ]}
          sideTitle="Reward flow with more trust."
          sideText="Users should feel they are inside a serious network product when depositing, claiming or unstaking."
          sideItems={[
            { title: 'Deposit route', text: 'Staking actions remain active in the client.', icon: <LockKeyhole className="h-4 w-4" /> },
            { title: 'Wallet-first', text: 'The experience connects to the official wallet flow.', icon: <Wallet2 className="h-4 w-4" /> },
            { title: 'Trust surface', text: 'Cleaner panels and CTAs improve confidence.', icon: <ShieldCheck className="h-4 w-4" /> },
          ]}
        />
        <InriUnifiedClientFrame>
          <InriStakingClient />
        </InriUnifiedClientFrame>
      </main>
    </InriShell>
  )
}
