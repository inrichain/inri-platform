import type { Metadata } from 'next'

const SITE_URL = 'https://www.inri.life'
const DEFAULT_DESCRIPTION =
  'Official INRI CHAIN website with wallet access, explorer, mining, pool, staking, token factory, P2P routes and whitepaper.'

export function createPageMetadata(
  title: string,
  description: string = DEFAULT_DESCRIPTION,
): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: title === 'Home' ? '/' : undefined,
    },
    openGraph: {
      title: title === 'Home' ? 'INRI CHAIN' : `${title} | INRI CHAIN`,
      description,
      url: SITE_URL,
      siteName: 'INRI CHAIN',
      type: 'website',
      images: ['/inri-logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: title === 'Home' ? 'INRI CHAIN' : `${title} | INRI CHAIN`,
      description,
      images: ['/inri-logo.png'],
    },
  }
}
