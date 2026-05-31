import { notFound } from 'next/navigation'
import { InriShell } from '@/components/inri-site-shell'
import { InriCollectibleDetailClient } from '@/components/inri-collectible-detail-client'
import { absoluteImageUrlForCountry, collectibleCountries } from '@/lib/inri-collectibles'

type CountryPageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return collectibleCountries.map((country) => ({ slug: country.slug }))
}

export async function generateMetadata({ params }: CountryPageProps) {
  const { slug } = await params
  const country = collectibleCountries.find((item) => item.slug === slug)

  if (!country) {
    return {
      title: 'INRI World Meme Collectibles',
    }
  }

  return {
    title: `${country.countryName} ${country.memeName} | INRI World Meme Collectibles`,
    description: `Mint ${country.countryName} ${country.memeName} on INRI Chain with iUSD. Receive rarity-based ${country.countryCode} reward tokens and support iUSD / WINRI liquidity operations.`,
    openGraph: {
      title: `${country.countryName} ${country.memeName} | INRI World Meme Collectibles`,
      description: `Country meme NFT on INRI Chain. Mint with iUSD and collect ${country.countryCode} reward tokens by rarity.`,
      images: [absoluteImageUrlForCountry(country.slug)],
    },
  }
}

export default async function CollectibleCountryPage({ params }: CountryPageProps) {
  const { slug } = await params
  const country = collectibleCountries.find((item) => item.slug === slug)

  if (!country) notFound()

  return (
    <InriShell>
      <InriCollectibleDetailClient country={country} />
    </InriShell>
  )
}
