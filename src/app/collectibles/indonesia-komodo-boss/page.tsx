import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('indonesia-komodo-boss')

export default function Page() {
  return <InriCollectibleCountryPage slug="indonesia-komodo-boss" />
}
