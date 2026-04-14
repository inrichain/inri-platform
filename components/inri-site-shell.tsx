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
  { label: 'Swap', href: '/swap' },
  { label: 'Token Factory', href: '/token-factory' },
  { label: 'P2P', href: '/p2p' },
  { label: 'Mining Windows', href: '/mining-windows' },
  { label: 'Mining Ubuntu', href: '/mining-ubuntu' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
]

const footerPrimaryLinks: InriNavItem[] = [
  { label: 'INRI Wallet', href: LIVE_WALLET_URL, external: true },
  { label: 'Wallets', href: '/wallets' },
  { label: 'Mining', href: '/mining' },
  { label: 'Pool', href: '/pool' },
  { label: 'Staking', href: '/staking' },
  { label: 'Swap', href: '/swap' },
  { label: 'Token Factory', href: '/token-factory' },
  { label: 'P2P', href: '/p2p' },
  { label: 'Whitepaper', href: '/whitepaper' },
  { label: 'Explorer', href: EXPLORER_URL, external: true },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
]

const socialLinks = [
  { label: 'X', href: 'https://x.com/inrichain', text: 'X' },
  { label: 'Instagram', href: 'https://www.instagram.com/inrichain/', icon: Instagram },
  { label: 'Telegram', href: 'https://t.me/+MQyCO6GXZJtmOTJh', icon: Send },
  { label: 'Discord', href: 'https://discord.gg/VuUCSTYJNe', text: 'Discord' },
  { label: 'GitHub', href: 'https://github.com/inrichain', icon: Github },
  { label: 'YouTube', href: 'https://www.youtube.com/@inrichain', icon: Youtube },
]

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
          More
          <ChevronDown className="h-4 w-4 text-white/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={14}
        className="w-60 rounded-[1.2rem] border border-white/[0.12] bg-[linear-gradient(180deg,#040912,#000000)] p-2 text-white shadow-[0_22px_70px_rgba(0,0,0,0.5),0_0_0_1px_rgba(19,164,255,0.06)]"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">More pages</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/[0.08]" />
        {utilityNavItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            asChild
            className="rounded-[0.95rem] px-3 py-3 text-sm font-semibold text-white/82 transition hover:bg-primary/[0.09] hover:text-white"
          >
            <Link href={item.href} translate="no" className="notranslate flex items-center justify-between gap-3" {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
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
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all ${noTranslate ? 'notranslate' : ''} ${variant === 'ghost' ? 'h-auto px-0 text-[14px] font-extrabold' : 'px-5'} ${styles}`}
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
      <SheetContent side="right" className="w-[88vw] border-l border-white/[0.18] bg-[linear-gradient(180deg,#03070d,#000000)] p-0 text-white sm:max-w-md">
        <SheetHeader className="border-b border-white/[0.10] px-5 py-5 text-left">
          <SheetTitle className="text-left text-white">
            <Logo showText size={52} />
          </SheetTitle>
          <SheetDescription className="pt-2 text-left text-white/55">Wallet access, network routes and main chain entry points.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 py-5">
          <div className="grid gap-3">
            <InriLinkButton href={LIVE_WALLET_URL} external noTranslate>
              INRI Wallet
            </InriLinkButton>
            <InriLinkButton href={EXPLORER_URL} external variant="secondary" noTranslate>
              Explorer
            </InriLinkButton>
            <ConnectWalletButton compact />
          </div>

          <div className="grid gap-2">
            {[...inriNavItems, ...utilityNavItems].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                translate="no"
                className="notranslate rounded-[1rem] border-[1.45px] border-white/[0.14] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/84 transition hover:border-primary/50 hover:bg-primary/[0.10] hover:text-white"
                {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {item.label}
              </Link>
            ))}
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
            className="notranslate text-center text-[14px] font-extrabold uppercase tracking-[0.26em] text-white/92 sm:text-[15px]"
          >
            Mainnet • Proof-of-Work • Chain 3777
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12 2xl:px-16">
        <div className="grid h-[86px] grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-6 lg:h-[88px]">
          <div className="min-w-0 justify-self-start">
            <Logo showText size={48} />
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
            <InriLinkButton href={LIVE_WALLET_URL} external noTranslate>
              Wallet
            </InriLinkButton>
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

function FooterSocialIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] text-white/72 transition-all hover:-translate-y-px hover:border-primary/48 hover:bg-primary/[0.12] hover:text-white"
    >
      {children}
    </Link>
  )
}

export function InriFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-black">
      <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-14 px-4 py-16 sm:px-8 xl:px-12 2xl:px-16">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:gap-14">
          <div className="space-y-6">
            <Logo showText size={56} />
            <div className="max-w-2xl space-y-3">
              <p className="text-base font-semibold text-white/92">A black-and-blue gateway to the INRI mainnet.</p>
              <p className="max-w-[60ch] text-sm leading-7 text-white/58">
                Explore the wallet, pool, mining routes, explorer and whitepaper from one refined network surface.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <InriLinkButton href={LIVE_WALLET_URL} external noTranslate>
                INRI Wallet
              </InriLinkButton>
              <InriLinkButton href={EXPLORER_URL} external variant="secondary" noTranslate>
                Explorer
              </InriLinkButton>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:pl-10">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-primary">Main routes</p>
              <div className="mt-5 grid gap-3">
                {footerPrimaryLinks.map((link) => (
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

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-primary">Community</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <FooterSocialIcon key={link.label} href={link.href} label={link.label}>
                    {link.icon ? <link.icon className="h-4 w-4" /> : <span className="text-sm font-bold">{link.text}</span>}
                  </FooterSocialIcon>
                ))}
                <FooterSocialIcon href="mailto:contact@inri.life" label="Email">
                  <Mail className="h-4 w-4" />
                </FooterSocialIcon>
              </div>
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
