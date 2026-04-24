import { InriMiningPage } from '@/components/inri-mining-page'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Mining',
  'Mining entry page for INRI CHAIN with Windows, Ubuntu and pool routes.',
)

export default function Page() {
  return <InriMiningPage />
}
