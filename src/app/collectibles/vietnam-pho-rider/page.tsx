import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('vietnam-pho-rider')

export default function Page() {
  return <InriCollectibleCountryPage slug="vietnam-pho-rider" />
}
