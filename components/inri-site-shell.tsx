import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown, Github, Instagram, Mail, Menu, Send, Youtube } from 'lucide-react'
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
  { label: 'Whitepaper', href: '/whitepaper' },
]

const LIVE_WALLET_URL = 'https://wallet.inri.life'
const EXPLORER_URL = 'https://explorer.inri.life'

const utilityNavItems: InriNavItem[] = [
  { label: 'INRI Wallet', href: LIVE_WALLET_URL, external: true },
  { label: 'Explorer', href: EXPLORER_URL, external: true },
  { label: 'Token Factory', href: '/token-factory' },
  { label: 'Swap', href: '/swap' },
  { label: 'P2P', href: '/p2p' },
  { label: 'Mining Championship', href: '/mining-championship/' },
  { label: 'Mining Windows', href: '/mining-windows' },
  { label: 'Mining Ubuntu', href: '/mining-ubuntu' },
]

const footerStartLinks: InriNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'INRI Wallet', href: LIVE_WALLET_URL, external: true },
  { label: 'Wallets', href: '/wallets' },
  { label: 'Explorer', href: EXPLORER_URL, external: true },
]

const footerEcosystemLinks: InriNavItem[] = [
  { label: 'Mining', href: '/mining' },
  { label: 'Pool', href: '/pool' },
  { label: 'Staking', href: '/staking' },
  { label: 'Token Factory', href: '/token-factory' },
  { label: 'Swap', href: '/swap' },
  { label: 'P2P', href: '/p2p' },
]

