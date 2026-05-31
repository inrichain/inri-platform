import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('bangladesh-rickshaw-tiger')

export default function Page() {
  return <InriCollectibleCountryPage slug="bangladesh-rickshaw-tiger" />
}
