'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Activity, ArrowUpRight, Gauge, Globe2, Layers3, Pickaxe, Radar, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type PulseState = {
  latestBlock: number | null
  peers: number | null
  difficulty: string
  hashrate: string
  baseFee: string
  gasUsedRatio: string
  chainId: string
  updatedAt: string
  status: 'ok' | 'error' | 'loading'
}

type BlockSample = {
  label: string
  block: number
  interval: number
  txs: number
  gasUsedPct: number
}

type ActionCard = {
  title: string
  text: string
  href: string
  icon: LucideIcon
  external?: boolean
}

const initialState: PulseState = {
  latestBlock: null,
  peers: null,
  difficulty: '-',
  hashrate: '-',
  baseFee: '-',
  gasUsedRatio: '-',
  chainId: '-',
  updatedAt: '—',
  status: 'loading',
}

const actionCards: ActionCard[] = [
  {
    title: 'Explorer',
    text: 'Inspect blocks, transactions and addresses with one click.',
    href: 'https://explorer.inri.life',
    icon: Globe2,
    external: true,
  },
  {
    title: 'Mining',
    text: 'Move miners from interest to participation faster.',
    href: '/mining',
    icon: Pickaxe,
  },
  {
    title: 'Wallet',
    text: 'Turn homepage traffic into ecosystem users immediately.',
    href: 'https://wallet.inri.life',
    icon: Wallet,
    external: true,
  },
]

const nodes = [
  { left: '10%', top: '36%', size: 'h-3 w-3' },
  { left: '20%', top: '62%', size: 'h-2.5 w-2.5' },
  { left: '33%', top: '28%', size: 'h-3 w-3' },
  { left: '46%', top: '47%', size: 'h-4 w-4' },
  { left: '58%', top: '34%', size: 'h-3 w-3' },
  { left: '70%', top: '58%', size: 'h-2.5 w-2.5' },
  { left: '83%', top: '25%', size: 'h-3 w-3' },
]

const RPC_URL = 'https://rpc.inri.life'
const REFRESH_INTERVAL = 15000

function formatShortNumber(n: number) {
  if (!Number.isFinite(n)) return '-'
  if (n < 1000) return String(n)
  const units = ['', 'K', 'M', 'B', 'T']
  let value = n
  let i = 0
  while (value >= 1000 && i < units.length - 1) {
    value /= 1000
    i += 1
  }
  return `${value >= 10 ? value.toFixed(1) : value.toFixed(2)}${units[i]}`
}

function formatBigHexShort(hex?: string) {
  if (!hex) return '-'
  try {
    let value = BigInt(hex)
    const units = ['', 'K', 'M', 'G', 'T', 'P', 'E']
    let i = 0
    while (value >= 1000n && i < units.length - 1) {
      value /= 1000n
      i += 1
    }
    return `${value.toString()}${units[i]}`
  } catch {
    return '-'
  }
}

function formatHashrate(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '-'
  const units = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s']
  let v = value
  let i = 0
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000
    i += 1
  }
  return `${v.toFixed(2)} ${units[i]}`
}

