import { Coins, LockKeyhole, ShieldCheck, Wallet2 } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriStakingClient } from '@/components/inri-staking-client'
import { InriClientFrame, InriHero } from '@/components/inri-premium-model'

export function InriStakingPage() {
  return (
    <InriShell>
      <main>
        <InriHero
          eyebrow="INRI Staking"
          title="Stake INRI inside a stronger official ecosystem interface."
          description="The staking app remains fully functional and is now presented with the same premium cards, buttons and containers as the rest of INRI."
          actions={[
            { label: 'Open Wallet', href: 'https://wallet.inri.life', external: true },
            { label: 'Explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
            { label: 'Whitepaper', href: '/whitepaper', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Program', value: 'Staking' },
            { label: 'Wallet', value: 'Connect' },
            { label: 'Status', value: 'On-chain' },
            { label: 'Network', value: 'INRI' },
          ]}
          sideTitle="Reward flow with more trust."
          sideText="Users should feel they are inside a serious network product when depositing, claiming or unstaking."
          sideItems={[
            { title: 'Deposit route', text: 'Staking actions remain active in the client.', icon: <LockKeyhole className="h-4 w-4" /> },
            { title: 'Wallet-first', text: 'The experience connects to the official wallet flow.', icon: <Wallet2 className="h-4 w-4" /> },
            { title: 'Trust surface', text: 'Cleaner panels and CTAs improve confidence.', icon: <ShieldCheck className="h-4 w-4" /> },
          ]}
        />
        <InriClientFrame>
          <InriStakingClient />
        </InriClientFrame>
      </main>
    </InriShell>
  )
}
