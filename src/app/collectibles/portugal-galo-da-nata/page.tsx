import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('portugal-galo-da-nata')

export default function Page() {
  return <InriCollectibleCountryPage slug="portugal-galo-da-nata" />
}
