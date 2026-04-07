'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Blocks,
  Cpu,
  Gauge,
  Globe2,
  Layers3,
  Pickaxe,
  Radar,
  ShieldCheck,
  Sparkles,
  Wallet,
  Waves,
  Zap,
} from 'lucide-react'

type CommandView = 'overview' | 'blocks' | 'mining'

type BlockRow = {
  number: number
  label: string
  interval: number
  gasUsedPct: number
  txCount: number
  baseFeeGwei: number
  miner: string
  timestamp: number
}

type PoolPulsePayload = {
  totals?: {
    connectedMiners?: number
    activeWorkers?: number
    poolHashrate?: number
    lastBlock?: number
    paymentsCount?: number
  }
}

type PulseState = {
  blockNumber: number | null
  chainId: number | null
  peers: number | null
  totalObservedPeers: number | null
  difficulty: string
  hashrate: string
  avgBlockTime: number | null
  gasUsedPct: number | null
  txCount: number | null
  baseFeeGwei: number | null
  poolConnectedMiners: number | null
  poolHashrate: string
  poolLastBlock: number | null
  paymentsCount: number | null
  updatedAt: string
  status: 'ok' | 'error' | 'loading'
  blocks: BlockRow[]
}

const RPC_URL = 'https://rpc.inri.life'
const WIDGET_URL = 'https://pool.inri.life/widget/pool-pulse.js'
const REFRESH_INTERVAL = 12000
const RECENT_BLOCKS = 12

const FIXED_RPC_CHAIN_PEERS = 13
const FIXED_BOOT1_PEERS = 25
const FIXED_BOOT2_PEERS = 15

const initialState: PulseState = {
  blockNumber: null,
  chainId: null,
  peers: null,
  totalObservedPeers: null,
  difficulty: '-',
  hashrate: '-',
  avgBlockTime: null,
  gasUsedPct: null,
  txCount: null,
  baseFeeGwei: null,
  poolConnectedMiners: null,
  poolHashrate: '-',
  poolLastBlock: null,
  paymentsCount: null,
  updatedAt: '—',
  status: 'loading',
  blocks: [],
}

async function rpc(method: string, params: unknown[] = []) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.status}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message || 'RPC error')
  }

  return data.result
}

function formatShortNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '-'
  if (value < 1000) return String(Math.round(value))

  const units = ['', 'K', 'M', 'B', 'T']
  let current = value
  let unit = 0

  while (current >= 1000 && unit < units.length - 1) {
    current /= 1000
    unit += 1
  }

  const digits = current >= 10 ? 1 : 2
  return `${current.toFixed(digits)}${units[unit]}`
}

function formatPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '-'
  return `${value.toFixed(value >= 10 ? 1 : 2)}%`
}

function formatBigHexShort(hex?: string) {
  if (!hex) return '-'

  try {
    let value = BigInt(hex)
    const units = ['', 'K', 'M', 'G', 'T', 'P']
    let unit = 0

    while (value >= 1000n && unit < units.length - 1) {
      value /= 1000n
      unit += 1
    }

    return `${value.toString()}${units[unit]}`
  } catch {
    return '-'
  }
}

function formatHashrate(value: number | null | undefined, compact = false) {
  if (value == null || !Number.isFinite(value) || value <= 0) return '-'

  const units = compact ? ['H', 'kH', 'MH', 'GH', 'TH', 'PH'] : ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s']
  let current = value
  let unit = 0

  while (current >= 1000 && unit < units.length - 1) {
    current /= 1000
    unit += 1
  }

  return `${current.toFixed(compact ? 1 : 2)} ${units[unit]}`.trim()
}

function hexToNumber(hex?: string) {
  if (!hex) return 0
  return parseInt(hex, 16)
}

function hexToBigInt(hex?: string) {
  if (!hex) return 0n
  return BigInt(hex)
}

function gweiFromHex(hex?: string) {
  if (!hex) return 0
  const value = Number(hexToBigInt(hex))
  return value / 1e9
}

function estimateHashrate(difficultyHex?: string, avgBlockTime?: number | null) {
  if (!difficultyHex || !avgBlockTime || avgBlockTime <= 0) return null

  try {
    const difficulty = hexToBigInt(difficultyHex)
    const blockTime = BigInt(Math.max(1, Math.round(avgBlockTime)))
    const estimate = difficulty / blockTime
    const capped = estimate > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : estimate
    return Number(capped)
  } catch {
    return null
  }
}

