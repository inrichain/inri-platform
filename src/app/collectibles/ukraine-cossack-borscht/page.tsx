import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('ukraine-cossack-borscht')

export default function Page() {
  return <InriCollectibleCountryPage slug="ukraine-cossack-borscht" />
}
