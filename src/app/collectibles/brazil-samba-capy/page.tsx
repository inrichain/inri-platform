import {
  generateCollectibleCountryMetadata,
  InriCollectibleCountryPage,
} from '@/components/inri-collectible-country-page'

export const metadata = generateCollectibleCountryMetadata('brazil-samba-capy')

export default function Page() {
  return <InriCollectibleCountryPage slug="brazil-samba-capy" />
}
