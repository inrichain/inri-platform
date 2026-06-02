import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('nigeria-jollof-boss')

export default function Page() {
  return <InriCollectibleCountryPage slug="nigeria-jollof-boss" />
}
