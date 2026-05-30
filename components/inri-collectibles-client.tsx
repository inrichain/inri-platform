'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Loader2, Search, ShieldCheck, Sparkles, Wallet, Zap } from 'lucide-react'
import { BrowserProvider, Contract, JsonRpcProvider, parseUnits } from 'ethers'
import {
  collectibleCountries,
  imageUrlForCountry,
  INRI_COLLECTIBLES_CONTRACT,
  INRI_EXPLORER_URL,
  INRI_RPC_URL,
  IUSD_ADDRESS,
  rarityBands,
  rarityForSerial,
  rewardForSerial,
  type CollectibleCountry,
} from '@/lib/inri-collectibles'
import { getErrorMessage, isInriChain, switchToInriChain } from '@/lib/web3'

type EthereumProvider = {
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

type CountryChainState = {
  exists: boolean
  active: boolean
  rewardToken: string
  nextSerial: number
  mintedPublic: number
  remainingPublic: number
  imageURI: string
}

const nftAbi = [
  'function countryInfo(uint256 countryId) view returns (string countryName,string countryCode,string memeName,string imageURI,address rewardToken,bool active,bool metadataFrozen,uint16 nextSerial,uint16 mintedPublic,uint16 remainingPublic)',
  'function mintCountry(uint256 countryId) returns (uint256)',
  'function mintPrice() view returns (uint256)',
]

const erc20Abi = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
]

function getInjectedEthereum(): EthereumProvider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { ethereum?: EthereumProvider }).ethereum
}

function shortAddress(value?: string) {
  if (!value || value === '0x0000000000000000000000000000000000000000') return '—'
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ')
}

