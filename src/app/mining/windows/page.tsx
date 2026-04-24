import { InriMiningWindowsPage } from '@/components/inri-mining-windows-page'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Mining Windows',
  'Windows mining setup for INRI CHAIN.',
)

export default function Page() {
  return <InriMiningWindowsPage />
}
