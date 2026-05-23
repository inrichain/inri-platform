import { InriShell } from '@/components/inri-site-shell'
import { InriBridgePage } from '@/components/inri-bridge-page'

export const metadata = {
  title: 'iUSD Bridge | INRI CHAIN',
  description: 'Bridge USDT on Polygon to iUSD on INRI Chain, and iUSD back to USDT.',
}

export default function BridgePage() {
  return (
    <InriShell>
      <InriBridgePage />
    </InriShell>
  )
}
