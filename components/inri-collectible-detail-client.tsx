'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BrowserProvider, Contract, parseUnits } from 'ethers'
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
  Zap,
} from 'lucide-react'
import {
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

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ')
}

function shortAddress(value?: string) {
  if (!value || value === ZERO_ADDRESS) return '—'
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function DetailStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      {sub ? <p className="mt-1 text-sm font-semibold text-white/55">{sub}</p> : null}
    </div>
  )
}

function StepCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">{icon}</div>
      <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/62">{text}</p>
    </div>
  )
}

function RarityRow({ label, range, reward, tone }: { label: string; range: string; reward: string; tone: string }) {
  return (
    <div className={classNames('rounded-[18px] border border-white/10 bg-gradient-to-r p-4', tone)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-black text-white">{label}</p>
          <p className="mt-1 text-sm font-bold text-white/60">{range}</p>
        </div>
        <p className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm font-black text-cyan-100">{reward}</p>
      </div>
    </div>
  )
}

export function InriCollectibleDetailClient({ country }: { country: CollectibleCountry }) {
  const [chainInfo, setChainInfo] = useState<CountryChainState | null>(null)
  const [loading, setLoading] = useState(true)
  const [minting, setMinting] = useState(false)
  const [status, setStatus] = useState('')
  const [copied, setCopied] = useState(false)

  const imageUrl = imageUrlForCountry(country.slug)
  const live = Boolean(chainInfo?.exists)
  const nextSerial = chainInfo?.nextSerial || 1
  const nextRarity = rarityForSerial(nextSerial)
  const nextReward = rewardForSerial(nextSerial)
  const minted = chainInfo?.mintedPublic || 0
  const remaining = chainInfo?.remainingPublic ?? 500
  const progress = Math.min(100, (minted / 500) * 100)
  const nextTokenId = country.countryId * 100000 + nextSerial
  const genesisTokenId = country.countryId * 100000

  const pageUrl = useMemo(() => `https://platform.inri.life/collectibles/${country.slug}`, [country.slug])
  const shareText = useMemo(
    () =>
      `I picked ${country.countryName} ${country.memeName} on INRI World Meme Collectibles. Mint, gift or flex your country NFT and help support iUSD / WINRI liquidity.`,
    [country.countryName, country.memeName],
  )
  const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`

  async function loadCountry() {
    try {
      setLoading(true)

      const ethereum = (window as unknown as { ethereum?: unknown }).ethereum
      if (!ethereum) throw new Error('Wallet provider not available')

      const provider = new BrowserProvider(ethereum as any)
      const contract = new Contract(INRI_COLLECTIBLES_CONTRACT, nftAbi, provider)
      const info = await contract.countryInfo(country.countryId)

      setChainInfo({
        exists: true,
        active: Boolean(info.active),
        rewardToken: info.rewardToken,
        nextSerial: Number(info.nextSerial),
        mintedPublic: Number(info.mintedPublic),
        remainingPublic: Number(info.remainingPublic),
        imageURI: info.imageURI,
      })
    } catch {
      setChainInfo({
        exists: false,
        active: false,
        rewardToken: '',
        nextSerial: 1,
        mintedPublic: 0,
        remainingPublic: 500,
        imageURI: imageUrl,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCountry()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.countryId])

  async function handleMint() {
    try {
      setStatus('')
      setMinting(true)

      const ethereum = (window as unknown as { ethereum?: unknown }).ethereum
      if (!ethereum) throw new Error('No wallet found. Please open with MetaMask or another EVM wallet.')

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

      setStatus('Mint successful. Updating country data...')
      await loadCountry()
    } catch (error) {
      setStatus(getErrorMessage(error))
    } finally {
      setMinting(false)
    }
  }

  async function copyPageLink() {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-5 sm:py-6 xl:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/collectibles"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/75 transition hover:border-cyan-400/40 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to collection
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
          INRI World Meme Collectibles
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[32px] border border-cyan-400/14 bg-[linear-gradient(180deg,#061727,#02070f_60%,#01040a)] shadow-[0_28px_95px_rgba(0,0,0,0.34)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(19,164,255,0.22),transparent_28%),radial-gradient(circle_at_18%_18%,rgba(255,210,77,0.12),transparent_26%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.11] [background-image:linear-gradient(rgba(19,164,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(19,164,255,0.18)_1px,transparent_1px)] [background-size:54px_54px]" />

        <div className="relative grid gap-7 p-4 sm:p-6 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.72fr)] xl:p-8">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/24 p-3 shadow-[0_22px_70px_rgba(0,0,0,0.36)]">
              <div className="relative overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_top,rgba(20,164,255,0.12),transparent_50%),#020813]">
                <Image
                  src={imageUrl}
                  alt={`${country.countryName} ${country.memeName}`}
                  width={1200}
                  height={1200}
                  priority
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 1024px) 100vw, 760px"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <DetailStat label="Country" value={country.countryName} sub={country.countryCode} />
              <DetailStat label="Next rarity" value={nextRarity} sub={`Serial #${nextSerial}`} />
              <DetailStat label="Reward" value={`${nextReward}.0 ${country.countryCode}`} sub="on mint" />
            </div>
          </div>

          <aside className="flex flex-col justify-center lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[28px] border border-cyan-400/16 bg-[linear-gradient(180deg,rgba(5,18,33,0.96),rgba(2,7,15,0.98))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.32)] sm:p-6">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950">
                  {live ? 'Live mint' : 'Coming soon'}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                  {country.region}
                </span>
              </div>

              <h1 className="mt-5 text-[2.35rem] font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-[3rem]">
                {country.countryName}
              </h1>
              <p className="mt-2 text-2xl font-black text-cyan-300">{country.memeName}</p>
              <p className="mt-4 text-sm leading-7 text-white/64">
                Mint this country meme NFT with iUSD, receive rarity-based {country.countryCode} reward tokens and help support INRI ecosystem liquidity operations focused on iUSD / WINRI.
              </p>

              <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between text-sm font-bold text-white/70">
                  <span>{minted}/500 public minted</span>
                  <span>{remaining} left</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-sky-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <DetailStat label="Price" value="5 iUSD" sub="INRI Chain" />
                  <DetailStat label="Next NFT" value={`#${nextSerial}`} sub={`ID ${nextTokenId}`} />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {live ? (
                  <button
                    onClick={handleMint}
                    disabled={minting || loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-cyan-300 to-sky-500 px-5 py-4 text-base font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    {minting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {minting ? 'Processing...' : 'Mint for 5 iUSD'}
                  </button>
                ) : (
                  <Link
                    href="/bridge/"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-cyan-300 to-sky-500 px-5 py-4 text-base font-black text-slate-950 transition hover:brightness-110"
                  >
                    <Wallet className="h-4 w-4" />
                    Get iUSD on Bridge
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={xShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/78 transition hover:border-cyan-400/35 hover:text-white"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Link>
                  <button
                    onClick={copyPageLink}
                    className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/78 transition hover:border-cyan-400/35 hover:text-white"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-3 rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Country token</span>
                  <span className="font-mono font-bold text-cyan-200">{shortAddress(chainInfo?.rewardToken)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Genesis token ID</span>
                  <span className="font-bold text-white/80">{genesisTokenId}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">NFT contract</span>
                  <span className="font-mono font-bold text-white/80">{shortAddress(INRI_COLLECTIBLES_CONTRACT)}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link
                  href={`${INRI_EXPLORER_URL}/token/${INRI_COLLECTIBLES_CONTRACT}/instance/${nextTokenId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black text-white/74 transition hover:border-cyan-400/35 hover:text-white"
                >
                  NFT on Explorer
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                {chainInfo?.rewardToken && chainInfo.rewardToken !== ZERO_ADDRESS ? (
                  <Link
                    href={`${INRI_EXPLORER_URL}/token/${chainInfo.rewardToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black text-white/74 transition hover:border-cyan-400/35 hover:text-white"
                  >
                    Token contract
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>

              {status ? <div className="mt-4 rounded-[16px] border border-cyan-400/20 bg-cyan-400/[0.07] p-4 text-sm text-cyan-100">{status}</div> : null}
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <StepCard
          icon={<Wallet className="h-5 w-5" />}
          title="1. Get iUSD"
          text="Use USDT on Polygon through the official INRI Bridge, then mint on INRI Chain with iUSD."
        />
        <StepCard
          icon={<Gift className="h-5 w-5" />}
          title="2. Mint or gift"
          text="Mint your country NFT, send it to a friend, or use it as a profile flex for the INRI community."
        />
        <StepCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="3. Support liquidity"
          text="The mint flow supports project liquidity operations focused on strengthening iUSD / WINRI. No resale tax in V1."
        />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,#04101b,#02060d)] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-amber-200">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Collector profile</p>
              <h2 className="text-2xl font-black text-white">Why collect {country.countryCode}?</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/62">
            {country.countryName} {country.memeName} is part of the official INRI World Meme Collectibles set. Lower serials are scarcer, the country reward token is issued at mint, and the art is made to be displayed, gifted and shared.
          </p>
          <div className="mt-5 rounded-[18px] border border-cyan-300/14 bg-cyan-300/[0.055] p-4 text-sm leading-7 text-cyan-100/80">
            Tip: after minting, share your NFT page on X and tag the community. Country culture + meme energy helps bring new users into the INRI ecosystem.
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,#04101b,#02060d)] p-5 sm:p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Rarity ladder</p>
          <h2 className="mt-1 text-2xl font-black text-white">Earlier serials receive more country tokens</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {rarityBands.map((item) => (
              <RarityRow key={item.label} label={item.label} range={item.range} reward={item.reward} tone={item.tone} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
