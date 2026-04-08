'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { withBasePath } from '@/lib/site'
import {
  Activity,
  ArrowUpRight,
  Blocks,
  Clock3,
  Gauge,
  Globe2,
  Network,
  Pickaxe,
  Search,
  Wallet,
  Waves,
  Zap,
} from 'lucide-react'

declare global {
  interface Window {
    INRI_POOL_PULSE?: any
  }
}

type TabKey = 'overview' | 'explorer' | 'audience'

type PulseState = {
  latestBlock: number
  rpcPeers: number
  chainId: string
  gasPrice: string
  gasUsedRatio: string
  avgBlockTime: string
  difficulty: string
  hashrate: string
  latestTxs: number
  updatedAt: string
  networkHealth: string
  syncStatus: string
  lastBlockAge: string
  status: 'ok' | 'error' | 'loading'
}

type RecentBlock = {
  block: number
  txs: number
  gasUsedPct: number
  interval: number
  timestamp: number
  miner: string
}

type RecentTx = {
  hash: string
  from: string
  to: string
  value: string
  blockNumber: number
}

type SearchActivity = {
  hash: string
  blockNumber: number
  direction: string
  counterparty: string
  value: string
}


type AudiencePoint = {
  country: string
  code?: string
  activeUsers: number
  lat?: number
  lng?: number
}

type AudiencePayload = {
  updatedAt?: string
  countries?: AudiencePoint[]
}

type SearchRow = { label: string; value: string; mono?: boolean }

type SearchResult =
  | {
      type: 'address'
      title: string
      rows: SearchRow[]
      activity: SearchActivity[]
    }
  | {
      type: 'tx' | 'block'
      title: string
      rows: SearchRow[]
      activity?: never
    }
  | null

const RPC_URL = 'https://rpc.inri.life'
const WIDGET_URL = 'https://pool.inri.life/widget/pool-pulse.js'
const EXPLORER_BASE = 'https://explorer.inri.life'
const LIVE_AUDIENCE_URL = withBasePath('/live-audience.json')
const REFRESH_INTERVAL_MS = 30000
const FIXED_RPC_CHAIN_PEERS = 13
const FIXED_BOOT1_PEERS = 25
const FIXED_BOOT2_PEERS = 15
const ADDRESS_SCAN_BLOCKS = 18
const RECENT_BLOCK_WINDOW = 7
const MAX_TX_RENDER = 10
const TXS_PER_BLOCK = 12

const initialPulse: PulseState = {
  latestBlock: 0,
  rpcPeers: 0,
  chainId: '3777',
  gasPrice: '—',
  gasUsedRatio: '—',
  avgBlockTime: '—',
  difficulty: '—',
  hashrate: '—',
  latestTxs: 0,
  updatedAt: '—',
  networkHealth: '—',
  syncStatus: '—',
  lastBlockAge: '—',
  status: 'loading',
}

const routeCards = [
  { title: 'Wallet', text: 'Official entry', href: '/inri-wallet', icon: Wallet },
  { title: 'Explorer', text: 'Open explorer page', href: '/explorer', icon: Search },
  { title: 'Mining', text: 'Windows and Ubuntu', href: '/mining', icon: Pickaxe },
  { title: 'Pool', text: 'Join active miners', href: '/pool', icon: Waves },
]

const mapNodes = [
  { name: 'North America', label: 'Explorer', x: 18, y: 32 },
  { name: 'Brazil', label: 'Community', x: 30, y: 67 },
  { name: 'Europe', label: 'Nodes', x: 49, y: 28 },
  { name: 'Middle East', label: 'P2P', x: 58, y: 43 },
  { name: 'India', label: 'Mining', x: 65, y: 49 },
  { name: 'Southeast Asia', label: 'Wallet', x: 75, y: 53 },
]

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US')
}

function formatShortNumber(value: number) {
  if (!Number.isFinite(value)) return '—'
  if (value < 1000) return String(value)
  const units = ['', 'K', 'M', 'B', 'T']
  let current = value
  let index = 0
  while (current >= 1000 && index < units.length - 1) {
    current /= 1000
    index += 1
  }
  return `${current >= 100 ? current.toFixed(0) : current >= 10 ? current.toFixed(1) : current.toFixed(2)}${units[index]}`
}

function hexToNumber(value?: string) {
  if (!value) return 0
  try {
    return Number.parseInt(value, 16)
  } catch {
    return 0
  }
}

function hexToBigInt(value?: string) {
  if (!value) return 0n
  let clean = String(value)
  if (clean.startsWith('0x')) clean = clean.slice(2)
  if (!clean) return 0n
  try {
    return BigInt(`0x${clean}`)
  } catch {
    return 0n
  }
}

function numberToHex(value: number) {
  return `0x${value.toString(16)}`
}

function safeArray<T = any>(value: any): T[] {
  return Array.isArray(value) ? value : []
}

function shortHex(value: string, left = 6, right = 4) {
  if (!value) return '—'
  if (value.length <= left + right + 2) return value
  return `${value.slice(0, left + 2)}…${value.slice(-right)}`
}

function formatAge(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—'
  if (seconds < 60) return `${Math.floor(seconds)}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m ago`
}

function formatBigHexShort(hex?: string) {
  const value = hexToBigInt(hex)
  if (value <= 0n) return '—'
  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E']
  let current = value
  let index = 0
  while (current >= 1000n && index < units.length - 1) {
    current /= 1000n
    index += 1
  }
  return `${current.toString()}${units[index]}`
}

