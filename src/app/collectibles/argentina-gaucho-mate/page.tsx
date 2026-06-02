import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('argentina-gaucho-mate')

export default function Page() {
  return <InriCollectibleCountryPage slug="argentina-gaucho-mate" />
}
