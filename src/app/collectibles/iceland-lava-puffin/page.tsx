import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('iceland-lava-puffin')

export default function Page() {
  return <InriCollectibleCountryPage slug="iceland-lava-puffin" />
}
