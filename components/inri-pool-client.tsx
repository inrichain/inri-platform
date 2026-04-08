'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Copy, Cpu, Pickaxe, Search, ShieldCheck, Wallet } from 'lucide-react'
import { InriLinkButton } from '@/components/inri-site-shell'

declare global {
  interface Window {
    INRI_POOL_PULSE?: PoolWidgetData
  }
}

type PoolSummary = {
  connectedMiners?: number
  activeWorkers?: number
  poolHashrate?: number
  paymentsCount?: number
  lastBlock?: number
}

type PoolPayment = {
  address?: string
  amount?: number
  created?: string
  poolId?: string
  poolid?: string
  transactionConfirmationData?: string
}

type PoolBlock = {
  miner?: string
  blockHeight?: number
  reward?: number
  status?: string
  created?: string
  transactionConfirmationData?: string
  infoLink?: string
}

type PoolMiner = {
  miner?: string
  hashrate?: number
  sharesPerSecond?: number
}

type PoolWidgetData = {
  generatedAt?: string
  totals?: {
    connectedMiners?: number
    poolHashrate?: number
  }
  pplns?: PoolSummary
  solo?: PoolSummary
  merged?: {
    payments?: PoolPayment[]
    blocks?: PoolBlock[]
    miners?: PoolMiner[]
  }
}

type SearchResult = {
  address: string
  balanceWei: bigint
  rank: number | null
  currentHashrate: number
  sharesPerSecond: number
  totalPaid: number
  paymentsCount: number
  latestPayment: PoolPayment | null
  blocksFound: number
  latestBlock: PoolBlock | null
  recentPayments: PoolPayment[]
  recentBlocks: PoolBlock[]
}

const RPC_URL = 'https://rpc.inri.life'
const WIDGET_URL = 'https://pool.inri.life/widget/pool-pulse.js'
const EXPLORER_BASE = 'https://explorer.inri.life'
const REFRESH_MS = 30000
const FIXED_RPC_CHAIN_PEERS = 13
const FIXED_BOOT1_PEERS = 25
const FIXED_BOOT2_PEERS = 15

function formatInt(value: number | string | undefined | null) {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num.toLocaleString('en-US') : '0'
}

function formatCoin(value: number | string | undefined | null, decimals = 6) {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '0'
  return num.toFixed(decimals).replace(/\.?0+$/, '')
}

function formatBalanceWei(value: bigint, decimals = 18) {
  const base = 10n ** BigInt(decimals)
  const whole = value / base
  const fraction = value % base
  const fractionText = fraction.toString().padStart(decimals, '0').slice(0, 4).replace(/0+$/, '')
  return fractionText ? `${whole.toString()}.${fractionText}` : whole.toString()
}

function formatHashrate(value: number | undefined | null) {
  let num = Number(value ?? 0)
  if (!Number.isFinite(num) || num <= 0) return '0 H/s'
  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s']
  let i = 0
  while (num >= 1000 && i < units.length - 1) {
    num /= 1000
    i += 1
  }
  const digits = num >= 100 ? 0 : num >= 10 ? 1 : 2
  return `${num.toFixed(digits)} ${units[i]}`
}

function shortHex(value: string | undefined, left = 8, right = 6) {
  if (!value) return '—'
  return value.length <= left + right + 2 ? value : `${value.slice(0, left)}…${value.slice(-right)}`
}

