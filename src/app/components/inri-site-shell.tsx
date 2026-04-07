import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, MessageCircle, Send, Github } from "lucide-react"

export type InriNavItem = {
  label: string
  href: string
  external?: boolean
}

export const inriNavItems: InriNavItem[] = [
  { label: "INRI Wallet", href: "/inri-wallet" },
  { label: "Mining Windows", href: "/mining/windows" },
  { label: "Mining Ubuntu", href: "/mining/ubuntu" },
  { label: "Pool", href: "/pool" },
  { label: "Staking", href: "/staking" },
  { label: "P2P", href: "/p2p" },
  { label: "Explorer", href: "https://explorer.inri.life", external: true },
  { label: "Whitepaper", href: "/whitepaper" },
]

const socialLinks = [
  { label: "Telegram", href: "https://t.me/+MQyCO6GXZJtmOTJh", icon: Send },
  { label: "X", href: "https://x.com/inrichain", icon: MessageCircle },
  { label: "GitHub", href: "https://github.com/inrichain", icon: Github },
]

export function InriBrand() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      <Image
        src="/inri-logo.png"
        alt="INRI CHAIN"
        width={44}
        height={44}
        priority
        className="h-11 w-11 shrink-0 object-contain"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold uppercase tracking-[0.22em] text-primary sm:tracking-[0.28em]">
          INRI CHAIN
        </p>
        <p className="truncate text-xs text-white/60">
          Proof-of-Work for everyone
        </p>
      </div>
    </Link>
  )
}

export function InriLinkButton({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  external?: boolean
}) {
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-[#149dff]"
      : variant === "secondary"
        ? "border border-white/15 bg-white/5 text-white hover:border-primary/50 hover:bg-primary/10"
        : "text-white/75 hover:text-white"

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all ${styles}`}
    >
      {children}
      {external && <ExternalLink className="h-4 w-4" />}
    </Link>
  )
}

export function InriHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061120]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <InriBrand />

        <nav className="hidden xl:flex items-center gap-6">
          {inriNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <InriLinkButton
            href="https://explorer.inri.life"
            variant="secondary"
            external
          >
            Explorer
          </InriLinkButton>
          <InriLinkButton href="/inri-wallet">Open ecosystem</InriLinkButton>
        </div>
      </div>

      <div className="xl:hidden border-t border-white/10">
        <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {inriNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="shrink-0 text-sm font-medium text-white/70 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

export function InriFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050d18]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <InriBrand />
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">
            INRI CHAIN is a community-driven Proof-of-Work Layer 1 focused on low fees,
            accessible ecosystem tools and a stronger experience for real users.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">
            Navigation
          </p>
          <div className="mt-5 grid gap-3">
            {inriNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="text-sm text-white/70 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">
            Community
          </p>
          <div className="mt-5 grid gap-3">
            {socialLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(17,95,174,0.30),transparent_35%),linear-gradient(180deg,#040d19_0%,#081425_35%,#07111e_100%)] text-white">
      <InriHeader />
      {children}
      <InriFooter />
    </div>
  )
}
