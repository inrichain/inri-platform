import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('egypt-pharaoh-cat')

export default function Page() {
  return <InriCollectibleCountryPage slug="egypt-pharaoh-cat" />
}
