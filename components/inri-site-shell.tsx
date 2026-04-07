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
      className="rounded-full px-3 py-2 text-sm font-semibold text-white/72 transition hover:bg-white/[0.05] hover:text-white"
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
      ? 'border border-primary/30 bg-primary text-[#03111f] hover:bg-[#27adff] hover:shadow-[0_16px_40px_rgba(19,164,255,0.28)]'
      : variant === 'secondary'
        ? 'border border-white/12 bg-white/[0.04] text-white hover:border-primary/35 hover:bg-primary/10'
        : 'text-white/75 hover:text-white'

  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all ${styles}`}
    >
      {children}
    </Link>
  )
}

export function InriHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050d17]/88 backdrop-blur-xl">
      <div className="border-b border-white/8 bg-[linear-gradient(90deg,rgba(19,164,255,0.12),rgba(19,164,255,0.04),rgba(19,164,255,0.12))] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white/72 sm:px-6 lg:px-8">
        INRI CHAIN · Proof-of-Work for everyone · Chain ID 3777
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo showText size={62} />

        <div className="hidden xl:flex min-w-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] p-1">
          {inriNavItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
            Explorer
          </InriLinkButton>
          <InriLinkButton href="https://wallet.inri.life" external>
            INRI Wallet
          </InriLinkButton>
          <ConnectWalletButton />
        </div>
      </div>

      <div className="xl:hidden border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {inriNavItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </div>
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8 md:hidden">
          <InriLinkButton href="https://explorer.inri.life" variant="secondary" external>
            Explorer
          </InriLinkButton>
          <InriLinkButton href="https://wallet.inri.life" external>
            INRI Wallet
          </InriLinkButton>
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
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-white/80 transition hover:border-primary/35 hover:bg-primary/10 hover:text-white"
    >
      {children}
    </Link>
  )
}

export function InriFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#040a13]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.9fr_0.95fr]">
          <div>
            <Logo showText size={58} />
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/64">
              A fair, community-driven Layer 1 blockchain built for decentralization, low fees and sustainable Proof-of-Work mining.
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
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/82">Ecosystem</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {footerPrimaryLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="text-sm text-white/68 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/82">Brand direction</p>
            <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">
                <Shield className="h-4 w-4" />
                Cleaner and stronger
              </p>
              <p className="mt-4 text-sm leading-7 text-white/66">
                The site should feel premium and useful at the same time: one strong hero, one refined live section and clear routes into the real INRI products.
              </p>
              <div className="mt-6 grid gap-3 text-sm">
                <Link href="/privacy-policy" className="text-white/68 transition hover:text-white">
                  Privacy Policy
                </Link>
                <Link href="/terms-and-conditions" className="text-white/68 transition hover:text-white">
                  Terms and Conditions
                </Link>
              </div>
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.18),transparent_28%),linear-gradient(180deg,#040b14_0%,#07111d_36%,#050d17_100%)] text-white">
      <InriHeader />
      {children}
      <InriFooter />
    </div>
  )
}
