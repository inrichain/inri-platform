import { InriShell } from '@/components/inri-site-shell'
import { InriCollectiblesPage } from '@/components/inri-collectibles-page'

export const metadata = {
  title: 'INRI World Meme Collectibles | Mint Country NFTs with iUSD',
  description:
    'Mint INRI country meme NFTs with iUSD. Each country has 501 collectibles, rarity by serial number, country reward tokens, and an initial mint allocation for liquidity.',
}

export default function CollectiblesPage() {
  return (
    <InriShell>
      <InriCollectiblesPage />
    </InriShell>
  )
}
