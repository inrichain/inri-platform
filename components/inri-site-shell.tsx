import type { ReactNode } from 'react'
import Link from 'next/link'
import { Github, Instagram, Mail, Menu, Send, Youtube } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ConnectWalletButton } from '@/components/connect-wallet-button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export type InriNavItem = {
  label: string
  href: string
  external?: boolean
}

export const inriNavItems: InriNavItem[] = [
  { label: 'Wallets', href: '/wallets' },
  { label: 'Swap', href: '/swap' },
  { label: 'Factory', href: '/token-factory' },
  { label: 'Mining', href: '/mining' },
  { label: 'Pool', href: '/pool' },
  { label: 'Stake', href: '/staking' },
  { label: 'Docs', href: '/whitepaper' },
]

const footerPrimaryLinks = [
  { label: 'INRI Wallet', href: '/inri-wallet' },
  { label: 'Wallets', href: '/wallets' },
  { label: 'Swap', href: '/swap' },
  { label: 'Token Factory', href: '/token-factory' },
  { label: 'Mining', href: '/mining' },
  { label: 'Pool', href: '/pool' },
  { label: 'Staking', href: '/staking' },
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

function NavLink({ item }: { item: InriNavItem }) {
  return (
    <Link
      href={item.href}
      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="inline-flex h-11 shrink-0 items-center rounded-full border-[1.15px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-4 text-sm font-semibold text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-px hover:border-primary/45 hover:bg-primary/10 hover:text-white"
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
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  external?: boolean
}) {
  const styles =
    variant === 'primary'
      ? 'border border-[#7dd6ff]/70 bg-[linear-gradient(135deg,#0f9cff_0%,#39bcff_55%,#8fe4ff_100%)] text-black shadow-[0_18px_46px_rgba(19,164,255,0.32),inset_0_1px_0_rgba(255,255,255,0.5)] hover:-translate-y-px hover:brightness-105'
      : variant === 'secondary'
        ? 'border-[1.15px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-px hover:border-primary/45 hover:bg-primary/10'
        : 'text-white/78 hover:text-white'

  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-bold transition-all ${styles}`}
    >
      {children}
    </Link>
  )
}

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[1.15px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-primary/45 hover:bg-primary/10 lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] border-l border-white/[0.18] bg-[linear-gradient(180deg,#03070d,#000000)] p-0 text-white sm:max-w-md">
        <SheetHeader className="border-b border-white/[0.12] px-5 py-5 text-left">
          <SheetTitle className="text-left text-white">
            <Logo showText size={48} />
          </SheetTitle>
          <SheetDescription className="pt-2 text-left text-white/58">
            Wallet, explorer, mining and core network routes.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 py-5">
          <div className="grid gap-3">
            <InriLinkButton href="https://wallet.inri.life" external>
              INRI Wallet
            </InriLinkButton>
            <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
              Explorer
            </InriLinkButton>
            <ConnectWalletButton />
          </div>

          <div className="grid gap-2">
            {inriNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="rounded-[1.15rem] border-[1.15px] border-white/[0.16] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/78 transition hover:border-primary/45 hover:bg-primary/10 hover:text-white"
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
    <header className="sticky top-0 z-50 border-b border-white/[0.12] bg-black/90 backdrop-blur-xl">
      <div className="border-b border-primary/14 bg-[linear-gradient(90deg,rgba(19,164,255,0.14),rgba(19,164,255,0.04),rgba(19,164,255,0.14))]">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white/68">
            Mainnet • Proof-of-Work • Chain 3777
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <Logo showText size={58} />
          </div>

          <div className="hidden min-w-0 flex-1 lg:flex lg:justify-center">
            <div className="max-w-full rounded-full border-[1.15px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-1.5 shadow-[0_18px_42px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex min-w-max items-center gap-1 overflow-x-auto whitespace-nowrap pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {inriNavItems.map((item) => (
                  <NavLink key={item.label} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
              Explorer
            </InriLinkButton>
            <InriLinkButton href="https://wallet.inri.life" external>
              INRI Wallet
            </InriLinkButton>
            <ConnectWalletButton />
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <InriLinkButton href="https://wallet.inri.life" external>
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
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border-[1.15px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-3 text-white/82 transition hover:-translate-y-px hover:border-primary/45 hover:bg-primary/10 hover:text-white"
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
              Community-driven Layer 1 with low fees, mining access and direct network utility.
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
                  {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="text-sm text-white/70 transition hover:text-white"
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

            <div className="mt-8 rounded-[1.6rem] border-[1.15px] border-white/[0.14] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.20em] text-primary">Network focus</p>
              <p className="mt-3 text-sm leading-7 text-white/64">
                Wallet, mining, pool, staking and explorer should always feel one click away.
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,95,180,0.14),transparent_26%),linear-gradient(180deg,#000000_0%,#02070e_24%,#000000_100%)] text-white">
      <InriHeader />
      {children}
      <InriFooter />
    </div>
  )
}
