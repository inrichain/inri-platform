import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('mexico-taco-mariachi')

export default function Page() {
  return <InriCollectibleCountryPage slug="mexico-taco-mariachi" />
}
