'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  Blocks,
  Cpu,
  Gauge,
  Globe2,
  Pickaxe,
  Radar,
  Shield,
  Sparkles,
} from 'lucide-react'

type RecentBlock = {
  number: number
  txCount: number
  gasRatio: number
  interval: number | null
  ageLabel: string
  baseFeeGwei: string
  hash: string
}

type PulseState = {
  status: 'loading' | 'ok' | 'error'
  updatedAt: string
  latestBlock: number | null
  peerCount: number | null
  difficultyLabel: string
  hashrateLabel: string
  avgBlockTime: number | null
  recentBlocks: RecentBlock[]
}

const initialState: PulseState = {
  status: 'loading',
  updatedAt: '—',
  latestBlock: null,
  peerCount: null,
  difficultyLabel: '—',
  hashrateLabel: '—',
  avgBlockTime: null,
  recentBlocks: [],
}

const RPC_URL = 'https://rpc.inri.life'
const REFRESH_INTERVAL = 15000

type ViewMode = 'overview' | 'blocks' | 'mining'

function formatCompactNumber(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—'
  if (value < 1000) return String(value)
  const units = ['', 'K', 'M', 'B', 'T']
  let current = value
  let unitIndex = 0
  while (current >= 1000 && unitIndex < units.length - 1) {
    current /= 1000
    unitIndex += 1
  }
  return `${current >= 10 ? current.toFixed(1) : current.toFixed(2)}${units[unitIndex]}`
}

function formatBigIntShort(hex?: string) {
  if (!hex) return '—'
  try {
    let value = BigInt(hex)
    const units = ['', 'K', 'M', 'G', 'T', 'P']
    let unitIndex = 0
    while (value >= 1000n && unitIndex < units.length - 1) {
      value /= 1000n
      unitIndex += 1
    }
    return `${value.toString()}${units[unitIndex]}`
  } catch {
    return '—'
  }
}

function formatHashrate(value: number | null) {
  if (value === null || !Number.isFinite(value) || value <= 0) return '—'
  const units = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s']
  let current = value
  let unitIndex = 0
  while (current >= 1000 && unitIndex < units.length - 1) {
    current /= 1000
    unitIndex += 1
  }
  return `${current.toFixed(2)} ${units[unitIndex]}`
}

function formatAge(timestampHex?: string) {
  if (!timestampHex) return '—'
  try {
    const timestamp = parseInt(timestampHex, 16) * 1000
    const diffMs = Math.max(0, Date.now() - timestamp)
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return `${diffSec}s ago`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHour = Math.floor(diffMin / 60)
    return `${diffHour}h ago`
  } catch {
    return '—'
  }
}

function hexToNumber(hex?: string) {
  if (!hex) return 0
  return parseInt(hex, 16)
}

function hexToGweiString(hex?: string) {
  if (!hex) return '—'
  try {
    const wei = BigInt(hex)
    const gweiBase = 1_000_000_000n
    const whole = wei / gweiBase
    const fraction = (wei % gweiBase) / 10_000_000n
    return `${whole.toString()}.${fraction.toString().padStart(2, '0')}`
  } catch {
    return '—'
  }
}

