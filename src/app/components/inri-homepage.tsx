import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Blocks,
  BookOpenText,
  ExternalLink,
  Github,
  Globe,
  Hammer,
  Layers3,
  Mail,
  MessageCircle,
  Pickaxe,
  Shield,
  Wallet,
  Zap,
} from 'lucide-react'

const navLinks = [
  { label: 'Wallets', href: '/wallets', external: false },
  { label: 'Mining Windows', href: '/mining/windows', external: false },
  { label: 'Mining Ubuntu', href: '/mining/ubuntu', external: false },
  { label: 'Pool', href: '/pool', external: false },
  { label: 'Staking', href: '/staking', external: false },
  { label: 'Explorer', href: 'https://explorer.inri.life', external: true },
  { label: 'Whitepaper', href: '/whitepaper', external: false },
]

const ecosystemCards = [
  {
    title: 'Wallets',
    description: 'Official access points for the INRI ecosystem and user tools.',
    href: 'https://www.inri.life/wallets',
    icon: Wallet,
  },
  {
    title: 'Mining Windows',
    description: 'Step-by-step Windows CPU miner setup from the official INRI site.',
    href: 'https://www.inri.life/mining-windows',
    icon: Hammer,
  },
  {
    title: 'Mining Ubuntu',
    description: 'Official Ubuntu mining page for Linux users joining the network.',
    href: 'https://www.inri.life/mining-ubuntu',
    icon: Pickaxe,
  },
  {
    title: 'Pool',
    description: 'Direct access to pool mining information and ecosystem entry points.',
    href: 'https://www.inri.life/pool',
    icon: Layers3,
  },
  {
    title: 'Staking',
    description: 'Open the live staking section and move deeper into the ecosystem.',
    href: 'https://www.inri.life/staking',
    icon: Shield,
  },
  {
    title: 'Explorer',
    description: 'Inspect blocks, transactions, addresses and network activity.',
    href: 'https://www.inri.life/explorer',
    icon: Blocks,
  },
  {
    title: 'Whitepaper',
    description: 'Read the official overview and understand the project direction.',
    href: 'https://www.inri.life/whitepaper',
    icon: BookOpenText,
  },
]

const highlights = [
  {
    title: 'Proof-of-Work for everyone',
    text: 'The current INRI site positions the network around accessible PoW participation and community growth.',
    icon: Pickaxe,
  },
  {
    title: 'Community-driven Layer 1',
    text: 'The messaging stays centered on decentralization, low fees and sustainable growth for the network.',
    icon: Globe,
  },
  {
    title: 'Clear ecosystem access',
    text: 'This redesign brings wallet, mining, explorer, staking and whitepaper access together in one cleaner homepage.',
    icon: Zap,
  },
]

const quickStats = [
  { value: '3777', label: 'Chain ID' },
  { value: 'PoW', label: 'Consensus' },
  { value: '6000000', label: 'Fork block reminder' },
  { value: '24/7', label: 'Open network access' },
]

const faqs = [
  {
    question: 'What did this redesign keep from the current INRI site?',
    answer:
      'The structure keeps the same core ecosystem entry points already present today: Wallets, Mining Windows, Mining Ubuntu, Pool, Staking, Explorer and Whitepaper.',
  },
  {
    question: 'Why is the page focused on mining and ecosystem access?',
    answer:
      'Because the current INRI positioning emphasizes Proof-of-Work, decentralization, low fees and community-driven participation.',
  },
  {
    question: 'Can this be used as the new main site?',
    answer:
      'Yes. This version is already organized as a more premium homepage and can be expanded into dedicated subpages later if you want.',
  },
  {
    question: 'Can the old links stay live while the homepage improves?',
    answer:
      'Yes. The main cards and navigation can continue pointing to the current official INRI URLs until you replace each section with new internal pages.',
  },
]

const socialLinks = [
  { label: 'X', href: 'https://x.com/inrichain' },
  { label: 'Telegram', href: 'https://t.me/+MQyCO6GXZJtmOTJh' },
  { label: 'Discord', href: 'https://discord.com/invite/VuUCSTYJNe' },
  { label: 'GitHub', href: 'https://github.com/inrichain' },
]