function age(iso: string | undefined) {
  if (!iso) return '—'
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return '—'
  let seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 0) seconds = 0
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h ago`
}

function toExplorerTx(hash?: string) {
  return hash ? `${EXPLORER_BASE}/tx/${hash}` : '#'
}

function toExplorerAddress(address: string) {
  return `${EXPLORER_BASE}/address/${address}`
}

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

async function fetchRpc(method: string, params: unknown[] = []) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`RPC HTTP ${response.status}`)
  }

  const data = (await response.json()) as { error?: { message?: string }; result?: unknown }
  if (data.error) {
    throw new Error(data.error.message || 'RPC error')
  }

  return data.result
}

function loadWidget(): Promise<PoolWidgetData> {
  return new Promise((resolve, reject) => {
    const old = document.getElementById('inri-pool-widget-loader')
    if (old) old.remove()
    window.INRI_POOL_PULSE = undefined

    const script = document.createElement('script')
    script.id = 'inri-pool-widget-loader'
    script.src = `${WIDGET_URL}?t=${Date.now()}`
    script.async = true
    script.onload = () => {
      const payload = window.INRI_POOL_PULSE
      if (payload?.totals) resolve(payload)
      else reject(new Error('Pool widget loaded but payload is invalid'))
    }
    script.onerror = () => reject(new Error('Pool widget failed to load'))
    document.head.appendChild(script)
  })
}

function copyText(text: string) {
  return navigator.clipboard.writeText(text)
}

function RowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:text-white">
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </a>
  )
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-[15px]">{description}</p> : null}
    </div>
  )
}

export function InriPoolClient() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [latestBlock, setLatestBlock] = useState(0)
  const [networkPeers, setNetworkPeers] = useState(0)
  const [mainRpcPeers, setMainRpcPeers] = useState(0)
  const [widget, setWidget] = useState<PoolWidgetData | null>(null)
  const [tab, setTab] = useState<'overview' | 'miner'>('overview')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [searchError, setSearchError] = useState('')

  const refreshAll = useCallback(async () => {
    try {
      setError('')
      const [blockHex, peersHex, widgetData] = await Promise.all([
        fetchRpc('eth_blockNumber') as Promise<string>,
        fetchRpc('net_peerCount') as Promise<string>,
        loadWidget(),
      ])

      const latest = parseInt(blockHex || '0x0', 16) || 0
      const peers = parseInt(peersHex || '0x0', 16) || 0
      const totalNetworkPeers = peers + FIXED_RPC_CHAIN_PEERS + FIXED_BOOT1_PEERS + FIXED_BOOT2_PEERS

      setLatestBlock(latest)
      setMainRpcPeers(peers)
      setNetworkPeers(totalNetworkPeers)
      setWidget(widgetData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load pool data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAll()
    const interval = window.setInterval(refreshAll, REFRESH_MS)
    return () => window.clearInterval(interval)
  }, [refreshAll])

  const totalLivePulse = networkPeers + Number(widget?.totals?.connectedMiners || 0)
  const totalPoolHashrate = Number(widget?.totals?.poolHashrate || 0)

  const peopleData = useMemo(() => {
    const payments = widget?.merged?.payments ?? []
    const blocks = widget?.merged?.blocks ?? []
    const miners = widget?.merged?.miners ?? []
    return { payments, blocks, miners }
  }, [widget])

  const runSearch = useCallback(async () => {
    const address = query.trim()
    if (!isAddress(address)) {
      setSearchError('Enter a valid INRI address starting with 0x.')
      setSearchResult(null)
      return
    }

    try {
      setSearching(true)
      setSearchError('')
      const lower = address.toLowerCase()
      const payments = peopleData.payments.filter((payment) => (payment.address || '').toLowerCase() === lower)
      const blocks = peopleData.blocks.filter((block) => (block.miner || '').toLowerCase() === lower)
      const minersSorted = [...peopleData.miners].sort((a, b) => Number(b.hashrate || 0) - Number(a.hashrate || 0))
      const rankIndex = minersSorted.findIndex((miner) => (miner.miner || '').toLowerCase() === lower)
      const minerRow = rankIndex >= 0 ? minersSorted[rankIndex] : undefined
      const balanceHex = (await fetchRpc('eth_getBalance', [address, 'latest'])) as string
      const balanceWei = BigInt(balanceHex || '0x0')

      const result: SearchResult = {
        address,
        balanceWei,
        rank: rankIndex >= 0 ? rankIndex + 1 : null,
        currentHashrate: Number(minerRow?.hashrate || 0),
        sharesPerSecond: Number(minerRow?.sharesPerSecond || 0),
        totalPaid: payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
        paymentsCount: payments.length,
        latestPayment: payments[0] ?? null,
        blocksFound: blocks.length,
        latestBlock: blocks[0] ?? null,
        recentPayments: payments.slice(0, 8),
        recentBlocks: blocks.slice(0, 8),
      }

      setSearchResult(result)
      setTab('miner')
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Could not search this miner address')
      setSearchResult(null)
    } finally {
      setSearching(false)
    }
  }, [peopleData.blocks, peopleData.miners, peopleData.payments, query])

  const searchSummary = searchResult
    ? [
        { label: 'INRI balance', value: formatBalanceWei(searchResult.balanceWei), note: 'RPC live balance' },
        { label: 'Current rank', value: searchResult.rank ? `#${searchResult.rank}` : 'Off top miners', note: 'From current pool widget' },
        { label: 'Current hashrate', value: formatHashrate(searchResult.currentHashrate), note: `${searchResult.sharesPerSecond.toFixed(3)} shares/sec` },
        { label: 'Total paid', value: `${formatCoin(searchResult.totalPaid, 6)} INRI`, note: `${searchResult.paymentsCount} payments in current widget window` },
        { label: 'Blocks found', value: formatInt(searchResult.blocksFound), note: searchResult.latestBlock ? `Latest #${formatInt(searchResult.latestBlock.blockHeight)}` : 'No recent pool block found' },
      ]
    : []

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.14),transparent_30%),linear-gradient(180deg,rgba(6,14,24,0.96),rgba(2,8,15,0.985))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
            <div>
              <div className="inline-flex rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                INRI Pool
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] text-white sm:text-5xl xl:text-[4rem]">
                Live pool stats, miner lookup and mining routes in one place.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                Monitor PPLNS and SOLO, inspect recent payments and blocks, search any miner address and open the explorer from the same screen.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <InriLinkButton href="https://pool.inri.life" external>
                  Open live pool
                </InriLinkButton>
                <InriLinkButton href="/mining" variant="secondary">
                  Mining guide
                </InriLinkButton>
                <InriLinkButton href={toExplorerAddress('0x1D760E78D92aA5B46b484bc054Bbfae11198B751')} external variant="secondary" noTranslate>
                  Explorer
                </InriLinkButton>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {['PPLNS + SOLO', 'Miner lookup', 'Live widget + RPC'].map((chip) => (
                  <div key={chip} className="rounded-full border border-primary/22 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                    {chip}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-black/25 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Miner lookup</div>
                  <h2 className="mt-2 text-2xl font-black text-white">Search a miner address</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/65">
                  {loading ? 'Loading' : error ? 'Partial' : 'Live'}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/62">
                See current rank, hashrate, payments, blocks and INRI balance for any address from the pool page.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="flex-1 rounded-[1.25rem] border border-white/12 bg-black/35 px-4 py-3 focus-within:border-primary/50">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/38">Miner address</div>
                  <div className="mt-2 flex items-center gap-3">
                    <Search className="h-5 w-5 text-primary" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          runSearch()
                        }
                      }}
                      placeholder="0x..."
                      className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/28"
                    />
                  </div>
                </label>
                <button
                  type="button"
                  onClick={runSearch}
                  disabled={searching}
                  className="inline-flex h-[74px] items-center justify-center rounded-[1.25rem] border border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] px-6 text-sm font-black text-black shadow-[0_14px_34px_rgba(19,164,255,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {searching ? 'Searching...' : 'Search miner'}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setTab('overview')} className={`rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] transition ${tab === 'overview' ? 'border-primary/30 bg-primary text-black' : 'border-white/14 bg-white/[0.03] text-white/72 hover:border-primary/42 hover:text-white'}`}>
                  Overview
                </button>
                <button type="button" onClick={() => setTab('miner')} className={`rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] transition ${tab === 'miner' ? 'border-primary/30 bg-primary text-black' : 'border-white/14 bg-white/[0.03] text-white/72 hover:border-primary/42 hover:text-white'}`}>
                  Miner lookup
                </button>
              </div>
              {searchError ? <div className="mt-4 rounded-[1.25rem] border border-rose-500/25 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">{searchError}</div> : null}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/40">Live status</div>
                  <div className="mt-2 text-lg font-black text-white">{loading ? 'Loading pool data...' : error ? 'Pool or RPC unavailable' : 'Pool + RPC live'}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/40">Connected miners</div>
                  <div className="mt-2 text-lg font-black text-white">{formatInt(widget?.totals?.connectedMiners || 0)}</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/40">Pool hashrate</div>
                  <div className="mt-2 text-lg font-black text-white">{formatHashrate(totalPoolHashrate)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'Total live pulse', value: formatInt(totalLivePulse), note: 'Raw peers + miners online', icon: Pickaxe },
            { label: 'Raw network peers', value: formatInt(networkPeers), note: 'rpc-chain + rpc + bootnodes', icon: ShieldCheck },
            { label: 'Pool miners', value: formatInt(widget?.totals?.connectedMiners || 0), note: 'PPLNS + SOLO', icon: Cpu },
            { label: 'Pool hashrate', value: formatHashrate(totalPoolHashrate), note: 'Merged widget total', icon: Pickaxe },
            { label: 'Latest network block', value: formatInt(latestBlock), note: 'Live mainnet block height', icon: Wallet },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,28,0.96),rgba(3,9,16,0.985))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.26)]">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/40">{stat.label}</div>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-4 text-3xl font-black text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-white/58">{stat.note}</div>
              </div>
            )
          })}
        </section>
      {tab === 'overview' ? (
        <div className="space-y-8">
          <section className="grid gap-6 xl:grid-cols-2">
            {[
              { title: 'PPLNS', data: widget?.pplns, badge: 'Steady rewards' },
              { title: 'SOLO', data: widget?.solo, badge: 'Full block wins' },
            ].map((pool) => (
              <div key={pool.title} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,28,0.96),rgba(3,9,16,0.985))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">{pool.title}</div>
                    <h3 className="mt-2 text-3xl font-black text-white">{pool.title} pool</h3>
                    <p className="mt-2 text-sm text-white/62">
                      {pool.data?.lastBlock ? `Last block ${formatInt(pool.data.lastBlock)} • ${formatInt(pool.data.paymentsCount || 0)} recent payments` : 'No recent activity in current widget window.'}
                    </p>
                  </div>
                  <div className="rounded-full border border-primary/22 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">{pool.badge}</div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    ['Connected miners', formatInt(pool.data?.connectedMiners || 0)],
                    ['Active workers', formatInt(pool.data?.activeWorkers || 0)],
                    ['Pool hashrate', formatHashrate(pool.data?.poolHashrate || 0)],
                    ['Recent payments', formatInt(pool.data?.paymentsCount || 0)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4">
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/40">{label}</div>
                      <div className="mt-3 text-2xl font-black text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,28,0.96),rgba(3,9,16,0.985))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <SectionTitle eyebrow="Recent payments" title="Latest pool payouts" description="Current widget payments from both PPLNS and SOLO." />
              <div className="mt-6 space-y-3">
                {(widget?.merged?.payments || []).slice(0, 8).map((payment, index) => (
                  <div key={`${payment.address}-${payment.created}-${index}`} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4">
                    <div>
                      <div className="font-black text-white">{shortHex(payment.address)}</div>
                      <div className="mt-1 text-sm text-white/58">{payment.poolId || payment.poolid || 'pool'} • {payment.created ? new Date(payment.created).toLocaleString() : '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-white">{formatCoin(payment.amount, 6)} INRI</div>
                      {payment.transactionConfirmationData ? <RowLink href={toExplorerTx(payment.transactionConfirmationData)}>Open tx</RowLink> : null}
                    </div>
                  </div>
                ))}
                {!(widget?.merged?.payments || []).length ? <div className="rounded-[1.35rem] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm text-white/55">No recent payments found in the current widget window.</div> : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,28,0.96),rgba(3,9,16,0.985))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <SectionTitle eyebrow="Recent blocks" title="Latest pool blocks" description="Blocks attributed to the pool widget feed, with reward and status." />
              <div className="mt-6 space-y-3">
                {(widget?.merged?.blocks || []).slice(0, 8).map((block, index) => (
                  <div key={`${block.blockHeight}-${block.created}-${index}`} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4">
                    <div>
                      <div className="font-black text-white">#{formatInt(block.blockHeight || 0)}</div>
                      <div className="mt-1 text-sm text-white/58">Miner {shortHex(block.miner)} • {age(block.created)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-white">{formatCoin(block.reward, 6)} INRI</div>
                      <div className="mt-1 text-sm uppercase tracking-[0.2em] text-primary">{block.status || 'unknown'}</div>
                    </div>
                  </div>
                ))}
                {!(widget?.merged?.blocks || []).length ? <div className="rounded-[1.35rem] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm text-white/55">No recent pool blocks found in the current widget window.</div> : null}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,28,0.96),rgba(3,9,16,0.985))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <SectionTitle eyebrow="Top miners" title="Current hashrate leaders" description="Ranked from the current widget feed." />
              <div className="mt-6 space-y-3">
                {(widget?.merged?.miners || []).slice(0, 10).map((miner, index) => (
                  <div key={`${miner.miner}-${index}`} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4">
                    <div>
                      <div className="font-black text-white">#{index + 1} {shortHex(miner.miner, 10, 8)}</div>
                      <div className="mt-1 text-sm text-white/58">{Number(miner.sharesPerSecond || 0).toFixed(3)} shares/sec</div>
                    </div>
                    <div className="text-right text-lg font-black text-white">{formatHashrate(miner.hashrate)}</div>
                  </div>
                ))}
                {!(widget?.merged?.miners || []).length ? <div className="rounded-[1.35rem] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm text-white/55">No miners found in the current widget window.</div> : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,28,0.96),rgba(3,9,16,0.985))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <SectionTitle eyebrow="Network pulse" title="Main RPC + pool context" description="Useful references for pool users and miners following the network health." />
              <div className="mt-6 grid gap-3">
                {[
                  ['rpc-chain peers', formatInt(FIXED_RPC_CHAIN_PEERS)],
                  ['boot1 peers', formatInt(FIXED_BOOT1_PEERS)],
                  ['boot2 peers', formatInt(FIXED_BOOT2_PEERS)],
                  ['Main RPC peers', formatInt(mainRpcPeers)],
                  ['Network health', networkPeers >= 60 ? 'Strong' : networkPeers >= 40 ? 'Healthy' : 'Light'],
                  ['Last widget update', widget?.generatedAt ? new Date(widget.generatedAt).toLocaleTimeString() : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="text-sm font-semibold text-white/64">{label}</div>
                    <div className="text-sm font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,28,0.96),rgba(3,9,16,0.985))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-7">
            <SectionTitle eyebrow="Miner lookup" title={searchResult ? 'Miner activity overview' : 'Search a miner address'} description={searchResult ? 'Live pool and RPC summary for the searched address.' : 'Enter an INRI address to see current pool presence, payments, blocks and balance.'} />
            {searchResult ? (
              <div className="mt-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-primary/24 bg-primary/[0.08] p-5">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Address searched</div>
                    <div className="mt-2 break-all font-mono text-sm font-bold text-white">{searchResult.address}</div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => copyText(searchResult.address)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
                    >
                      <Copy className="h-4 w-4" />
                      Copy address
                    </button>
                    <InriLinkButton href={toExplorerAddress(searchResult.address)} external variant="secondary" noTranslate>
                      Open in explorer
                    </InriLinkButton>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {searchSummary.map((item) => (
                    <div key={item.label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/40">{item.label}</div>
                      <div className="mt-3 text-2xl font-black text-white">{item.value}</div>
                      <div className="mt-2 text-sm text-white/56">{item.note}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Recent payments</div>
                    <div className="mt-4 space-y-3">
                      {searchResult.recentPayments.length ? searchResult.recentPayments.map((payment, index) => (
                        <div key={`${payment.created}-${index}`} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.15rem] border border-white/10 bg-black/25 p-4">
                          <div>
                            <div className="font-black text-white">{formatCoin(payment.amount, 6)} INRI</div>
                            <div className="mt-1 text-sm text-white/58">{payment.poolId || payment.poolid || 'pool'} • {payment.created ? new Date(payment.created).toLocaleString() : '—'}</div>
                          </div>
                          {payment.transactionConfirmationData ? <RowLink href={toExplorerTx(payment.transactionConfirmationData)}>Open tx</RowLink> : null}
                        </div>
                      )) : <div className="rounded-[1.15rem] border border-dashed border-white/12 bg-black/20 p-4 text-sm text-white/55">No recent payments found for this address in the current widget window.</div>}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Recent blocks</div>
                    <div className="mt-4 space-y-3">
                      {searchResult.recentBlocks.length ? searchResult.recentBlocks.map((block, index) => (
                        <div key={`${block.blockHeight}-${index}`} className="flex flex-wrap items-center justify-between gap-4 rounded-[1.15rem] border border-white/10 bg-black/25 p-4">
                          <div>
                            <div className="font-black text-white">#{formatInt(block.blockHeight || 0)}</div>
                            <div className="mt-1 text-sm text-white/58">Reward {formatCoin(block.reward, 6)} INRI • {age(block.created)}</div>
                          </div>
                          {(block.transactionConfirmationData || block.infoLink) ? <RowLink href={block.transactionConfirmationData ? toExplorerTx(block.transactionConfirmationData) : (block.infoLink || '#')}>Open block</RowLink> : null}
                        </div>
                      )) : <div className="rounded-[1.15rem] border border-dashed border-white/12 bg-black/20 p-4 text-sm text-white/55">No recent pool block found for this address in the current widget window.</div>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] p-6 text-sm leading-7 text-white/62">
                Search an address to open the dedicated miner tab. You will see current hashrate rank, total paid from the current widget window, blocks found, latest payment, recent blocks and live INRI balance.
              </div>
            )}
          </div>
        </section>
      )}
    </section>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,16,28,0.96),rgba(3,9,16,0.985))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-7">
        <SectionTitle eyebrow="How to start" title="Simple mining route" description="Use your INRI wallet address, choose PPLNS or SOLO and monitor the pool from this page." />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: '1. Get an INRI wallet',
              text: 'Use your INRI address as the miner username. Add worker names like YOUR_WALLET.RIG001 to separate machines.',
            },
            {
              title: '2. Choose PPLNS or SOLO',
              text: 'PPLNS fits steady payouts. SOLO fits miners comfortable with variance and full block wins.',
            },
            {
              title: '3. Start and monitor',
              text: 'Use the live pool, this page, the explorer and the miner search tab to follow your rigs and payouts.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {error ? <div className="rounded-[1.4rem] border border-rose-500/25 bg-rose-500/10 p-5 text-sm font-semibold text-rose-300">{error}</div> : null}
    </div>
  )
}
