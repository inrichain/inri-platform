import { InriShell } from '@/components/inri-site-shell'
import { InriLiquidityCampaignClient } from '@/components/inri-liquidity-campaign-client'

export const metadata = {
  title: 'Liquidity Campaign | INRI CHAIN',
  description: 'Protected iUSD / INRI liquidity seeding campaign for INRISwap.',
}

export default function Page() {
  return (
    <InriShell>
      <InriLiquidityCampaignClient />
    </InriShell>
  )
}
