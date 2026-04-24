import { InriP2PPage } from '@/components/inri-p2p-page'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'P2P',
  'Peer-to-peer market route for INRI CHAIN.',
)

export default function Page() {
  return <InriP2PPage />
}
