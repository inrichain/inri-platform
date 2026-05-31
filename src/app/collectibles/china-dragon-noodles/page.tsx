import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('china-dragon-noodles')

export default function Page() {
  return <InriCollectibleCountryPage slug="china-dragon-noodles" />
}
