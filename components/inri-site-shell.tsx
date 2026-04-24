'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUp, Github, Instagram, Mail, Menu, Send, Youtube } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ConnectWalletButton } from '@/components/connect-wallet-button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export type InriNavItem = { label: string; href: string; external?: boolean }

export const inriNavItems: InriNavItem[] = [
  { label: 'Network', href: '/' },
  { label: 'Mining', href: '/mining' },
  { label: 'Pool', href: '/pool' },
  { label: 'Staking', href: '/staking' },
  { label: 'Factory', href: '/token-factory' },
  { label: 'P2P', href: '/p2p' },
  { label: 'Docs', href: '/whitepaper' },
]

const LIVE_WALLET_URL = 'https://wallet.inri.life'
const EXPLORER_URL = 'https://explorer.inri.life'

const utilityNavItems: InriNavItem[] = [
  { label: 'Wallets', href: '/wallets' },
  { label: 'Championship', href: '/mining-championship/' },
  { label: 'Explorer', href: EXPLORER_URL, external: true },
  { label: 'Swap', href: '/swap' },
  { label: 'Windows', href: '/mining-windows' },
  { label: 'Ubuntu', href: '/mining-ubuntu' },
]

const footerGroups: { title: string; links: InriNavItem[] }[] = [
  {
    title: 'Start',
    links: [
      { label: 'Home', href: '/' },
      { label: 'INRI Wallet', href: LIVE_WALLET_URL, external: true },
      { label: 'Explorer', href: EXPLORER_URL, external: true },
      { label: 'Whitepaper', href: '/whitepaper' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { label: 'Mining', href: '/mining' },
      { label: 'Pool', href: '/pool' },
      { label: 'Staking', href: '/staking' },
      { label: 'Token Factory', href: '/token-factory' },
      { label: 'Swap', href: '/swap' },
      { label: 'P2P', href: '/p2p' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Mining Championship', href: '/mining-championship/' },
      { label: 'Mining Windows', href: '/mining-windows' },
      { label: 'Mining Ubuntu', href: '/mining-ubuntu' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms & Conditions', href: '/terms-and-conditions' },
    ],
  },
]

function normalizePath(path: string) {
  if (!path) return '/'
  const clean = path.split('?')[0].split('#')[0]
  if (clean.length > 1 && clean.endsWith('/')) return clean.slice(0, -1)
  return clean || '/'
}

function isPathActive(pathname: string, href: string) {
  if (!href.startsWith('/')) return false
  const current = normalizePath(pathname)
  const target = normalizePath(href)
  if (target === '/') return current === '/'
  return current === target || current.startsWith(target + '/')
}

function DiscordIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.078.037c-.211.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.579.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 13.94 13.94 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.011c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.1.246.198.373.292a.077.077 0 0 1-.006.128 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .031-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.211 0 2.175 1.095 2.157 2.418 0 1.334-.955 2.419-2.157 2.419Zm7.975 0c-1.184 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.211 0 2.175 1.095 2.157 2.418 0 1.334-.946 2.419-2.157 2.419Z" />
    </svg>
  )
}

type SocialLink = { label: string; href: string; icon: ReactNode }

const socialLinks: SocialLink[] = [
  { label: 'X', href: 'https://x.com/inrichain', icon: <span className="text-base font-black">X</span> },
  { label: 'Instagram', href: 'https://www.instagram.com/inrichain/', icon: <Instagram className="h-5 w-5" /> },
  { label: 'Telegram', href: 'https://t.me/+MQyCO6GXZJtmOTJh', icon: <Send className="h-5 w-5" /> },
  { label: 'Discord', href: 'https://discord.gg/VuUCSTYJNe', icon: <DiscordIcon className="h-5 w-5" /> },
  { label: 'GitHub', href: 'https://github.com/inrichain', icon: <Github className="h-5 w-5" /> },
  { label: 'YouTube', href: 'https://www.youtube.com/@inrichain', icon: <Youtube className="h-5 w-5" /> },
  { label: 'Email', href: 'mailto:contact@inri.life', icon: <Mail className="h-5 w-5" /> },
]

function NavLink({ item }: { item: InriNavItem }) {
  const pathname = usePathname()
  const active = isPathActive(pathname || '/', item.href)

  return (
    <Link
      href={item.href}
      translate="no"
      className={`notranslate rounded-[14px] px-4 py-2.5 text-sm font-black transition ${
        active ? 'bg-cyan-400/10 text-white shadow-[inset_0_0_0_1px_rgba(103,232,249,0.14)]' : 'text-white/65 hover:bg-white/[0.055] hover:text-white'
      }`}
      aria-current={active ? 'page' : undefined}
      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {item.label}
    </Link>
  )
}

export function InriLinkButton({
  href,
  children,
  variant = 'primary',
  external = false,
  noTranslate = false,
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  external?: boolean
  noTranslate?: boolean
}) {
  const styles =
    variant === 'primary'
      ? 'border-cyan-200/70 bg-[linear-gradient(180deg,#8be7ff_0%,#2bbcff_48%,#0a8fe0_100%)] text-[#021019] shadow-[0_18px_44px_rgba(14,165,233,0.28),inset_0_1px_0_rgba(255,255,255,0.45)]'
      : variant === 'secondary'
        ? 'border-white/12 bg-white/[0.045] text-white shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-cyan-300/30 hover:bg-cyan-400/10'
        : 'text-white/78 hover:text-white'

  return (
    <Link
      href={href}
      translate={noTranslate ? 'no' : undefined}
      className={`inline-flex h-[52px] items-center justify-center gap-2 whitespace-nowrap rounded-[16px] border px-5 text-sm font-black transition hover:-translate-y-px hover:brightness-105 ${
        noTranslate ? 'notranslate' : ''
      } ${styles}`}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </Link>
  )
}

function MobileMenu() {
  const pathname = usePathname()
  const mobileItems = [...inriNavItems, ...utilityNavItems, { label: 'INRI Wallet', href: LIVE_WALLET_URL, external: true }]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-cyan-300/15 bg-white/[0.04] text-white shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition hover:border-cyan-300/40 hover:bg-cyan-400/10 lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex h-[100dvh] w-[88vw] max-w-none flex-col overflow-hidden border-l border-cyan-300/15 bg-[linear-gradient(180deg,#07101d,#03060b)] p-0 text-white sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-cyan-300/10 px-5 py-5 text-left">
          <SheetTitle className="text-left text-white">
            <Logo showText size={52} />
          </SheetTitle>
          <SheetDescription className="pt-2 text-left text-white/60">
            Official routes for the INRI mainnet.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <div className="grid gap-3 pb-24">
            <InriLinkButton href={LIVE_WALLET_URL} external noTranslate>
              INRI Wallet
            </InriLinkButton>
            <InriLinkButton href={EXPLORER_URL} external variant="secondary" noTranslate>
              Explorer
            </InriLinkButton>
            <ConnectWalletButton compact />
            <div className="mt-4 grid gap-2">
              {mobileItems.map((item, index) => {
                const active = isPathActive(pathname || '/', item.href)
                return (
                  <Link
                    key={`${item.label}-${item.href}-${index}`}
                    href={item.href}
                    translate="no"
                    className={`notranslate block w-full rounded-[14px] border px-4 py-3 text-sm font-bold transition ${
                      active ? 'border-cyan-300/30 bg-cyan-400/12 text-white' : 'border-cyan-300/12 bg-white/[0.035] text-white/75 hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white'
                    }`}
                    aria-current={active ? 'page' : undefined}
                    {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function InriHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-300/10 bg-[#03060b]/82 backdrop-blur-2xl">
      <div className="border-b border-cyan-300/10 bg-[linear-gradient(90deg,rgba(6,33,55,0.92),rgba(7,20,35,0.76),rgba(6,33,55,0.92))] py-2 text-center text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/84">
        INRI MAINNET · PROOF-OF-WORK · CHAIN 3777 · EVM COMPATIBLE
      </div>
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-4 py-4 sm:px-6 xl:px-8">
        <Logo showText size={48} />
        <nav className="hidden items-center gap-1 rounded-[18px] border border-cyan-300/12 bg-white/[0.04] p-1.5 shadow-[0_16px_38px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.045)] xl:flex">
          {inriNavItems.map((item) => (
            <NavLink key={`${item.label}-${item.href}`} item={item} />
          ))}
          <div className="mx-1 h-6 w-px bg-cyan-300/12" />
          {utilityNavItems.map((item) => (
            <NavLink key={`${item.label}-${item.href}`} item={item} />
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <InriLinkButton href={LIVE_WALLET_URL} external noTranslate>
            INRI Wallet
          </InriLinkButton>
          <ConnectWalletButton compact />
        </div>
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-5 right-5 z-[60] inline-flex h-12 w-12 items-center justify-center rounded-[16px] border border-cyan-300/15 bg-white/[0.05] text-cyan-200 shadow-[0_18px_44px_rgba(0,0,0,0.26)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-300/35 hover:text-white sm:bottom-7 sm:right-7 ${
        visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}

export function InriShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#02050a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_-10%,rgba(14,165,233,0.24),transparent_34rem),radial-gradient(circle_at_88%_-8%,rgba(125,220,255,0.10),transparent_30rem),linear-gradient(180deg,#03060b_0%,#06101d_48%,#02050a_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(125,220,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,220,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px] opacity-45 [mask-image:linear-gradient(180deg,black,transparent_82%)]" />
      <InriHeader />
      {children}
      <InriFooter />
      <BackToTopButton />
    </div>
  )
}

function FooterSocialIcon({ link }: { link: SocialLink }) {
  return (
    <Link href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label} className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-cyan-300/12 bg-white/[0.04] text-white/68 transition-all hover:-translate-y-px hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-white">
      {link.icon}
    </Link>
  )
}

export function InriFooter() {
  return (
    <footer className="border-t border-cyan-300/10 bg-[radial-gradient(circle_at_top_left,rgba(25,168,255,0.12),transparent_28rem),linear-gradient(180deg,#07101d_0%,#020409_100%)]">
      <div className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 lg:py-20 xl:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.75fr))] lg:gap-10">
          <div className="max-w-md">
            <Logo showText size={78} />
            <p className="mt-6 text-sm leading-7 text-white/60 sm:text-[15px]">
              INRI CHAIN official surface: wallet, explorer, mining, staking, token launch, P2P and championship routes from one premium network interface.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {socialLinks.map((link) => (
                <FooterSocialIcon key={link.label} link={link} />
              ))}
            </div>
            <div className="mt-8 h-px w-full bg-gradient-to-r from-cyan-300/60 via-white/10 to-transparent" />
            <div className="mt-6 space-y-1.5 text-sm text-white/42">
              <p>© 2026 INRI CHAIN. All rights reserved.</p>
              <p>Mainnet • Chain 3777 • Proof-of-Work • EVM Compatible</p>
            </div>
          </div>
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[1.05rem] font-black uppercase tracking-[0.14em] text-white">{group.title}</h3>
              <div className="mt-6 grid gap-4">
                {group.links.map((item) => (
                  <Link key={`${group.title}-${item.label}-${item.href}`} href={item.href} className="text-[15px] font-semibold text-white/58 transition hover:text-cyan-200" {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div>
            <h3 className="text-[1.05rem] font-black uppercase tracking-[0.14em] text-white">Network</h3>
            <div className="mt-6 grid gap-3 text-[15px] text-white/60">
              {[
                ['Consensus', 'Proof-of-Work'],
                ['Chain ID', '3777'],
                ['Compatibility', 'EVM'],
              ].map(([label, value]) => (
                <div key={label} className="border-l-2 border-cyan-300/50 pl-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/38">{label}</p>
                  <p className="mt-1 font-black text-white">{value}</p>
                </div>
              ))}
              <Link href="mailto:contact@inri.life" className="mt-2 font-black text-white transition hover:text-cyan-200">
                contact@inri.life
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
