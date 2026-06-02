import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('canada-maple-moose')

export default function Page() {
  return <InriCollectibleCountryPage slug="canada-maple-moose" />
}
