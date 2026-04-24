import { InriMiningUbuntuPage } from '@/components/inri-mining-ubuntu-page'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Mining Ubuntu',
  'Ubuntu mining setup for INRI CHAIN.',
)

export default function Page() {
  return <InriMiningUbuntuPage />
}
