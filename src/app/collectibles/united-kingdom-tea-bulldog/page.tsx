import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('united-kingdom-tea-bulldog')

export default function Page() {
  return <InriCollectibleCountryPage slug="united-kingdom-tea-bulldog" />
}