const footerResourceLinks: InriNavItem[] = [
  { label: 'Whitepaper', href: '/whitepaper' },
  { label: 'Mining Championship', href: '/mining-championship/' },
  { label: 'Mining Windows', href: '/mining-windows' },
  { label: 'Mining Ubuntu', href: '/mining-ubuntu' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
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
  { label: 'X', href: 'https://x.com/inrichain', icon: <span className="text-sm font-black">X</span> },
  { label: 'Instagram', href: 'https://www.instagram.com/inrichain/', icon: <Instagram className="h-4 w-4" /> },
  { label: 'Telegram', href: 'https://t.me/+MQyCO6GXZJtmOTJh', icon: <Send className="h-4 w-4" /> },
  { label: 'Discord', href: 'https://discord.gg/VuUCSTYJNe', icon: <DiscordIcon className="h-4 w-4" /> },
  { label: 'GitHub', href: 'https://github.com/inrichain', icon: <Github className="h-4 w-4" /> },
  { label: 'YouTube', href: 'https://www.youtube.com/@inrichain', icon: <Youtube className="h-4 w-4" /> },
  { label: 'Email', href: 'mailto:contact@inri.life', icon: <Mail className="h-4 w-4" /> },
]

const footerFacts = ['Proof-of-Work', 'Chain ID 3777', 'EVM Compatible', 'Mainnet Live']

const navLinkClass =
  'notranslate relative inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap px-2 text-[15px] font-bold text-white/78 transition-all hover:text-white after:absolute after:-bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-all hover:after:w-6 xl:px-3'

function NavLink({ item }: { item: InriNavItem }) {
  return (
    <Link
      href={item.href}
      translate="no"
      className={navLinkClass}
      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {item.label}
    </Link>
  )
}

function UtilityMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button translate="no" className={`${navLinkClass} gap-1.5`}>
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
          More routes
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/[0.08]" />
        {utilityNavItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            asChild
            className="rounded-[0.95rem] px-3 py-3 text-sm font-semibold text-white/82 transition hover:bg-primary/[0.09] hover:text-white"
          >
            <Link
              href={item.href}
              translate="no"
              className="notranslate flex items-center justify-between gap-3"
              {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              <span>{item.label}</span>
              <span className="text-primary/70">↗</span>
            </Link>
          </DropdownMenuItem>
        ))}
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
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.16] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] text-white shadow-[0_12px_26px_rgba(0,0,0,0.18)] transition hover:border-primary/45 hover:bg-primary/[0.08] lg:hidden">
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
              {mobileNavItems.map((item, index) => (
                <Link
                  key={`${item.label}-${item.href}-${index}`}
                  href={item.href}
                  translate="no"
                  className="notranslate block w-full rounded-[1rem] border-[1.45px] border-white/[0.14] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/84 transition hover:border-primary/50 hover:bg-primary/[0.10] hover:text-white"
                  {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function InriHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/18 bg-black/96 backdrop-blur-2xl">
      <div className="bg-[linear-gradient(90deg,#056ec7_0%,#118ff0_52%,#056ec7_100%)] shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-8 xl:px-12 2xl:px-16">
          <p
            translate="no"
            className="notranslate text-center text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/92 sm:text-[13px] lg:text-[15px] lg:tracking-[0.24em]"
          >
            Mainnet • Proof-of-Work • Chain 3777 • EVM Compatible
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12 2xl:px-16">
        <div className="grid min-h-[74px] grid-cols-[auto_1fr_auto] items-center gap-3 py-3 sm:min-h-[82px] md:gap-6 lg:min-h-[88px] lg:py-0">
          <div className="min-w-0 justify-self-start">
            <Logo showText size={42} />
          </div>

          <div className="hidden min-w-0 items-center justify-center lg:flex">
            <nav className="flex items-center justify-center gap-5 xl:gap-6">
              {inriNavItems.map((item) => (
                <NavLink key={item.label} item={item} />
              ))}
              <UtilityMenu />
            </nav>
          </div>

          <div className="hidden items-center justify-self-end gap-3 md:flex">
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

      <div className="h-[6px] border-t border-white/10 bg-[linear-gradient(90deg,#056ec7_0%,#118ff0_52%,#056ec7_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
    </header>
  )
}

export function InriShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <InriHeader />
      {children}
      <InriFooter />
    </div>
  )
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: InriNavItem[]
}) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-primary">{title}</p>
      <div className="mt-5 grid gap-3">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            translate="no"
            className="notranslate text-sm font-semibold text-white/72 transition hover:text-white"
            {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function FooterSocialButton({ link }: { link: SocialLink }) {
  return (
    <Link
      href={link.href}
      target="_blank"
      rel="noreferrer"
      aria-label={link.label}
      className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white/74 transition-all hover:-translate-y-px hover:border-primary/48 hover:bg-primary/[0.12] hover:text-white"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.12] bg-black/40">
        {link.icon}
      </span>
      <span>{link.label}</span>
    </Link>
  )
}

export function InriFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.12),transparent_22%),linear-gradient(180deg,#010408_0%,#000000_100%)]">
      <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-14 px-4 py-16 sm:px-8 xl:px-12 2xl:px-16">
        <div className="grid gap-8 rounded-[2rem] border-[1.45px] border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-6 shadow-[0_28px_88px_rgba(0,0,0,0.34)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:p-8">
          <div className="space-y-6">
            <Logo showText size={58} />
            <div className="max-w-3xl space-y-3">
              <p className="text-lg font-semibold text-white/94 sm:text-xl">
                Official access layer for the INRI mainnet.
              </p>
              <p className="max-w-[66ch] text-sm leading-7 text-white/60 sm:text-base">
                Use one clear surface to open the wallet, explore the chain, start mining,
                access the pool, launch tokens and read the whitepaper.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {footerFacts.map((fact) => (
                <span
                  key={fact}
                  className="rounded-full border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/72"
                >
                  {fact}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <InriLinkButton href={LIVE_WALLET_URL} external noTranslate>
                Open INRI Wallet
              </InriLinkButton>
              <InriLinkButton href={EXPLORER_URL} external variant="secondary" noTranslate>
                Open Explorer
              </InriLinkButton>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/[0.1] bg-black/28 p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-primary">
                Network
              </p>
              <div className="mt-4 space-y-3 text-sm text-white/72">
                <div className="flex items-center justify-between gap-4">
                  <span>Consensus</span>
                  <span className="font-bold text-white">Proof-of-Work</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Chain ID</span>
                  <span className="font-bold text-white">3777</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Compatibility</span>
                  <span className="font-bold text-white">EVM</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Support</span>
                  <span className="font-bold text-white">contact@inri.life</span>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/[0.1] bg-black/28 p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-primary">
                Community
              </p>
              <p className="mt-3 text-sm leading-7 text-white/58">
                Official channels for updates, support, announcements and ecosystem activity.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {socialLinks.map((link) => (
                  <FooterSocialButton key={link.label} link={link} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-3 xl:grid-cols-4">
          <FooterLinkColumn title="Start" links={footerStartLinks} />
          <FooterLinkColumn title="Ecosystem" links={footerEcosystemLinks} />
          <FooterLinkColumn title="Resources" links={footerResourceLinks} />
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-primary">Brand</p>
            <div className="mt-5 space-y-3 text-sm leading-7 text-white/60">
              <p>
                INRI CHAIN is built to keep the main routes of the network visible, direct and
                easy to use on desktop and mobile.
              </p>
              <p>
                The site should feel like a real network control surface, not a generic landing
                page.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.08] pt-6 text-sm text-white/42 md:flex-row md:items-center md:justify-between">
          <p>© 2026 INRI CHAIN. All rights reserved.</p>
          <p>Mainnet • Chain 3777 • Proof-of-Work • EVM Compatible</p>
        </div>
      </div>
    </footer>
  )
}
