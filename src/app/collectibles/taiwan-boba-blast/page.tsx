import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('taiwan-boba-blast')

export default function Page() {
  return <InriCollectibleCountryPage slug="taiwan-boba-blast" />
}
