import { InriHomepage } from '@/components/inri-homepage'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata(
  'Home',
  'Official home of INRI CHAIN with wallet access, explorer, mining, pool, token factory, staking and the active mining championship route.',
)

export default function HomePage() {
  return <InriHomepage />
}
