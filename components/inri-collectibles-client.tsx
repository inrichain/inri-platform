'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BrowserProvider, Contract, parseUnits } from 'ethers'
import { ArrowRight, ChevronLeft, ChevronRight, Coins, ExternalLink, Globe2, Loader2, RotateCw, Search, ShieldCheck, Sparkles, Wallet, Zap } from 'lucide-react'
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
  'france-croissant-pup': 1.08,
  'switzerland-alpine-cheese': 1.08,
  'singapore-merlion-mode': 1.08,
  'netherlands-bike-boss': 1.08,
  'brazil-samba-capy': 1.08,
  'australia-outback-roo': 1.08,
  'germany-pretzel-boss': 1.08,
  'bangladesh-rickshaw-tiger': 1.08,
  'united-kingdom-tea-bulldog': 1.08,
  'south-korea-kimchi-gamer': 1.08,
  'russia-bear-boss': 1.08,
  'india-masala-tiger': 1.08,
  'liechtenstein-alpine-prince': 1.08,
  'vietnam-pho-rider': 1.08,
  'new-zealand-kiwi-boss': 1.08,
  'norway-fjord-viking': 1.08,
  'turkiye-kebab-sultan': 1.08,
  'slovakia-tatra-wolf': 1.08,
  'united-arab-emirates-desert-falcon': 1.08,
  'philippines-jeepney-star': 1.08,
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

function HeroStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="group rounded-[18px] border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(7,22,38,0.72),rgba(2,7,15,0.82))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition hover:border-cyan-300/32 hover:bg-cyan-300/[0.05]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-cyan-300/14 bg-cyan-300/[0.06] text-cyan-300 shadow-[0_0_22px_rgba(20,184,255,0.10)]">{icon}</span>
        <span>
          <span className="block text-[1.45rem] font-black leading-none text-white">{value}</span>
          <span className="mt-1 block text-xs font-semibold text-white/55">{label}</span>
        </span>
      </div>
    </div>
  )
}

