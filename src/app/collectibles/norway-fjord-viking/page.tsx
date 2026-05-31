import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('norway-fjord-viking')

export default function Page() {
  return <InriCollectibleCountryPage slug="norway-fjord-viking" />
}