function ExternalButton({ href, children, variant = 'primary' }: { href: string; children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' }) {
  const styles =
    variant === 'primary'
      ? 'bg-primary text-primary-foreground hover:bg-[#0ca2ff]'
      : variant === 'secondary'
        ? 'border border-white/15 bg-white/5 text-white hover:border-primary/50 hover:bg-primary/10'
        : 'text-white/70 hover:text-white'

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${styles}`}
    >
      {children}
      <ExternalLink className="h-4 w-4" />
    </Link>
  )
}

export function InriHomepage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(17,95,174,0.30),transparent_35%),linear-gradient(180deg,#040d19_0%,#081425_35%,#07111e_100%)] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061120]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/inri-logo.png" alt="INRI CHAIN" width={44} height={44} className="rounded-xl" priority />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/90">INRI CHAIN</p>
              <p className="text-xs text-white/60">Proof-of-Work for everyone</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 xl:flex">
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href} target="_blank" rel="noreferrer" className="text-sm text-white/70 transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ExternalButton href="https://www.inri.life/explorer" variant="secondary">Explorer</ExternalButton>
            <ExternalButton href="https://www.inri.life/wallets">Open ecosystem</ExternalButton>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,173,255,0.20),transparent_20%),radial-gradient(circle_at_80%_10%,rgba(0,99,204,0.25),transparent_25%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <Zap className="h-4 w-4" />
                Fork on block 6000000
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-balance sm:text-5xl lg:text-7xl">
                A premium homepage for a fair, community-driven PoW network.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                This adaptation keeps the current INRI focus on decentralization, low fees, sustainable Proof-of-Work mining and direct access to the ecosystem — but presents it with a cleaner, stronger, more professional front page.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ExternalButton href="https://www.inri.life/wallets">Wallets</ExternalButton>
                <ExternalButton href="https://www.inri.life/mining-windows" variant="secondary">Start mining</ExternalButton>
                <ExternalButton href="https://www.inri.life/whitepaper" variant="secondary">Read whitepaper</ExternalButton>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {quickStats.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                    <p className="text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-white/60">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle,rgba(0,128,255,0.18),transparent_70%)] blur-2xl" />
              <div className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/90">INRI ecosystem</p>
                    <h2 className="mt-2 text-2xl font-semibold">One cleaner control surface</h2>
                  </div>
                  <Image src="/inri-logo.png" alt="INRI logo" width={56} height={56} className="rounded-2xl" />
                </div>
                <div className="mt-6 grid gap-4">
                  {[
                    ['Wallets', 'Official ecosystem access'],
                    ['Explorer', 'Blocks, addresses and transactions'],
                    ['Mining', 'Windows and Ubuntu guides'],
                    ['Pool & Staking', 'Direct network participation'],
                  ].map(([title, subtitle]) => (
                    <div key={title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#081424] px-4 py-4">
                      <div>
                        <p className="font-medium text-white">{title}</p>
                        <p className="text-sm text-white/60">{subtitle}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-7 text-cyan-50/90">
                  Built to mirror the current INRI structure while upgrading the presentation, hierarchy and first impression.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" id="ecosystem">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/80">Core ecosystem</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl lg:text-5xl">The same INRI structure, reorganized to feel stronger.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-8 text-white/70 sm:text-base">
              The live site already exposes the main ecosystem paths. This version keeps them visible, but puts them into a modern layout that is easier to trust, scan and navigate.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ecosystemCards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.16)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-white/10"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/70">{card.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Open section
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="why-inri">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/80">Why this direction</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl lg:text-5xl">Less clutter. More trust. Better positioning for INRI.</h2>
              <p className="mt-6 text-base leading-8 text-white/70">
                Instead of a busy or improvised front page, this version pushes a cleaner hierarchy: strong hero, clearer ecosystem access, and messaging that matches the actual project instead of generic crypto filler.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-[#0a1627] p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8" id="start">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,34,0.95),rgba(8,19,38,0.8))] p-8 sm:p-10 lg:p-12">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/80">Getting started</p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">A clearer first path into INRI.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-8 text-white/70 sm:text-base">
                The current site is useful, but the first impression can be stronger. This sequence makes the main user journey feel intentional from the start.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Open wallets and official tools',
                  text: 'Keep the first step simple: wallet access, official links and the ecosystem entry points that already exist.',
                  href: 'https://www.inri.life/wallets',
                },
                {
                  step: '02',
                  title: 'Choose your mining path',
                  text: 'The live site already separates Windows and Ubuntu mining. This makes the journey easier to follow.',
                  href: 'https://www.inri.life/mining-windows',
                },
                {
                  step: '03',
                  title: 'Verify and go deeper',
                  text: 'Use explorer, whitepaper, pool and staking links to keep everything transparent and easy to validate.',
                  href: 'https://www.inri.life/explorer',
                },
              ].map((item) => (
                <div key={item.step} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-semibold leading-none text-primary/70">{item.step}</span>
                    <Link href={item.href} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-primary/40 hover:text-primary">
                      Open
                    </Link>
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="faq">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/80">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl lg:text-5xl">Questions this new version already answers better.</h2>
          </div>
          <div className="mx-auto grid max-w-4xl gap-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-6 ">
                <summary className="cursor-pointer list-none text-lg font-semibold text-white [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center justify-between gap-4">
                    <span>{faq.question}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition ">Open</span>
                  </div>
                </summary>
                <p className="mt-4 text-sm leading-8 text-white/70">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#040b14]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-3">
                <Image src="/inri-logo.png" alt="INRI CHAIN" width={42} height={42} className="rounded-xl" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/90">INRI CHAIN</p>
                  <p className="text-sm text-white/60">Building the Future of PoW</p>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-white/70">
                A stronger homepage concept for INRI, built around the same official sections already present on the live website: Wallets, Mining Windows, Mining Ubuntu, Pool, Staking, Explorer and Whitepaper.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                {socialLinks.map((item) => (
                  <Link key={item.label} href={item.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/70 transition hover:border-primary/40 hover:text-white">
                    {item.label === 'GitHub' ? <Github className="h-4 w-4" /> : item.label === 'Telegram' ? <MessageCircle className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Official links</p>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  {navLinks.slice(0, 4).map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} target="_blank" rel="noreferrer" className="transition hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">Contact</p>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  <li>
                    <Link href="mailto:contact@inri.life" className="inline-flex items-center gap-2 transition hover:text-white">
                      <Mail className="h-4 w-4" />
                      contact@inri.life
                    </Link>
                  </li>
                  <li>
                    <Link href="https://github.com/inrichain" target="_blank" rel="noreferrer" className="transition hover:text-white">
                      GitHub profile
                    </Link>
                  </li>
                  <li>
                    <Link href="https://x.com/inrichain" target="_blank" rel="noreferrer" className="transition hover:text-white">
                      X / Twitter
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 INRI CHAIN. All rights reserved.</p>
            <p>Custom homepage concept adapted around the current INRI site structure.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
