import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('turkiye-kebab-sultan')

export default function Page() {
  return <InriCollectibleCountryPage slug="turkiye-kebab-sultan" />
}