function formatGasPriceFromHex(hex?: string) {
  const wei = hexToBigInt(hex)
  if (wei <= 0n) return '0 gwei'
  const gweiTimes100 = Number((wei * 100n) / 1000000000n) / 100
  return gweiTimes100 >= 1 ? `${gweiTimes100.toFixed(2)} gwei` : `${gweiTimes100.toFixed(4)} gwei`
}

function formatHashrate(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '—'
  const units = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s']
  let current = value
  let index = 0
  while (current >= 1000 && index < units.length - 1) {
    current /= 1000
    index += 1
  }
  return `${current >= 100 ? current.toFixed(0) : current >= 10 ? current.toFixed(1) : current.toFixed(2)} ${units[index]}`
}

function weiToInriApprox(value: bigint) {
  const whole = value / 1000000000000000000n
  const fraction = Number((value % 1000000000000000000n) / 10000000000000000n)
  return `${whole.toString()}.${String(fraction).padStart(2, '0')}`
}

function estimateHashrateFromDifficulty(difficultyHex?: string, averageBlockTimeSeconds?: number) {
  const difficulty = hexToBigInt(difficultyHex)
  const avg = Math.max(1, Math.round(Number(averageBlockTimeSeconds || 0)))
  if (difficulty <= 0n || !Number.isFinite(avg) || avg <= 0) return 0
  const result = difficulty / BigInt(avg)
  const max = BigInt(Number.MAX_SAFE_INTEGER)
  return Number(result > max ? max : result)
}

async function rpc(method: string, params: unknown[] = []) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('RPC request failed')
  const data = await response.json()
  if (data.error) throw new Error(data.error.message || 'RPC error')
  return data.result
}

async function loadPoolWidget() {
  return new Promise<any | null>((resolve) => {
    const existing = document.getElementById('inri-pool-pulse-runtime')
    if (existing) existing.remove()
    window.INRI_POOL_PULSE = undefined

    const script = document.createElement('script')
    script.id = 'inri-pool-pulse-runtime'
    script.src = `${WIDGET_URL}?t=${Date.now()}`
    script.async = true
    script.onload = () => resolve(window.INRI_POOL_PULSE ?? null)
    script.onerror = () => resolve(null)
    document.head.appendChild(script)
  })
}

async function loadAudienceData() {
  try {
    const response = await fetch(LIVE_AUDIENCE_URL, { cache: 'no-store' })
    if (!response.ok) return null
    const payload = (await response.json()) as AudiencePayload
    if (!payload || !Array.isArray(payload.countries)) return null
    return {
      updatedAt: payload.updatedAt,
      countries: payload.countries
        .filter((item) => Number(item.activeUsers || 0) > 0 && Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng)))
        .map((item) => ({
          country: item.country,
          code: item.code,
          activeUsers: Number(item.activeUsers || 0),
          lat: Number(item.lat),
          lng: Number(item.lng),
        })),
    }
  } catch {
    return null
  }
}

function buildRecentBlocks(blocks: any[]): RecentBlock[] {
  const ordered = [...blocks].filter(Boolean).sort((a, b) => hexToNumber(a?.number) - hexToNumber(b?.number))
  return ordered.map((block, index) => {
    const currentTimestamp = hexToNumber(block?.timestamp)
    const previousTimestamp = index > 0 ? hexToNumber(ordered[index - 1]?.timestamp) : currentTimestamp
    const gasUsed = hexToNumber(block?.gasUsed)
    const gasLimit = Math.max(hexToNumber(block?.gasLimit), 1)
    return {
      block: hexToNumber(block?.number),
      txs: safeArray(block?.transactions).length,
      gasUsedPct: Number(((gasUsed / gasLimit) * 100).toFixed(1)),
      interval: index > 0 ? Math.max(currentTimestamp - previousTimestamp, 0) : 0,
      timestamp: currentTimestamp,
      miner: block?.miner || '—',
    }
  })
}

function getAverageBlockTime(blocks: any[]) {
  const ordered = [...blocks].filter(Boolean).sort((a, b) => hexToNumber(a?.number) - hexToNumber(b?.number))
  if (ordered.length < 2) return 0
  let total = 0
  let count = 0
  for (let index = 1; index < ordered.length; index += 1) {
    const currentTimestamp = hexToNumber(ordered[index]?.timestamp)
    const previousTimestamp = hexToNumber(ordered[index - 1]?.timestamp)
    if (currentTimestamp >= previousTimestamp && previousTimestamp > 0) {
      total += currentTimestamp - previousTimestamp
      count += 1
    }
  }
  return count > 0 ? total / count : 0
}

function buildRecentTransactions(blocks: any[]) {
  const items: RecentTx[] = []
  const seen = new Set<string>()
  for (const block of blocks.slice().reverse()) {
    for (const tx of safeArray(block?.transactions).slice(0, TXS_PER_BLOCK)) {
      if (!tx?.hash || seen.has(tx.hash)) continue
      seen.add(tx.hash)
      items.push({
        hash: tx.hash,
        from: tx.from || '—',
        to: tx.to || 'Contract creation',
        value: weiToInriApprox(hexToBigInt(tx.value || '0x0')),
        blockNumber: hexToNumber(tx.blockNumber || block?.number),
      })
      if (items.length >= MAX_TX_RENDER) return items
    }
  }
  return items
}

