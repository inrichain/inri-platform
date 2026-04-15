'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

type Props = {
  measurementId: string
}

export function GoogleAnalyticsRouteTracker({ measurementId }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    if (!window.gtag) return

    const url = `${window.location.pathname}${window.location.search}`

    window.gtag('config', measurementId, {
      page_path: url,
    })
  }, [pathname, measurementId])

  return null
}
