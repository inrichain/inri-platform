import type { Metadata } from 'next'
import './globals.css'

import { GoogleAnalytics } from '@next/third-parties/google'
import { GoogleAnalyticsRouteTracker } from '@/components/google-analytics-route-tracker'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { ubuntu } from '@/lib/fonts'
import { withBasePath } from '@/lib/site'

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

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-M1ZJQTCXPT'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ubuntu.variable} dark antialiased`} suppressHydrationWarning>
      <body className={ubuntu.className}>
        <ThemeProvider defaultTheme="dark" storageKey="inri-theme">
          <SidebarConfigProvider>
            {children}
            {GA_ID ? <GoogleAnalyticsRouteTracker /> : null}
          </SidebarConfigProvider>
        </ThemeProvider>
      </body>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  )
}
