import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  Github,
  Instagram,
  Mail,
  MessageCircle,
  Send,
  Shield,
  Youtube,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { WalletConnectButton } from '@/components/wallet-connect'

export type InriNavItem = {
  label: string
  href: string
  external?: boolean
}

export const inriNavItems: InriNavItem[] = [
  { label: 'Wallets', href: '/wallets' },
  { label: 'Swap', href: '/swap' },
  { label: 'Token Factory', href: '/token-factory' },
  { label: 'Mining', href: '/mining' },
  { label: 'Pool', href: '/pool' },
  { label: 'Staking', href: '/staking' },
  { label: 'P2P', href: '/p2p' },
  { label: 'Whitepaper', href: '/whitepaper' },
]

const footerPrimaryLinks = [
  { label: 'INRI Wallet', href: '/inri-wallet' },
  { label: 'Wallets', href: '/wallets' },
  { label: 'Swap', href: '/swap' },
  { label: 'Token Factory', href: '/token-factory' },
  { label: 'Mining Windows', href: '/mining/windows' },
  { label: 'Mining Ubuntu', href: '/mining/ubuntu' },
  { label: 'Pool', href: '/pool' },
  { label: 'Staking', href: '/staking' },
  { label: 'P2P', href: '/p2p' },
  { label: 'Whitepaper', href: '/whitepaper' },
  { label: 'Explorer', href: 'https://explorer.inri.life', external: true },
]

const socialLinks = [
  { label: 'X', href: 'https://x.com/inrichain', icon: MessageCircle },
  { label: 'Instagram', href: 'https://www.instagram.com/inrichain/', icon: Instagram },
  { label: 'Telegram', href: 'https://t.me/+MQyCO6GXZJtmOTJh', icon: Send },
  { label: 'Discord', href: 'https://discord.com/invite/VuUCSTYJNe', icon: MessageCircle },
  { label: 'GitHub', href: 'https://github.com/inrichain', icon: Github },
  { label: 'YouTube', href: 'https://www.youtube.com/@inrichain', icon: Youtube },
]

function NavLink({ item }: { item: InriNavItem }) {
  return (
    <Link
      href={item.href}
      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="text-sm font-medium text-white/72 transition hover:text-white"
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
      ? 'bg-primary text-primary-foreground hover:bg-[#1bb0ff]'
      : variant === 'secondary'
        ? 'border border-white/15 bg-white/5 text-white hover:border-primary/50 hover:bg-primary/10'
        : 'text-white/75 hover:text-white'

  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all ${styles}`}
    >
      {children}
      {external ? <ExternalLink className="h-4 w-4" /> : null}
    </Link>
  )
}

export function InriHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061120]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo showText />

        <nav className="hidden xl:flex items-center gap-6">
          {inriNavItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
          <Link
            href="https://explorer.inri.life"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-white/72 transition hover:text-white"
          >
            Explorer
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
            Explorer
          </InriLinkButton>
          <WalletConnectButton />
        </div>
      </div>

      <div className="xl:hidden border-t border-white/10">
        <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {inriNavItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
          <Link
            href="https://explorer.inri.life"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-sm font-medium text-white/72 transition hover:text-white"
          >
            Explorer
          </Link>
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
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:border-primary/40 hover:bg-primary/10 hover:text-white"
    >
      {children}
    </Link>
  )
}

export function InriFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#040b14]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <div>
            <Logo showText />
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">
              INRI CHAIN is a community-driven Proof-of-Work Layer 1 focused on low fees,
              sustainable mining, ecosystem access and a cleaner experience for real users.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <FooterSocialIcon key={item.label} href={item.href} label={item.label}>
                    {item.label === 'X' ? <span className="text-lg font-bold">X</span> : <Icon className="h-5 w-5" />}
                  </FooterSocialIcon>
                )
              })}
            </div>

            <Link
              href="mailto:contact@inri.life"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/85 transition hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              contact@inri.life
            </Link>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">
              Ecosystem
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">
              Legal
            </p>
            <div className="mt-5 grid gap-3">
              <Link href="/privacy-policy" className="text-sm text-white/70 transition hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="text-sm text-white/70 transition hover:text-white">
                Terms and Conditions
              </Link>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-primary/15 bg-primary/10 p-5">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">
                <Shield className="h-4 w-4" />
                Brand direction
              </p>
              <p className="mt-3 text-sm leading-7 text-white/75">
                The new site is meant to feel cleaner, more product-focused and more trustworthy,
                while keeping the current INRI ecosystem structure visible.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/45 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} INRI CHAIN. All rights reserved.
      </div>
    </footer>
  )
}

export function InriShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(17,95,174,0.26),transparent_35%),linear-gradient(180deg,#030914_0%,#071221_40%,#07111e_100%)] text-white">
      <InriHeader />
      {children}
      <InriFooter />
    </div>
  )
}
