'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowUpRight,
  Blocks,
  Clock3,
  Flame,
  Gauge,
  Globe2,
  MapPinned,
  Network,
  Pickaxe,
  Search,
  ShieldCheck,
  Wallet,
  Waves,
} from 'lucide-react'

declare global {
  interface Window {
    INRI_POOL_PULSE?: any
  }
}

type TabKey = 'overview' | 'explorer' | 'global'

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

type SearchResult =
  | {
      type: 'address'
      title: string
      rows: Array<{ label: string; value: string; mono?: boolean }>
      activity: SearchActivity[]
    }
  | {
      type: 'tx' | 'block'
      title: string
      rows: Array<{ label: string; value: string; mono?: boolean }>
      activity?: never
    }
  | null

const RPC_URL = 'https://rpc.inri.life'
const WIDGET_URL = 'https://pool.inri.life/widget/pool-pulse.js'
const EXPLORER_BASE = 'https://explorer.inri.life'
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

const utilityRoutes = [
  {
    title: 'Wallet',
    text: 'Open the official INRI wallet and connect faster.',
    href: 'https://wallet.inri.life',
    external: true,
    icon: Wallet,
  },
  {
    title: 'Explorer',
    text: 'Verify blocks, transactions and addresses immediately.',
    href: 'https://explorer.inri.life',
    external: true,
    icon: Search,
  },
  {
    title: 'Mining',
    text: 'Show guides, pool entry and real network activity.',
    href: '/mining',
    icon: Pickaxe,
  },
  {
    title: 'Pool',
    text: 'Turn curiosity into active participation on the chain.',
    href: '/pool',
    icon: Gauge,
  },
]

const presenceNodes = [
  { name: 'North America', label: 'Explorer', detail: 'Routing + docs', x: 18, y: 28, delay: '0s' },
  { name: 'Brazil', label: 'Community', detail: 'Wallet + growth', x: 30, y: 66, delay: '0.4s' },
  { name: 'Europe', label: 'Nodes', detail: 'RPC + relay', x: 49, y: 26, delay: '0.8s' },
  { name: 'Middle East', label: 'P2P', detail: 'Route ready', x: 57, y: 40, delay: '1.2s' },
  { name: 'India', label: 'Mining', detail: 'Pool activity', x: 65, y: 46, delay: '1.6s' },
  { name: 'Southeast Asia', label: 'Wallet', detail: 'User entry', x: 74, y: 50, delay: '2s' },
]

function classNames(...parts: Array<string | false | null | undefined>) {
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

function buildRecentBlocks(blocks: any[]): RecentBlock[] {
  const ordered = [...blocks]
    .filter(Boolean)
    .sort((a, b) => hexToNumber(a?.number) - hexToNumber(b?.number))

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
  const ordered = [...blocks]
    .filter(Boolean)
    .sort((a, b) => hexToNumber(a?.number) - hexToNumber(b?.number))

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
    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.05] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <span className={classNames('h-2.5 w-2.5 rounded-full', pulse.status === 'ok' ? 'bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.95)]' : pulse.status === 'loading' ? 'bg-primary shadow-[0_0_14px_rgba(19,164,255,0.95)]' : 'bg-red-400')} />
      {label}
    </div>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={classNames(
        'rounded-[1.9rem] border-[1.3px] border-white/[0.20] bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.10),transparent_32%),linear-gradient(180deg,rgba(8,16,25,0.98),rgba(1,5,10,0.99))] p-5 shadow-[0_26px_92px_rgba(0,0,0,0.40),0_0_0_1px_rgba(19,164,255,0.05),inset_0_1px_0_rgba(255,255,255,0.05)]',
        className
      )}
    >
      {children}
    </div>
  )
}

function SectionTitle({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/90">{eyebrow}</p>
        <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">{title}</h3>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-7 text-white/58">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, foot }: { icon: any; label: string; value: string; foot: string }) {
  return (
    <div className="flex h-full min-h-[154px] flex-col justify-between rounded-[1.45rem] border-[1.25px] border-white/[0.22] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] px-4 py-4 shadow-[0_18px_46px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="min-h-[1.75rem] flex items-center gap-2 text-white/48">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-4 text-[1.95rem] font-bold leading-none tabular-nums text-white sm:text-[2.1rem]">{value}</p>
      <p className="mt-4 min-h-[2.6rem] text-[11px] uppercase tracking-[0.12em] text-white/38">{foot}</p>
    </div>
  )
}

