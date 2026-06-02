import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('ireland-lucky-leprechaun')

export default function Page() {
  return <InriCollectibleCountryPage slug="ireland-lucky-leprechaun" />
}