export function InriCollectiblesClient() {
  const [query, setQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [liveOnly, setLiveOnly] = useState(false)
  const [chainData, setChainData] = useState<Record<number, CountryChainState>>({})
  const [loading, setLoading] = useState(true)
  const [mintingCountryId, setMintingCountryId] = useState<number | null>(null)
  const [status, setStatus] = useState<string>('')

  const regions = useMemo(() => {
    return ['All', ...Array.from(new Set(collectibleCountries.map((item) => item.region)))]
  }, [])

  const liveCountries = useMemo(() => {
    return collectibleCountries.filter((item) => chainData[item.countryId]?.exists)
  }, [chainData])

  const liveCount = liveCountries.length

  const totalPublicMinted = useMemo(() => {
    return collectibleCountries.reduce((acc, item) => acc + (chainData[item.countryId]?.mintedPublic || 0), 0)
  }, [chainData])

  async function loadCountry(country: CollectibleCountry) {
    try {
      const rpcProvider = new JsonRpcProvider(INRI_RPC_URL)
      const contract = new Contract(INRI_COLLECTIBLES_CONTRACT, nftAbi, rpcProvider)
      const info = await contract.countryInfo(country.countryId)

      setChainData((prev) => ({
        ...prev,
        [country.countryId]: {
          exists: true,
          active: Boolean(info.active),
          rewardToken: info.rewardToken,
          nextSerial: Number(info.nextSerial),
          mintedPublic: Number(info.mintedPublic),
          remainingPublic: Number(info.remainingPublic),
          imageURI: info.imageURI,
        },
      }))
    } catch {
      setChainData((prev) => ({
        ...prev,
        [country.countryId]: {
          exists: false,
          active: false,
          rewardToken: '',
          nextSerial: 1,
          mintedPublic: 0,
          remainingPublic: 500,
          imageURI: imageUrlForCountry(country.slug),
        },
      }))
    }
  }

  async function loadAllCountries() {
    setLoading(true)
    try {
      await Promise.all(collectibleCountries.map((country) => loadCountry(country)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllCountries()
  }, [])

  const filteredCountries = useMemo(() => {
    return collectibleCountries.filter((country) => {
      const live = chainData[country.countryId]?.exists

      if (liveOnly && !live) return false
      if (selectedRegion !== 'All' && country.region !== selectedRegion) return false

      const text = `${country.countryName} ${country.countryCode} ${country.memeName} ${country.theme}`.toLowerCase()
      if (query && !text.includes(query.toLowerCase())) return false

      return true
    })
  }, [chainData, liveOnly, query, selectedRegion])

  async function handleMint(country: CollectibleCountry) {
    try {
      setStatus('')
      setMintingCountryId(country.countryId)

      const ethereum = getInjectedEthereum()
      if (!ethereum) {
        throw new Error('No wallet found. Please open with MetaMask or another EVM wallet.')
      }

      const provider = new BrowserProvider(ethereum as any)
      await provider.send('eth_requestAccounts', [])

      if (!(await isInriChain(provider))) {
        await switchToInriChain()
      }

      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()

      const nft = new Contract(INRI_COLLECTIBLES_CONTRACT, nftAbi, signer)
      const iusd = new Contract(IUSD_ADDRESS, erc20Abi, signer)

      const mintPrice = await nft.mintPrice()
      const allowance = await iusd.allowance(userAddress, INRI_COLLECTIBLES_CONTRACT)

      if (allowance < mintPrice) {
        setStatus('Approving 5 iUSD...')
        const approveTx = await iusd.approve(INRI_COLLECTIBLES_CONTRACT, parseUnits('5', 6))
        await approveTx.wait()
      }

      setStatus(`Minting ${country.countryName} ${country.memeName}...`)
      const mintTx = await nft.mintCountry(country.countryId)
      await mintTx.wait()

      setStatus('Mint successful. Refreshing collection data...')
      await loadCountry(country)
      setStatus('Mint successful.')
    } catch (error) {
      setStatus(getErrorMessage(error))
    } finally {
      setMintingCountryId(null)
    }
  }

  const heroCountry = collectibleCountries.find((item) => item.countryId === 1)!
  const heroChain = chainData[heroCountry.countryId]
  const heroImage = heroChain?.imageURI || imageUrlForCountry(heroCountry.slug)
  const heroNextSerial = heroChain?.nextSerial || 1
  const heroRarity = rarityForSerial(heroNextSerial)

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(255,194,71,0.08),transparent_28%),#02070d]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:54px_54px]" />

      <div className="relative mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[28px] border border-cyan-400/14 bg-[linear-gradient(180deg,rgba(6,21,36,0.92),rgba(2,7,13,0.96))] shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:p-8 xl:p-10">
            <div className="flex min-w-0 flex-col justify-center">
              <div className="mb-4 flex flex-wrap gap-2">
                <Pill>Official INRI NFT Collection</Pill>
                <Pill>Mint with iUSD</Pill>
                <Pill>Free transfers after mint</Pill>
              </div>

              <h1 className="max-w-4xl text-[2.6rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                INRI World Meme Collectibles
              </h1>

              <p className="mt-5 max-w-3xl text-[15px] leading-7 text-white/72 sm:text-[17px]">
                Country meme NFTs on INRI Chain. Each country has 501 NFTs: the Genesis #0 goes to the creator, and #1 to #500 are public mints.
                Lower serials are rarer and receive more country reward tokens.
              </p>

              <div className="mt-6 grid gap-3 lg:grid-cols-3">
                <InfoPanel
                  title="Get iUSD first"
                  text="Use USDT on Polygon through the official INRI Bridge, then mint on INRI Chain."
                />
                <InfoPanel
                  title="Liquidity first"
                  text="95% of each mint supports project liquidity operations, focused on iUSD / WINRI."
                />
                <InfoPanel
                  title="Country rewards"
                  text="Each NFT mints country tokens by rarity. Holders may later create their own pools on INRISwap."
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox label="Mint price" value="5 iUSD" sub="Paid on INRI" />
                <StatBox label="Initial split" value="95 / 5" sub="Liquidity / creator" />
                <StatBox label="Genesis" value="#0" sub="NFT + 100 tokens" />
                <StatBox label="Live" value={`${liveCount}/30`} sub={`${totalPublicMinted} public mints`} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="https://platform.inri.life/bridge/"
                  className="inline-flex items-center justify-center rounded-[16px] bg-gradient-to-r from-cyan-300 to-sky-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:brightness-110"
                >
                  Get iUSD on Bridge
                </Link>
                <Link
                  href={`${INRI_EXPLORER_URL}/address/${INRI_COLLECTIBLES_CONTRACT}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.06]"
                >
                  View NFT Contract
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[540px] self-center rounded-[26px] border border-cyan-400/18 bg-[#030b15]/90 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.34)] sm:p-4">
              <div className="rounded-[22px] border border-white/8 bg-black/30 p-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[18px]">
                  <Image
                    src={heroImage}
                    alt="China Dragon Noodles NFT preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 90vw, 520px"
                    priority
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <MiniInfo label="Country" value="China" />
                <MiniInfo label="Rarity" value={heroRarity} />
                <MiniInfo label="Next" value={`#${heroNextSerial}`} />
              </div>

              {heroChain?.rewardToken ? (
                <div className="mt-3 rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Country token contract</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="break-all rounded bg-black/30 px-2 py-1 text-[11px] text-cyan-200">{heroChain.rewardToken}</code>
                    <Link
                      href={`${INRI_EXPLORER_URL}/token/${heroChain.rewardToken}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-black text-cyan-300 hover:text-cyan-200"
                    >
                      Open token
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[22px] border border-white/8 bg-[#030b15]/88 p-4 shadow-[0_16px_60px_rgba(0,0,0,0.2)] sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-[-0.03em] text-white sm:text-3xl">Mint countries</h2>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Marketplace-style discovery with rarity, reward amount, live supply and contract links for each active country.
              </p>
            </div>

            <div className="grid gap-3 lg:min-w-[680px] lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country, code or meme..."
                  className="h-12 w-full rounded-[16px] border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/35"
                />
              </div>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="h-12 rounded-[16px] border border-white/10 bg-[#071321] px-4 text-sm font-black text-white outline-none transition focus:border-cyan-400/35"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setLiveOnly((prev) => !prev)}
                className={classNames(
                  'h-12 rounded-[16px] px-4 text-sm font-black transition',
                  liveOnly
                    ? 'bg-emerald-400 text-slate-950'
                    : 'border border-white/10 bg-white/[0.04] text-white/72 hover:border-emerald-400/35 hover:text-white',
                )}
              >
                {liveOnly ? 'Live only' : 'All countries'}
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="mt-5 rounded-[22px] border border-cyan-400/12 bg-cyan-400/[0.04] p-5 text-sm font-bold text-cyan-100">
            Loading on-chain country data...
          </div>
        ) : null}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredCountries.map((country) => {
            const info = chainData[country.countryId]
            const live = Boolean(info?.exists)
            const imageUrl = info?.imageURI || imageUrlForCountry(country.slug)
            const nextSerial = info?.nextSerial || 1
            const nextRarity = rarityForSerial(nextSerial)
            const nextReward = rewardForSerial(nextSerial)
            const minted = info?.mintedPublic || 0
            const remaining = info?.remainingPublic ?? 500
            const progress = Math.min(100, (minted / 500) * 100)
            const isMinting = mintingCountryId === country.countryId

            return (
              <article
                key={country.countryId}
                className="group overflow-hidden rounded-[24px] border border-cyan-400/12 bg-[linear-gradient(180deg,#071421,#030912)] shadow-[0_14px_46px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-cyan-300/24"
              >
                <div className="p-3">
                  <div className="relative overflow-hidden rounded-[19px] border border-white/8 bg-[#020812] p-2">
                    <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
                      {live ? (
                        <span className="rounded-full bg-emerald-400 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-950">
                          Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/70">
                          Soon
                        </span>
                      )}
                      <span className="rounded-full bg-black/50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white">
                        {country.countryCode}
                      </span>
                    </div>

                    <div className="relative aspect-[4/3] overflow-hidden rounded-[15px]">
                      <Image
                        src={imageUrl}
                        alt={`${country.countryName} ${country.memeName}`}
                        fill
                        className="object-contain transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[1.45rem] font-black text-white">{country.countryName}</h3>
                      <p className="mt-1 truncate text-[1rem] font-black text-cyan-300">{country.memeName}</p>
                    </div>

                    <div className="shrink-0 rounded-[15px] border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Next</p>
                      <p className="mt-1 text-lg font-black text-white">#{nextSerial}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <MiniCard label="Rarity" value={nextRarity} />
                    <MiniCard label="Reward" value={`${nextReward}.0 ${country.countryCode}`} />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-bold text-white/70">
                      <span>{minted}/500 minted</span>
                      <span>{remaining} left</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-sky-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 rounded-[16px] border border-white/8 bg-white/[0.03] p-3">
                    <InfoRow label="Need first" value="iUSD via Bridge" />
                    <InfoRow label="Mint price" value="5 iUSD" />
                    <InfoRow label="Split" value="95% liquidity / 5% creator" />
                    {live ? <InfoRow label="Token" value={shortAddress(info.rewardToken)} mono /> : null}

                    {live ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Link
                          href={`${INRI_EXPLORER_URL}/token/${info.rewardToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-[11px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/80 transition hover:border-cyan-400/30 hover:text-white"
                        >
                          Token
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>

                        <Link
                          href={`${INRI_EXPLORER_URL}/address/${INRI_COLLECTIBLES_CONTRACT}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-[11px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/80 transition hover:border-cyan-400/30 hover:text-white"
                        >
                          NFT contract
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex gap-3">
                    {live ? (
                      <button
                        onClick={() => handleMint(country)}
                        disabled={isMinting}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-[15px] bg-gradient-to-r from-cyan-300 to-sky-500 px-4 py-3.5 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isMinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        {isMinting ? 'Processing...' : 'Mint for 5 iUSD'}
                      </button>
                    ) : (
                      <Link
                        href="https://platform.inri.life/bridge/"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-[15px] bg-white/[0.06] px-4 py-3.5 text-sm font-black text-white/80 transition hover:bg-white/[0.10] hover:text-white"
                      >
                        <Wallet className="h-4 w-4" />
                        Get iUSD first
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border border-white/8 bg-[#030b15]/88 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
              <h2 className="text-2xl font-black text-white sm:text-3xl">How the economy works</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/68">
              <p>
                Users mint with <span className="font-black text-white">5 iUSD</span>. The contract sends{' '}
                <span className="font-black text-white">95%</span> to the project liquidity wallet and{' '}
                <span className="font-black text-white">5%</span> to the creator/project wallet.
              </p>
              <p>
                The initial liquidity focus is <span className="font-black text-cyan-300">iUSD / WINRI</span>. Country tokens are rewards for collectors and can later be used by holders to create independent pools on INRISwap.
              </p>
              <p>No resale tax in V1. NFTs are freely transferable after mint.</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-[#030b15]/88 p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white sm:text-3xl">Rarity & reward structure</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {rarityBands.map((item) => (
                <div key={item.label} className={`rounded-[18px] border border-white/8 bg-gradient-to-br ${item.tone} p-4`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    <p className="text-base font-black text-white">{item.label}</p>
                  </div>
                  <p className="mt-2 text-sm font-bold text-white/70">{item.range}</p>
                  <p className="mt-3 text-sm leading-6 text-white/70">{item.reward}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {status ? (
          <div className="mt-5 rounded-[18px] border border-cyan-400/20 bg-cyan-400/[0.06] p-4 text-sm text-cyan-100">
            {status}
          </div>
        ) : null}
      </div>
    </main>
  )
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-400/25 bg-cyan-400/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
      {children}
    </span>
  )
}

function InfoPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[18px] border border-emerald-400/15 bg-emerald-400/[0.055] p-4">
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
    </div>
  )
}

function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[18px] border border-cyan-400/14 bg-[linear-gradient(180deg,#061221,#030915)] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-black text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-white/55 sm:text-sm">{sub}</p>
    </div>
  )
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-white/8 bg-white/[0.03] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 truncate text-sm font-black text-white">{value}</p>
    </div>
  )
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-cyan-400/12 bg-[linear-gradient(180deg,#071223,#040c18)] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className="mt-2 truncate text-xl font-black text-white">{value}</p>
    </div>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-white/48">{label}</span>
      <span className={classNames('text-right font-bold text-white/82', mono && 'font-mono text-[12px]')}>{value}</span>
    </div>
  )
}
