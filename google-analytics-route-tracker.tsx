'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-M1ZJQTCXPT'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export function GoogleAnalyticsRouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return

    const query = searchParams?.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname
    const pageLocation = `${window.location.origin}${pagePath}`

    window.gtag('config', GA_ID, {
      page_path: pagePath,
      page_location: pageLocation,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  return null
}
