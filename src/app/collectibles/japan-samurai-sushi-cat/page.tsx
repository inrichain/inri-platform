import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('japan-samurai-sushi-cat')

export default function Page() {
  return <InriCollectibleCountryPage slug="japan-samurai-sushi-cat" />
}
