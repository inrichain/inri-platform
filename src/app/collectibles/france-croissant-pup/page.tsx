import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('france-croissant-pup')

export default function Page() {
  return <InriCollectibleCountryPage slug="france-croissant-pup" />
}
