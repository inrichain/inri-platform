import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('slovakia-tatra-wolf')

export default function Page() {
  return <InriCollectibleCountryPage slug="slovakia-tatra-wolf" />
}
