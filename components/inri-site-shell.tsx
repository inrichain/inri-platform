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
  { label: 'Docs', href: '/whitepaper' },
]

const utilityNavItems: InriNavItem[] = [
  { label: 'Swap', href: '/swap' },
  { label: 'Factory', href: '/token-factory' },
  { label: 'P2P', href: '/p2p' },
]

const footerPrimaryLinks = [
  { label: 'INRI Wallet', href: '/inri-wallet' },
  { label: 'Wallets', href: '/wallets' },
  { label: 'Mining', href: '/mining' },
  { label: 'Pool', href: '/pool' },
  { label: 'Staking', href: '/staking' },
  { label: 'Swap', href: '/swap' },
  { label: 'Token Factory', href: '/token-factory' },
  { label: 'P2P', href: '/p2p' },
  { label: 'Whitepaper', href: '/whitepaper' },
  { label: 'Explorer', href: 'https://explorer.inri.life', external: true },
]

const socialLinks = [
  { label: 'X', href: 'https://x.com/inrichain', text: 'X' },
  { label: 'Instagram', href: 'https://www.instagram.com/inrichain/', icon: Instagram },
  { label: 'Telegram', href: 'https://t.me/+MQyCO6GXZJtmOTJh', icon: Send },
  { label: 'Discord', href: 'https://discord.gg/VuUCSTYJNe', text: 'Discord' },
  { label: 'GitHub', href: 'https://github.com/inrichain', icon: Github },
  { label: 'YouTube', href: 'https://www.youtube.com/@inrichain', icon: Youtube },
]

const navPillClass =
  'notranslate inline-flex h-12 shrink-0 items-center justify-center rounded-[1.15rem] border-[1.6px] border-transparent px-5 text-sm font-semibold text-white/80 transition-all hover:-translate-y-px hover:border-primary/32 hover:bg-primary/[0.08] hover:text-white'