function formatClock(value: Date) {
  return value.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function shortAddress(value?: string) {
  if (!value) return '—'
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

function getStatusLabel(status: PulseState['status']) {
  if (status === 'ok') return 'live'
  if (status === 'loading') return 'loading'
  return 'offline'
}

function getIntervalColumnHeight(interval: number, maxInterval: number) {
  if (!Number.isFinite(interval) || interval <= 0) return 18
  if (!Number.isFinite(maxInterval) || maxInterval <= 0) return 22
  return Math.max(18, Math.round((interval / maxInterval) * 100))
}

async function loadPoolPulse(): Promise<PoolPulsePayload | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }

    const win = window as Window & { INRI_POOL_PULSE?: PoolPulsePayload }
    const existing = document.getElementById('inri-pool-pulse-script')
    if (existing) existing.remove()

    const script = document.createElement('script')
    script.id = 'inri-pool-pulse-script'
    script.src = `${WIDGET_URL}?t=${Date.now()}`
    script.async = true

    script.onload = () => {
      resolve(win.INRI_POOL_PULSE ?? null)
    }

    script.onerror = () => {
      resolve(null)
    }

    document.head.appendChild(script)
  })
}

function SignalCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  icon: typeof Activity
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">{label}</p>
          <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">{value}</p>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/62">{detail}</p>
    </div>
  )
}

function ActionCard({
  href,
  title,
  text,
  icon: Icon,
  external = false,
}: {
  href: string
  title: string
  text: string
  icon: typeof Activity
  external?: boolean
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4 transition hover:border-primary/35 hover:bg-primary/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
    </Link>
  )
}