function HeroFeature({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 border-cyan-300/10 px-4 py-3 md:border-l first:md:border-l-0">
      <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-cyan-400/[0.06] text-cyan-300">{icon}</span>
      <span>
        <span className="block text-base font-black text-cyan-300">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-white/58">{children}</span>
      </span>
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
  const [activeHeroIndex, setActiveHeroIndex] = useState(0)

  const regions = useMemo(() => ['All', ...Array.from(new Set(collectibleCountries.map((item) => item.region)))], [])

  const heroSlugs = useMemo(
    () => [
      'spain-fiesta-bull',
      'france-croissant-pup',
      'australia-outback-roo',
      'japan-samurai-sushi-cat',
      'singapore-merlion-mode',
      'germany-pretzel-boss',
      'new-zealand-kiwi-boss',
      'china-dragon-noodles',
      'united-states-eagle-burger',
      'brazil-samba-capy',
    ],
    [],
  )

  const heroCountries = useMemo(() => {
    const selected = heroSlugs
      .map((slug) => collectibleCountries.find((country) => country.slug === slug))
      .filter((country): country is CollectibleCountry => Boolean(country))

    return selected.length ? selected : collectibleCountries.slice(0, 7)
  }, [heroSlugs])

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

  useEffect(() => {
    if (heroCountries.length <= 1) return

    const timer = window.setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroCountries.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [heroCountries.length])

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

  const featured = heroCountries[activeHeroIndex % heroCountries.length] || collectibleCountries.find((item) => chainData[item.countryId]?.exists) || collectibleCountries[0]
  const featuredInfo = chainData[featured.countryId]
  const featuredImage = imageUrlForCountry(featured.slug)
  const featuredNextSerial = featuredInfo?.nextSerial || 1
  const heroDisplayCountries = useMemo(() => {
    if (!heroCountries.length) return []

    return [-2, -1, 0, 1, 2].map((offset) => {
      const index = (activeHeroIndex + offset + heroCountries.length) % heroCountries.length
      return { country: heroCountries[index], offset }
    })
  }, [activeHeroIndex, heroCountries])

  const featuredStripCountries = useMemo(() => {
    const slugs = [
      'china-dragon-noodles',
      'united-states-eagle-burger',
      'indonesia-komodo-boss',
      'japan-samurai-sushi-cat',
      'spain-fiesta-bull',
    ]

    return slugs
      .map((slug) => collectibleCountries.find((country) => country.slug === slug))
      .filter((country): country is CollectibleCountry => Boolean(country))
  }, [])

  return (
    <main className="w-full overflow-hidden bg-[#02070d]">
      <div className="space-y-0">
        <section className="relative isolate min-h-[760px] overflow-hidden bg-[#020711] sm:min-h-[820px] lg:min-h-[calc(100svh-104px)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_71%_22%,rgba(14,165,233,0.28),transparent_27%),radial-gradient(circle_at_86%_38%,rgba(59,130,246,0.19),transparent_26%),radial-gradient(circle_at_38%_54%,rgba(6,182,212,0.12),transparent_34%),linear-gradient(180deg,#051827_0%,#020812_50%,#010309_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(20,184,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,255,0.16)_1px,transparent_1px)] [background-size:62px_62px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_45%_22%,rgba(14,165,233,0.45)_0_1px,transparent_2px),radial-gradient(circle_at_68%_17%,rgba(125,211,252,0.38)_0_1px,transparent_2px),radial-gradient(circle_at_82%_31%,rgba(56,189,248,0.34)_0_1px,transparent_2px),radial-gradient(circle_at_58%_61%,rgba(14,165,233,0.26)_0_1px,transparent_2px),radial-gradient(circle_at_93%_18%,rgba(255,255,255,0.22)_0_1px,transparent_2px)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#02070d] to-transparent" />

          <div className="relative mx-auto grid min-h-[760px] w-full max-w-[1920px] grid-cols-1 gap-4 px-5 pb-7 pt-12 sm:min-h-[820px] sm:px-8 sm:pt-14 lg:min-h-[calc(100svh-104px)] lg:grid-cols-[minmax(420px,0.42fr)_minmax(0,0.58fr)] lg:px-12 lg:pb-8 lg:pt-14 xl:px-16 2xl:px-20">
            <div className="relative z-30 flex flex-col justify-center lg:pb-20">
              <div className="mb-7 inline-flex w-fit items-center rounded-full border border-cyan-300/34 bg-cyan-300/[0.055] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-200 shadow-[0_0_34px_rgba(20,184,255,0.14)] sm:text-[11px]">
                INRI Chain • Proof-of-Work • Chain 3777 • EVM Compatible
              </div>

              <h1 className="max-w-[820px] text-[3.65rem] font-black leading-[0.91] tracking-[-0.07em] text-white sm:text-[5.4rem] lg:text-[5.1rem] xl:text-[6.25rem] 2xl:text-[7.1rem]">
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-100 bg-clip-text text-transparent">INRI</span>{' '}
                World
                <span className="block">Meme Collectibles</span>
              </h1>

              <p className="mt-6 max-w-[720px] text-base font-semibold leading-8 text-white/74 sm:text-[1.14rem] xl:text-[1.28rem]">
                Mint unique country meme NFTs on INRI Chain. Power the future by strengthening{' '}
                <span className="font-black text-cyan-300">iUSD / WINRI</span> liquidity.
              </p>

              <div className="mt-4 rounded-[18px] border border-cyan-300/14 bg-cyan-300/[0.045] px-4 py-3 text-sm font-bold leading-6 text-white/64 sm:max-w-[690px]">
                Need iUSD first? Buy iUSD with USDT on Polygon using the official bridge, then mint your country NFT on INRI Chain.
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/bridge/"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-cyan-300 to-sky-500 px-7 text-sm font-black text-slate-950 shadow-[0_18px_48px_rgba(14,165,233,0.38)] transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  <Coins className="h-4 w-4" />
                  Get iUSD First
                </Link>
                <a
                  href="#collection"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-[16px] border border-cyan-300/42 bg-cyan-300/[0.08] px-7 text-sm font-black text-white shadow-[0_0_36px_rgba(14,165,233,0.23)] transition hover:-translate-y-0.5 hover:bg-cyan-300/[0.13]"
                >
                  <Zap className="h-4 w-4" />
                  Mint Now
                </a>
                <Link
                  href={`${INRI_EXPLORER_URL}/address/${INRI_COLLECTIBLES_CONTRACT}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-[16px] border border-white/12 bg-white/[0.04] px-7 text-sm font-black text-white/84 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Explorer
                </Link>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-[850px]">
                <HeroStat icon={<Globe2 className="h-5 w-5" />} value="30" label="Countries Live" />
                <HeroStat icon={<Coins className="h-5 w-5" />} value="5 iUSD" label="Mint Price" />
                <HeroStat icon={<Sparkles className="h-5 w-5" />} value="100" label="Country Tokens" />
                <HeroStat icon={<ShieldCheck className="h-5 w-5" />} value="INRI" label="Chain" />
              </div>
            </div>

            <div className="relative z-20 min-h-[470px] overflow-visible sm:min-h-[590px] lg:min-h-0">
              <div className="absolute left-1/2 top-0 z-50 -translate-x-1/2 rounded-full border border-cyan-300/30 bg-black/46 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/84 shadow-[0_0_32px_rgba(14,165,233,0.22)] backdrop-blur-md sm:top-5 sm:text-[11px]">
                <span className="inline-flex items-center gap-2">
                  <RotateCw className="h-3.5 w-3.5 text-cyan-300" />
                  Live rotating collection
                </span>
              </div>

              <div className="pointer-events-none absolute left-1/2 top-[8%] h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-cyan-400/12 blur-[90px] lg:top-[10%] lg:h-[620px] lg:w-[1180px]" />
              <div className="pointer-events-none absolute left-1/2 top-[18%] h-[430px] w-[940px] -translate-x-1/2 rounded-[100%] border border-cyan-300/10 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.16),transparent_66%)] shadow-[inset_0_0_90px_rgba(14,165,233,0.10)]" />
              <div className="pointer-events-none absolute inset-x-[4%] bottom-[12%] h-[148px] rounded-[100%] border border-cyan-300/30 bg-cyan-300/[0.045] shadow-[0_0_90px_rgba(14,165,233,0.48),inset_0_0_60px_rgba(14,165,233,0.20)] sm:h-[172px]" />
              <div className="pointer-events-none absolute inset-x-[14%] bottom-[17%] h-[62px] rounded-[100%] bg-cyan-300/20 blur-2xl" />

              <div className="absolute inset-0 flex items-center justify-center overflow-visible pt-6 sm:pt-12 lg:pt-0">
                <div className="relative h-[430px] w-full max-w-[1160px] overflow-visible sm:h-[560px] lg:h-[650px] xl:h-[700px]">
                  {heroDisplayCountries.map(({ country, offset }) => {
                    const isCenter = offset === 0
                    const positionClass =
                      offset === -2
                        ? 'hidden lg:block left-[8%] top-[43%] z-10 w-[31%] -rotate-[9deg] opacity-[0.56]'
                        : offset === -1
                          ? 'left-[22%] top-[36%] z-20 w-[45%] -rotate-[6deg] opacity-[0.86] sm:left-[25%] sm:top-[32%] sm:w-[39%] lg:left-[26%] lg:w-[37%]'
                          : offset === 0
                            ? 'left-[50%] top-[11%] z-40 w-[94%] opacity-100 sm:top-[9%] sm:w-[70%] lg:w-[64%] xl:w-[61%]'
                            : offset === 1
                              ? 'left-[78%] top-[36%] z-20 w-[45%] rotate-[6deg] opacity-[0.86] sm:left-[75%] sm:top-[32%] sm:w-[39%] lg:left-[74%] lg:w-[37%]'
                              : 'hidden lg:block left-[92%] top-[43%] z-10 w-[31%] rotate-[9deg] opacity-[0.56]'

                    return (
                      <Link
                        key={`${country.slug}-${offset}`}
                        href={`/collectibles/${country.slug}/`}
                        className={classNames(
                          'absolute block aspect-[1.47/1] -translate-x-1/2 transform-gpu rounded-[10px] transition-all duration-700 hover:z-50 hover:scale-[1.035]',
                          positionClass,
                        )}
                        aria-label={`Open ${country.countryName} ${country.memeName}`}
                      >
                        <div className={classNames('relative h-full w-full overflow-hidden rounded-[10px] border bg-black shadow-[0_28px_90px_rgba(0,0,0,0.54)] ring-1 ring-white/5', isCenter ? 'border-amber-300/75 shadow-[0_0_74px_rgba(251,191,36,0.28),0_38px_120px_rgba(0,0,0,0.62)]' : 'border-cyan-300/18')}>
                          <Image
                            src={imageUrlForCountry(country.slug)}
                            alt={`${country.countryName} ${country.memeName}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 94vw, (max-width: 1024px) 72vw, 720px"
                            priority={isCenter}
                          />
                          {isCenter ? (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/88 via-black/32 to-transparent px-4 py-5 text-center">
                              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">Featured now</p>
                              <p className="mt-1 text-xl font-black text-white sm:text-2xl">{country.countryName} · {country.memeName}</p>
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="absolute bottom-[5%] left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 sm:bottom-[6%] sm:gap-4">
                <button
                  type="button"
                  onClick={() => setActiveHeroIndex((prev) => (prev - 1 + heroCountries.length) % heroCountries.length)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/24 bg-black/46 text-cyan-200 shadow-[0_0_26px_rgba(14,165,233,0.18)] backdrop-blur-md transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.10]"
                  aria-label="Previous featured NFT"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/38 px-3 py-2 backdrop-blur-md">
                  {heroCountries.slice(0, 7).map((country, index) => (
                    <button
                      key={country.slug}
                      type="button"
                      onClick={() => setActiveHeroIndex(index)}
                      className={classNames(
                        'h-3 rounded-full transition-all',
                        activeHeroIndex % heroCountries.length === index ? 'w-7 bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.86)]' : 'w-3 bg-white/24 hover:bg-white/46',
                      )}
                      aria-label={`Show ${country.countryName}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHeroIndex((prev) => (prev + 1) % heroCountries.length)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/24 bg-black/46 text-cyan-200 shadow-[0_0_26px_rgba(14,165,233,0.18)] backdrop-blur-md transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.10]"
                  aria-label="Next featured NFT"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[1820px] px-5 pb-9 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
            <div className="grid gap-4 rounded-[24px] border border-cyan-300/14 bg-black/26 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur-md lg:grid-cols-[270px_1fr]">
              <div className="flex flex-col justify-center rounded-[18px] border border-cyan-300/10 bg-cyan-300/[0.03] p-4">
                <p className="text-xl font-black text-cyan-300">Featured Countries</p>
                <p className="mt-2 text-sm leading-6 text-white/58">Explore the world through meme culture.</p>
                <a href="#collection" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-cyan-300 hover:text-cyan-200">
                  View All Countries
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {featuredStripCountries.map((country) => {
                  const info = chainData[country.countryId]
                  const nextSerial = info?.nextSerial || 1
                  const reward = rewardForSerial(nextSerial)

                  return (
                    <Link
                      href={`/collectibles/${country.slug}/`}
                      key={country.slug}
                      className="group grid grid-cols-[108px_1fr] gap-3 rounded-[16px] border border-white/9 bg-white/[0.04] p-2 transition hover:-translate-y-0.5 hover:border-cyan-300/34 hover:bg-cyan-300/[0.055] xl:grid-cols-[128px_1fr]"
                    >
                      <div className="relative aspect-[1.34/1] overflow-hidden rounded-[12px] bg-black shadow-[0_14px_32px_rgba(0,0,0,0.24)]">
                        <Image
                          src={imageUrlForCountry(country.slug)}
                          alt={`${country.countryName} ${country.memeName}`}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                          sizes="190px"
                        />
                      </div>
                      <div className="min-w-0 py-1">
                        <p className="truncate text-sm font-black text-white">{country.countryName}</p>
                        <p className="mt-1 truncate text-xs font-black text-cyan-300">{country.memeName}</p>
                        <div className="mt-2 inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/[0.055] px-2 py-0.5 text-[10px] font-bold text-cyan-100">
                          Legendary
                        </div>
                        <p className="mt-2 text-xs font-bold text-white/75">{reward}.0 {country.countryCode}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="mx-auto mt-5 flex max-w-[760px] items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/48">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-300/24" />
              Powered by INRI Chain • Built for liquidity • Backed by community
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-300/24" />
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1720px] space-y-6 px-2 py-6 sm:px-4 xl:px-6">
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

        <section id="collection" className="rounded-[24px] border border-cyan-400/10 bg-[linear-gradient(180deg,#04101b,#02060d)] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Live mint board</p>
              <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">Premium collection cards</h2>
              <p className="mt-1 text-sm text-white/58">30 country pages ready • premium mint access • profile-ready NFTs.</p>
            </div>
            <div className="rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/72">
              Showing <span className="text-white">{filteredCountries.length}</span> countries • <span className="text-white">{liveCount}</span> live
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filteredCountries.map((country) => {
              const info = chainData[country.countryId]
              const live = Boolean(info?.exists)
              const imageUrl = imageUrlForCountry(country.slug)
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
                          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/45 bg-emerald-400/14 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100 shadow-[0_0_22px_rgba(16,185,129,0.22)] backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-80" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.95)]" />
                            </span>
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/75">
                            Soon
                          </span>
                        )}
                      </div>

                      <Link href={`/collectibles/${country.slug}/`} className="group block" aria-label={`Open ${country.countryName} ${country.memeName} page`}>
                        <div className="relative aspect-square">
                          <div className="absolute inset-0 flex items-center justify-center transition duration-300 group-hover:scale-[1.025]" style={{ transform: `scale(${imageScaleBySlug[country.slug] || 1.08})` }}>
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
                          <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden rounded-[14px] border border-cyan-300/20 bg-black/55 px-3 py-2 text-center text-xs font-black uppercase tracking-[0.14em] text-cyan-100 opacity-0 backdrop-blur-md transition group-hover:opacity-100 sm:block">
                            Open country page
                          </div>
                        </div>
                      </Link>
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

                    <div className="mt-4 grid gap-3">
                      <Link
                        href={`/collectibles/${country.slug}/`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3 text-sm font-black text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-400/[0.10]"
                      >
                        View country page
                        <ArrowRight className="h-4 w-4" />
                      </Link>
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
      </div>
    </main>
  )
}
