'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUp, ChevronDown, Github, Instagram, Mail, Menu, Send, Youtube } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ConnectWalletButton } from '@/components/connect-wallet-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export type InriNavItem = {
  label: string
  href: string
  external?: boolean
}

export const inriNavItems: InriNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Wallets', href: '/wallets' },
  { label: 'Mining', href: '/mining' },
  { label: 'Pool', href: '/pool' },
  { label: 'Staking', href: '/staking' },
  { label: 'Championship', href: '/mining-championship/' },
]

const LIVE_WALLET_URL = 'https://wallet.inri.life'
const EXPLORER_URL = 'https://explorer.inri.life'

const utilityNavItems: InriNavItem[] = [
  { label: 'INRI Wallet', href: LIVE_WALLET_URL, external: true },
  { label: 'Explorer', href: EXPLORER_URL, external: true },
  { label: 'Whitepaper', href: '/whitepaper' },
  { label: 'Token Factory', href: '/token-factory' },
  { label: 'Swap', href: '/swap' },
  { label: 'P2P', href: '/p2p' },
  { label: 'Mining Windows', href: '/mining-windows' },
  { label: 'Mining Ubuntu', href: '/mining-ubuntu' },
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

function uniqueNavItems(items: InriNavItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.label}::${item.href}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const mobileNavItems = uniqueNavItems([...inriNavItems, ...utilityNavItems])

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

type SocialLink = {
  label: string
  href: string
  icon: ReactNode
}

const socialLinks: SocialLink[] = [
  { label: 'X', href: 'https://x.com/inrichain', icon: <span className="text-base font-black">X</span> },
  { label: 'Instagram', href: 'https://www.instagram.com/inrichain/', icon: <Instagram className="h-5 w-5" /> },
  { label: 'Telegram', href: 'https://t.me/+MQyCO6GXZJtmOTJh', icon: <Send className="h-5 w-5" /> },
  { label: 'Discord', href: 'https://discord.gg/VuUCSTYJNe', icon: <DiscordIcon className="h-5 w-5" /> },
  { label: 'GitHub', href: 'https://github.com/inrichain', icon: <Github className="h-5 w-5" /> },
  { label: 'YouTube', href: 'https://www.youtube.com/@inrichain', icon: <Youtube className="h-5 w-5" /> },
  { label: 'Email', href: 'mailto:contact@inri.life', icon: <Mail className="h-5 w-5" /> },
]

const navLinkClass =
  'notranslate relative inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] px-3 text-[14px] font-extrabold transition-all after:absolute after:bottom-1 after:left-1/2 after:h-[2px] after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-all xl:px-4'

function NavLink({ item }: { item: InriNavItem }) {
  const pathname = usePathname()
  const active = isPathActive(pathname || '/', item.href)

  return (
    <Link
      href={item.href}
      translate="no"
      className={`${navLinkClass} ${
        active ? 'bg-primary/10 text-white after:w-6' : 'text-white/70 after:w-0 hover:bg-white/[0.05] hover:text-white hover:after:w-6'
      }`}
      aria-current={active ? 'page' : undefined}
      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {item.label}
    </Link>
  )
}

function UtilityMenu() {
  const pathname = usePathname()
  const activeParent = utilityNavItems.some((item) => isPathActive(pathname || '/', item.href))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          translate="no"
          className={`${navLinkClass} gap-1.5 ${
            activeParent ? 'bg-primary/10 text-white after:w-6' : 'text-white/70 after:w-0 hover:bg-white/[0.05] hover:text-white hover:after:w-6'
          }`}
          aria-current={activeParent ? 'page' : undefined}
        >
          Ecosystem
          <ChevronDown className="h-4 w-4 text-white/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={14}
        className="w-60 rounded-[1.2rem] border border-white/[0.12] bg-[linear-gradient(180deg,#040912,#000000)] p-2 text-white shadow-[0_22px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(19,164,255,0.06)]"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Main routes
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/[0.08]" />
        {utilityNavItems.map((item) => {
          const active = isPathActive(pathname || '/', item.href)
          return (
            <DropdownMenuItem
              key={item.label}
              asChild
              className={`rounded-[0.95rem] px-3 py-3 text-sm font-semibold transition ${
                active ? 'bg-primary/[0.12] text-white' : 'text-white/82 hover:bg-primary/[0.09] hover:text-white'
              }`}
            >
              <Link
                href={item.href}
                translate="no"
                className="notranslate flex items-center justify-between gap-3"
                aria-current={active ? 'page' : undefined}
                {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <span>{item.label}</span>
                <span className="text-primary/70">↗</span>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
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
      ? 'inri-button-primary'
      : variant === 'secondary'
        ? 'inri-button-secondary'
        : 'text-white/78 hover:text-white'

  return (
    <Link
      href={href}
      translate={noTranslate ? 'no' : undefined}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all ${
        noTranslate ? 'notranslate' : ''
      } ${variant === 'ghost' ? 'h-auto px-0 text-[14px] font-extrabold' : 'px-5'} ${styles}`}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </Link>
  )
}

function MobileMenu() {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/[0.16] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] text-white shadow-[0_12px_26px_rgba(0,0,0,0.18)] transition hover:border-primary/45 hover:bg-primary/[0.08] lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex h-[100dvh] w-[88vw] max-w-none flex-col overflow-hidden border-l border-white/[0.18] bg-[linear-gradient(180deg,#03070d,#000000)] p-0 text-white sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b border-white/[0.10] px-5 py-5 text-left">
          <SheetTitle className="text-left text-white">
            <Logo showText size={52} />
          </SheetTitle>
          <SheetDescription className="pt-2 text-left text-white/55">
            Official routes for the INRI mainnet.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <div className="flex flex-col gap-6 pb-24">
            <div className="grid gap-3">
              <InriLinkButton href={LIVE_WALLET_URL} external noTranslate>
                INRI Wallet
              </InriLinkButton>

              <InriLinkButton href={EXPLORER_URL} external variant="secondary" noTranslate>
                Explorer
              </InriLinkButton>

              <div className="w-full min-w-0">
                <ConnectWalletButton compact />
              </div>
            </div>

            <div className="grid gap-2">
              {mobileNavItems.map((item, index) => {
                const active = isPathActive(pathname || '/', item.href)
                return (
                  <Link
                    key={`${item.label}-${item.href}-${index}`}
                    href={item.href}
                    translate="no"
                    className={`notranslate block w-full rounded-[10px] border-[1.45px] px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? 'border-primary/50 bg-primary/[0.10] text-white'
                        : 'border-white/[0.14] bg-white/[0.03] text-white/84 hover:border-primary/50 hover:bg-primary/[0.10] hover:text-white'
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
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/82 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="border-b border-white/[0.08] bg-[linear-gradient(90deg,rgba(19,164,255,0.20),rgba(103,212,255,0.10),rgba(19,164,255,0.20))]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center px-4 py-2.5 sm:px-8 xl:px-12 2xl:px-16">
          <p
            translate="no"
            className="notranslate text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/78 sm:text-[12px] lg:tracking-[0.28em]"
          >
            INRI Mainnet · Proof-of-Work · Chain 3777 · EVM Compatible
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12 2xl:px-16">
        <div className="grid min-h-[78px] grid-cols-[auto_1fr_auto] items-center gap-3 py-3 md:gap-6 lg:min-h-[86px] lg:py-0">
          <div className="min-w-0 justify-self-start">
            <Link href="/" aria-label="INRI home" className="inline-flex items-center rounded-full">
              <Logo showText size={48} />
            </Link>
          </div>

          <div className="hidden min-w-0 items-center justify-center lg:flex">
            <nav className="flex items-center justify-center gap-1 rounded-[14px] border border-white/[0.10] bg-white/[0.035] p-1">
              {inriNavItems.map((item) => (
                <NavLink key={item.label} item={item} />
              ))}
              <UtilityMenu />
            </nav>
          </div>

          <div className="hidden items-center justify-self-end gap-2 md:flex">
            <InriLinkButton href={EXPLORER_URL} external variant="secondary" noTranslate>
              Explorer
            </InriLinkButton>
            <InriLinkButton href={LIVE_WALLET_URL} external noTranslate>
              INRI Wallet
            </InriLinkButton>
            <ConnectWalletButton compact />
          </div>

          <div className="flex items-center justify-self-end gap-2 md:hidden">
            <div className="hidden min-[430px]:block">
              <InriLinkButton href={LIVE_WALLET_URL} external noTranslate variant="secondary">
                Wallet
              </InriLinkButton>
            </div>
            <MobileMenu />
          </div>
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
      className={`inri-back-to-top fixed bottom-5 right-5 z-[60] inline-flex h-12 w-12 items-center justify-center text-primary backdrop-blur-xl transition-all hover:-translate-y-1 hover:text-white sm:bottom-7 sm:right-7 ${
        visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}

export function InriShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <InriHeader />
      {children}
      <InriFooter />
      <BackToTopButton />
    </div>
  )
}

function FooterSocialIcon({ link }: { link: SocialLink }) {
  return (
    <Link
      href={link.href}
      target="_blank"
      rel="noreferrer"
      aria-label={link.label}
      title={link.label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.025] text-white/68 transition-all hover:-translate-y-px hover:border-primary/35 hover:bg-primary/[0.08] hover:text-white"
    >
      {link.icon}
    </Link>
  )
}

export function InriFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[linear-gradient(180deg,#030812,#000)]">
      <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-8 lg:py-20 xl:px-12 2xl:px-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.75fr))] lg:gap-10">
          <div className="max-w-md">
            <Logo showText size={78} />
            <p className="mt-6 text-sm leading-7 text-white/56 sm:text-[15px]">
              INRI CHAIN official surface: wallet, explorer, mining, staking, token launch, P2P and championship routes from one network interface.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {socialLinks.map((link) => (
                <FooterSocialIcon key={link.label} link={link} />
              ))}
            </div>
            <div className="mt-8 h-px w-full bg-gradient-to-r from-primary/60 via-white/10 to-transparent" />
            <div className="mt-6 space-y-1.5 text-sm text-white/40">
              <p>© 2026 INRI CHAIN. All rights reserved.</p>
              <p>Mainnet • Chain 3777 • Proof-of-Work • EVM Compatible</p>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[1.1rem] font-black uppercase tracking-[0.14em] text-white">{group.title}</h3>
              <div className="mt-6 grid gap-4">
                {group.links.map((item) => (
                  <Link
                    key={`${group.title}-${item.label}-${item.href}`}
                    href={item.href}
                    className="text-[15px] font-semibold text-white/58 transition hover:text-primary"
                    {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-[1.1rem] font-black uppercase tracking-[0.14em] text-white">Network</h3>
            <div className="mt-6 grid gap-3 text-[15px] text-white/60">
              <div className="border-l-2 border-primary/40 pl-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/34">Consensus</p>
                <p className="mt-1 font-black text-white">Proof-of-Work</p>
              </div>
              <div className="border-l-2 border-primary/40 pl-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/34">Chain ID</p>
                <p className="mt-1 font-black text-white">3777</p>
              </div>
              <div className="border-l-2 border-primary/40 pl-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/34">Compatibility</p>
                <p className="mt-1 font-black text-white">EVM</p>
              </div>
              <Link href="mailto:contact@inri.life" className="mt-2 font-black text-white transition hover:text-primary">
                contact@inri.life
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
