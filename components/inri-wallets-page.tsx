import type { ReactNode } from 'react'
import Link from 'next/link'
import { CheckCircle2, Download, ExternalLink, Layers3, Shield, Smartphone, Wallet2 } from 'lucide-react'
import { InriLinkButton } from '@/components/inri-site-shell'

type WalletItem = {
  name: string
  description: string
  logo: string
  tags: string[]
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}

const networkFields = [
  { label: 'Network name', value: 'INRI CHAIN' },
  { label: 'RPC URL', value: 'https://rpc.inri.life' },
  { label: 'Chain ID', value: '3777 (0xEC1)' },
  { label: 'Currency symbol', value: 'INRI' },
  { label: 'Block explorer URL', value: 'https://explorer.inri.life' },
] as const

const walletItems: WalletItem[] = [
  {
    name: 'MetaMask',
    description: 'Most used EVM wallet. Recommended for INRI CHAIN.',
    logo: 'https://raw.githubusercontent.com/inrichain/Metamask/main/metamask.png',
    tags: ['Chrome / Brave / Edge', 'Android', 'iOS'],
    primaryLabel: 'Official download',
    primaryHref: 'https://metamask.io/download/',
    secondaryLabel: 'Website / guide',
    secondaryHref: 'https://metamask.io/',
  },
  {
    name: 'Rabby Wallet',
    description: 'DeFi-focused browser wallet. Great for INRISWAP.',
    logo: 'https://raw.githubusercontent.com/inrichain/Rabby-Wallet/main/Rabby%20Wallet.png',
    tags: ['Chrome', 'Brave', 'Desktop'],
    primaryLabel: 'Official download',
    primaryHref: 'https://rabby.io/',
    secondaryLabel: 'Help center / guide',
    secondaryHref: 'https://support.rabby.io/hc/en-us',
  },
  {
    name: 'Trust Wallet',
    description: 'Mobile-first wallet. Great if you use only your phone.',
    logo: 'https://raw.githubusercontent.com/inrichain/Trust-Wallet/main/Trust%20Wallet.png',
    tags: ['Android', 'iOS', 'Extension'],
    primaryLabel: 'Official download',
    primaryHref: 'https://trustwallet.com/download',
    secondaryLabel: 'Website / guide',
    secondaryHref: 'https://trustwallet.com/',
  },
  {
    name: 'SafePal',
    description: 'Mobile + hardware wallet. Good if you want extra security.',
    logo: 'https://raw.githubusercontent.com/inrichain/SafePal/main/SafePal.png',
    tags: ['Android', 'iOS', 'Hardware'],
    primaryLabel: 'Download app',
    primaryHref: 'https://www.safepal.com/en/download',
    secondaryLabel: 'Website / guide',
    secondaryHref: 'https://www.safepal.com/',
  },
  {
    name: 'Coinbase Wallet',
    description: 'Standalone Web3 wallet with custom EVM network support.',
    logo: 'https://raw.githubusercontent.com/inrichain/Coinbase-Wallet/main/Coinbase%20Wallet.png',
    tags: ['Extension', 'Android', 'iOS'],
    primaryLabel: 'Official download',
    primaryHref: 'https://www.coinbase.com/wallet/downloads',
    secondaryLabel: 'Website / guide',
    secondaryHref: 'https://www.coinbase.com/wallet',
  },
  {
    name: 'Bitget Wallet',
    description: 'Multi-chain wallet with strong EVM and DeFi support.',
    logo: 'https://raw.githubusercontent.com/inrichain/Bitget-Wallet/main/Bitget%20Wallet.png',
    tags: ['Extension', 'Android', 'iOS'],
    primaryLabel: 'Official download',
    primaryHref: 'https://web3.bitget.com/en/wallet',
    secondaryLabel: 'Website / guide',
    secondaryHref: 'https://web3.bitget.com/en/wallet/download',
  },
  {
    name: 'Binance Web3 Wallet',
    description: 'Web3 wallet inside the Binance app with custom network support.',
    logo: 'https://raw.githubusercontent.com/inrichain/Binance-Web3-Wallet/main/Binance%20Web3%20Wallet.png',
    tags: ['Binance App', 'Android', 'iOS'],
    primaryLabel: 'Learn & enable',
    primaryHref: 'https://www.binance.com/en/web3wallet',
    secondaryLabel: 'Download app',
    secondaryHref: 'https://www.binance.com/en/download',
  },
  {
    name: 'OKX Web3 Wallet',
    description: 'Multi-chain Web3 wallet with support for EVM and custom networks.',
    logo: 'https://raw.githubusercontent.com/inrichain/OKX-Web3-Wallet/main/OKX%20Web3%20Wallet.png',
    tags: ['Extension', 'Android', 'iOS'],
    primaryLabel: 'Official download',
    primaryHref: 'https://www.okx.com/web3',
    secondaryLabel: 'Website / guide',
    secondaryHref: 'https://www.okx.com/web3/wallet',
  },
]

const quickHighlights = [
  {
    icon: <Wallet2 className="h-5 w-5" />,
    title: 'Official wallet route',
    text: 'Use INRI Wallet if you want the native project experience inside the ecosystem.',
  },
  {
    icon: <Layers3 className="h-5 w-5" />,
    title: 'Custom network ready',
    text: 'Every wallet on this page can be pointed to INRI CHAIN using the network values below.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Explorer-compatible',
    text: 'After setup, you can connect to Explorer, INRISWAP and the rest of the INRI routes.',
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: 'Desktop and mobile',
    text: 'Choose the wallet that fits your browser, phone or hardware setup best.',
  },
]

function QuickCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[1.45rem] border-[1.5px] border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/64">{text}</p>
    </div>
  )
}

export function InriWalletsPage() {
  return (
    <main className="bg-black text-white">
      <section className="inri-hero-surface bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_24%),radial-gradient(circle_at_85%_0%,rgba(19,164,255,0.08),transparent_22%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
        <div className="inri-page-container py-14 sm:py-18 xl:py-20">
          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.08fr)_430px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                Step 1 — Download your wallet
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.04] text-white sm:text-5xl xl:text-[4rem]">
                Choose a compatible wallet for <span className="text-primary">INRI CHAIN</span>.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                Download an official wallet, create your address and then add INRI CHAIN using the main RPC and explorer.
                This page keeps every supported route inside the same site so onboarding feels clear and professional.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                  Open INRI Wallet
                </InriLinkButton>
                <InriLinkButton href="/explorer" variant="secondary" noTranslate>
                  Open Explorer
                </InriLinkButton>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
                <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">RPC: https://rpc.inri.life</div>
                <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Explorer: https://explorer.inri.life</div>
                <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Chain ID: 3777 (0xEC1)</div>
              </div>
            </div>

            <div className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Manual setup</p>
              <h2 className="mt-3 text-2xl font-black text-white">Add INRI CHAIN manually.</h2>
              <p className="mt-3 text-sm leading-7 text-white/64">
                Use these values in MetaMask, Rabby, Coinbase Wallet, Bitget, OKX or any compatible EVM wallet.
              </p>

              <div className="mt-5 rounded-[1.5rem] border border-primary/18 bg-primary/[0.07] p-4">
                <ol className="space-y-2 text-sm leading-6 text-white/72">
                  <li>1. Open your wallet and go to <strong className="text-white">Settings → Networks</strong>.</li>
                  <li>2. Choose <strong className="text-white">Add network</strong> or <strong className="text-white">Add custom network</strong>.</li>
                  <li>3. Fill the fields below and save.</li>
                </ol>
              </div>

              <div className="mt-5 grid gap-3">
                {networkFields.map((field) => (
                  <div key={field.label} className="rounded-[1.15rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/44">{field.label}</div>
                    <div className="mt-1 text-sm font-bold text-white">{field.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="inri-page-container">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickHighlights.map((item) => (
              <QuickCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="inri-page-container">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Wallet directory</p>
              <h2 className="mt-2 text-3xl font-black text-white sm:text-[2.2rem]">Choose the wallet that fits your setup.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/62">
              Desktop, mobile and hardware-friendly options. Download, add INRI CHAIN and continue directly into explorer, swap or mining.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {walletItems.map((wallet) => (
              <article
                key={wallet.name}
                className="flex min-h-[290px] flex-col rounded-[1.8rem] border-[1.6px] border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/14 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={wallet.logo} alt={wallet.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{wallet.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/60">{wallet.description}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {wallet.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid gap-3">
                  <Link
                    href={wallet.primaryHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] px-4 text-[13px] font-extrabold text-black shadow-[0_14px_34px_rgba(19,164,255,0.28),inset_0_1px_0_rgba(255,255,255,0.52)] transition hover:-translate-y-px hover:brightness-105"
                  >
                    <Download className="h-4 w-4" />
                    {wallet.primaryLabel}
                  </Link>
                  <Link
                    href={wallet.secondaryHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-4 text-[13px] font-bold text-white shadow-[0_12px_26px_rgba(0,0,0,0.18)] transition hover:-translate-y-px hover:border-primary/55 hover:bg-primary/[0.10]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {wallet.secondaryLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-14 pt-6 sm:pb-18">
        <div className="inri-page-container">
          <div className="rounded-[2rem] border-[1.6px] border-white/12 bg-[linear-gradient(180deg,rgba(6,18,30,0.96),rgba(2,8,14,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.32)] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-center">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Next step</p>
                <h2 className="mt-2 text-3xl font-black text-white sm:text-[2.15rem]">Install, add the network and move directly into the ecosystem.</h2>
                <div className="mt-5 grid gap-3 text-sm leading-7 text-white/70">
                  <div className="flex items-start gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <p>After saving the network, switch to <strong className="text-white">INRI CHAIN</strong> inside your wallet.</p>
                  </div>
                  <div className="flex items-start gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <p>Open the <strong className="text-white">Explorer</strong> to verify balances, contracts and recent blocks.</p>
                  </div>
                  <div className="flex items-start gap-3 rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <p>Continue into <strong className="text-white">Mining</strong>, <strong className="text-white">Pool</strong> or <strong className="text-white">Swap</strong> without leaving the same site.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-primary/18 bg-primary/[0.07] p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Useful routes</p>
                <div className="mt-4 grid gap-3">
                  {[
                    { label: 'INRI Wallet', href: 'https://wallet.inri.life', external: true },
                    { label: 'Explorer', href: '/explorer' },
                    { label: 'Swap', href: '/swap' },
                    { label: 'Mining', href: '/mining' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between rounded-[1.1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-white transition hover:border-primary/35 hover:bg-black/30"
                    >
                      <span>{item.label}</span>
                      <span className="text-primary">↗</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
