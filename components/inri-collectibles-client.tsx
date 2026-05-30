'use client'

import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Coins,
  Copy,
  ExternalLink,
  Filter,
  Gem,
  Globe2,
  ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { Contract, Interface, JsonRpcProvider, formatUnits } from 'ethers'
import {
  CREATOR_WALLET,
  IUSD_ADDRESS,
  INRI_COLLECTIBLES_CONTRACT,
  INRI_EXPLORER_URL,
  INRI_RPC_URL,
  LIQUIDITY_RECEIVER,
  collectibleCountries,
  imageUrlForCountry,
  rarityBands,
  rarityForSerial,
  rewardForSerial,
  type CollectibleCountry,
} from '@/lib/inri-collectibles'
import {
  getErrorMessage,
  isInriChain,
  readActiveWalletSnapshot,
  requestFromActiveWallet,
  toHex,
  type EthereumProvider,
} from '@/lib/inri-active-wallet'

const IUSD_DECIMALS = 6
const MINT_PRICE = 5_000_000n
const CREATOR_FEE = 250_000n
const LIQUIDITY_AMOUNT = 4_750_000n

const nftAbi = [
  'function countryInfo(uint256) view returns (string countryName,string countryCode,string memeName,string imageURI,address rewardToken,bool active,bool metadataFrozen,uint16 nextSerial,uint16 mintedPublic,uint16 remainingPublic)',
  'function nextTokenPreview(uint256) view returns (uint256 tokenId,uint16 serial,string rarity,uint256 rewardAmount,bool soldOut)',
  'function mintCountry(uint256) returns (uint256)',
]

const erc20Abi = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
]

const rpc = new JsonRpcProvider(INRI_RPC_URL)
const nftRead = new Contract(INRI_COLLECTIBLES_CONTRACT, nftAbi, rpc)
const iusdRead = new Contract(IUSD_ADDRESS, erc20Abi, rpc)
const nftIface = new Interface(nftAbi)
const erc20Iface = new Interface(erc20Abi)

type WalletState = {
  provider: EthereumProvider | null
  account: string | null
  chainId: string | null
  ready: boolean
}

type ChainCountryState = {
  exists: boolean
  active: boolean
  rewardToken: string
  nextSerial: number
  mintedPublic: number
  remainingPublic: number
  previewTokenId: string
  previewSerial: number
  previewRarity: string
  previewReward: string
  soldOut: boolean
  loading: boolean
}

type UserState = {
  balance: bigint
  allowance: bigint
}

const emptyWallet: WalletState = { provider: null, account: null, chainId: null, ready: false }
const emptyUser: UserState = { balance: 0n, allowance: 0n }