export function NetworkPulse() {
  const [pulse, setPulse] = useState<PulseState>(initialState)
  const [view, setView] = useState<CommandView>('overview')

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [blockHex, peerHex, chainIdHex] = await Promise.all([
          rpc('eth_blockNumber'),
          rpc('net_peerCount'),
          rpc('eth_chainId'),
        ])

        const latestBlockNumber = hexToNumber(blockHex)
        const start = Math.max(0, latestBlockNumber - RECENT_BLOCKS)
        const blockCalls: Promise<any>[] = []

        for (let blockNumber = start; blockNumber <= latestBlockNumber; blockNumber += 1) {
          blockCalls.push(rpc('eth_getBlockByNumber', [`0x${blockNumber.toString(16)}`, true]))
        }

        const [blocksRaw, poolData] = await Promise.all([
          Promise.all(blockCalls),
          loadPoolPulse(),
        ])

        const blocks = blocksRaw.filter(Boolean)
        const normalizedBlocks: BlockRow[] = blocks.map((block: any, index: number) => {
          const previous = index > 0 ? blocks[index - 1] : null
          const timestamp = hexToNumber(block?.timestamp)
          const previousTimestamp = previous ? hexToNumber(previous.timestamp) : timestamp
          const gasUsed = hexToNumber(block?.gasUsed)
          const gasLimit = Math.max(1, hexToNumber(block?.gasLimit))

          return {
            number: hexToNumber(block?.number),
            label: `#${formatShortNumber(hexToNumber(block?.number))}`,
            interval: index === 0 ? 0 : Math.max(1, timestamp - previousTimestamp),
            gasUsedPct: (gasUsed / gasLimit) * 100,
            txCount: Array.isArray(block?.transactions) ? block.transactions.length : 0,
            baseFeeGwei: gweiFromHex(block?.baseFeePerGas),
            miner: shortAddress(block?.miner),
            timestamp,
          }
        })

        const latestBlock = blocks[blocks.length - 1]
        const intervals = normalizedBlocks.map((item) => item.interval).filter((item) => item > 0)
        const avgBlockTime = intervals.length > 0 ? intervals.reduce((acc, item) => acc + item, 0) / intervals.length : null
        const difficultyHex = latestBlock?.difficulty || '0x0'
        const estimatedHashrate = estimateHashrate(difficultyHex, avgBlockTime)
        const peers = hexToNumber(peerHex)
        const poolConnectedMiners = Number(poolData?.totals?.connectedMiners || 0)

        const nextState: PulseState = {
          blockNumber: latestBlockNumber,
          chainId: hexToNumber(chainIdHex),
          peers,
          totalObservedPeers: FIXED_RPC_CHAIN_PEERS + peers + FIXED_BOOT1_PEERS + FIXED_BOOT2_PEERS + poolConnectedMiners,
          difficulty: formatBigHexShort(difficultyHex),
          hashrate: formatHashrate(estimatedHashrate),
          avgBlockTime,
          gasUsedPct: normalizedBlocks.length > 0 ? normalizedBlocks[normalizedBlocks.length - 1].gasUsedPct : null,
          txCount: normalizedBlocks.length > 0 ? normalizedBlocks[normalizedBlocks.length - 1].txCount : null,
          baseFeeGwei: normalizedBlocks.length > 0 ? normalizedBlocks[normalizedBlocks.length - 1].baseFeeGwei : null,
          poolConnectedMiners,
          poolHashrate: formatHashrate(Number(poolData?.totals?.poolHashrate || 0)),
          poolLastBlock: Number(poolData?.totals?.lastBlock || 0) || null,
          paymentsCount: Number(poolData?.totals?.paymentsCount || 0) || null,
          updatedAt: formatClock(new Date()),
          status: 'ok',
          blocks: normalizedBlocks.slice(-RECENT_BLOCKS),
        }

        if (!mounted) return
        setPulse(nextState)
      } catch {
        if (!mounted) return
        setPulse((current) => ({
          ...current,
          status: 'error',
          updatedAt: 'offline',
        }))
      }
    }

    load()
    const intervalId = window.setInterval(load, REFRESH_INTERVAL)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const summary = useMemo(
    () => [
      {
        label: 'Latest block',
        value: pulse.blockNumber != null ? formatShortNumber(pulse.blockNumber) : '-',
        detail: 'Current chain height from the INRI RPC.',
        icon: Blocks,
      },
      {
        label: 'Observed nodes',
        value: pulse.totalObservedPeers != null ? formatShortNumber(pulse.totalObservedPeers) : '-',
        detail: 'RPC peers plus the fixed network and pool view from the status model.',
        icon: Globe2,
      },
      {
        label: 'Avg block time',
        value: pulse.avgBlockTime != null ? `${pulse.avgBlockTime.toFixed(1)}s` : '-',
        detail: 'Calculated from the most recent on-chain blocks.',
        icon: Gauge,
      },
      {
        label: 'Estimated hashrate',
        value: pulse.hashrate,
        detail: 'Approximation from recent block timing and latest difficulty.',
        icon: Zap,
      },
    ],
    [pulse],
  )

  const maxInterval = useMemo(() => {
    const values = pulse.blocks.map((item) => item.interval).filter((item) => item > 0)
    return values.length ? Math.max(...values) : 1
  }, [pulse.blocks])

  const maxGasPct = useMemo(() => {
    const values = pulse.blocks.map((item) => item.gasUsedPct).filter((item) => Number.isFinite(item))
    return values.length ? Math.max(...values) : 100
  }, [pulse.blocks])

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">Live network layer</p>
          <h2 className="mt-3 max-w-4xl text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            A real command center for the network, not just a row of static numbers.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-8 text-white/70 sm:text-base">
          The strongest blockchain sites pair clean positioning with visible network proof. This section turns the homepage into a live surface for chain signals, mining visibility and operational trust.
        </p>
      </div>

      <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 shadow-[0_28px_100px_rgba(0,0,0,0.24)] backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-4 rounded-[1.45rem] border border-white/8 bg-[#06111e]/90 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-white/55">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_0_6px_rgba(34,211,238,0.12),0_0_18px_rgba(34,211,238,0.85)]" />
                <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-400 bg-clip-text font-extrabold tracking-[0.28em] text-transparent">INRI CHAIN</span>
              </span>
              <span>POW</span>
              <span>Chain {pulse.chainId != null ? `${pulse.chainId} / 0x${pulse.chainId.toString(16).toUpperCase()}` : '—'}</span>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              {[
                ['Block', pulse.blockNumber != null ? formatShortNumber(pulse.blockNumber) : '-'],
                ['Peers', pulse.totalObservedPeers != null ? formatShortNumber(pulse.totalObservedPeers) : '-'],
                ['Diff', pulse.difficulty],
                ['Hashrate', pulse.hashrate],
                ['Avg', pulse.avgBlockTime != null ? `${pulse.avgBlockTime.toFixed(1)}s` : '-'],
              ].map(([label, value]) => (
                <div key={label} className="inline-flex min-w-[118px] items-center justify-between gap-5 rounded-full border border-white/12 bg-white/95 px-4 py-2 text-[#0b1525] shadow-[0_16px_38px_rgba(0,0,0,0.18)]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">{label}</span>
                  <span className="text-xs font-bold">{value}</span>
                </div>
              ))}
            </div>

            <div className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-white/45 md:block">Updated {pulse.updatedAt}</div>
          </div>

          <div className="grid grid-cols-4 gap-3 md:hidden">
            {[
              ['Block', pulse.blockNumber != null ? formatShortNumber(pulse.blockNumber) : '-'],
              ['Peers', pulse.totalObservedPeers != null ? formatShortNumber(pulse.totalObservedPeers) : '-'],
              ['Hash', pulse.hashrate === '-' ? '-' : pulse.hashrate.replace('/s', '')],
              ['Time', pulse.updatedAt],
            ].map(([label, value], index) => (
              <div key={`${label}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{label}</p>
                <p className="mt-2 truncate text-xs font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_120px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">Network command center</p>
              <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Live telemetry, recent blocks and mining routes in one surface.</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['overview', 'blocks', 'mining'] as CommandView[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setView(tab)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                    view === tab
                      ? 'border border-primary/35 bg-primary text-primary-foreground shadow-[0_14px_34px_rgba(19,164,255,0.28)]'
                      : 'border border-white/10 bg-white/[0.05] text-white/72 hover:border-primary/25 hover:bg-primary/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-7 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#06111d] p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(19,164,255,0.20),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.18),transparent_18%),radial-gradient(circle_at_50%_84%,rgba(34,211,238,0.12),transparent_18%)]" />
            <div className="relative">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary/80">Signal board</p>
                  <h4 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                    {view === 'overview' && 'Operational view of the network'}
                    {view === 'blocks' && 'Recent block behavior and timing'}
                    {view === 'mining' && 'Mining surface and pool visibility'}
                  </h4>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  <Activity className="h-3.5 w-3.5" />
                  {getStatusLabel(pulse.status)}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summary.map((item) => (
                  <SignalCard key={item.label} label={item.label} value={item.value} detail={item.detail} icon={item.icon} />
                ))}
              </div>

              {view === 'overview' && (
                <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(3,10,18,0.48),rgba(9,20,33,0.92))] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Recent block cadence</p>
                        <h5 className="mt-2 text-lg font-bold text-white">Intervals across the latest blocks</h5>
                      </div>
                      <div className="text-xs text-white/45">window {pulse.blocks.length}</div>
                    </div>

                    <div className="mt-6 flex h-[210px] items-end gap-2 overflow-hidden rounded-[1.25rem] border border-white/8 bg-black/20 px-3 pb-3 pt-6">
                      {pulse.blocks.length === 0 ? (
                        <div className="flex h-full w-full items-center justify-center text-sm text-white/45">Waiting for live blocks…</div>
                      ) : (
                        pulse.blocks.map((block, index) => {
                          const height = getIntervalColumnHeight(block.interval || 1, maxInterval)
                          return (
                            <div key={`${block.number}-${index}`} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                                {block.interval > 0 ? `${block.interval}s` : '—'}
                              </div>
                              <div className="relative w-full rounded-t-[1rem] bg-[linear-gradient(180deg,rgba(34,211,238,0.96),rgba(19,164,255,0.28))] shadow-[0_0_20px_rgba(19,164,255,0.22)]" style={{ height: `${height}%` }} />
                              <div className="truncate text-[10px] text-white/40">#{String(block.number).slice(-4)}</div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Latest block load</p>
                      <p className="mt-3 text-3xl font-bold text-white">{formatPercent(pulse.gasUsedPct)}</p>
                      <p className="mt-2 text-sm leading-6 text-white/60">Gas used versus gas limit on the most recent observed block.</p>
                    </div>
                    <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Base fee</p>
                      <p className="mt-3 text-3xl font-bold text-white">{pulse.baseFeeGwei != null ? `${pulse.baseFeeGwei.toFixed(4)} gwei` : '-'}</p>
                      <p className="mt-2 text-sm leading-6 text-white/60">Useful for wallet previews, staking UX and fee transparency.</p>
                    </div>
                    <div className="rounded-[1.45rem] border border-white/10 bg-primary/10 p-5">
                      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        <Sparkles className="h-4 w-4" />
                        Visitor-facing signal
                      </p>
                      <p className="mt-3 text-sm leading-7 text-white/80">
                        This block now acts like proof of life for the chain. It gives first-time visitors visible evidence that INRI is active, updating and operational.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {view === 'blocks' && (
                <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(3,10,18,0.48),rgba(9,20,33,0.92))] p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Block gas profile</p>
                    <h5 className="mt-2 text-lg font-bold text-white">Gas usage of the latest observed blocks</h5>
                    <div className="mt-6 space-y-3">
                      {pulse.blocks.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5 text-sm text-white/50">Waiting for live blocks…</div>
                      ) : (
                        pulse.blocks.map((block) => (
                          <div key={`gas-${block.number}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                            <div className="flex items-center justify-between gap-3 text-sm text-white/70">
                              <span className="font-bold text-white">#{block.number}</span>
                              <span>{formatPercent(block.gasUsedPct)}</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-white/8">
                              <div
                                className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.95),rgba(168,85,247,0.95))]"
                                style={{ width: `${Math.max(4, (block.gasUsedPct / Math.max(1, maxGasPct)) * 100)}%` }}
                              />
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.14em] text-white/38">
                              <span>{block.txCount} tx</span>
                              <span>{block.baseFeeGwei.toFixed(4)} gwei</span>
                              <span>{block.miner}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Recent block feed</p>
                    <h5 className="mt-2 text-lg font-bold text-white">Readable block stream for visitors</h5>
                    <div className="mt-5 space-y-3">
                      {pulse.blocks.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-white/50">Waiting for live blocks…</div>
                      ) : (
                        [...pulse.blocks].reverse().map((block) => (
                          <div key={`feed-${block.number}`} className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4 transition hover:border-primary/25 hover:bg-primary/10">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-lg font-bold text-white">Block #{block.number}</p>
                                <p className="mt-1 text-sm text-white/55">Miner {block.miner}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{block.interval > 0 ? `${block.interval}s` : 'genesis'}</span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">{block.txCount} tx</span>
                              </div>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">Gas used</p>
                                <p className="mt-2 text-sm font-bold text-white">{formatPercent(block.gasUsedPct)}</p>
                              </div>
                              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">Base fee</p>
                                <p className="mt-2 text-sm font-bold text-white">{block.baseFeeGwei.toFixed(4)} gwei</p>
                              </div>
                              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">Updated</p>
                                <p className="mt-2 text-sm font-bold text-white">{new Date(block.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {view === 'mining' && (
                <div className="mt-6 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
                  <div className="grid gap-4">
                    <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Pool connected miners</p>
                      <p className="mt-3 text-3xl font-bold text-white">{pulse.poolConnectedMiners != null ? formatShortNumber(pulse.poolConnectedMiners) : '-'}</p>
                      <p className="mt-2 text-sm leading-6 text-white/60">Pulled from the pool widget layer when available.</p>
                    </div>
                    <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Pool hashrate</p>
                      <p className="mt-3 text-3xl font-bold text-white">{pulse.poolHashrate}</p>
                      <p className="mt-2 text-sm leading-6 text-white/60">Useful for surfacing mining activity directly on the homepage.</p>
                    </div>
                    <div className="rounded-[1.45rem] border border-white/10 bg-primary/10 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Pool last block / payments</p>
                      <p className="mt-3 text-xl font-bold text-white">
                        {pulse.poolLastBlock != null ? `#${formatShortNumber(pulse.poolLastBlock)}` : '—'}
                        <span className="mx-2 text-white/35">•</span>
                        {pulse.paymentsCount != null ? `${formatShortNumber(pulse.paymentsCount)} payments` : 'payments —'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ActionCard href="/pool" title="Pool" text="Lead the user into mining stats, payments, blocks and participation routes." icon={Layers3} />
                    <ActionCard href="/mining/windows" title="Mining Windows" text="Onboarding path for CPU miners joining the network from Windows." icon={Cpu} />
                    <ActionCard href="/mining/ubuntu" title="Mining Ubuntu" text="Linux route for miners who want a cleaner technical entry point." icon={Pickaxe} />
                    <ActionCard href="https://explorer.inri.life" title="Explorer" text="Let the user jump directly into live addresses, transactions and blocks." icon={Radar} external />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.2)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">Trust layer</p>
                <h3 className="mt-3 text-2xl font-bold text-white">Readable proof for visitors</h3>
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                ['RPC peers', pulse.peers != null ? formatShortNumber(pulse.peers) : '-'],
                ['Difficulty', pulse.difficulty],
                ['Latest tx count', pulse.txCount != null ? formatShortNumber(pulse.txCount) : '-'],
                ['Base fee', pulse.baseFeeGwei != null ? `${pulse.baseFeeGwei.toFixed(4)} gwei` : '-'],
                ['Updated', pulse.updatedAt],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">{label}</p>
                  </div>
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-primary">
              <Waves className="h-4 w-4" />
              Next visual direction
            </p>
            <p className="mt-4 text-sm leading-8 text-white/78">
              This panel is now built like a product block: live status bar, interactive views, block feed and mining entry points. The next step is carrying this exact design system into Pool, Mining, Wallet and Staking pages so the whole site feels like one premium platform.
            </p>
          </div>

          <div className="rounded-[2rem] border border-primary/15 bg-primary/10 p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-primary">
              <Wallet className="h-4 w-4" />
              Good for onboarding
            </p>
            <p className="mt-4 text-sm leading-8 text-white/78">
              New users usually trust what they can see. Putting block movement, fee conditions and mining visibility on the homepage makes the network feel alive before they even open the explorer.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