function StatusPill({ pulse }: { pulse: PulseState }) {
  const label = pulse.status === 'ok' ? `Updated ${pulse.updatedAt}` : pulse.status === 'loading' ? 'Loading live data' : 'Connection issue'
  return (
    <div className="inline-flex items-center gap-2 rounded-full border-[1.15px] border-white/[0.18] bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">
      <span className={cx('h-2.5 w-2.5 rounded-full', pulse.status === 'ok' ? 'bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.95)]' : pulse.status === 'loading' ? 'bg-primary shadow-[0_0_14px_rgba(19,164,255,0.95)]' : 'bg-red-400')} />
      {label}
    </div>
  )
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-[1.95rem] border-[1.28px] border-white/[0.18] bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.10),transparent_30%),linear-gradient(180deg,rgba(6,14,22,0.98),rgba(0,0,0,0.99))] p-5 shadow-[0_28px_92px_rgba(0,0,0,0.42),0_0_0_1px_rgba(19,164,255,0.05),inset_0_1px_0_rgba(255,255,255,0.04)]', className)}>
      {children}
    </div>
  )
}

function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/90">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">{title}</h3>
      {subtitle ? <p className="mt-2 text-sm leading-7 text-white/58">{subtitle}</p> : null}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, foot }: { icon: any; label: string; value: string; foot: string }) {
  return (
    <div className="flex min-h-[158px] flex-col justify-between rounded-[1.45rem] border-[1.2px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] px-4 py-4 shadow-[0_16px_46px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex min-h-[1.6rem] items-center gap-2 text-white/46">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-5 text-[1.95rem] font-bold leading-none tabular-nums text-white">{value}</p>
      <p className="mt-4 min-h-[2.4rem] text-[11px] uppercase tracking-[0.14em] text-white/36">{foot}</p>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.35rem] border-[1.15px] border-white/[0.17] bg-white/[0.03] px-4 py-3.5">
      <span className="text-base text-white/72">{label}</span>
      <span className="text-base font-bold tabular-nums text-white">{value}</span>
    </div>
  )
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'rounded-full border px-4 py-2.5 text-sm font-bold uppercase tracking-[0.16em] transition',
        active
          ? 'border-primary/55 bg-primary text-black shadow-[0_16px_44px_rgba(19,164,255,0.28)]'
          : 'border-white/[0.16] bg-white/[0.03] text-white/76 hover:border-primary/40 hover:bg-primary/10 hover:text-white'
      )}
    >
      {label}
    </button>
  )
}

function RouteCard({ title, text, href, external, icon: Icon }: { title: string; text: string; href: string; external?: boolean; icon: any }) {
  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group rounded-[1.45rem] border-[1.15px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-4 transition hover:-translate-y-px hover:border-primary/45 hover:bg-primary/10"
    >
      <div className="inline-flex rounded-2xl border border-primary/28 bg-primary/10 p-2.5 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-white/58">{text}</p>
        </div>
        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      </div>
    </Link>
  )
}

