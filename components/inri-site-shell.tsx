import type { ReactNode } from 'react'
import Link from 'next/link'
import { Github, Instagram, Mail, Send, Shield, Youtube } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ConnectWalletButton } from '@/components/connect-wallet-button'

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
  { label: 'P2P', href: '/p2p' },
  { label: 'Docs', href: '/whitepaper' },
]

const footerPrimaryLinks = [
  { label: 'Wallet', href: '/inri-wallet' },
  { label: 'Wallets', href: '/wallets' },
  { label: 'Swap', href: '/swap' },
  { label: 'Factory', href: '/token-factory' },
  { label: 'Mining Windows', href: '/mining/windows' },
  { label: 'Mining Ubuntu', href: '/mining/ubuntu' },
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
      className="inline-flex h-11 shrink-0 items-center rounded-full border border-transparent px-4 text-sm font-semibold text-white/74 transition hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
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
      ? 'border border-primary/50 bg-primary text-black shadow-[0_16px_44px_rgba(19,164,255,0.22)] hover:bg-[#33b0ff] hover:shadow-[0_20px_54px_rgba(19,164,255,0.30)]'
      : variant === 'secondary'
        ? 'border border-white/[0.16] bg-white/[0.04] text-white hover:border-primary/45 hover:bg-primary/10 hover:shadow-[0_14px_40px_rgba(19,164,255,0.10)]'
        : 'text-white/75 hover:text-white'

  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition-all ${styles}`}
    >
      {children}
    </Link>
  )
}

function HeaderNav() {
  return (
    <div className="min-w-0 flex-1 xl:flex xl:justify-center">
      <div className="hidden xl:block max-w-full overflow-hidden rounded-full border border-white/[0.14] bg-white/[0.035] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex min-w-max items-center gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {inriNavItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function InriHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.12] bg-black/88 backdrop-blur-xl">
      <div className="border-b border-primary/15 bg-[linear-gradient(90deg,rgba(19,164,255,0.12),rgba(19,164,255,0.03),rgba(19,164,255,0.12))] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white/62 sm:px-6 lg:px-8">
        MAINNET • POW • CHAIN 3777
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="shrink-0">
          <Logo showText size={56} />
        </div>

        <HeaderNav />

        <div className="hidden items-center gap-3 md:flex">
          <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
            Explorer
          </InriLinkButton>
          <InriLinkButton href="https://wallet.inri.life" external>
            INRI Wallet
          </InriLinkButton>
          <ConnectWalletButton />
        </div>
      </div>

      <div className="xl:hidden border-t border-white/[0.12] bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {inriNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8 md:hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
            Explorer
          </InriLinkButton>
          <InriLinkButton href="https://wallet.inri.life" external>
            INRI Wallet
          </InriLinkButton>
          <ConnectWalletButton />
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
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border border-white/[0.16] bg-white/[0.04] px-3 text-white/80 transition hover:border-primary/45 hover:bg-primary/10 hover:text-white hover:shadow-[0_14px_34px_rgba(19,164,255,0.10)]"
    >
      {children}
    </Link>
  )
}

export function InriFooter() {
  return (
    <footer className="border-t border-white/[0.12] bg-black">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.85fr_0.95fr]">
          <div>
            <Logo showText size={54} />
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/58">
              A community-driven Layer 1 built for real mining, low fees and direct network use.
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

            <Link
              href="mailto:contact@inri.life"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/82 transition hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              contact@inri.life
            </Link>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/82">Explore</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {footerPrimaryLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="text-sm text-white/64 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/82">Why INRI</p>
            <div className="mt-5 rounded-[1.75rem] border border-white/[0.16] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">
                <Shield className="h-4 w-4" />
                Real utility
              </p>
              <p className="mt-4 text-sm leading-7 text-white/62">
                The homepage should lead people into the wallet, explorer, mining, pool and staking with less noise and more trust.
              </p>
              <div className="mt-6 grid gap-3 text-sm">
                <Link href="/privacy-policy" className="text-white/64 transition hover:text-white">
                  Privacy Policy
                </Link>
                <Link href="/terms-and-conditions" className="text-white/64 transition hover:text-white">
                  Terms and Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/42 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} INRI CHAIN. All rights reserved.
      </div>
    </footer>
  )
}

export function InriShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_-10%,rgba(19,164,255,0.22),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(19,164,255,0.12),transparent_18%),linear-gradient(180deg,#000000_0%,#02060c_32%,#000000_100%)] text-white">
      <InriHeader />
      {children}
      <InriFooter />
    </div>
  )
}
