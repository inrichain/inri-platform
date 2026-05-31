import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('united-arab-emirates-desert-falcon')

export default function Page() {
  return <InriCollectibleCountryPage slug="united-arab-emirates-desert-falcon" />
}
