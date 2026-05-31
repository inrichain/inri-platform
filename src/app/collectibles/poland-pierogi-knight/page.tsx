import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('poland-pierogi-knight')

export default function Page() {
  return <InriCollectibleCountryPage slug="poland-pierogi-knight" />
}
