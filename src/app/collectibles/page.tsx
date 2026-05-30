import { InriShell } from '@/components/inri-site-shell'
import { InriCollectiblesPage } from '@/components/inri-collectibles-page'

export const metadata = {
  title: 'INRI World Meme Collectibles | INRI CHAIN',
  description:
    'Mint country meme NFTs on INRI Chain with iUSD. Each country has 501 collectibles, rarity by serial number, and country reward tokens.',
}

export default function CollectiblesPage() {
  return (
    <InriShell>
      <InriCollectiblesPage />
    </InriShell>
  )
}
