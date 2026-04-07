import type { Metadata } from 'next'
import './globals.css'

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
    icon: [{ url: withBasePath('/inri-logo.png'), type: 'image/png' }],
    shortcut: [withBasePath('/inri-logo.png')],
    apple: [withBasePath('/inri-logo.png')],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ubuntu.variable} dark antialiased`} suppressHydrationWarning>
      <body className={ubuntu.className}>
        <ThemeProvider defaultTheme="dark" storageKey="inri-theme">
          <SidebarConfigProvider>{children}</SidebarConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