function formatGwei(hex?: string) {
  if (!hex) return '-'
  try {
    const gwei = Number(BigInt(hex)) / 1e9
    if (!Number.isFinite(gwei)) return '-'
    if (gwei >= 1) return `${gwei.toFixed(2)} gwei`
    return `${gwei.toFixed(4)} gwei`
  } catch {
    return '-'
  }
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

function buildSamples(blocks: any[]): BlockSample[] {
  const ordered = [...blocks]
    .filter(Boolean)
    .sort((a, b) => hexToNumber(a.number) - hexToNumber(b.number))

  return ordered.map((block, index) => {
    const currentNumber = hexToNumber(block.number)
    const timestamp = hexToNumber(block.timestamp)
    const previousTimestamp = index > 0 ? hexToNumber(ordered[index - 1]?.timestamp) : timestamp
    const interval = index > 0 ? Math.max(timestamp - previousTimestamp, 0) : 0
    const txs = Array.isArray(block.transactions) ? block.transactions.length : 0
    const gasUsed = hexToNumber(block.gasUsed)
    const gasLimit = Math.max(hexToNumber(block.gasLimit), 1)

    return {
      label: `#${currentNumber}`,
      block: currentNumber,
      interval,
      txs,
      gasUsedPct: Number(((gasUsed / gasLimit) * 100).toFixed(1)),
    }
  })
}

export function NetworkPulse() {
  const [pulse, setPulse] = useState<PulseState>(initialState)
  const [samples, setSamples] = useState<BlockSample[]>([])

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
        const recentTargets = Array.from({ length: 8 }, (_, index) => latestBlockNumber - (7 - index)).filter((value) => value >= 0)
        const recentBlocks = await Promise.all(recentTargets.map((blockNumber) => rpc('eth_getBlockByNumber', [numberToHex(blockNumber), true])))

        const peers = hexToNumber(peerHex)
        const difficultyHex = latestBlock?.difficulty || '0x0'
        const difficultyBig = BigInt(difficultyHex)
        const difficultyNum = Number(difficultyBig > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : difficultyBig)
        const estimatedHashrate = difficultyNum > 0 ? difficultyNum / 15 : 0
        const gasUsed = hexToNumber(latestBlock?.gasUsed)
        const gasLimit = Math.max(hexToNumber(latestBlock?.gasLimit), 1)

        if (!mounted) return

        setPulse({
          latestBlock: latestBlockNumber,
          peers,
          difficulty: formatBigHexShort(difficultyHex),
          hashrate: formatHashrate(estimatedHashrate),
          baseFee: formatGwei(latestBlock?.baseFeePerGas),
          gasUsedRatio: `${((gasUsed / gasLimit) * 100).toFixed(1)}%`,
          chainId: String(hexToNumber(chainIdHex)),
          updatedAt: new Date().toLocaleTimeString(),
          status: 'ok',
        })
        setSamples(buildSamples(recentBlocks))
      } catch {
        if (!mounted) return
        setPulse((current) => ({ ...current, status: 'error', updatedAt: 'offline' }))
      }
    }

    load()
    const interval = setInterval(load, REFRESH_INTERVAL)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const metricCards = useMemo(
    () => [
      { label: 'Latest block', value: pulse.latestBlock ? formatShortNumber(pulse.latestBlock) : '-' },
      { label: 'Connected peers', value: pulse.peers !== null ? formatShortNumber(pulse.peers) : '-' },
      { label: 'Base fee', value: pulse.baseFee },
      { label: 'Estimated hashrate', value: pulse.hashrate },
      { label: 'Difficulty', value: pulse.difficulty },
      { label: 'Gas used', value: pulse.gasUsedRatio },
    ],
    [pulse]
  )

  const latestSamples = samples.slice(-5).reverse()

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_25px_120px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">Live network console</p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Make the chain feel alive on the homepage.</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <Activity className="h-4 w-4" />
              {pulse.status === 'ok' ? 'Live data' : pulse.status === 'loading' ? 'Loading' : 'Offline'}
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-8 text-white/70 sm:text-base">
            Instead of a static hero with only marketing copy, this section reads directly from the public RPC and shows live chain signals that refresh automatically.
          </p>

          <div className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#06111d] p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(19,164,255,0.18),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(19,164,255,0.12),transparent_24%),radial-gradient(circle_at_58%_74%,rgba(19,164,255,0.10),transparent_20%)]" />
            <div className="relative aspect-[16/9] rounded-[1.25rem] border border-white/6 bg-[linear-gradient(180deg,rgba(8,18,33,0.84),rgba(6,12,22,0.96))]">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:22px_22px] opacity-40" />
              {nodes.map((node, index) => (
                <div key={index} className="absolute" style={{ left: node.left, top: node.top }}>
                  <span className={`absolute -left-3 -top-3 rounded-full bg-primary/20 blur-md ${node.size === 'h-4 w-4' ? 'h-10 w-10' : 'h-8 w-8'}`} />
                  <span className={`relative block rounded-full bg-primary shadow-[0_0_0_6px_rgba(19,164,255,0.12)] ${node.size}`} />
                </div>
              ))}
              <div className="absolute inset-x-10 bottom-10 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="absolute left-[14%] top-[36%] h-px w-[22%] rotate-[14deg] bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
              <div className="absolute left-[35%] top-[31%] h-px w-[26%] rotate-[18deg] bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
              <div className="absolute left-[49%] top-[48%] h-px w-[24%] -rotate-[8deg] bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
              <div className="absolute right-[9%] top-[16%] rounded-[1.1rem] border border-white/10 bg-black/35 px-4 py-3 text-xs text-white/80 backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Chain ID</p>
                <p className="mt-2 text-lg font-bold text-white">{pulse.chainId}</p>
              </div>
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/75">
                <Radar className="h-3.5 w-3.5 text-primary" />
                Updated {pulse.updatedAt}
              </div>
              <div className="absolute bottom-5 right-5 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/75">
                Block {pulse.latestBlock ? formatShortNumber(pulse.latestBlock) : '-'}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {actionCards.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="group rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/35 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-white/40 transition group-hover:text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/68">{item.text}</p>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)] sm:p-8">
            <Tabs defaultValue="overview" className="gap-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">Interactive panels</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">Signals that feel technological</h3>
                </div>
                <TabsList className="h-auto flex-wrap rounded-[1rem] border border-white/10 bg-white/[0.04] p-1.5">
                  <TabsTrigger value="overview" className="rounded-[0.8rem] px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
                  <TabsTrigger value="blocks" className="rounded-[0.8rem] px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Blocks</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview">
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  {metricCards.map((item) => (
                    <div key={item.label} className="rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                      <p className="mt-3 text-2xl font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="blocks">
                <div className="mt-2 rounded-[1.4rem] border border-white/8 bg-[#091425] p-4">
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={samples} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="intervalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#13a4ff" stopOpacity={0.42} />
                            <stop offset="95%" stopColor="#13a4ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="label" tick={{ fill: 'rgba(237,247,255,0.55)', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'rgba(237,247,255,0.55)', fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                        <Tooltip
                          cursor={{ stroke: 'rgba(19,164,255,0.25)' }}
                          contentStyle={{ background: '#081223', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', color: '#edf7ff' }}
                          formatter={(value: number, name: string) => [`${value}${name === 'interval' ? 's' : ''}`, name === 'interval' ? 'Block interval' : 'Value']}
                        />
                        <Area type="monotone" dataKey="interval" stroke="#13a4ff" strokeWidth={2} fill="url(#intervalGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/45">Recent block intervals</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">Recent blocks</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Short, live activity feed</h3>
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Layers3 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {latestSamples.length > 0 ? (
                latestSamples.map((sample) => (
                  <div key={sample.block} className="grid gap-3 rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-4 sm:grid-cols-[0.95fr_0.7fr_0.7fr] sm:items-center">
                    <div>
                      <p className="text-sm font-bold text-white">{sample.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Recent block</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{sample.interval}s</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Interval</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:block">
                      <p className="text-sm font-bold text-white">{sample.txs} tx • {sample.gasUsedPct}% gas</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Load</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-6 text-sm text-white/65">
                  Waiting for live samples from the RPC.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary/15 bg-primary/10 p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-4 w-4" />
              Upgrade path
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-white/8 bg-black/10 p-4">
                <Gauge className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-bold text-white">Add RPC latency</p>
                <p className="mt-2 text-sm leading-7 text-white/72">Measure response time and show node health in milliseconds.</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-black/10 p-4">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-bold text-white">Add validator or miner trust signals</p>
                <p className="mt-2 text-sm leading-7 text-white/72">Surface live participation strength for visitors checking whether the chain is active.</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/8 bg-black/10 p-4">
                <Radar className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-bold text-white">Add visitor presence</p>
                <p className="mt-2 text-sm leading-7 text-white/72">A Supabase or Ably layer can show live viewers on the site itself.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
