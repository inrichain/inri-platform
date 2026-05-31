import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('italy-pizza-mafioso')

export default function Page() {
  return <InriCollectibleCountryPage slug="italy-pizza-mafioso" />
}