function shortAddress(value: string) {
  if (!value) return ''
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function formatIusd(value: bigint) {
  return Number(formatUnits(value, IUSD_DECIMALS)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function getImageFallback(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget
  if (!img.src.includes('/nft-assets/countries/placeholder.svg')) {
    img.src = '/nft-assets/countries/placeholder.svg'
  }
}

function StatusPill({ children, tone = 'cyan' }: { children: React.ReactNode; tone?: 'cyan' | 'green' | 'gold' | 'gray' | 'red' }) {
  const cls =
    tone === 'green'
      ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100'
      : tone === 'gold'
        ? 'border-amber-300/30 bg-amber-400/10 text-amber-100'
        : tone === 'gray'
          ? 'border-white/12 bg-white/[0.045] text-white/64'
          : tone === 'red'
            ? 'border-red-300/30 bg-red-500/10 text-red-100'
            : 'border-primary/30 bg-primary/10 text-cyan-100'

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${cls}`}>{children}</span>
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/[0.10] bg-white/[0.04] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.20)] backdrop-blur-xl">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-black text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm font-semibold text-white/55">{note}</p>
    </div>
  )
}

function CountryCard({
  country,
  state,
  busyCountryId,
  onMint,
}: {
  country: CollectibleCountry
  state?: ChainCountryState
  busyCountryId: number | null
  onMint: (country: CollectibleCountry) => void
}) {
  const live = Boolean(state?.exists && state.active)
  const soldOut = Boolean(state?.soldOut || state?.remainingPublic === 0)
  const loading = state?.loading
  const nextSerial = state?.previewSerial || 1
  const rarity = state?.previewRarity || rarityForSerial(nextSerial)
  const reward = state?.previewReward || rewardForSerial(nextSerial)
  const progress = state?.mintedPublic ? Math.min(100, (state.mintedPublic / 500) * 100) : 0
  const busy = busyCountryId === country.countryId

  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-white/[0.10] bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.025))] shadow-[0_22px_70px_rgba(0,0,0,0.30)] transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_85px_rgba(19,164,255,0.10)]">
      <div className="relative aspect-square overflow-hidden bg-[#03070d]">
        <img
          src={imageUrlForCountry(country.slug)}
          alt={`${country.countryName} ${country.memeName}`}
          onError={getImageFallback}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.42))]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <StatusPill tone={live ? 'green' : 'gray'}>{live ? 'Live' : 'Soon'}</StatusPill>
          <StatusPill tone="gold">{country.countryCode}</StatusPill>
        </div>
        <div className="absolute bottom-3 left-3 right-3 rounded-[1rem] border border-white/[0.13] bg-black/62 p-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-white">{country.countryName}</h3>
              <p className="truncate text-sm font-bold text-primary">{country.memeName}</p>
            </div>
            <div className="shrink-0 rounded-[0.8rem] border border-white/10 bg-white/10 px-2.5 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">Next</p>
              <p className="text-sm font-black text-white">#{nextSerial}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[1rem] border border-white/[0.08] bg-black/25 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Rarity</p>
            <p className="mt-1 text-sm font-black text-white">{loading ? 'Loading...' : soldOut ? 'Sold out' : rarity}</p>
          </div>
          <div className="rounded-[1rem] border border-white/[0.08] bg-black/25 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Reward</p>
            <p className="mt-1 text-sm font-black text-white">{soldOut ? '—' : `${reward} ${country.countryCode}`}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/52">
            <span>{state?.mintedPublic ?? 0} / 500 minted</span>
            <span>{state?.remainingPublic ?? 500} left</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#13a4ff,#f7c843)]" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onMint(country)}
          disabled={!live || soldOut || busy}
          className={`mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] px-4 text-sm font-black transition-all ${
            live && !soldOut
              ? 'bg-primary text-black shadow-[0_16px_40px_rgba(19,164,255,0.20)] hover:-translate-y-px hover:bg-white'
              : 'cursor-not-allowed border border-white/[0.10] bg-white/[0.04] text-white/45'
          }`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : live ? <Zap className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          {busy ? 'Processing...' : live ? 'Mint for 5 iUSD' : 'Coming soon'}
        </button>
      </div>
    </article>
  )
}

export function InriCollectiblesClient() {
  const [wallet, setWallet] = useState<WalletState>(emptyWallet)
  const [user, setUser] = useState<UserState>(emptyUser)
  const [states, setStates] = useState<Record<number, ChainCountryState>>({})
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('All')
  const [onlyLive, setOnlyLive] = useState(false)
  const [busyCountryId, setBusyCountryId] = useState<number | null>(null)
  const [notice, setNotice] = useState<{ type: 'ok' | 'warn' | 'error'; text: string; hash?: string } | null>(null)

  const refreshWallet = useCallback(async () => {
    const snapshot = await readActiveWalletSnapshot()
    setWallet({ provider: snapshot.provider, account: snapshot.account, chainId: snapshot.chainId, ready: snapshot.providerReady })
  }, [])

  const refreshUser = useCallback(async (account?: string | null) => {
    if (!account) {
      setUser(emptyUser)
      return
    }

    try {
      const [balance, allowance] = await Promise.all([
        iusdRead.balanceOf(account) as Promise<bigint>,
        iusdRead.allowance(account, INRI_COLLECTIBLES_CONTRACT) as Promise<bigint>,
      ])
      setUser({ balance, allowance })
    } catch {
      setUser(emptyUser)
    }
  }, [])

  const refreshCountries = useCallback(async () => {
    const loadingState = Object.fromEntries(
      collectibleCountries.map((country) => [
        country.countryId,
        {
          exists: false,
          active: false,
          rewardToken: '',
          nextSerial: 1,
          mintedPublic: 0,
          remainingPublic: 500,
          previewTokenId: '',
          previewSerial: 1,
          previewRarity: rarityForSerial(1),
          previewReward: rewardForSerial(1),
          soldOut: false,
          loading: true,
        } satisfies ChainCountryState,
      ]),
    ) as Record<number, ChainCountryState>

    setStates((current) => ({ ...loadingState, ...current }))

    const entries = await Promise.all(
      collectibleCountries.map(async (country) => {
        try {
          const info = (await nftRead.countryInfo(country.countryId)) as unknown as [string, string, string, string, string, boolean, boolean, bigint, bigint, bigint]
          const preview = (await nftRead.nextTokenPreview(country.countryId)) as unknown as [bigint, bigint, string, bigint, boolean]
          return [
            country.countryId,
            {
              exists: true,
              active: Boolean(info[5]),
              rewardToken: String(info[4]),
              nextSerial: Number(info[7]),
              mintedPublic: Number(info[8]),
              remainingPublic: Number(info[9]),
              previewTokenId: preview[0].toString(),
              previewSerial: Number(preview[1]),
              previewRarity: String(preview[2]),
              previewReward: formatUnits(preview[3], 18),
              soldOut: Boolean(preview[4]),
              loading: false,
            } satisfies ChainCountryState,
          ] as const
        } catch {
          return [
            country.countryId,
            {
              exists: false,
              active: false,
              rewardToken: '',
              nextSerial: 1,
              mintedPublic: 0,
              remainingPublic: 500,
              previewTokenId: '',
              previewSerial: 1,
              previewRarity: rarityForSerial(1),
              previewReward: rewardForSerial(1),
              soldOut: false,
              loading: false,
            } satisfies ChainCountryState,
          ] as const
        }
      }),
    )

    setStates(Object.fromEntries(entries))
  }, [])

  useEffect(() => {
    refreshWallet()
    refreshCountries()
  }, [refreshWallet, refreshCountries])

  useEffect(() => {
    refreshUser(wallet.account)
  }, [wallet.account, refreshUser])

  const regions = useMemo(() => ['All', ...Array.from(new Set(collectibleCountries.map((country) => country.region)))], [])

  const filteredCountries = useMemo(() => {
    const clean = query.trim().toLowerCase()
    return collectibleCountries.filter((country) => {
      const state = states[country.countryId]
      const matchesSearch = !clean || `${country.countryName} ${country.countryCode} ${country.memeName} ${country.region}`.toLowerCase().includes(clean)
      const matchesRegion = region === 'All' || country.region === region
      const matchesLive = !onlyLive || Boolean(state?.exists && state.active)
      return matchesSearch && matchesRegion && matchesLive
    })
  }, [query, region, onlyLive, states])

  const liveCount = useMemo(() => collectibleCountries.filter((country) => states[country.countryId]?.exists).length, [states])
  const mintedCount = useMemo(() => collectibleCountries.reduce((total, country) => total + (states[country.countryId]?.mintedPublic || 0), 0), [states])

  async function ensureConnected() {
    let current = await readActiveWalletSnapshot()
    let provider = current.provider

    if (!provider && typeof window !== 'undefined') {
      provider = (window as Window & { ethereum?: EthereumProvider }).ethereum || null
    }

    if (!provider) throw new Error('Connect MetaMask or INRI Wallet first.')

    if (!current.account) {
      await requestFromActiveWallet(provider, 'eth_requestAccounts')
      current = await readActiveWalletSnapshot()
    }

    if (!isInriChain(current.chainId)) {
      try {
        await requestFromActiveWallet(provider, 'wallet_switchEthereumChain', [{ chainId: '0xec1' }])
      } catch {
        await requestFromActiveWallet(provider, 'wallet_addEthereumChain', [
          {
            chainId: '0xec1',
            chainName: 'INRI CHAIN',
            nativeCurrency: { name: 'INRI', symbol: 'INRI', decimals: 18 },
            rpcUrls: ['https://rpc.inri.life'],
            blockExplorerUrls: ['https://explorer.inri.life'],
          },
        ])
      }
      current = await readActiveWalletSnapshot()
    }

    if (!current.account) throw new Error('Wallet connected, but no account was returned.')

    setWallet({ provider, account: current.account, chainId: current.chainId, ready: true })
    return { provider, account: current.account }
  }

  async function waitTx(hash: string) {
    try {
      await rpc.waitForTransaction(hash, 1, 120_000)
    } catch {
      // Wallet already submitted the transaction; if RPC wait times out, user can still check explorer.
    }
  }

  async function mintCountry(country: CollectibleCountry) {
    setNotice(null)
    setBusyCountryId(country.countryId)

    try {
      const state = states[country.countryId]
      if (!state?.exists || !state.active) throw new Error(`${country.countryName} is not live on-chain yet.`)
      if (state.soldOut || state.remainingPublic === 0) throw new Error(`${country.countryName} is sold out.`)

      const { provider, account } = await ensureConnected()
      const [balance, allowance] = await Promise.all([
        iusdRead.balanceOf(account) as Promise<bigint>,
        iusdRead.allowance(account, INRI_COLLECTIBLES_CONTRACT) as Promise<bigint>,
      ])

      if (balance < MINT_PRICE) throw new Error(`You need 5 iUSD to mint. Current balance: ${formatIusd(balance)} iUSD.`)

      if (allowance < MINT_PRICE) {
        setNotice({ type: 'warn', text: 'Step 1/2: approve 5 iUSD for the NFT contract.' })
        const approveData = erc20Iface.encodeFunctionData('approve', [INRI_COLLECTIBLES_CONTRACT, MINT_PRICE])
        const approveHash = (await requestFromActiveWallet(provider, 'eth_sendTransaction', [
          { from: account, to: IUSD_ADDRESS, data: approveData, value: '0x0' },
        ])) as string
        setNotice({ type: 'warn', text: 'Approval sent. Waiting for confirmation...', hash: approveHash })
        await waitTx(approveHash)
      }

      setNotice({ type: 'warn', text: `Step 2/2: minting ${country.countryName} ${country.memeName}.` })
      const mintData = nftIface.encodeFunctionData('mintCountry', [country.countryId])
      const mintHash = (await requestFromActiveWallet(provider, 'eth_sendTransaction', [
        { from: account, to: INRI_COLLECTIBLES_CONTRACT, data: mintData, value: '0x0' },
      ])) as string
      setNotice({ type: 'ok', text: `${country.countryName} mint transaction sent.`, hash: mintHash })
      await waitTx(mintHash)
      await Promise.all([refreshCountries(), refreshUser(account)])
    } catch (cause) {
      setNotice({ type: 'error', text: getErrorMessage(cause, 'Mint failed') })
    } finally {
      setBusyCountryId(null)
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setNotice({ type: 'ok', text: 'Copied to clipboard.' })
    } catch {
      setNotice({ type: 'error', text: 'Could not copy.' })
    }
  }

  return (
    <main className="overflow-hidden bg-[#03070d] text-white">
      <section className="relative border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(19,164,255,0.25),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(247,200,67,0.20),transparent_30%),linear-gradient(180deg,#06111e,#03070d_65%,#000)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-16 sm:px-8 lg:py-24 xl:px-12 2xl:px-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill tone="cyan">Official INRI NFT Collection</StatusPill>
                <StatusPill tone="gold">Mint with iUSD</StatusPill>
                <StatusPill tone="green">Free transfers after mint</StatusPill>
              </div>

              <h1 className="mt-7 max-w-5xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                INRI World Meme Collectibles
              </h1>
              <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-white/64 sm:text-lg">
                Country meme NFTs on INRI Chain. Each country has 501 NFTs: the Genesis #0 goes to the creator, and #1 to #500 are public mints. Mint earlier to receive a lower serial, stronger rarity and more country reward tokens.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Mint price" value="5 iUSD" note="Paid on INRI Chain" />
                <StatCard label="Initial split" value="95 / 5" note="Liquidity / creator" />
                <StatCard label="Genesis" value="#0" note="Creator NFT + 100 tokens" />
                <StatCard label="Live countries" value={`${liveCount}/30`} note={`${mintedCount} public mints`} />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#mint" className="inri-button-primary inline-flex items-center justify-center gap-2 px-6">
                  Explore collection <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href={`${INRI_EXPLORER_URL}/address/${INRI_COLLECTIBLES_CONTRACT}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inri-button-secondary inline-flex items-center justify-center gap-2 px-6"
                >
                  View contract <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_30px_110px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-4">
              <div className="overflow-hidden rounded-[1.5rem] border border-primary/25 bg-black">
                <img
                  src="/nft-assets/countries/china-dragon-noodles.png"
                  onError={getImageFallback}
                  alt="China Dragon Noodles NFT preview"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1rem] border border-white/[0.10] bg-black/35 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Next live</p>
                  <p className="mt-1 text-sm font-black text-white">China #{states[1]?.nextSerial || 1}</p>
                </div>
                <div className="rounded-[1rem] border border-white/[0.10] bg-black/35 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Reward</p>
                  <p className="mt-1 text-sm font-black text-white">{states[1]?.previewReward || '100'} CHN</p>
                </div>
                <div className="rounded-[1rem] border border-white/[0.10] bg-black/35 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Rarity</p>
                  <p className="mt-1 text-sm font-black text-white">{states[1]?.previewRarity || 'Legendary'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] bg-black/35">
        <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-8 sm:px-8 lg:grid-cols-3 xl:px-12 2xl:px-16">
          <div className="rounded-[1.4rem] border border-primary/20 bg-primary/[0.055] p-5">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h2 className="mt-4 text-lg font-black text-white">Simple V1 rules</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/58">Only the first mint has a 5% creator fee. After mint, NFTs and country tokens transfer freely with no resale tax in V1.</p>
          </div>
          <div className="rounded-[1.4rem] border border-amber-300/20 bg-amber-400/[0.055] p-5">
            <Coins className="h-7 w-7 text-amber-200" />
            <h2 className="mt-4 text-lg font-black text-white">Country reward tokens</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/58">Mint Brazil to receive BRA, China to receive CHN, India to receive IND. Lower serials receive higher token rewards.</p>
          </div>
          <div className="rounded-[1.4rem] border border-emerald-300/20 bg-emerald-400/[0.055] p-5">
            <Globe2 className="h-7 w-7 text-emerald-200" />
            <h2 className="mt-4 text-lg font-black text-white">Built to expand</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/58">The contract supports adding new countries later. The page uses one clean country list so future collections can be added fast.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-12 sm:px-8 lg:py-16 xl:px-12 2xl:px-16">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <Gem className="h-4 w-4" /> Rarity engine
            </div>
            <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.035em] text-white sm:text-5xl">Mint early. Lower serials matter.</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-white/58 sm:text-base">Every country follows the same rarity ladder. The NFT image is the country artwork, while the on-chain serial and metadata define rarity and reward.</p>
          </div>
          <div className="rounded-[1.2rem] border border-white/[0.10] bg-white/[0.04] p-4 text-sm font-semibold text-white/60 lg:max-w-md">
            Mint payment: <span className="font-black text-white">5 iUSD</span>. Split: <span className="font-black text-white">4.75 iUSD</span> to liquidity and <span className="font-black text-white">0.25 iUSD</span> to creator/project.
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {rarityBands.map((band) => (
            <div key={band.label} className={`rounded-[1.2rem] border border-white/[0.10] bg-gradient-to-br ${band.tone} p-4`}>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">{band.range}</p>
              <p className="mt-2 text-lg font-black text-white">{band.label}</p>
              <p className="mt-1 text-sm font-semibold text-white/58">{band.reward}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="mint" className="border-t border-white/[0.08] bg-[linear-gradient(180deg,#03070d,#000)]">
        <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-8 lg:py-16 xl:px-12 2xl:px-16">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-[-0.035em] text-white sm:text-5xl">Collection countries</h2>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-white/58 sm:text-base">Start with China live on-chain, then add the remaining countries using the same contract. Missing images safely show a placeholder until you export the final square NFT artwork.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                refreshCountries()
                refreshWallet()
                refreshUser(wallet.account)
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-black text-white/78 transition hover:border-primary/45 hover:bg-primary/10 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_160px_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country, symbol or meme name"
                className="h-12 w-full rounded-[1rem] border border-white/[0.12] bg-white/[0.045] pl-11 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-white/32 focus:border-primary/55"
              />
            </label>
            <label className="relative block">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="h-12 w-full appearance-none rounded-[1rem] border border-white/[0.12] bg-[#07101b] pl-11 pr-4 text-sm font-black text-white outline-none transition focus:border-primary/55"
              >
                {regions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="inline-flex h-12 items-center gap-3 rounded-[1rem] border border-white/[0.12] bg-white/[0.045] px-4 text-sm font-black text-white/76">
              <input type="checkbox" checked={onlyLive} onChange={(event) => setOnlyLive(event.target.checked)} className="h-4 w-4 accent-cyan-400" />
              Live only
            </label>
            <div className="inline-flex h-12 items-center justify-center rounded-[1rem] border border-white/[0.12] bg-white/[0.045] px-4 text-sm font-black text-white/76">
              {filteredCountries.length} shown
            </div>
          </div>

          {notice ? (
            <div className={`mt-5 flex flex-col gap-3 rounded-[1.1rem] border p-4 text-sm font-bold sm:flex-row sm:items-center sm:justify-between ${
              notice.type === 'ok'
                ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100'
                : notice.type === 'warn'
                  ? 'border-amber-300/25 bg-amber-400/10 text-amber-100'
                  : 'border-red-300/25 bg-red-500/10 text-red-100'
            }`}>
              <div className="flex items-start gap-3">
                {notice.type === 'ok' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : notice.type === 'warn' ? <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />}
                <span>{notice.text}</span>
              </div>
              {notice.hash ? (
                <Link href={`${INRI_EXPLORER_URL}/tx/${notice.hash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] underline underline-offset-4">
                  View tx <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 rounded-[1.2rem] border border-white/[0.10] bg-white/[0.035] p-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/38">Wallet</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-black text-white">
                  <Wallet className="h-4 w-4 text-primary" /> {wallet.account ? shortAddress(wallet.account) : 'Not connected'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/38">iUSD balance</p>
                <p className="mt-1 text-sm font-black text-white">{wallet.account ? `${formatIusd(user.balance)} iUSD` : '—'}</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/38">Contract</p>
                <button type="button" onClick={() => copy(INRI_COLLECTIBLES_CONTRACT)} className="mt-1 inline-flex items-center gap-2 text-sm font-black text-primary">
                  {shortAddress(INRI_COLLECTIBLES_CONTRACT)} <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/38">Liquidity receiver</p>
                <button type="button" onClick={() => copy(LIQUIDITY_RECEIVER)} className="mt-1 inline-flex items-center gap-2 text-sm font-black text-white/80">
                  {shortAddress(LIQUIDITY_RECEIVER)} <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredCountries.map((country) => (
              <CountryCard key={country.countryId} country={country} state={states[country.countryId]} busyCountryId={busyCountryId} onMint={mintCountry} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.08] bg-black">
        <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-8 lg:py-16 xl:px-12 2xl:px-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-4 w-4" /> How it works
              </div>
              <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.035em] text-white sm:text-5xl">Designed like a real marketplace front page.</h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-white/58 sm:text-base">
                Top NFT marketplaces emphasize collection discovery, filters, trait metadata, activity and clean buy actions. This V1 page starts with minting and rarity discovery; later we can add holder pages, activity, listings and marketplace trading.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['1', 'Choose a country', 'Pick a country meme NFT from the collection grid.'],
                ['2', 'Approve 5 iUSD', 'The page sends the iUSD approval to the verified NFT contract.'],
                ['3', 'Mint the NFT', 'The contract mints the next serial number for that country.'],
                ['4', 'Receive country tokens', 'The buyer receives country reward tokens based on rarity.'],
              ].map(([step, title, text]) => (
                <div key={step} className="rounded-[1.25rem] border border-white/[0.10] bg-white/[0.04] p-5">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-[0.8rem] bg-primary text-sm font-black text-black">{step}</div>
                  <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/56">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/[0.10] bg-[linear-gradient(135deg,rgba(19,164,255,0.12),rgba(247,200,67,0.08),rgba(255,255,255,0.025))] p-5 sm:p-7">
            <h3 className="text-xl font-black text-white">Official V1 economics</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-[1rem] bg-black/30 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/38">Price</p><p className="mt-1 text-lg font-black text-white">5 iUSD</p></div>
              <div className="rounded-[1rem] bg-black/30 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/38">Creator fee</p><p className="mt-1 text-lg font-black text-white">5% initial only</p></div>
              <div className="rounded-[1rem] bg-black/30 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/38">Liquidity</p><p className="mt-1 text-lg font-black text-white">95% to project wallet</p></div>
              <div className="rounded-[1rem] bg-black/30 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/38">Transfers</p><p className="mt-1 text-lg font-black text-white">No NFT resale tax</p></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
