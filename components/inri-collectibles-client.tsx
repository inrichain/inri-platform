'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BrowserProvider, Contract, parseUnits } from 'ethers'
import { ExternalLink, Loader2, Search, Sparkles, Wallet, Zap } from 'lucide-react'
import {
  collectibleCountries,
  imageUrlForCountry,
  INRI_COLLECTIBLES_CONTRACT,
  INRI_EXPLORER_URL,
  IUSD_ADDRESS,
  rarityBands,
  rarityForSerial,
  rewardForSerial,
  type CollectibleCountry,
} from '@/lib/inri-collectibles'
import { getErrorMessage, isInriChain, switchToInriChain } from '@/lib/web3'

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

const imageScaleBySlug: Record<string, number> = {
  'china-dragon-noodles': 1.08,
  'united-states-eagle-burger': 1.07,
  'indonesia-komodo-boss': 1.16,
  'japan-samurai-sushi-cat': 1.08,
  'taiwan-boba-blast': 1.08,
  'spain-fiesta-bull': 1.08,
  'hong-kong-neon-dim-sum': 1.08,
  'portugal-galo-da-nata': 1.08,
  'poland-pierogi-knight': 1.08,
  'italy-pizza-mafioso': 1.08,
}

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ')
}

function shortAddress(value?: string) {
  if (!value || value === '0x0000000000000000000000000000000000000000') return '—'
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-400/25 bg-cyan-400/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200 sm:text-[11px]">
      {children}
    </span>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-[linear-gradient(180deg,rgba(9,22,40,0.96),rgba(4,10,20,0.96))] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/38">{label}</p>
      <p className="mt-2 text-[1.95rem] font-black leading-none text-white">{value}</p>
      <p className="mt-1 text-sm text-white/56">{sub}</p>
    </div>
  )
}

function InfoFeature({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur-sm">
      <p className="text-base font-black text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-white/68">{children}</p>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-white/8 bg-white/[0.03] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  )
}

function SmallInfo({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-white/45">{label}</span>
      <span className={classNames('text-right font-bold text-white/82', mono && 'font-mono text-[12px]')}>{value}</span>
    </div>
  )
}

