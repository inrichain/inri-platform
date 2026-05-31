import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('germany-pretzel-boss')

export default function Page() {
  return <InriCollectibleCountryPage slug="germany-pretzel-boss" />
}
