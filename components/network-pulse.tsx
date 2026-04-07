'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowUpRight, Blocks, Clock3, Flame, Gauge, Network, ShieldCheck, Wallet } from 'lucide-react'

type PulseState = {
  latestBlock: number | null
  peers: number | null
  chainId: string
  baseFee: string
  gasUsedRatio: string
  avgBlockTime: string
  difficulty: string
  hashrate: string
  latestTxs: number
  updatedAt: string
  status: 'ok' | 'error' | 'loading'
}

type RecentBlock = {
  block: number
  txs: number
  gasUsedPct: number
  interval: number
}

const RPC_URL = 'https://rpc.inri.life'
const REFRESH_INTERVAL = 15000

const initialState: PulseState = {
  latestBlock: null,
  peers: null,
  chainId: '-',
  baseFee: '-',
  gasUsedRatio: '-',
  avgBlockTime: '-',
  difficulty: '-',
  hashrate: '-',
  latestTxs: 0,
  updatedAt: '—',
  status: 'loading',
}

function formatShortNumber(value: number) {
  if (!Number.isFinite(value)) return '-'
  if (value < 1000) return String(value)

  const units = ['', 'K', 'M', 'B', 'T']
  let current = value
  let index = 0

  while (current >= 1000 && index < units.length - 1) {
    current /= 1000
    index += 1
  }

  return `${current >= 10 ? current.toFixed(1) : current.toFixed(2)}${units[index]}`
}

function formatBigHexShort(hex?: string) {
  if (!hex) return '-'

  try {
    let value = BigInt(hex)
    const units = ['', 'K', 'M', 'G', 'T', 'P', 'E']
    let index = 0

    while (value >= 1000n && index < units.length - 1) {
      value /= 1000n
      index += 1
    }

    return `${value.toString()}${units[index]}`
  } catch {
    return '-'
  }
}

function formatGwei(hex?: string) {
  if (!hex) return '-'

  try {
    const gwei = Number(BigInt(hex)) / 1e9
    if (!Number.isFinite(gwei)) return '-'
    return gwei >= 1 ? `${gwei.toFixed(2)} gwei` : `${gwei.toFixed(4)} gwei`
  } catch {
    return '-'
  }
}

function formatHashrate(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '-'

  const units = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s']
  let current = value
  let index = 0

  while (current >= 1000 && index < units.length - 1) {
    current /= 1000
    index += 1
  }

  return `${current.toFixed(2)} ${units[index]}`
}

function hexToNumber(value?: string) {
  if (!value) return 0
  return Number.parseInt(value, 16)
}

function numberToHex(value: number) {
  return `0x${value.toString(16)}`
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
      txs: Array.isArray(block?.transactions) ? block.transactions.length : 0,
      gasUsedPct: Number(((gasUsed / gasLimit) * 100).toFixed(1)),
      interval: index > 0 ? Math.max(currentTimestamp - previousTimestamp, 0) : 0,
    }
  })
}

function getAverageBlockTime(recentBlocks: any[]) {
  const ordered = [...recentBlocks]
    .filter(Boolean)
    .sort((a, b) => hexToNumber(a?.number) - hexToNumber(b?.number))

  if (ordered.length < 2) return 0

  let total = 0
  let count = 0

  for (let index = 1; index < ordered.length; index += 1) {
    const currentTimestamp = hexToNumber(ordered[index]?.timestamp)
    const previousTimestamp = hexToNumber(ordered[index - 1]?.timestamp)
    if (currentTimestamp > 0 && previousTimestamp > 0 && currentTimestamp >= previousTimestamp) {
      total += currentTimestamp - previousTimestamp
      count += 1
    }
  }

  return count > 0 ? total / count : 0
}