function RarityTile({ label, range, reward, tone }: { label: string; range: string; reward: string; tone: string }) {
  return (
    <div className={classNames('rounded-[18px] border border-white/8 bg-gradient-to-br p-4', tone)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-cyan-300" />
        <p className="text-base font-black text-white">{label}</p>
      </div>
      <p className="mt-2 text-sm font-bold text-white/76">{range}</p>
      <p className="mt-3 text-sm leading-6 text-white/70">{reward}</p>
    </div>
  )
}

export function InriCollectiblesClient() {
  const [query, setQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [liveOnly, setLiveOnly] = useState(false)
  const [chainData, setChainData] = useState<Record<number, CountryChainState>>({})
  const [mintingCountryId, setMintingCountryId] = useState<number | null>(null)
  const [status, setStatus] = useState('')

  const regions = useMemo(() => ['All', ...Array.from(new Set(collectibleCountries.map((item) => item.region)))], [])

  const liveCount = useMemo(() => collectibleCountries.filter((item) => chainData[item.countryId]?.exists).length, [chainData])

  const totalPublicMinted = useMemo(
    () => collectibleCountries.reduce((acc, item) => acc + (chainData[item.countryId]?.mintedPublic || 0), 0),
    [chainData],
  )

  async function loadCountry(country: CollectibleCountry) {
    try {
      if (!window.ethereum) throw new Error('Wallet provider not available')

      const provider = new BrowserProvider(window.ethereum as any)
      const contract = new Contract(INRI_COLLECTIBLES_CONTRACT, nftAbi, provider)
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
    await Promise.all(collectibleCountries.map((country) => loadCountry(country)))
  }

  useEffect(() => {
    loadAllCountries()
  }, [])

  const filteredCountries = useMemo(() => {
    return [...collectibleCountries]
      .filter((country) => {
        const live = chainData[country.countryId]?.exists

        if (liveOnly && !live) return false
        if (selectedRegion !== 'All' && country.region !== selectedRegion) return false

        const text = `${country.countryName} ${country.countryCode} ${country.memeName} ${country.theme}`.toLowerCase()
        if (query && !text.includes(query.toLowerCase())) return false

        return true
      })
      .sort((a, b) => {
        const liveA = chainData[a.countryId]?.exists ? 1 : 0
        const liveB = chainData[b.countryId]?.exists ? 1 : 0
        if (liveA !== liveB) return liveB - liveA
        return a.countryId - b.countryId
      })
  }, [chainData, liveOnly, query, selectedRegion])

  async function handleMint(country: CollectibleCountry) {
    try {
      setStatus('')
      setMintingCountryId(country.countryId)

      if (!window.ethereum) {
        throw new Error('No wallet found. Please open with MetaMask or another EVM wallet.')
      }

      const provider = new BrowserProvider(window.ethereum as any)
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

      setStatus('Mint successful.')
      await loadCountry(country)
    } catch (error) {
      setStatus(getErrorMessage(error))
    } finally {
      setMintingCountryId(null)
    }
  }

  const featured = collectibleCountries.find((item) => chainData[item.countryId]?.exists) || collectibleCountries[0]
  const featuredInfo = chainData[featured.countryId]
  const featuredImage = featuredInfo?.imageURI || imageUrlForCountry(featured.slug)
  const featuredNextSerial = featuredInfo?.nextSerial || 1

  return (
    <main className="mx-auto w-full max-w-[1480px] px-3 py-4 sm:px-5 sm:py-6 xl:px-6">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-cyan-400/12 bg-[linear-gradient(180deg,#04111d,#02060d)] shadow-[0_25px_80px_rgba(0,0,0,0.22)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(19,164,255,0.18),transparent_26%),radial-gradient(circle_at_top_left,rgba(19,164,255,0.10),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(19,164,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(19,164,255,0.18)_1px,transparent_1px)] [background-size:52px_52px]" />

          <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.08fr_0.92fr] xl:gap-8 xl:p-8">
            <div className="flex flex-col justify-center">
              <div className="mb-4 flex flex-wrap gap-2">
                <Pill>Official INRI NFT Collection</Pill>
                <Pill>Mint with iUSD</Pill>
                <Pill>Free transfers after mint</Pill>
              </div>

              <h1 className="max-w-[790px] text-[2.5rem] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-[3.4rem] xl:text-[4.6rem]">
                INRI World Meme Collectibles
              </h1>

              <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-white/74 sm:text-[17px]">
                Country meme NFTs on INRI Chain. Each country has 501 NFTs: the Genesis #0 goes to the creator, and #1 to #500 are public mints.
                Lower serials are rarer and receive more country reward tokens.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <InfoFeature title="Get iUSD first">
                  Use USDT on Polygon through the official INRI Bridge, then mint directly on INRI Chain.
                </InfoFeature>
                <InfoFeature title="Liquidity first">
                  95% of each mint supports project liquidity operations focused on iUSD / WINRI.
                </InfoFeature>
                <InfoFeature title="Country rewards">
                  Each NFT delivers country reward tokens by rarity. Holders may later open their own pools on INRISwap.
                </InfoFeature>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard label="Mint price" value="5 iUSD" sub="Paid on INRI" />
                <StatCard label="Initial split" value="95 / 5" sub="Liquidity / creator" />
                <StatCard label="Genesis" value="#0" sub="NFT + 100 tokens" />
                <StatCard label="Live" value={`${liveCount}/30`} sub={`${totalPublicMinted} public mints`} />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
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

            <div className="flex items-center justify-center xl:justify-end">
              <div className="w-full max-w-[560px] rounded-[28px] border border-cyan-400/14 bg-[linear-gradient(180deg,rgba(6,20,39,0.96),rgba(3,9,21,0.98))] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
                <div className="relative overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_top,rgba(20,164,255,0.08),transparent_55%),#020812]">
                    <div className="absolute left-3 top-3 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950 shadow-[0_6px_18px_rgba(16,185,129,0.35)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                        Live now
                      </span>
                    </div>
                    <div className="relative aspect-square">
                      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scale(${imageScaleBySlug[featured.slug] || 1.08})` }}>
                        <div className="relative h-full w-full">
                          <Image
                            src={featuredImage}
                            alt={`${featured.countryName} ${featured.memeName}`}
                            fill
                            className="object-contain p-3"
                            sizes="(max-width: 1024px) 90vw, 500px"
                            priority
                          />
                        </div>
                      </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <MiniMetric label="Country" value={`${featured.countryName} · ${featured.countryCode}`} />
                  <MiniMetric label="Rarity" value={rarityForSerial(featuredNextSerial)} />
                  <MiniMetric label="Next" value={`#${featuredNextSerial}`} />
                </div>

                <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">Country token contract</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <code className="rounded bg-black/28 px-2 py-1 text-[11px] font-bold text-cyan-200 sm:text-[12px]">
                      {featuredInfo?.rewardToken || 'Will appear after addCountry'}
                    </code>
                    {featuredInfo?.rewardToken ? (
                      <Link
                        href={`${INRI_EXPLORER_URL}/token/${featuredInfo.rewardToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-black text-cyan-300 hover:text-cyan-200"
                      >
                        Open token
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,#04101b,#02060d)] p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country, code or meme..."
                className="h-12 w-full rounded-[16px] border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/35"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={classNames(
                    'rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition',
                    selectedRegion === region
                      ? 'bg-cyan-400 text-slate-950'
                      : 'border border-white/10 bg-white/[0.04] text-white/65 hover:border-cyan-400/35 hover:text-white',
                  )}
                >
                  {region}
                </button>
              ))}
            </div>

            <button
              onClick={() => setLiveOnly((prev) => !prev)}
              className={classNames(
                'h-12 rounded-[16px] px-4 text-sm font-black transition',
                liveOnly
                  ? 'bg-emerald-400 text-slate-950'
                  : 'border border-white/10 bg-white/[0.04] text-white/72 hover:border-emerald-400/35 hover:text-white',
              )}
            >
              {liveOnly ? 'Showing Live Only' : 'Show Live Only'}
            </button>
          </div>
        </section>

        <section className="rounded-[24px] border border-cyan-400/10 bg-[linear-gradient(180deg,#04101b,#02060d)] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Live mint board</p>
              <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">Premium collection cards</h2>
              <p className="mt-1 text-sm text-white/58">Cleaner proportions, tighter layout, premium presentation and direct mint access.</p>
            </div>
            <div className="rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/72">
              Showing <span className="text-white">{filteredCountries.length}</span> countries • <span className="text-white">{liveCount}</span> live
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  className="overflow-hidden rounded-[24px] border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(7,19,35,0.98),rgba(3,8,16,0.98))] shadow-[0_16px_50px_rgba(0,0,0,0.24)]"
                >
                  <div className="px-3 pt-3 pb-2">
                    <div className="relative overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_top,rgba(20,164,255,0.08),transparent_55%),#020814]">
                      <div className="absolute left-3 top-3 z-10">
                        {live ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_6px_18px_rgba(16,185,129,0.35)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/75">
                            Soon
                          </span>
                        )}
                      </div>

                      <div className="relative aspect-square">
                        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scale(${imageScaleBySlug[country.slug] || 1.08})` }}>
                          <div className="relative h-full w-full">
                            <Image
                              src={imageUrl}
                              alt={`${country.countryName} ${country.memeName}`}
                              fill
                              className="object-contain p-2.5"
                              sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 25vw"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[1.18rem] font-black leading-tight text-white sm:text-[1.28rem]">{country.countryName}</h3>
                        <p className="mt-1 text-[1.03rem] font-black text-cyan-300">{country.memeName}</p>
                        <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/62">
                          {country.countryCode} • {country.region}
                        </div>
                      </div>

                      <div className="min-w-[78px] rounded-[16px] border border-white/10 bg-white/[0.04] px-3 py-2 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">Next</p>
                        <p className="mt-1 text-[1.15rem] font-black text-white">#{nextSerial}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <MiniMetric label="Rarity" value={nextRarity} />
                      <MiniMetric label="Reward" value={`${nextReward}.0 ${country.countryCode}`} />
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm font-bold text-white/72">
                        <span>{minted}/500 minted</span>
                        <span>{remaining} left</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-sky-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="space-y-2.5">
                        <SmallInfo label="Need first" value="iUSD via Bridge" />
                        <SmallInfo label="Mint price" value="5 iUSD" />
                        <SmallInfo label="Split" value="95% liquidity / 5% creator" />
                        {live ? <SmallInfo label="Token" value={shortAddress(info.rewardToken)} mono /> : null}
                      </div>

                      {live ? (
                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`${INRI_EXPLORER_URL}/token/${info.rewardToken}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[12px] border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-black text-white/82 transition hover:border-cyan-400/35 hover:text-white"
                          >
                            Token
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            href={`${INRI_EXPLORER_URL}/address/${INRI_COLLECTIBLES_CONTRACT}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[12px] border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-black text-white/82 transition hover:border-cyan-400/35 hover:text-white"
                          >
                            NFT contract
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      {live ? (
                        <button
                          onClick={() => handleMint(country)}
                          disabled={isMinting}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-cyan-300 to-sky-500 px-4 py-4 text-base font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isMinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                          {isMinting ? 'Processing...' : 'Mint for 5 iUSD'}
                        </button>
                      ) : (
                        <Link
                          href="https://platform.inri.life/bridge/"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.05] px-4 py-4 text-base font-black text-white/82 transition hover:border-cyan-400/30 hover:bg-white/[0.08] hover:text-white"
                        >
                          <Wallet className="h-4 w-4" />
                          Get iUSD First
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,#04101b,#02060d)] p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Collector guide</p>
              <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">Rarity & reward structure</h2>
            </div>
            <p className="max-w-[680px] text-sm leading-6 text-white/58">
              Earlier serials receive stronger rarity and more country tokens. Genesis #0 is the creator piece. Public mints start from #1.
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {rarityBands.map((item) => (
              <RarityTile key={item.label} label={item.label} range={item.range} reward={item.reward} tone={item.tone} />
            ))}
          </div>

          {status ? (
            <div className="mt-5 rounded-[18px] border border-cyan-400/20 bg-cyan-400/[0.06] p-4 text-sm text-cyan-100">
              {status}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
