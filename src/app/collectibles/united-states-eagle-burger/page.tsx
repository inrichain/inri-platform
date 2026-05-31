import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('united-states-eagle-burger')

export default function Page() {
  return <InriCollectibleCountryPage slug="united-states-eagle-burger" />
}
