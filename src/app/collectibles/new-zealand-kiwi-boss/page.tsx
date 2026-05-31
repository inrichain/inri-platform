import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('new-zealand-kiwi-boss')

export default function Page() {
  return <InriCollectibleCountryPage slug="new-zealand-kiwi-boss" />
}