function PoolCard({ title, connected, workers, hashrate, payments }: { title: string; connected: string; workers: string; hashrate: string; payments: string }) {
  return (
    <div className="rounded-[1.5rem] border-[1.18px] border-white/[0.18] bg-black/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xl font-bold text-white">{title}</p>
        <span className="rounded-full border border-primary/28 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{title}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          ['Connected miners', connected],
          ['Active workers', workers],
          ['Pool hashrate', hashrate],
          ['Payments', payments],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.2rem] border border-white/[0.12] bg-white/[0.02] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/46">{label}</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function WorldMap({
  totalLivePulse,
  totalPeers,
  poolMiners,
  updatedAt,
  audience,
}: {
  totalLivePulse: number
  totalPeers: number
  poolMiners: number
  updatedAt: string
  audience: AudiencePayload | null
}) {
  const points = safeArray<AudiencePoint>(audience?.countries)
  const maxUsers = Math.max(...points.map((item) => Number(item.activeUsers || 0)), 1)

  const projected = points.map((item) => ({
    ...item,
    x: ((Number(item.lng || 0) + 180) / 360) * 100,
    y: ((90 - Number(item.lat || 0)) / 180) * 100,
  }))

  return (
    <div className="rounded-[1.75rem] border-[1.45px] border-white/[0.18] bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.16),transparent_34%),linear-gradient(180deg,rgba(3,8,14,0.98),rgba(0,0,0,0.99))] p-4 sm:p-5">
      <div className="relative overflow-hidden rounded-[1.55rem] border-[1.4px] border-white/[0.16] bg-black/38 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(19,164,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(19,164,255,0.045)_1px,transparent_1px)] bg-[size:30px_30px] opacity-45" />
        <div className="absolute -left-10 top-6 h-48 w-48 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
          <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-[1.45rem] border-[1.35px] border-white/[0.14] bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.10),transparent_30%),rgba(0,0,0,0.35)]">
            <svg viewBox="0 0 1100 620" className="absolute inset-0 h-full w-full opacity-90">
              <defs>
                <linearGradient id="audience-land" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(19,164,255,0.14)" />
                  <stop offset="100%" stopColor="rgba(19,164,255,0.04)" />
                </linearGradient>
                <linearGradient id="audience-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(19,164,255,0)" />
                  <stop offset="50%" stopColor="rgba(19,164,255,0.82)" />
                  <stop offset="100%" stopColor="rgba(19,164,255,0)" />
                </linearGradient>
              </defs>
              <path d="M102 170C160 112 236 104 314 130C364 146 418 172 440 216C402 236 356 252 324 266C270 290 212 302 150 300C132 270 122 242 116 212C112 194 108 178 102 170Z" fill="url(#audience-land)" stroke="rgba(19,164,255,0.15)" strokeWidth="2" />
              <path d="M298 312C340 322 364 350 372 388C380 432 364 480 334 532C292 518 276 478 280 438C284 392 288 344 298 312Z" fill="url(#audience-land)" stroke="rgba(19,164,255,0.15)" strokeWidth="2" />
              <path d="M492 166C534 144 578 148 616 168C638 182 652 202 652 220C624 230 604 244 584 268C560 266 544 258 528 248C506 234 494 210 492 166Z" fill="url(#audience-land)" stroke="rgba(19,164,255,0.15)" strokeWidth="2" />
              <path d="M540 262C600 248 650 270 678 312C706 352 706 414 686 472C628 494 564 488 524 458C486 430 470 386 472 340C474 308 498 274 540 262Z" fill="url(#audience-land)" stroke="rgba(19,164,255,0.15)" strokeWidth="2" />
              <path d="M642 174C718 138 812 140 888 170C940 192 986 232 1000 280C954 296 918 294 872 314C828 334 766 332 714 316C690 294 676 262 666 232C658 210 650 190 642 174Z" fill="url(#audience-land)" stroke="rgba(19,164,255,0.15)" strokeWidth="2" />
              <path d="M818 422C854 406 900 412 930 440C948 458 958 482 954 506C916 518 878 520 844 510C818 500 796 480 796 454C796 440 802 430 818 422Z" fill="url(#audience-land)" stroke="rgba(19,164,255,0.15)" strokeWidth="2" />
              <path d="M190 205 Q440 100 678 198" fill="none" stroke="url(#audience-line)" strokeWidth="2" opacity="0.7" />
              <path d="M288 410 Q500 228 676 298" fill="none" stroke="url(#audience-line)" strokeWidth="1.8" opacity="0.64" />
              <path d="M548 236 Q734 188 846 250" fill="none" stroke="url(#audience-line)" strokeWidth="1.7" opacity="0.64" />
            </svg>

            {projected.length > 0 ? projected.map((point, index) => (
              <div key={`${point.country}-${index}`} className="absolute" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
                <div className="absolute -inset-4 rounded-full border border-primary/28 animate-ping" style={{ animationDuration: '3.2s', animationDelay: `${index * 0.22}s` }} />
                <div
                  className="relative rounded-full bg-primary shadow-[0_0_28px_rgba(19,164,255,0.95)]"
                  style={{ width: `${10 + (Number(point.activeUsers) / maxUsers) * 14}px`, height: `${10 + (Number(point.activeUsers) / maxUsers) * 14}px`, marginLeft: '-10px', marginTop: '-10px' }}
                />
              </div>
            )) : (
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <div className="max-w-md rounded-[1.35rem] border-[1.35px] border-white/[0.14] bg-black/58 px-5 py-5 backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-primary">Live audience map</p>
                  <p className="mt-3 text-sm leading-7 text-white/66">
                    No realtime audience endpoint is connected yet. Add a secure analytics endpoint and this panel will show live countries on the site.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid w-full gap-3 lg:max-w-[290px]">
            <div className="rounded-[1.35rem] border-[1.35px] border-white/[0.14] bg-black/46 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Live pulse</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-white">{formatNumber(totalLivePulse)}</p>
              <p className="mt-2 text-sm text-white/58">Peers + connected miners</p>
            </div>
            <div className="rounded-[1.35rem] border-[1.35px] border-white/[0.14] bg-black/46 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Network peers</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-white">{formatNumber(totalPeers)}</p>
              <p className="mt-2 text-sm text-white/58">rpc-chain + rpc + bootnodes</p>
            </div>
            <div className="rounded-[1.35rem] border-[1.35px] border-white/[0.14] bg-black/46 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Pool miners</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-white">{formatNumber(poolMiners)}</p>
              <p className="mt-2 text-sm text-white/58">PPLNS + SOLO connected</p>
            </div>
            <div className="rounded-[1.35rem] border-[1.35px] border-white/[0.14] bg-black/46 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Audience refresh</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">{audience?.updatedAt || updatedAt}</p>
              <p className="mt-2 text-sm text-white/58">Realtime timestamp</p>
            </div>
          </div>
        </div>

        {projected.length > 0 ? (
          <div className="relative mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {projected
              .slice()
              .sort((a, b) => Number(b.activeUsers) - Number(a.activeUsers))
              .slice(0, 4)
              .map((item) => (
                <div key={item.country} className="rounded-[1.25rem] border-[1.25px] border-white/[0.14] bg-black/45 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">{item.country}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-white">{formatNumber(Number(item.activeUsers || 0))}</p>
                  <p className="mt-2 text-sm text-white/58">Active visitors</p>
                </div>
              ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function SearchResultPanel({ result }: { result: SearchResult }) {
  if (!result) return null
  return (
    <div className="mt-5 rounded-[1.45rem] border-[1.15px] border-white/[0.16] bg-black/35 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{result.title}</p>
      <div className="mt-4 grid gap-3">
        {result.rows.map((row) => (
          <div key={row.label} className="grid gap-1 rounded-2xl border border-white/[0.12] bg-white/[0.02] px-3 py-3 sm:grid-cols-[160px_1fr] sm:items-center">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">{row.label}</p>
            <p className={cx('text-sm text-white', row.mono && 'break-all font-mono text-[13px]')}>{row.value}</p>
          </div>
        ))}
      </div>
      {result.type === 'address' ? (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Recent activity</p>
          <div className="mt-3 grid gap-3">
            {result.activity.length > 0 ? result.activity.map((item) => (
              <div key={item.hash} className="rounded-2xl border border-white/[0.12] bg-white/[0.02] px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[13px] text-white">{shortHex(item.hash, 10, 6)}</p>
                  <span className="text-xs text-white/55">#{formatNumber(item.blockNumber)}</span>
                </div>
                <p className="mt-2 text-sm text-white/70">{item.direction} • {item.value}</p>
                <p className="mt-1 break-all font-mono text-[12px] text-white/52">{item.counterparty}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-white/[0.12] bg-white/[0.02] px-3 py-3 text-sm text-white/58">No recent activity found in the scanned window.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function NetworkPulse() {
  const [tab, setTab] = useState<TabKey>('overview')
  const [pulse, setPulse] = useState<PulseState>(initialPulse)
  const [recentBlocks, setRecentBlocks] = useState<RecentBlock[]>([])
  const [recentTxs, setRecentTxs] = useState<RecentTx[]>([])
  const [poolData, setPoolData] = useState<any>(null)
  const [searchValue, setSearchValue] = useState('')
  const [searchResult, setSearchResult] = useState<SearchResult>(null)
  const [searchError, setSearchError] = useState('')
  const [searchBusy, setSearchBusy] = useState(false)
  const [audience, setAudience] = useState<AudiencePayload | null>(null)

  useEffect(() => {
    let mounted = true
    let widgetCache: any = null

    async function load() {
      try {
        const [blockHex, peerHex, chainIdHex, gasHex, syncingState] = await Promise.all([
          rpc('eth_blockNumber'),
          rpc('net_peerCount'),
          rpc('eth_chainId'),
          rpc('eth_gasPrice'),
          rpc('eth_syncing').catch(() => false),
        ])

        const latestBlockNumber = hexToNumber(blockHex)
        const targets = Array.from({ length: RECENT_BLOCK_WINDOW }, (_, index) => latestBlockNumber - index).filter((value) => value >= 0).reverse()
        const blocks = await Promise.all(targets.map((blockNumber) => rpc('eth_getBlockByNumber', [numberToHex(blockNumber), true])))
        const latestBlock = blocks[blocks.length - 1]
        const averageBlockTime = getAverageBlockTime(blocks)
        const gasUsed = hexToNumber(latestBlock?.gasUsed)
        const gasLimit = Math.max(hexToNumber(latestBlock?.gasLimit), 1)
        const estimatedHashrate = estimateHashrateFromDifficulty(latestBlock?.difficulty, averageBlockTime)
        const latestTxCount = safeArray(latestBlock?.transactions).length
        const totalPeers = FIXED_RPC_CHAIN_PEERS + hexToNumber(peerHex) + FIXED_BOOT1_PEERS + FIXED_BOOT2_PEERS

        const [widget, audiencePayload] = await Promise.all([loadPoolWidget(), loadAudienceData()])
        if (widget?.totals) widgetCache = widget

        if (!mounted) return

        setAudience(audiencePayload)
        setPulse({
          latestBlock: latestBlockNumber,
          rpcPeers: hexToNumber(peerHex),
          chainId: String(hexToNumber(chainIdHex)),
          gasPrice: formatGasPriceFromHex(gasHex),
          gasUsedRatio: `${((gasUsed / gasLimit) * 100).toFixed(1)}%`,
          avgBlockTime: averageBlockTime > 0 ? `${averageBlockTime.toFixed(1)}s` : '—',
          difficulty: formatBigHexShort(latestBlock?.difficulty),
          hashrate: formatHashrate(estimatedHashrate),
          latestTxs: latestTxCount,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          networkHealth: totalPeers >= 60 ? 'Strong' : totalPeers >= 40 ? 'Healthy' : 'Light',
          syncStatus:
            syncingState && typeof syncingState === 'object'
              ? `${formatNumber(hexToNumber(syncingState.currentBlock || '0x0'))} / ${formatNumber(hexToNumber(syncingState.highestBlock || '0x0'))}`
              : 'Synced',
          lastBlockAge: latestBlock?.timestamp ? formatAge(Math.floor(Date.now() / 1000) - hexToNumber(latestBlock.timestamp)) : '—',
          status: 'ok',
        })
        setRecentBlocks(buildRecentBlocks(blocks))
        setRecentTxs(buildRecentTransactions(blocks))
        setPoolData(widget?.totals ? widget : widgetCache)
      } catch {
        if (!mounted) return
        setPulse((current) => ({ ...current, status: 'error', updatedAt: 'offline' }))
      }
    }

    load()
    const interval = window.setInterval(load, REFRESH_INTERVAL_MS)
    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  const totalNetworkPeers = FIXED_RPC_CHAIN_PEERS + pulse.rpcPeers + FIXED_BOOT1_PEERS + FIXED_BOOT2_PEERS
  const poolConnectedMiners = Number(poolData?.totals?.connectedMiners || 0)
  const totalLivePulse = totalNetworkPeers + poolConnectedMiners
  const displayBlocks = [...recentBlocks].reverse().slice(0, 5)
  const chartBlocks = recentBlocks.slice(1)
  const maxInterval = Math.max(...chartBlocks.map((item) => item.interval), 1)

  const topMetrics = useMemo(
    () => [
      { icon: Activity, label: 'Total live pulse', value: formatNumber(totalLivePulse), foot: 'Peers + miners online' },
      { icon: Network, label: 'Network peers', value: formatNumber(totalNetworkPeers), foot: 'rpc-chain + rpc + bootnodes' },
      { icon: Pickaxe, label: 'Pool miners', value: formatNumber(poolConnectedMiners), foot: 'PPLNS + SOLO connected' },
      { icon: Blocks, label: 'Latest block', value: formatNumber(pulse.latestBlock), foot: 'Confirmed block height' },
      { icon: Clock3, label: 'Avg block time', value: pulse.avgBlockTime, foot: 'Recent window average' },
      { icon: Gauge, label: 'Estimated hashrate', value: pulse.hashrate, foot: 'Difficulty ÷ block time' },
    ],
    [poolConnectedMiners, pulse.avgBlockTime, pulse.hashrate, pulse.latestBlock, totalLivePulse, totalNetworkPeers]
  )

  const pplns = poolData?.pplns || {}
  const solo = poolData?.solo || {}

  async function handleSearch() {
    const query = searchValue.trim()
    if (!query) return
    setSearchBusy(true)
    setSearchError('')
    try {
      if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
        const [balanceHex, nonceHex, codeHex, latestBlockHex] = await Promise.all([
          rpc('eth_getBalance', [query, 'latest']),
          rpc('eth_getTransactionCount', [query, 'latest']),
          rpc('eth_getCode', [query, 'latest']),
          rpc('eth_blockNumber'),
        ])
        const latestBlockNumber = hexToNumber(latestBlockHex)
        const fromBlock = Math.max(0, latestBlockNumber - ADDRESS_SCAN_BLOCKS + 1)
        const blocks = await Promise.all(
          Array.from({ length: latestBlockNumber - fromBlock + 1 }, (_, index) => latestBlockNumber - index).map((blockNumber) =>
            rpc('eth_getBlockByNumber', [numberToHex(blockNumber), true])
          )
        )

        const lower = query.toLowerCase()
        const activity: SearchActivity[] = []
        blocks.forEach((block) => {
          safeArray(block?.transactions).forEach((tx: any) => {
            const from = String(tx?.from || '').toLowerCase()
            const to = String(tx?.to || '').toLowerCase()
            if (from === lower || to === lower) {
              activity.push({
                hash: tx.hash,
                blockNumber: hexToNumber(tx.blockNumber || block?.number),
                direction: from === lower ? 'Outgoing' : 'Incoming',
                counterparty: from === lower ? tx.to || 'Contract creation' : tx.from || '—',
                value: `${weiToInriApprox(hexToBigInt(tx.value || '0x0'))} INRI`,
              })
            }
          })
        })

        setSearchResult({
          type: 'address',
          title: 'Address details',
          rows: [
            { label: 'Address', value: query, mono: true },
            { label: 'Balance', value: `${weiToInriApprox(hexToBigInt(balanceHex))} INRI` },
            { label: 'Nonce', value: formatNumber(hexToNumber(nonceHex)) },
            { label: 'Type', value: codeHex && codeHex !== '0x' ? 'Contract account' : 'Externally owned account' },
            { label: 'Code size', value: codeHex && codeHex !== '0x' ? `${Math.max(0, (String(codeHex).length - 2) / 2)} bytes` : '0 bytes' },
            { label: 'Current block', value: formatNumber(latestBlockNumber) },
          ],
          activity: activity.slice(0, 8),
        })
      } else if (/^0x[a-fA-F0-9]{64}$/.test(query)) {
        const [tx, receipt] = await Promise.all([rpc('eth_getTransactionByHash', [query]), rpc('eth_getTransactionReceipt', [query]).catch(() => null)])
        if (!tx) throw new Error('Transaction not found')
        setSearchResult({
          type: 'tx',
          title: 'Transaction details',
          rows: [
            { label: 'Hash', value: query, mono: true },
            { label: 'Status', value: receipt?.status === '0x1' ? 'Success' : receipt?.status === '0x0' ? 'Failed' : 'Pending / unknown' },
            { label: 'Block', value: formatNumber(hexToNumber(tx.blockNumber || '0x0')) },
            { label: 'From', value: tx.from || '—', mono: true },
            { label: 'To', value: tx.to || 'Contract creation', mono: true },
            { label: 'Value', value: `${weiToInriApprox(hexToBigInt(tx.value || '0x0'))} INRI` },
            { label: 'Gas', value: formatNumber(hexToNumber(tx.gas || '0x0')) },
            { label: 'Gas price', value: formatGasPriceFromHex(tx.gasPrice) },
          ],
        })
      } else if (/^\d+$/.test(query)) {
        const block = await rpc('eth_getBlockByNumber', [numberToHex(Number(query)), true])
        if (!block) throw new Error('Block not found')
        setSearchResult({
          type: 'block',
          title: 'Block details',
          rows: [
            { label: 'Block number', value: formatNumber(hexToNumber(block.number)) },
            { label: 'Hash', value: block.hash || '—', mono: true },
            { label: 'Parent hash', value: block.parentHash || '—', mono: true },
            { label: 'Miner', value: block.miner || '—', mono: true },
            { label: 'Transactions', value: formatNumber(safeArray(block.transactions).length) },
            { label: 'Gas used', value: formatNumber(hexToNumber(block.gasUsed)) },
            { label: 'Gas limit', value: formatNumber(hexToNumber(block.gasLimit)) },
            { label: 'Timestamp', value: new Date(hexToNumber(block.timestamp) * 1000).toLocaleString() },
          ],
        })
      } else {
        throw new Error('Search must be an address, tx hash or block number')
      }
    } catch (error: any) {
      setSearchError(error?.message || 'Search failed')
      setSearchResult(null)
    } finally {
      setSearchBusy(false)
    }
  }

  return (
    <section className="border-t border-white/[0.10] bg-black">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-18">
        <Panel className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/90">Live network data</p>
              <h2 className="mt-2 max-w-3xl text-3xl font-bold text-white sm:text-4xl">Blocks, miners, peers and search in one clean surface.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58 sm:text-base">
                Latest blocks, peer count, pool miners, gas, difficulty and live explorer search without turning the homepage into clutter.
              </p>
            </div>
            <StatusPill pulse={pulse} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {topMetrics.map((item) => (
              <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} foot={item.foot} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <TabButton active={tab === 'overview'} label="Overview" onClick={() => setTab('overview')} />
            <TabButton active={tab === 'explorer'} label="Explorer" onClick={() => setTab('explorer')} />
            <TabButton active={tab === 'audience'} label="Live map" onClick={() => setTab('audience')} />
          </div>
        </Panel>

        {tab === 'overview' ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Panel>
              <SectionHead eyebrow="Recent blocks" title="Latest mainnet blocks" subtitle="Recent intervals and the latest confirmed blocks." />

              <div className="mt-6 rounded-[1.6rem] border-[1.15px] border-white/[0.16] bg-black/35 p-4">
                <div className="grid grid-cols-5 gap-3 sm:gap-4">
                  {chartBlocks.slice(-5).map((item) => (
                    <div key={item.block} className="flex flex-col items-center gap-2">
                      <div className="relative flex h-36 w-full items-end justify-center rounded-[1.2rem] border border-white/[0.12] bg-white/[0.02] px-2 py-2">
                        <div
                          className="w-full rounded-[1rem] bg-[linear-gradient(180deg,rgba(34,184,255,1),rgba(16,115,198,0.75))] shadow-[0_0_18px_rgba(19,164,255,0.26)]"
                          style={{ height: `${Math.max((item.interval / maxInterval) * 100, 18)}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold tabular-nums text-white">{item.interval}s</p>
                        <p className="text-[11px] text-white/42">#{item.block}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {displayBlocks.map((block) => (
                  <div key={block.block} className="flex items-center justify-between gap-4 rounded-[1.35rem] border-[1.15px] border-white/[0.16] bg-white/[0.03] px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-base font-bold tabular-nums text-white">Block #{formatNumber(block.block)}</p>
                      <p className="mt-1 text-sm text-white/54">{block.interval}s • {block.txs} txs • gas {block.gasUsedPct}%</p>
                    </div>
                    <Link href={`${EXPLORER_BASE}/block/${block.block}`} target="_blank" rel="noreferrer" className="shrink-0 text-sm font-bold text-primary">
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="grid gap-6">
              <Panel>
                <SectionHead eyebrow="Pool state" title="PPLNS and SOLO" subtitle="Connected miners, workers and current pool hashrate." />
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  <PoolCard
                    title="PPLNS"
                    connected={formatNumber(Number(pplns.connectedMiners || 0))}
                    workers={formatNumber(Number(pplns.activeWorkers || 0))}
                    hashrate={formatHashrate(Number(pplns.poolHashrate || 0))}
                    payments={formatNumber(Number(pplns.paymentsCount || 0))}
                  />
                  <PoolCard
                    title="SOLO"
                    connected={formatNumber(Number(solo.connectedMiners || 0))}
                    workers={formatNumber(Number(solo.activeWorkers || 0))}
                    hashrate={formatHashrate(Number(solo.poolHashrate || 0))}
                    payments={formatNumber(Number(solo.paymentsCount || 0))}
                  />
                </div>
              </Panel>

              <Panel>
                <SectionHead eyebrow="Mining and gas" title="Current chain pulse" subtitle="Live values from the main RPC." />
                <div className="mt-6 grid gap-3">
                  <MetricRow label="Mining status" value={pulse.latestBlock > 0 ? 'Blocks are being mined' : 'Waiting'} />
                  <MetricRow label="Difficulty" value={pulse.difficulty} />
                  <MetricRow label="Estimated hashrate" value={pulse.hashrate} />
                  <MetricRow label="Avg block time" value={pulse.avgBlockTime} />
                  <MetricRow label="Gas price" value={pulse.gasPrice} />
                  <MetricRow label="Last block utilization" value={pulse.gasUsedRatio} />
                  <MetricRow label="Last block age" value={pulse.lastBlockAge} />
                </div>
              </Panel>
            </div>

            <Panel className="xl:col-span-2">
              <SectionHead eyebrow="Fast routes" title="Open the useful parts of the network quickly" subtitle="Wallet, explorer, mining and pool stay one click away." />
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {routeCards.map((item) => (
                  <RouteCard key={item.title} {...item} />
                ))}
              </div>
            </Panel>
          </div>
        ) : null}

        {tab === 'explorer' ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <Panel>
              <SectionHead eyebrow="Mini explorer" title="Search live chain data" subtitle="Address, tx hash or block number." />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSearch()
                  }}
                  placeholder="0x... address, tx hash or block number"
                  className="min-h-12 flex-1 rounded-full border-[1.15px] border-white/[0.16] bg-black/35 px-4 text-sm text-white outline-none placeholder:text-white/32 focus:border-primary/45"
                />
                <button
                  onClick={handleSearch}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#7dd6ff]/70 bg-[linear-gradient(135deg,#0f9cff_0%,#39bcff_55%,#8fe4ff_100%)] px-5 text-sm font-bold text-black shadow-[0_18px_46px_rgba(19,164,255,0.28)]"
                >
                  {searchBusy ? 'Searching...' : 'Search'}
                </button>
              </div>
              {searchError ? <p className="mt-4 text-sm text-red-300">{searchError}</p> : null}
              <SearchResultPanel result={searchResult} />
            </Panel>

            <div className="grid gap-6">
              <Panel>
                <SectionHead eyebrow="Recent transactions" title="Latest activity" />
                <div className="mt-6 grid gap-3">
                  {recentTxs.map((tx) => (
                    <div key={tx.hash} className="flex items-center justify-between gap-4 rounded-[1.35rem] border-[1.15px] border-white/[0.16] bg-white/[0.03] px-4 py-3.5">
                      <div className="min-w-0">
                        <Link href={`${EXPLORER_BASE}/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="font-mono text-[13px] text-white underline-offset-4 hover:text-primary hover:underline">
                          {shortHex(tx.hash, 10, 6)}
                        </Link>
                        <p className="mt-1 text-sm text-white/54">{shortHex(tx.from, 6, 4)} → {shortHex(tx.to, 6, 4)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold tabular-nums text-white">{tx.value} INRI</p>
                        <p className="mt-1 text-xs text-white/44">#{formatNumber(tx.blockNumber)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <SectionHead eyebrow="Block list" title="Latest confirmed blocks" />
                <div className="mt-6 grid gap-3">
                  {displayBlocks.map((block) => (
                    <div key={block.block} className="flex items-center justify-between gap-4 rounded-[1.35rem] border-[1.15px] border-white/[0.16] bg-white/[0.03] px-4 py-3.5">
                      <div>
                        <p className="text-base font-bold tabular-nums text-white">#{formatNumber(block.block)}</p>
                        <p className="mt-1 text-sm text-white/54">{block.txs} txs • {formatAge(Math.floor(Date.now() / 1000) - block.timestamp)}</p>
                      </div>
                      <p className="font-mono text-[12px] text-white/48">{shortHex(block.miner, 8, 6)}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        ) : null}

        {tab === 'audience' ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Panel>
              <SectionHead eyebrow="Live audience map" title="Realtime visitors on the site" subtitle="Only renders real country activity when a realtime endpoint is connected." />
              <div className="mt-6">
                <WorldMap
                  totalLivePulse={totalLivePulse}
                  totalPeers={totalNetworkPeers}
                  poolMiners={poolConnectedMiners}
                  updatedAt={pulse.updatedAt}
                  audience={audience}
                />
              </div>
            </Panel>

            <div className="grid gap-6">
              <Panel>
                <SectionHead eyebrow="Network status" title="Current chain view" />
                <div className="mt-6 grid gap-3">
                  <MetricRow label="Chain ID" value={pulse.chainId} />
                  <MetricRow label="Network health" value={pulse.networkHealth} />
                  <MetricRow label="Sync status" value={pulse.syncStatus} />
                  <MetricRow label="Latest block" value={formatNumber(pulse.latestBlock)} />
                  <MetricRow label="Recent txs in last block" value={formatNumber(pulse.latestTxs)} />
                  <MetricRow label="Gas price" value={pulse.gasPrice} />
                </div>
              </Panel>

              <Panel>
                <SectionHead eyebrow="Top audience countries" title="Visitor feed by country" />
                <div className="mt-6 grid gap-3">
                  {(safeArray<AudiencePoint>(audience?.countries).length > 0
                    ? safeArray<AudiencePoint>(audience?.countries)
                    : [{ country: 'No live audience data', activeUsers: 0 } as AudiencePoint])
                    .slice(0, 6)
                    .map((node) => (
                      <div key={node.country} className="flex items-center justify-between gap-4 rounded-[1.35rem] border-[1.15px] border-white/[0.16] bg-white/[0.03] px-4 py-3.5">
                        <div>
                          <p className="text-base font-bold text-white">{node.country}</p>
                          <p className="mt-1 text-sm text-white/54">{node.activeUsers ? `${formatNumber(Number(node.activeUsers || 0))} active visitors` : 'Waiting for realtime audience source'}</p>
                        </div>
                        <span className="rounded-full border border-primary/28 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                          {node.activeUsers ? 'Live' : 'Offline'}
                        </span>
                      </div>
                    ))}
                </div>
              </Panel>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
