import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('north-korea-rocket-kimchi-tiger')

export default function Page() {
  return <InriCollectibleCountryPage slug="north-korea-rocket-kimchi-tiger" />
}
