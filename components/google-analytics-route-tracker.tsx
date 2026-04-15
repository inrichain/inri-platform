'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

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
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!window.gtag) return

    const search = searchParams?.toString()
    const url = search ? `${pathname}?${search}` : pathname

    window.gtag('config', measurementId, {
      page_path: url,
    })
  }, [pathname, searchParams, measurementId])

  return null
}
