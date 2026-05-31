import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('spain-fiesta-bull')

export default function Page() {
  return <InriCollectibleCountryPage slug="spain-fiesta-bull" />
}
