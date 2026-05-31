import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('singapore-merlion-mode')

export default function Page() {
  return <InriCollectibleCountryPage slug="singapore-merlion-mode" />
}
