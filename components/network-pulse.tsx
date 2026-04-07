'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowUpRight, Blocks, Clock3, Flame, Gauge, Network, Pickaxe, Wallet } from 'lucide-react'

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
      { label: 'Block', value: pulse.latestBlock ? formatShortNumber(pulse.latestBlock) : '-', icon: Blocks },
      { label: 'Peers', value: pulse.peers !== null ? formatShortNumber(pulse.peers) : '-', icon: Network },
      { label: 'Avg time', value: pulse.avgBlockTime, icon: Clock3 },
      { label: 'Base fee', value: pulse.baseFee, icon: Flame },
      { label: 'Txs', value: formatShortNumber(pulse.latestTxs), icon: Activity },
    ],
    [pulse]
  )

  const displayBlocks = [...recentBlocks].reverse().slice(0, 5)
  const chartBlocks = recentBlocks.slice(1)
  const maxInterval = Math.max(...chartBlocks.map((item) => item.interval), 1)

  return (
    <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(4,8,13,0.98),rgba(0,0,0,0.98))] shadow-[0_32px_120px_rgba(0,0,0,0.42)]">
        <div className="border-b border-white/10 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Live network</p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Real activity, cleaner presentation.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58 sm:text-base">
                The live section should prove the network is active without turning the homepage into a crowded dashboard.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
              <Activity className="h-4 w-4 text-primary" />
              {pulse.status === 'ok' ? `Updated ${pulse.updatedAt}` : pulse.status === 'loading' ? 'Loading' : 'Offline'}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {quickStats.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="flex items-center gap-2 text-white/46">
                    <Icon className="h-4 w-4 text-primary" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{item.label}</p>
                  </div>
                  <p className="mt-3 text-lg font-bold text-white sm:text-xl">{item.value}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.12),transparent_36%),linear-gradient(180deg,rgba(5,10,16,0.96),rgba(1,4,8,0.98))] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Recent rhythm</p>
                  <p className="mt-2 text-sm leading-7 text-white/60">Recent block timing and usage in a cleaner view.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Chain', value: pulse.chainId },
                    { label: 'Difficulty', value: pulse.difficulty },
                    { label: 'Hashrate', value: pulse.hashrate },
                    { label: 'Gas', value: pulse.gasUsedRatio },
                  ].map((item) => (
                    <span
                      key={item.label}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/66"
                    >
                      {item.label}: <span className="text-white">{item.value}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-6 items-end gap-3 sm:gap-4">
                {chartBlocks.map((item) => {
                  const height = `${Math.max(28, (item.interval / maxInterval) * 120)}px`
                  return (
                    <div key={item.block} className="flex flex-col items-center gap-3">
                      <div className="flex h-36 w-full items-end justify-center rounded-[1.2rem] border border-white/8 bg-white/[0.02] px-2 py-3">
                        <div
                          className="w-full rounded-full bg-[linear-gradient(180deg,rgba(19,164,255,0.98),rgba(19,164,255,0.16))] shadow-[0_10px_24px_rgba(19,164,255,0.24)]"
                          style={{ height }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-white">{item.interval}s</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/40">#{String(item.block).slice(-4)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 space-y-3">
                {displayBlocks.map((item) => (
                  <div key={item.block} className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-white/10 bg-black/40 px-4 py-4">
                    <div>
                      <p className="text-sm font-bold text-white">Block #{item.block}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/42">
                        {item.interval}s • {item.txs} txs
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40">Gas</p>
                      <p className="mt-1 text-sm font-bold text-primary">{item.gasUsedPct}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Real value</p>
              <h3 className="mt-3 text-2xl font-bold text-white">Useful routes should be visible fast.</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">
                A stronger homepage gives users immediate access to the wallet, explorer, mining and pool.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="https://wallet.inri.life"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[1.25rem] border border-white/10 bg-black/30 p-4 transition hover:border-primary/35 hover:bg-primary/10"
                >
                  <div className="inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-lg font-bold text-white">Wallet</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">Open the official INRI wallet.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Open <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>

                <Link
                  href="https://explorer.inri.life"
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-[1.25rem] border border-white/10 bg-black/30 p-4 transition hover:border-primary/35 hover:bg-primary/10"
                >
                  <div className="inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
                    <Blocks className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-lg font-bold text-white">Explorer</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">Verify blocks, txs and addresses.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Open <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>

                <Link
                  href="/mining"
                  className="group rounded-[1.25rem] border border-white/10 bg-black/30 p-4 transition hover:border-primary/35 hover:bg-primary/10"
                >
                  <div className="inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
                    <Pickaxe className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-lg font-bold text-white">Mining</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">Windows, Ubuntu and first steps.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Open <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>

                <Link
                  href="/pool"
                  className="group rounded-[1.25rem] border border-white/10 bg-black/30 p-4 transition hover:border-primary/35 hover:bg-primary/10"
                >
                  <div className="inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
                    <Gauge className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-lg font-bold text-white">Pool</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">Turn interest into active mining.</p>
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
