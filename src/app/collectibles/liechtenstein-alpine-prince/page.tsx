import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('liechtenstein-alpine-prince')

export default function Page() {
  return <InriCollectibleCountryPage slug="liechtenstein-alpine-prince" />
}