export function NetworkPulse() {
  const [pulse, setPulse] = useState<PulseState>(initialState)
  const [recentBlocks, setRecentBlocks] = useState<RecentBlock[]>([])

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [blockHex, peerHex, chainIdHex, latestBlock] = await Promise.all([
          rpc('eth_blockNumber'),
          rpc('net_peerCount'),
          rpc('eth_chainId'),
          rpc('eth_getBlockByNumber', ['latest', true]),
        ])

        const latestBlockNumber = hexToNumber(blockHex)
        const targets = Array.from({ length: 7 }, (_, index) => latestBlockNumber - (6 - index)).filter((value) => value >= 0)
        const rawRecentBlocks = await Promise.all(
          targets.map((blockNumber) => rpc('eth_getBlockByNumber', [numberToHex(blockNumber), true]))
        )

        const averageBlockTime = getAverageBlockTime(rawRecentBlocks)
        const gasUsed = hexToNumber(latestBlock?.gasUsed)
        const gasLimit = Math.max(hexToNumber(latestBlock?.gasLimit), 1)
        const difficultyHex = latestBlock?.difficulty || '0x0'
        const difficultyBig = BigInt(difficultyHex)
        const safeDifficulty = Number(difficultyBig > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : difficultyBig)
        const estimatedHashrate = averageBlockTime > 0 ? safeDifficulty / averageBlockTime : 0
        const latestTxs = Array.isArray(latestBlock?.transactions) ? latestBlock.transactions.length : 0

        if (!mounted) return

        setPulse({
          latestBlock: latestBlockNumber,
          peers: hexToNumber(peerHex),
          chainId: String(hexToNumber(chainIdHex)),
          baseFee: formatGwei(latestBlock?.baseFeePerGas),
          gasUsedRatio: `${((gasUsed / gasLimit) * 100).toFixed(1)}%`,
          avgBlockTime: averageBlockTime > 0 ? `${averageBlockTime.toFixed(1)}s` : '-',
          difficulty: formatBigHexShort(difficultyHex),
          hashrate: formatHashrate(estimatedHashrate),
          latestTxs,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: 'ok',
        })
        setRecentBlocks(buildRecentBlocks(rawRecentBlocks))
      } catch {
        if (!mounted) return
        setPulse((current) => ({ ...current, status: 'error', updatedAt: 'offline' }))
      }
    }

    load()
    const interval = window.setInterval(load, REFRESH_INTERVAL)

    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  const quickStats = useMemo(
    () => [
      { label: 'Latest block', value: pulse.latestBlock ? formatShortNumber(pulse.latestBlock) : '-' },
      { label: 'Peers', value: pulse.peers !== null ? formatShortNumber(pulse.peers) : '-' },
      { label: 'Base fee', value: pulse.baseFee },
      { label: 'Avg block', value: pulse.avgBlockTime },
      { label: 'Chain ID', value: pulse.chainId },
    ],
    [pulse]
  )

  const detailStats = useMemo(
    () => [
      { label: 'Difficulty', value: pulse.difficulty, icon: ShieldCheck },
      { label: 'Estimated hashrate', value: pulse.hashrate, icon: Gauge },
      { label: 'Gas used', value: pulse.gasUsedRatio, icon: Flame },
      { label: 'Latest tx count', value: formatShortNumber(pulse.latestTxs), icon: Blocks },
    ],
    [pulse]
  )

  const displayBlocks = [...recentBlocks].reverse().slice(0, 5)
  const chartBlocks = recentBlocks.slice(1)
  const maxInterval = Math.max(...chartBlocks.map((item) => item.interval), 1)

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,23,39,0.96),rgba(7,15,27,0.96))] shadow-[0_32px_120px_rgba(0,0,0,0.32)]">
        <div className="border-b border-white/10 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary/85">Live network proof</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-bold text-white sm:text-4xl">
                Show that INRI is alive, usable and worth entering.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                This section should feel like proof, not noise: the latest block, chain health, fees, recent activity and direct paths into the ecosystem.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/78">
              <Activity className="h-4 w-4 text-primary" />
              {pulse.status === 'ok' ? `Live · Updated ${pulse.updatedAt}` : pulse.status === 'loading' ? 'Loading live data' : 'Live feed offline'}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {quickStats.map((item) => (
              <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-2 text-lg font-bold text-white sm:text-xl">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.12),transparent_40%),linear-gradient(180deg,rgba(8,18,31,0.96),rgba(7,14,25,0.96))] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Recent block rhythm</p>
                  <p className="mt-2 text-sm leading-7 text-white/64">A cleaner visual of recent intervals and utilization instead of a crowded dashboard.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Avg {pulse.avgBlockTime}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-6 items-end gap-3 sm:gap-4">
                {chartBlocks.map((item) => {
                  const height = `${Math.max(24, (item.interval / maxInterval) * 132)}px`
                  return (
                    <div key={item.block} className="flex flex-col items-center gap-3">
                      <div className="flex h-40 w-full items-end justify-center rounded-[1.25rem] border border-white/6 bg-white/[0.02] px-2 py-3">
                        <div
                          className="w-full rounded-full bg-[linear-gradient(180deg,rgba(19,164,255,0.95),rgba(19,164,255,0.18))] shadow-[0_10px_30px_rgba(19,164,255,0.22)]"
                          style={{ height }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-white">{item.interval}s</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/42">#{String(item.block).slice(-4)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {detailStats.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                      <p className="mt-2 text-lg font-bold text-white">{item.value}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Latest blocks</p>
                  <h3 className="mt-3 text-2xl font-bold text-white">The network should look active at a glance.</h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                  <Network className="h-4 w-4 text-primary" />
                  Chain status
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {displayBlocks.map((item) => (
                  <div key={item.block} className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-[#091322] px-4 py-4">
                    <div>
                      <p className="text-sm font-bold text-white">Block #{item.block}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">{item.interval}s interval · {item.txs} txs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/45">Gas used</p>
                      <p className="mt-1 text-sm font-bold text-primary">{item.gasUsedPct}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Link
                  href="https://explorer.inri.life"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/35 hover:bg-primary/10"
                >
                  <p className="text-sm font-bold text-white">Explorer</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">Inspect blocks, transactions and addresses.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Open <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>

                <Link
                  href="https://wallet.inri.life"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/35 hover:bg-primary/10"
                >
                  <p className="text-sm font-bold text-white">Wallet</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">Bring users from homepage to real usage quickly.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Open <Wallet className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>

                <Link
                  href="/pool"
                  className="group rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/35 hover:bg-primary/10"
                >
                  <p className="text-sm font-bold text-white">Pool</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">Turn interest in mining into active participation.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Open <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