function ListRow({ left, right, subtle = false }: { left: ReactNode; right: ReactNode; subtle?: boolean }) {
  return (
    <div className={classNames('flex items-center justify-between gap-4 rounded-[1.3rem] border-[1.15px] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]', subtle ? 'border-white/[0.14] bg-black/32' : 'border-white/[0.18] bg-white/[0.035]')}>
      <div className="min-w-0">{left}</div>
      <div className="shrink-0 text-right">{right}</div>
    </div>
  )
}

function RouteCard({ title, text, href, icon: Icon, external }: { title: string; text: string; href: string; icon: any; external?: boolean }) {
  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group rounded-[1.45rem] border-[1.2px] border-white/[0.20] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-4 shadow-[0_16px_44px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-px hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_24px_52px_rgba(19,164,255,0.12)]"
    >
      <div className="inline-flex rounded-2xl border border-primary/30 bg-primary/12 p-2.5 text-primary shadow-[0_0_22px_rgba(19,164,255,0.14)]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-white/58">{text}</p>
        </div>
        <ArrowUpRight className="mt-0.5 h-4 w-4 text-primary transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function GlobalPresenceMap({ totalLivePulse, totalPeers, poolMiners, updatedAt }: { totalLivePulse: number; totalPeers: number; poolMiners: number; updatedAt: string }) {
  return (
    <Card className="overflow-hidden">
      <SectionTitle
        eyebrow="Global network view"
        title="A world panel that feels closer to real analytics."
        subtitle="Designed to look memorable now and become a real active-users-by-country view later when you connect analytics."
        action={<span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Telemetry ready</span>}
      />

      <div className="mt-6 rounded-[1.8rem] border-[1.25px] border-white/[0.18] bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.16),transparent_34%),linear-gradient(180deg,rgba(3,8,14,0.98),rgba(0,0,0,0.99))] p-4 shadow-[0_22px_68px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="relative overflow-hidden rounded-[1.6rem] border-[1.2px] border-white/[0.16] bg-black/40 p-4 sm:p-5">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(19,164,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(19,164,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px] opacity-45" />
            <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-primary/12 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative h-[320px] sm:h-[380px]">
              <svg viewBox="0 0 1100 620" className="absolute inset-0 h-full w-full opacity-95">
                <defs>
                  <linearGradient id="map-line" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(19,164,255,0)" />
                    <stop offset="50%" stopColor="rgba(19,164,255,0.9)" />
                    <stop offset="100%" stopColor="rgba(19,164,255,0)" />
                  </linearGradient>
                  <linearGradient id="land-a" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(19,164,255,0.18)" />
                    <stop offset="100%" stopColor="rgba(19,164,255,0.04)" />
                  </linearGradient>
                </defs>
                <path d="M110 164C162 112 234 102 312 128C360 144 414 170 438 214C404 232 356 250 322 266C270 290 214 300 152 300C134 272 124 244 118 214C114 194 110 178 110 164Z" fill="url(#land-a)" stroke="rgba(19,164,255,0.18)" strokeWidth="2" />
                <path d="M302 312C342 322 366 350 374 388C382 432 364 480 334 532C294 520 276 478 280 438C284 392 290 346 302 312Z" fill="url(#land-a)" stroke="rgba(19,164,255,0.18)" strokeWidth="2" />
                <path d="M490 164C532 144 576 148 614 168C634 180 650 202 650 222C624 228 602 244 584 268C562 268 546 258 530 248C506 232 492 208 490 164Z" fill="url(#land-a)" stroke="rgba(19,164,255,0.18)" strokeWidth="2" />
                <path d="M544 262C602 248 650 270 678 312C706 354 706 414 686 472C628 494 566 488 526 460C488 432 470 386 472 340C474 306 500 274 544 262Z" fill="url(#land-a)" stroke="rgba(19,164,255,0.18)" strokeWidth="2" />
                <path d="M642 174C716 138 810 138 886 170C938 192 986 232 1000 280C956 296 918 292 874 314C830 336 766 332 714 316C692 294 678 262 668 232C660 208 650 190 642 174Z" fill="url(#land-a)" stroke="rgba(19,164,255,0.18)" strokeWidth="2" />
                <path d="M816 420C854 406 900 412 930 440C948 458 958 484 954 506C916 518 878 520 844 510C816 500 796 478 796 454C796 440 802 430 816 420Z" fill="url(#land-a)" stroke="rgba(19,164,255,0.18)" strokeWidth="2" />
                <path d="M200 205 Q440 100 676 200" fill="none" stroke="url(#map-line)" strokeWidth="2.4" />
                <path d="M290 410 Q500 228 668 300" fill="none" stroke="url(#map-line)" strokeWidth="2.2" />
                <path d="M564 234 Q732 184 846 250" fill="none" stroke="url(#map-line)" strokeWidth="2" />
                <path d="M320 270 Q520 202 760 330" fill="none" stroke="url(#map-line)" strokeWidth="1.8" opacity="0.8" />
                <path d="M520 238 Q660 236 848 454" fill="none" stroke="url(#map-line)" strokeWidth="1.8" opacity="0.75" />
              </svg>
              {presenceNodes.map((node) => (
                <div key={node.name} className="absolute" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                  <div className="absolute -inset-5 animate-ping rounded-full border border-primary/35" style={{ animationDelay: node.delay, animationDuration: '3.3s' }} />
                  <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-[0_0_28px_rgba(19,164,255,0.95)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                  <div className="mt-3 rounded-full border-[1.15px] border-white/[0.18] bg-black/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md">
                    {node.name} • {node.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid content-start gap-3">
            <div className="rounded-[1.4rem] border-[1.2px] border-white/[0.18] bg-white/[0.035] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Country-ready telemetry</p>
              <p className="mt-2 text-sm leading-7 text-white/58">
                This block is shaped like an analytics surface so later you can plug in real country activity without redesigning the homepage again.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {presenceNodes.map((node, index) => (
                <div key={`${node.name}-card`} className="rounded-[1.3rem] border-[1.15px] border-white/[0.16] bg-black/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{node.name}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/40">{node.label}</p>
                    </div>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Ready</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/58">{node.detail}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(19,164,255,0.95),rgba(108,220,255,0.95))]" style={{ width: `${48 + index * 7}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total live pulse', formatNumber(totalLivePulse)],
            ['Network peers', formatNumber(totalPeers)],
            ['Pool miners', formatNumber(poolMiners)],
            ['Last refresh', updatedAt],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-[1.25rem] border-[1.15px] border-white/[0.16] bg-black/32 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/42">{label}</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs leading-6 text-white/48">
        Connect GA4 Realtime, Vercel Web Analytics or Cloudflare analytics later to turn this into a true live users-by-country panel.
      </p>
    </Card>
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
        const targets = Array.from({ length: RECENT_BLOCK_WINDOW }, (_, index) => latestBlockNumber - index)
          .filter((value) => value >= 0)
          .reverse()

        const blocks = await Promise.all(targets.map((blockNumber) => rpc('eth_getBlockByNumber', [numberToHex(blockNumber), true])))
        const latestBlock = blocks[blocks.length - 1]
        const averageBlockTime = getAverageBlockTime(blocks)
        const gasUsed = hexToNumber(latestBlock?.gasUsed)
        const gasLimit = Math.max(hexToNumber(latestBlock?.gasLimit), 1)
        const estimatedHashrate = estimateHashrateFromDifficulty(latestBlock?.difficulty, averageBlockTime)
        const latestTxCount = safeArray(latestBlock?.transactions).length
        const totalPeers = FIXED_RPC_CHAIN_PEERS + hexToNumber(peerHex) + FIXED_BOOT1_PEERS + FIXED_BOOT2_PEERS

        const widget = await loadPoolWidget()
        if (widget?.totals) {
          widgetCache = widget
        }

        if (!mounted) return

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

  const mergedBlocks = safeArray(poolData?.merged?.blocks).slice(0, 10)
  const mergedPayments = safeArray(poolData?.merged?.payments).slice(0, 10)
  const mergedMiners = safeArray(poolData?.merged?.miners).slice(0, 10)
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
    <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
      <div className="overflow-hidden rounded-[2.55rem] border-[1.35px] border-white/[0.20] bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(19,164,255,0.09),transparent_24%),linear-gradient(180deg,rgba(5,10,16,0.98),rgba(0,0,0,0.99))] shadow-[0_40px_170px_rgba(0,0,0,0.58),0_0_0_1px_rgba(19,164,255,0.08)]">
        <div className="border-b border-white/[0.12] px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Network command center</p>
              <h2 className="mt-3 max-w-4xl text-3xl font-bold text-white sm:text-4xl">Give the homepage real proof, useful routes and a stronger blue-on-black impact.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58 sm:text-base">
                This section is designed to feel complete like a premium command center: live network proof, pool pulse, mini explorer and a global-view panel that can evolve into real-time analytics later.
              </p>
            </div>
            <StatusPill pulse={pulse} />
          </div>

          <div className="mt-6 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {topMetrics.map((item) => (
              <MetricCard key={item.label} icon={item.icon} label={item.label} value={item.value} foot={item.foot} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {([
              { key: 'overview', label: 'Overview' },
              { key: 'explorer', label: 'Explorer' },
              { key: 'global', label: 'Global view' },
            ] as Array<{ key: TabKey; label: string }>).map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={classNames(
                  'rounded-full border-[1.15px] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.14em] transition',
                  tab === item.key
                    ? 'border-primary/50 bg-primary text-black shadow-[0_14px_40px_rgba(19,164,255,0.26)]'
                    : 'border-white/[0.18] bg-white/[0.035] text-white/72 hover:border-primary/40 hover:bg-primary/10 hover:text-white'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {tab === 'overview' ? (
            <div className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
                <Card className="overflow-hidden">
                  <SectionTitle
                    eyebrow="Recent rhythm"
                    title="Recent blocks in a stronger visual system."
                    subtitle="More data, more breathing room and thicker borders so the live area feels premium instead of crowded."
                  />

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      { label: 'Chain', value: pulse.chainId },
                      { label: 'Difficulty', value: pulse.difficulty },
                      { label: 'Hashrate', value: pulse.hashrate },
                      { label: 'Gas', value: pulse.gasUsedRatio },
                    ].map((item) => (
                      <span key={item.label} className="rounded-full border-[1.15px] border-white/[0.18] bg-white/[0.045] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/76">
                        {item.label}: <span className="text-white">{item.value}</span>
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 grid grid-cols-6 items-end gap-3 sm:gap-4">
                    {chartBlocks.map((item) => {
                      const height = `${Math.max(34, (item.interval / maxInterval) * 136)}px`
                      return (
                        <div key={item.block} className="flex flex-col items-center gap-3">
                          <div className="flex h-40 w-full items-end justify-center rounded-[1.45rem] border-[1.2px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-2 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.03)]">
                            <div
                              className="w-full rounded-full bg-[linear-gradient(180deg,rgba(32,184,255,0.98),rgba(19,164,255,0.14))] shadow-[0_18px_40px_rgba(19,164,255,0.24)]"
                              style={{ height }}
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-white">{item.interval}s</p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/38">#{String(item.block).slice(-4)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-7 space-y-3">
                    {displayBlocks.map((item) => (
                      <ListRow
                        key={item.block}
                        left={
                          <>
                            <p className="text-sm font-bold text-white">Block #{item.block}</p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">
                              {item.interval}s • {item.txs} txs • {formatAge(Math.floor(Date.now() / 1000) - item.timestamp)}
                            </p>
                          </>
                        }
                        right={
                          <>
                            <p className="text-[11px] uppercase tracking-[0.14em] text-white/38">Gas</p>
                            <p className="mt-1 text-sm font-bold text-primary">{item.gasUsedPct}%</p>
                          </>
                        }
                        subtle
                      />
                    ))}
                  </div>
                </Card>

                <div className="space-y-5">
                  <Card>
                    <SectionTitle eyebrow="Pool overview" title="PPLNS and SOLO together, but cleaner." action={<span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/48">PPLNS + SOLO</span>} />
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {[
                        { name: 'PPLNS', data: pplns },
                        { name: 'SOLO', data: solo },
                      ].map((item) => (
                        <div key={item.name} className="rounded-[1.6rem] border-[1.2px] border-white/[0.20] bg-black/35 p-4 shadow-[0_16px_38px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.03)]">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xl font-bold text-white">{item.name}</p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">
                                {item.data?.lastBlock ? `Height ${formatNumber(Number(item.data.lastBlock))}` : 'No recent block'} • payments {formatNumber(Number(item.data?.paymentsCount || 0))}
                              </p>
                            </div>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{item.name}</span>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {[
                              { label: 'Connected miners', value: formatNumber(Number(item.data?.connectedMiners || 0)) },
                              { label: 'Active workers', value: formatNumber(Number(item.data?.activeWorkers || 0)) },
                              { label: 'Pool hashrate', value: formatHashrate(Number(item.data?.poolHashrate || 0)) },
                              { label: 'Recent payments', value: formatNumber(Number(item.data?.paymentsCount || 0)) },
                            ].map((stat) => (
                              <div key={stat.label} className="rounded-[1.2rem] border-[1.15px] border-white/[0.18] bg-white/[0.035] px-3 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{stat.label}</p>
                                <p className="mt-2 text-lg font-bold text-white">{stat.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle eyebrow="Network pulse" title="The current state of the chain, not just pretty cards." action={<span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/48">Main RPC</span>} />
                    <div className="mt-5 space-y-3">
                      {[
                        ['rpc-chain peers', formatNumber(FIXED_RPC_CHAIN_PEERS)],
                        ['boot1 peers', formatNumber(FIXED_BOOT1_PEERS)],
                        ['boot2 peers', formatNumber(FIXED_BOOT2_PEERS)],
                        ['Main RPC peers', formatNumber(pulse.rpcPeers)],
                        ['Network health', pulse.networkHealth],
                        ['Sync status', pulse.syncStatus],
                        ['Gas price', pulse.gasPrice],
                        ['Last block age', pulse.lastBlockAge],
                      ].map(([label, value]) => (
                        <ListRow
                          key={String(label)}
                          left={<p className="text-sm text-white/62">{label}</p>}
                          right={<p className="text-sm font-bold tabular-nums text-white">{value}</p>}
                        />
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle eyebrow="Mining & gas pulse" title="Useful live data for miners too." action={<span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/48">Main RPC</span>} />
                    <div className="mt-5 space-y-3">
                      {[
                        ['Mining status', pulse.latestBlock > 0 ? 'Blocks are being mined' : 'Waiting for miners'],
                        ['Difficulty', pulse.difficulty],
                        ['Estimated hashrate', pulse.hashrate],
                        ['Avg block time', pulse.avgBlockTime],
                        ['Last block utilization', pulse.gasUsedRatio],
                        ['Latest txs', formatNumber(pulse.latestTxs)],
                      ].map(([label, value]) => (
                        <ListRow
                          key={String(label)}
                          left={<p className="text-sm text-white/62">{label}</p>}
                          right={<p className="text-sm font-bold tabular-nums text-white">{value}</p>}
                        />
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
                <Card>
                  <SectionTitle eyebrow="Latest pool payments" title="Recent movement from the pool." action={<span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/48">PPLNS + SOLO</span>} />
                  <div className="mt-5 space-y-3">
                    {mergedPayments.length ? (
                      mergedPayments.map((payment: any, index: number) => (
                        <ListRow
                          key={`${payment.address}-${payment.created}-${index}`}
                          left={
                            <>
                              <p className="font-semibold text-white">{shortHex(payment.address || '—', 8, 6)}</p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">
                                {(payment.poolId || payment.poolid || 'pool').toString()} • {payment.created ? new Date(payment.created).toLocaleString() : '—'}
                              </p>
                            </>
                          }
                          right={
                            <>
                              <p className="font-bold text-white">{Number(payment.amount || 0).toFixed(4)} INRI</p>
                              {payment.transactionConfirmationData ? (
                                <Link href={`${EXPLORER_BASE}/tx/${payment.transactionConfirmationData}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary">
                                  {shortHex(payment.transactionConfirmationData, 8, 6)} <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                              ) : (
                                <p className="mt-1 text-[11px] text-white/36">No tx link</p>
                              )}
                            </>
                          }
                          subtle
                        />
                      ))
                    ) : (
                      <p className="text-sm text-white/48">Pool widget data is still loading.</p>
                    )}
                  </div>
                </Card>

                <Card>
                  <SectionTitle eyebrow="Top miners and latest transactions" title="More reasons for the user to stay on the page." subtitle="A stronger home page should already answer basic trust and activity questions before the user clicks away." />
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                      {mergedMiners.length ? (
                        mergedMiners.map((miner: any, index: number) => (
                          <ListRow
                            key={`${miner.miner}-${index}`}
                            left={
                              <>
                                <p className="font-semibold text-white">#{index + 1} <span className="font-semibold text-white/72">{shortHex(miner.miner || '—', 8, 6)}</span></p>
                                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">shares {formatNumber(Number(miner.sharesPerSecond || 0))}</p>
                              </>
                            }
                            right={<p className="font-bold text-primary">{formatHashrate(Number(miner.hashrate || 0))}</p>}
                            subtle
                          />
                        ))
                      ) : (
                        <p className="text-sm text-white/48">Top miners will appear here when widget data is available.</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {recentTxs.map((tx) => (
                        <ListRow
                          key={tx.hash}
                          left={
                            <>
                              <Link href={`${EXPLORER_BASE}/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="font-semibold text-white hover:text-primary">
                                {shortHex(tx.hash, 8, 6)}
                              </Link>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">
                                {shortHex(tx.from, 6, 4)} → {shortHex(tx.to, 6, 4)}
                              </p>
                            </>
                          }
                          right={
                            <>
                              <p className="font-bold text-white">{tx.value} INRI</p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">#{formatNumber(tx.blockNumber)}</p>
                            </>
                          }
                          subtle
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}

          {tab === 'explorer' ? (
            <div className="space-y-5">
              <Card>
                <SectionTitle eyebrow="Mini explorer" title="Search the chain without leaving the homepage." subtitle="Address, transaction and block lookups stay right here for a better first impression." />
                <div className="mt-5 flex flex-col gap-3 rounded-[1.55rem] border border-white/[0.16] bg-white/[0.03] p-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.2rem] border border-white/[0.12] bg-black/40 px-4 py-3">
                    <Search className="h-4 w-4 shrink-0 text-primary" />
                    <input
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSearch()
                      }}
                      placeholder="Search by address, tx hash or block number"
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/32"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searchBusy}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-primary/50 bg-primary px-5 text-sm font-bold uppercase tracking-[0.14em] text-black shadow-[0_16px_44px_rgba(19,164,255,0.24)] transition hover:bg-[#37b0ff] disabled:opacity-60"
                  >
                    {searchBusy ? 'Searching…' : 'Search'}
                  </button>
                </div>
                {searchError ? <p className="mt-3 text-sm text-red-300">{searchError}</p> : null}
              </Card>

              <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
                <Card>
                  <SectionTitle eyebrow="Latest transactions" title="Fresh chain activity." action={<Link href={EXPLORER_BASE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary">Full explorer <ArrowUpRight className="h-4 w-4" /></Link>} />
                  <div className="mt-5 space-y-3">
                    {recentTxs.map((tx) => (
                      <ListRow
                        key={tx.hash}
                        left={
                          <>
                            <Link href={`${EXPLORER_BASE}/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="font-semibold text-white hover:text-primary">
                              {shortHex(tx.hash, 8, 6)}
                            </Link>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">
                              {shortHex(tx.from, 6, 4)} → {shortHex(tx.to, 6, 4)}
                            </p>
                          </>
                        }
                        right={
                          <>
                            <p className="font-bold text-white">{tx.value} INRI</p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">#{formatNumber(tx.blockNumber)}</p>
                          </>
                        }
                        subtle
                      />
                    ))}
                  </div>
                </Card>

                <div className="space-y-5">
                  <Card>
                    <SectionTitle eyebrow="Latest blocks" title="Recent block snapshot." />
                    <div className="mt-5 space-y-3">
                      {displayBlocks.map((item) => (
                        <ListRow
                          key={item.block}
                          left={
                            <>
                              <p className="font-semibold text-white">#{formatNumber(item.block)}</p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">{shortHex(item.miner, 8, 6)}</p>
                            </>
                          }
                          right={
                            <>
                              <p className="font-bold text-white">{formatNumber(item.txs)} tx</p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">{formatAge(Math.floor(Date.now() / 1000) - item.timestamp)}</p>
                            </>
                          }
                          subtle
                        />
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle eyebrow="Search result" title={searchResult ? searchResult.title : 'Ready for your lookup'} subtitle={searchResult ? undefined : 'Try an address, tx hash or block number.'} />
                    {searchResult ? (
                      <div className="mt-5 space-y-3">
                        {searchResult.rows.map((row) => (
                          <ListRow
                            key={row.label}
                            left={<p className="text-sm text-white/58">{row.label}</p>}
                            right={<p className={classNames('max-w-[18rem] break-all text-sm font-bold text-white', row.mono && 'font-mono text-[13px]')}>{row.value}</p>}
                            subtle
                          />
                        ))}
                        {searchResult.type === 'address' ? (
                          <div className="mt-4 rounded-[1.35rem] border border-white/[0.14] bg-black/30 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary/90">Recent activity</p>
                            <div className="mt-3 space-y-3">
                              {searchResult.activity.length ? (
                                searchResult.activity.map((item) => (
                                  <ListRow
                                    key={item.hash}
                                    left={
                                      <>
                                        <p className="font-semibold text-white">{shortHex(item.hash, 8, 6)}</p>
                                        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">{item.direction} • {shortHex(item.counterparty, 8, 6)}</p>
                                      </>
                                    }
                                    right={
                                      <>
                                        <p className="font-bold text-white">{item.value}</p>
                                        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">#{formatNumber(item.blockNumber)}</p>
                                      </>
                                    }
                                    subtle
                                  />
                                ))
                              ) : (
                                <p className="text-sm text-white/48">No recent activity found in the scanned block window.</p>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </Card>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'global' ? (
            <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
              <GlobalPresenceMap totalLivePulse={totalLivePulse} totalPeers={totalNetworkPeers} poolMiners={poolConnectedMiners} updatedAt={pulse.updatedAt} />

              <div className="space-y-5">
                <Card>
                  <SectionTitle eyebrow="Mining & gas pulse" title="Keep the homepage useful for miners too." action={<span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/48">Main RPC</span>} />
                  <div className="mt-5 space-y-3">
                    {[
                      ['Mining status', pulse.latestBlock > 0 ? 'Blocks are being mined' : 'Waiting for miners'],
                      ['Difficulty', pulse.difficulty],
                      ['Estimated hashrate', pulse.hashrate],
                      ['Avg block time', pulse.avgBlockTime],
                      ['Gas price', pulse.gasPrice],
                      ['Last block utilization', pulse.gasUsedRatio],
                      ['Last block age', pulse.lastBlockAge],
                    ].map(([label, value]) => (
                      <ListRow
                        key={String(label)}
                        left={<p className="text-sm text-white/58">{label}</p>}
                        right={<p className="text-sm font-bold text-white">{value}</p>}
                      />
                    ))}
                  </div>
                </Card>

                <Card>
                  <SectionTitle eyebrow="Utility routes" title="Make the next action obvious." subtitle="Users stay longer when the page feels alive and useful from the first screen." />
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {utilityRoutes.map((route) => (
                      <RouteCard key={route.title} {...route} />
                    ))}
                  </div>
                </Card>

                <Card>
                  <SectionTitle eyebrow="Why this matters" title="An unforgettable experience still has to stay honest." />
                  <div className="mt-4 space-y-3 text-sm leading-7 text-white/60">
                    <p>
                      A stronger homepage should combine brand impact, real chain proof and clear utility. That is why this panel mixes live RPC data, pool activity and a telemetry-ready global section instead of fake visitor numbers.
                    </p>
                    <p>
                      When you connect a real analytics source later, the map can evolve into true live geography without redesigning the whole homepage again.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
