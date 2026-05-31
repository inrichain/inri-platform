import { notFound } from 'next/navigation'
import { InriShell } from '@/components/inri-site-shell'
import { InriCollectibleDetailClient } from '@/components/inri-collectible-detail-client'
import { absoluteImageUrlForCountry, collectibleCountries } from '@/lib/inri-collectibles'

export function getCollectibleCountryBySlug(slug: string) {
  return collectibleCountries.find((item) => item.slug === slug)
}

export function generateCollectibleCountryMetadata(slug: string) {
  const country = getCollectibleCountryBySlug(slug)

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
    twitter: {
      card: 'summary_large_image',
      title: `${country.countryName} ${country.memeName} | INRI World Meme Collectibles`,
      description: `Mint ${country.countryName} ${country.memeName} on INRI Chain with iUSD.`,
      images: [absoluteImageUrlForCountry(country.slug)],
    },
  }
}

export function InriCollectibleCountryPage({ slug }: { slug: string }) {
  const country = getCollectibleCountryBySlug(slug)

  if (!country) {
    notFound()
  }

  return (
    <InriShell>
      <InriCollectibleDetailClient country={country} />
    </InriShell>
  )
}
