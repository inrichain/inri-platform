import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('south-korea-kimchi-gamer')

export default function Page() {
  return <InriCollectibleCountryPage slug="south-korea-kimchi-gamer" />
}
