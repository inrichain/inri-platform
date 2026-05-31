import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('australia-outback-roo')

export default function Page() {
  return <InriCollectibleCountryPage slug="australia-outback-roo" />
}