async function rpc(method: string, params: unknown[] = []) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`RPC request failed for ${method}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(data.error.message || `RPC error for ${method}`)
  }

  return data.result
}

function SegmentButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition',
        active
          ? 'border-primary/40 bg-primary/12 text-primary shadow-[0_12px_30px_rgba(19,164,255,0.18)]'
          : 'border-white/10 bg-white/[0.03] text-white/58 hover:border-white/20 hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

export function NetworkPulse() {
  const [pulse, setPulse] = useState<PulseState>(initialState)
  const [view, setView] = useState<ViewMode>('overview')

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [blockHex, peerHex] = await Promise.all([rpc('eth_blockNumber'), rpc('net_peerCount')])
        const latestBlockNumber = parseInt(blockHex, 16)
        const peerCount = parseInt(peerHex, 16)
        const depth = Math.min(7, Math.max(2, latestBlockNumber + 1))
        const blockNumbers = Array.from({ length: depth }, (_, index) => latestBlockNumber - index)

        const blocks = await Promise.all(
          blockNumbers.map((blockNumber) => rpc('eth_getBlockByNumber', [`0x${blockNumber.toString(16)}`, false]))
        )

        const latestBlock = blocks[0]
        const intervals = blocks
          .slice(0, -1)
          .map((block, index) => {
            const currentTs = hexToNumber(block?.timestamp)
            const nextTs = hexToNumber(blocks[index + 1]?.timestamp)
            return currentTs > 0 && nextTs > 0 ? Math.max(1, currentTs - nextTs) : null
          })
          .filter((value): value is number => value !== null)

        const avgBlockTime = intervals.length
          ? Number((intervals.reduce((sum, value) => sum + value, 0) / intervals.length).toFixed(1))
          : null

        const difficultyLabel = formatBigIntShort(latestBlock?.difficulty)
        const difficultyNumber = latestBlock?.difficulty
          ? Number(
              BigInt(latestBlock.difficulty) > BigInt(Number.MAX_SAFE_INTEGER)
                ? Number.MAX_SAFE_INTEGER
                : Number(BigInt(latestBlock.difficulty))
            )
          : 0
        const estimatedHashrate = avgBlockTime && avgBlockTime > 0 ? difficultyNumber / avgBlockTime : null

        const recentBlocks: RecentBlock[] = blocks.slice(0, 6).map((block, index) => {
          const gasUsed = hexToNumber(block?.gasUsed)
          const gasLimit = Math.max(1, hexToNumber(block?.gasLimit))
          const interval = index < blocks.length - 1
            ? Math.max(1, hexToNumber(block?.timestamp) - hexToNumber(blocks[index + 1]?.timestamp))
            : null

          return {
            number: hexToNumber(block?.number),
            txCount: Array.isArray(block?.transactions) ? block.transactions.length : 0,
            gasRatio: Math.max(6, Math.min(100, Math.round((gasUsed / gasLimit) * 100))),
            interval,
            ageLabel: formatAge(block?.timestamp),
            baseFeeGwei: hexToGweiString(block?.baseFeePerGas),
            hash: typeof block?.hash === 'string' ? block.hash.slice(0, 10) : '—',
          }
        })

        if (!mounted) return

        setPulse({
          status: 'ok',
          updatedAt: new Date().toLocaleTimeString(),
          latestBlock: latestBlockNumber,
          peerCount,
          difficultyLabel,
          hashrateLabel: formatHashrate(estimatedHashrate),
          avgBlockTime,
          recentBlocks,
        })
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
    const interval = window.setInterval(load, REFRESH_INTERVAL)

    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  const metricItems = useMemo(
    () => [
      { label: 'Latest block', value: formatCompactNumber(pulse.latestBlock) },
      { label: 'Peers', value: formatCompactNumber(pulse.peerCount) },
      { label: 'Difficulty', value: pulse.difficultyLabel },
      { label: 'Hashrate', value: pulse.hashrateLabel },
      { label: 'Avg block time', value: pulse.avgBlockTime ? `${pulse.avgBlockTime}s` : '—' },
      { label: 'Updated', value: pulse.updatedAt },
    ],
    [pulse]
  )

  const intervalBars = useMemo(() => {
    const values = pulse.recentBlocks
      .map((block) => block.interval)
      .filter((value): value is number => value !== null)
    const maxValue = values.length ? Math.max(...values) : 1
    return values.map((value, index) => ({
      label: `B${index + 1}`,
      value,
      height: `${Math.max(18, Math.round((value / maxValue) * 100))}%`,
    }))
  }, [pulse.recentBlocks])

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,16,28,0.98),rgba(6,14,24,0.92))] shadow-[0_35px_120px_rgba(0,0,0,0.32)]">
        <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(19,164,255,0.08),transparent_32%,rgba(19,164,255,0.06))] px-5 py-4 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/85">Live network layer</p>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">A cleaner command center for INRI CHAIN</h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <SegmentButton active={view === 'overview'} label="Overview" onClick={() => setView('overview')} />
              <SegmentButton active={view === 'blocks'} label="Blocks" onClick={() => setView('blocks')} />
              <SegmentButton active={view === 'mining'} label="Mining" onClick={() => setView('mining')} />
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-8">
          <div className="min-w-0">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {metricItems.map((item) => (
                <MetricPill key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 sm:p-6">
              {view === 'overview' ? (
                <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="rounded-[1.6rem] border border-white/10 bg-[#071321]/92 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/85">Network now</p>
                        <h3 className="mt-2 text-xl font-bold text-white">A premium live panel without visual clutter</h3>
                      </div>
                      <span className={[
                        'rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]',
                        pulse.status === 'ok'
                          ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                          : pulse.status === 'loading'
                            ? 'border-primary/20 bg-primary/10 text-primary'
                            : 'border-rose-400/20 bg-rose-400/10 text-rose-300',
                      ].join(' ')}>
                        {pulse.status === 'ok' ? 'Live' : pulse.status === 'loading' ? 'Loading' : 'Offline'}
                      </span>
                    </div>

                    <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(5,11,20,0.76),rgba(7,16,28,0.94))] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.20em] text-white/45">Chain signal</p>
                          <p className="mt-1 text-3xl font-bold text-white">{formatCompactNumber(pulse.latestBlock)}</p>
                          <p className="mt-1 text-sm text-white/55">Latest block observed from the public RPC</p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                          <Globe2 className="h-7 w-7" />
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-3 gap-3">
                        {[28, 44, 36, 62, 48, 58, 32, 66, 41].map((value, index) => (
                          <div key={index} className="flex items-end gap-2">
                            <div className="h-20 w-full rounded-full bg-white/[0.04] p-1">
                              <div className="w-full rounded-full bg-[linear-gradient(180deg,rgba(109,220,255,0.95),rgba(19,164,255,0.35))]" style={{ height: `${value}%`, marginTop: 'auto' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/85">Why this works better</p>
                      <div className="mt-4 space-y-4">
                        {[
                          'One dominant live area instead of many competing cards.',
                          'Official dark-blue INRI palette kept across the whole section.',
                          'Live metrics remain visible without making the page feel crowded.',
                        ].map((item) => (
                          <div key={item} className="flex gap-3 text-sm leading-7 text-white/74">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-primary/15 bg-primary/10 p-5">
                      <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                        <Sparkles className="h-4 w-4" />
                        Better homepage rhythm
                      </p>
                      <p className="mt-3 text-sm leading-7 text-white/78">
                        The goal is to feel closer to a modern chain homepage: cleaner hero, clearer live proof, and fewer elements competing at the same time.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {view === 'blocks' ? (
                <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="rounded-[1.6rem] border border-white/10 bg-[#071321]/92 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/85">Recent block rhythm</p>
                    <h3 className="mt-2 text-xl font-bold text-white">Recent intervals and activity</h3>
                    <div className="mt-6 flex h-48 items-end gap-3 rounded-[1.3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(4,10,18,0.88),rgba(7,14,24,0.96))] px-4 py-5">
                      {intervalBars.length ? intervalBars.map((bar) => (
                        <div key={`${bar.label}-${bar.value}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                          <span className="text-xs font-semibold text-white/80">{bar.value}s</span>
                          <div className="flex h-full w-full items-end rounded-full bg-white/[0.04] p-1">
                            <div
                              className="w-full rounded-full bg-[linear-gradient(180deg,rgba(107,224,255,0.95),rgba(19,164,255,0.32))] shadow-[0_14px_24px_rgba(19,164,255,0.12)]"
                              style={{ height: bar.height }}
                            />
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">{bar.label}</span>
                        </div>
                      )) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-white/55">Waiting for block data</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {pulse.recentBlocks.map((block) => (
                      <div key={block.number} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/85">Block {block.number}</p>
                            <p className="mt-1 text-sm text-white/56">{block.hash} • {block.ageLabel}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-[#081524] px-3 py-1 text-xs font-semibold text-white/80">{block.txCount} tx</span>
                            <span className="rounded-full border border-white/10 bg-[#081524] px-3 py-1 text-xs font-semibold text-white/80">{block.baseFeeGwei} gwei</span>
                            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{block.interval ? `${block.interval}s` : '—'}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/42">
                            <span>Gas used</span>
                            <span>{block.gasRatio}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/[0.05] p-[2px]">
                            <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(95,216,255,0.95),rgba(19,164,255,0.40))]" style={{ width: `${block.gasRatio}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {view === 'mining' ? (
                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-[1.6rem] border border-white/10 bg-[#071321]/92 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/85">Mining surface</p>
                    <h3 className="mt-2 text-xl font-bold text-white">The network should feel mineable, not abstract</h3>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        { icon: Cpu, label: 'Consensus', value: 'Proof-of-Work' },
                        { icon: Pickaxe, label: 'Estimated hashrate', value: pulse.hashrateLabel },
                        { icon: Gauge, label: 'Difficulty', value: pulse.difficultyLabel },
                        { icon: Radar, label: 'Avg block time', value: pulse.avgBlockTime ? `${pulse.avgBlockTime}s` : '—' },
                      ].map((item) => {
                        const Icon = item.icon
                        return (
                          <div key={item.label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                                <Icon className="h-5 w-5" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{item.label}</p>
                                <p className="mt-1 truncate text-sm font-semibold text-white">{item.value}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {[
                      {
                        title: 'Mining Windows',
                        text: 'A more direct route for CPU miners joining from Windows.',
                        href: '/mining/windows',
                      },
                      {
                        title: 'Mining Ubuntu',
                        text: 'Linux path for miners who want a cleaner setup flow.',
                        href: '/mining/ubuntu',
                      },
                      {
                        title: 'Pool & Explorer',
                        text: 'Pool participation and block visibility should stay one click away.',
                        href: '/pool',
                      },
                    ].map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/30 hover:bg-primary/[0.06]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-lg font-bold text-white">{item.title}</p>
                            <p className="mt-2 text-sm leading-7 text-white/68">{item.text}</p>
                          </div>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary transition group-hover:translate-x-1">
                            <ArrowRight className="h-5 w-5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/85">Design direction</p>
              <h3 className="mt-2 text-xl font-bold text-white">More premium, less noisy</h3>
              <div className="mt-5 space-y-4 text-sm leading-7 text-white/72">
                <div className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>Keep the official INRI blue on a darker, more refined background.</span>
                </div>
                <div className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>Use fewer boxes, more spacing, and stronger section hierarchy.</span>
                </div>
                <div className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>Only show live data where it adds trust and motion to the page.</span>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-primary/15 bg-[linear-gradient(180deg,rgba(19,164,255,0.12),rgba(19,164,255,0.05))] p-5 sm:p-6">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                <Shield className="h-4 w-4" />
                Structured for next pages
              </p>
              <p className="mt-3 text-sm leading-7 text-white/80">
                This section is already shaped to extend into Pool, Staking, Mining, Wallet and Explorer pages without breaking the visual language.
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-[#071321]/92 p-5 sm:p-6">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary/85">
                <Blocks className="h-4 w-4" />
                Next detail layer
              </p>
              <p className="mt-3 text-sm leading-7 text-white/72">
                After the homepage is approved, the strongest next move is to build dedicated pages with the same visual system, instead of forcing every ecosystem detail into the front page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
