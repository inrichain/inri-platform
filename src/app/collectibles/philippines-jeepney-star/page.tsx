import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('philippines-jeepney-star')

export default function Page() {
  return <InriCollectibleCountryPage slug="philippines-jeepney-star" />
}