function NavLink({ item }: { item: InriNavItem }) {
  return (
    <Link
      href={item.href}
      translate="no"
      className={navPillClass}
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
        <button
          translate="no"
          className={`${navPillClass} gap-2`}
        >
          More
          <ChevronDown className="h-4 w-4 text-white/55" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={14}
        className="w-60 rounded-[1.4rem] border-[1.5px] border-white/[0.14] bg-[linear-gradient(180deg,#040912,#000000)] p-2 text-white shadow-[0_28px_90px_rgba(0,0,0,0.52),0_0_0_1px_rgba(19,164,255,0.08)]"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Utility</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/[0.08]" />
        {utilityNavItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            asChild
            className="rounded-[1rem] px-3 py-3 text-sm font-semibold text-white/82 transition hover:bg-primary/[0.09] hover:text-white"
          >
            <Link href={item.href} translate="no" className="notranslate flex items-center justify-between gap-3">
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
      ? 'border-[1.7px] border-[#84dbff]/85 bg-[linear-gradient(135deg,#0896ef_0%,#22b2ff_54%,#8fe1ff_100%)] text-black shadow-[0_20px_60px_rgba(19,164,255,0.32),inset_0_1px_0_rgba(255,255,255,0.58)] hover:-translate-y-px hover:brightness-105'
      : variant === 'secondary'
        ? 'border-[1.6px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] text-white shadow-[0_18px_44px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-px hover:border-primary/55 hover:bg-primary/[0.10]'
        : 'text-white/78 hover:text-white'

  return (
    <Link
      href={href}
      translate={noTranslate ? 'no' : undefined}
      className={`inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[1.1rem] px-5 text-sm font-extrabold transition-all ${noTranslate ? 'notranslate' : ''} ${styles}`}
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
        <button className="inline-flex h-12 w-12 items-center justify-center rounded-[1.1rem] border-[1.6px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] text-white shadow-[0_18px_44px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-primary/55 hover:bg-primary/[0.10] lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] border-l border-white/[0.18] bg-[linear-gradient(180deg,#03070d,#000000)] p-0 text-white sm:max-w-md">
        <SheetHeader className="border-b border-white/[0.10] px-5 py-5 text-left">
          <SheetTitle className="text-left text-white">
            <Logo showText size={50} />
          </SheetTitle>
          <SheetDescription className="pt-2 text-left text-white/55">Wallet access, network routes and main chain entry points.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 py-5">
          <div className="grid gap-3">
            <InriLinkButton href="https://wallet.inri.life" external noTranslate>
              INRI Wallet
            </InriLinkButton>
            <InriLinkButton href="https://explorer.inri.life" variant="secondary" external noTranslate>
              Explorer
            </InriLinkButton>
            <ConnectWalletButton />
          </div>

          <div className="grid gap-2">
            {[...inriNavItems, ...utilityNavItems].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                translate="no"
                className="notranslate rounded-[1.1rem] border-[1.55px] border-white/[0.14] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/84 transition hover:border-primary/50 hover:bg-primary/[0.10] hover:text-white"
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
    <header className="sticky top-0 z-50 border-b border-white/[0.10] bg-black/94 backdrop-blur-2xl">
      <div className="border-b border-primary/14 bg-[linear-gradient(90deg,rgba(19,164,255,0.14),rgba(19,164,255,0.05),rgba(19,164,255,0.14))]">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2 sm:px-6 lg:px-8">
          <p translate="no" className="notranslate text-center text-[11px] font-extrabold uppercase tracking-[0.26em] text-white/68">
            Mainnet • Proof-of-Work • Chain 3777
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 xl:gap-6">
          <div className="shrink-0">
            <Logo showText size={58} />
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <div className="rounded-[1.85rem] border-[1.8px] border-white/[0.14] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] p-1.5 shadow-[0_24px_74px_rgba(0,0,0,0.36),0_0_0_1px_rgba(19,164,255,0.05),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <nav className="flex min-w-max items-center gap-1">
                {inriNavItems.map((item) => (
                  <NavLink key={item.label} item={item} />
                ))}
                <UtilityMenu />
              </nav>
            </div>
          </div>

          <div className="ml-auto hidden items-center gap-3 md:flex">
            <InriLinkButton href="https://explorer.inri.life" variant="secondary" external noTranslate>
              Explorer
            </InriLinkButton>
            <InriLinkButton href="https://wallet.inri.life" external noTranslate>
              INRI Wallet
            </InriLinkButton>
            <ConnectWalletButton />
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <InriLinkButton href="https://wallet.inri.life" external noTranslate>
              Wallet
            </InriLinkButton>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

function FooterSocialIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border-[1.4px] border-white/[0.20] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-3 text-white/84 transition hover:-translate-y-px hover:border-primary/60 hover:bg-primary/12 hover:text-white"
    >
      {children}
    </Link>
  )
}

export function InriFooter() {
  return (
    <footer className="border-t border-white/[0.12] bg-black">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.9fr_0.95fr]">
          <div>
            <Logo showText size={54} />
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/58">
              Community-driven Layer 1 with live blocks, mining access, low fees and direct network utility.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <FooterSocialIcon key={item.label} href={item.href} label={item.label}>
                    {item.text ? <span className="text-xs font-bold">{item.text}</span> : Icon ? <Icon className="h-5 w-5" /> : null}
                  </FooterSocialIcon>
                )
              })}
            </div>

            <Link href="mailto:contact@inri.life" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/82 transition hover:text-primary">
              <Mail className="h-4 w-4" />
              contact@inri.life
            </Link>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">Routes</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {footerPrimaryLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-white/70 transition hover:text-white"
                  {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">Legal</p>
            <div className="mt-5 grid gap-3">
              <Link href="/privacy-policy" className="text-sm text-white/70 transition hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="text-sm text-white/70 transition hover:text-white">
                Terms and Conditions
              </Link>
            </div>

            <div className="mt-8 rounded-[1.6rem] border-[1.45px] border-white/[0.16] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.20em] text-primary">Network utility</p>
              <p className="mt-3 text-sm leading-7 text-white/64">
                Wallet, explorer, mining, pool and staking should feel fast, clear and close to live network data.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.10] px-4 py-5 text-center text-xs text-white/42 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} INRI CHAIN. All rights reserved.
      </div>
    </footer>
  )
}

export function InriShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,95,180,0.16),transparent_24%),linear-gradient(180deg,#000000_0%,#01060c_24%,#000000_100%)] text-white">
      <InriHeader />
      {children}
      <InriFooter />
    </div>
  )
}
