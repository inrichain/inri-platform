import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('hong-kong-neon-dim-sum')

export default function Page() {
  return <InriCollectibleCountryPage slug="hong-kong-neon-dim-sum" />
}
