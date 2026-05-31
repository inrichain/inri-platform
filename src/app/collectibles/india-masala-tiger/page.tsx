import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('india-masala-tiger')

export default function Page() {
  return <InriCollectibleCountryPage slug="india-masala-tiger" />
}
