import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('netherlands-bike-boss')

export default function Page() {
  return <InriCollectibleCountryPage slug="netherlands-bike-boss" />
}
