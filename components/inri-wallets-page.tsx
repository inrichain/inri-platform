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

type NetworkField = {
  label: string
  value: string
  span?: 'full'
}

const networkFields: NetworkField[] = [
  { label: 'Network name', value: 'INRI CHAIN' },
  { label: 'RPC URL', value: 'https://rpc.inri.life' },
  { label: 'Chain ID', value: '3777 (0xEC1)' },
  { label: 'Currency symbol', value: 'INRI' },
  { label: 'Block explorer URL', value: 'https://explorer.inri.life', span: 'full' },
]

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
    text: 'Use INRI Wallet if you want the native project experience.',
  },
  {
    icon: <Layers3 className="h-5 w-5" />,
    title: 'Custom network ready',
    text: 'Every wallet here can connect to INRI CHAIN.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Explorer-compatible',
    text: 'After setup, connect to explorer and ecosystem tools.',
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: 'Desktop and mobile',
    text: 'Choose the wallet that best fits your device.',
  },
]

function QuickCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="inri-v2-feature p-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-2.5 text-[14px] font-bold text-white">{title}</h3>
      <p className="mt-1 text-[13px] leading-6 text-white/64">{text}</p>
    </div>
  )
}

export function InriWalletsPage() {
  return (
    <main className="inri-site-v2">
      <section className="inri-v2-hero">
        <div className="inri-page-container py-10 sm:py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.46fr)] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2.5">
                <span className="inri-chip text-primary">Wallets</span>
                <span className="inri-chip">Onboarding</span>
                <span className="inri-chip">Chain 3777</span>
              </div>
              <h1 className="mt-6 max-w-5xl text-balance text-[2.4rem] font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-[3.4rem] lg:text-[5rem]">
                Choose a wallet and enter the INRI network.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg sm:leading-9">
                Install a compatible EVM wallet, add INRI CHAIN and continue into explorer, mining, staking, P2P and token creation from the same official site.
              </p>

              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                  Open INRI Wallet
                </InriLinkButton>
                <InriLinkButton href="https://explorer.inri.life" external variant="secondary" noTranslate>
                  Open Explorer
                </InriLinkButton>
              </div>
            </div>

            <div className="inri-v2-card p-5 sm:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Network setup</p>
              <h2 className="mt-3 text-2xl font-black text-white">Add INRI manually.</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Use these values in MetaMask, Rabby, Trust Wallet, OKX, Bitget, Coinbase Wallet or any EVM-compatible wallet.
              </p>
              <div className="mt-5 grid gap-3">
                {networkFields.map((field) => (
                  <div
                    key={field.label}
                    className="inri-v2-feature px-4 py-3"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">{field.label}</div>
                    <div className="mt-1 break-all text-sm font-black text-white">{field.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickHighlights.map((item) => (
              <QuickCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="inri-page-container">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Wallet directory</p>
              <h2 className="mt-2 text-3xl font-black text-white sm:text-[2.35rem]">Supported wallet options</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/58">
              The cards below stay compact and consistent with the rest of the site: install, add INRI CHAIN and continue.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {walletItems.map((wallet) => (
              <article key={wallet.name} className="inri-v2-card flex min-h-[250px] flex-col p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/14 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={wallet.logo} alt={wallet.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{wallet.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/58">{wallet.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {wallet.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto grid gap-3 pt-5">
                  <Link href={wallet.primaryHref} target="_blank" rel="noreferrer" className="inri-button-primary text-sm">
                    <Download className="h-4 w-4" />
                    {wallet.primaryLabel}
                  </Link>
                  <Link href={wallet.secondaryHref} target="_blank" rel="noreferrer" className="inri-button-secondary text-sm">
                    <ExternalLink className="h-4 w-4" />
                    {wallet.secondaryLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-14 pt-2">
        <div className="inri-page-container">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              'Create or import a wallet and save your seed phrase offline.',
              'Add INRI CHAIN with RPC https://rpc.inri.life and Chain ID 3777.',
              'Open explorer, mining, staking or the P2P market from the same site.',
            ].map((text) => (
              <div key={text} className="inri-v2-card flex items-start gap-3 p-5">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-7 text-white/68">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
