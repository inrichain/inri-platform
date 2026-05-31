import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('russia-bear-boss')

export default function Page() {
  return <InriCollectibleCountryPage slug="russia-bear-boss" />
}
