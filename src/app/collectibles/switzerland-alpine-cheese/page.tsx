import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('switzerland-alpine-cheese')

export default function Page() {
  return <InriCollectibleCountryPage slug="switzerland-alpine-cheese" />
}
