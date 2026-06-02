import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('israel-island-of-innovation')

export default function Page() {
  return <InriCollectibleCountryPage slug="israel-island-of-innovation" />
}
