import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import './globals.css'

import { GoogleAnalyticsRouteTracker } from '@/components/google-analytics-route-tracker'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { ubuntu } from '@/lib/fonts'
import { withBasePath } from '@/lib/site'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-M1ZJQTCXPT'

export const metadata: Metadata = {
  title: {
    default: 'INRI CHAIN',
    template: '%s | INRI CHAIN',
  },
  description:
    'Official INRI CHAIN website with wallets, swap, token factory, mining, pool, staking, P2P, explorer and whitepaper access.',
  icons: {
    icon: [
      { url: withBasePath('/icon.png'), sizes: '32x32', type: 'image/png' },
      { url: withBasePath('/inri-logo.png'), sizes: '256x256', type: 'image/png' },
    ],
    shortcut: [withBasePath('/icon.png')],
    apple: [withBasePath('/apple-icon.png')],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ubuntu.variable} dark antialiased`} suppressHydrationWarning>
      <body className={ubuntu.className}>
        <ThemeProvider defaultTheme="dark" storageKey="inri-theme">
          <SidebarConfigProvider>
            {children}
            <Suspense fallback={null}>
              <GoogleAnalyticsRouteTracker measurementId={GA_MEASUREMENT_ID} />
            </Suspense>
          </SidebarConfigProvider>
        </ThemeProvider>

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname + window.location.search,
            });
          `}
        </Script>
      </body>
    </html>
  )
}
