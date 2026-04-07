'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowUpRight,
  Blocks,
  Clock3,
  Coins,
  Flame,
  Gauge,
  Network,
  Pickaxe,
  Search,
  ShieldCheck,
  Wallet,
} from 'lucide-react'

type PulseStatus = 'loading' | 'ok' | 'partial' | 'error'
type ActiveTab = 'overview' | 'explorer' | 'mining'

type RecentBlock = {
  block: number
  txs: number
  gasUsedPct: number
  interval: number
  miner: string
  timestamp: number
  hash: string
}

type LatestTx = {
  hash: string
  from: string
  to: string
  value: string
  blockNumber: number
}

type PoolPulse = {
  pplns?: {
    connectedMiners?: number
    activeWorkers?: number
    poolHashrate?: number
    lastBlock?: number
    paymentsCount?: number
  }
  solo?: {
    connectedMiners?: number
    activeWorkers?: number
    poolHashrate?: number
    lastBlock?: number
    paymentsCount?: number
  }
  totals?: {
    connectedMiners?: number
    activeWorkers?: number
  }
  merged?: {
    payments?: Array<{
      amount?: number
      address?: string
      created?: string
      transactionConfirmationData?: string
      poolId?: string
      poolid?: string
    }>
  }
}

type SearchResult =
  | {
      kind: 'address'
      address: string
      balance: string
      nonce: number
      codeSize: number
      blockNumber: number
      recent: Array<{ hash: string; direction: string; counterparty: string; value: string; blockNumber: number }>
    }
  | {
      kind: 'tx'
      hash: string
      status: string
      blockNumber: number
      from: string
      to: string
      value: string
      gas: number
      gasPrice: string
      nonce: number
    }
  | {
      kind: 'block'
      number: number
      hash: string
      parentHash: string
      miner: string
      txCount: number
      gasUsed: number
      gasLimit: number
      timestamp: string
    }
  | null

type PoolPayment = {
  amount?: number
  address?: string
  created?: string
  transactionConfirmationData?: string
  poolId?: string
  poolid?: string
}

type PulseState = {
  latestBlock: number | null
  peers: number | null
  chainId: string
  baseFee: string
  gasPrice: string
  gasUsedRatio: string
  avgBlockTime: string
  difficulty: string
  hashrate: string
  latestTxs: number
  updatedAt: string
  status: PulseStatus
  poolMiners: number
  poolWorkers: number
  pplnsHashrate: string
  soloHashrate: string
  poolPayments: number
}

const RPC_URL = 'https://rpc.inri.life'
const WIDGET_URL = 'https://pool.inri.life/widget/pool-pulse.js'
const REFRESH_INTERVAL = 20000
const ADDRESS_SCAN_BLOCKS = 20

const initialState: PulseState = {
  latestBlock: null,
  peers: null,
  chainId: '3777',
  baseFee: '-',
  gasPrice: '-',
  gasUsedRatio: '-',
  avgBlockTime: '-',
  difficulty: '-',
  hashrate: '-',
  latestTxs: 0,
  updatedAt: '-',
  status: 'loading',
  poolMiners: 0,
  poolWorkers: 0,
  pplnsHashrate: '-',
  soloHashrate: '-',
  poolPayments: 0,
}

declare global {
  interface Window {
    INRI_POOL_PULSE?: PoolPulse
  }
}

function formatShortNumber(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '-'
  if (value < 1000) return String(value)
  if (value < 1_000_000) return `${(value / 1000).toFixed(1)}K`
  if (value < 1_000_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  return `${(value / 1_000_000_000).toFixed(1)}B`
}

function formatBigHexShort(hex?: string) {
  if (!hex) return '-'
  let clean = String(hex)
  if (clean.startsWith('0x')) clean = clean.slice(2)
  if (!clean) return '0'

  try {
    let value = BigInt(`0x${clean}`)
    const units = ['', 'K', 'M', 'G', 'T', 'P']
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
    const wei = BigInt(hex)
    const gwei = Number(wei) / 1_000_000_000
    if (!Number.isFinite(gwei)) return '-'
    return `${gwei.toFixed(4)} gwei`
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
  return `${current.toFixed(current >= 100 ? 0 : current >= 10 ? 1 : 2)} ${units[index]}`
}

function formatCoinAmount(value?: number) {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric)) return '-'
  return numeric.toFixed(4).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}

function formatAge(timestamp: number) {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - timestamp)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m ago`
}

function shortHash(value: string, left = 8, right = 6) {
  if (!value) return '—'
  if (value.length <= left + right + 2) return value
  return `${value.slice(0, left)}…${value.slice(-right)}`
}

function hexToNumber(value?: string) {
  if (!value) return 0
  return Number.parseInt(value, 16)
}

function numberToHex(value: number) {
  return `0x${value.toString(16)}`
}

function weiToEthApprox(wei: bigint) {
  const base = 1_000_000_000_000_000_000n
  const whole = wei / base
  const fraction = Number((wei % base) / 10_000_000_000_000_000n) / 100
  const fractionString = String(fraction).split('.')[1] || '00'
  return `${whole.toString()}.${fractionString.padEnd(2, '0').slice(0, 2)}`
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

async function loadPoolWidget(): Promise<PoolPulse | null> {
  return new Promise((resolve) => {
    const previous = document.getElementById('inri-pool-pulse-loader')
    if (previous) previous.remove()
    window.INRI_POOL_PULSE = undefined

    const script = document.createElement('script')
    script.id = 'inri-pool-pulse-loader'
    script.src = `${WIDGET_URL}?t=${Date.now()}`
    script.async = true

    script.onload = () => {
      resolve(window.INRI_POOL_PULSE || null)
    }

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
      txs: Array.isArray(block?.transactions) ? block.transactions.length : 0,
      gasUsedPct: Number(((gasUsed / gasLimit) * 100).toFixed(1)),
      interval: index > 0 ? Math.max(currentTimestamp - previousTimestamp, 0) : 0,
      miner: block?.miner || '',
      timestamp: currentTimestamp,
      hash: block?.hash || '',
    }
  })
}

function buildLatestTxs(blocks: any[]) {
  const items: LatestTx[] = []
  const seen = new Set<string>()

  for (const block of [...blocks].reverse()) {
    for (const tx of Array.isArray(block?.transactions) ? block.transactions : []) {
      if (!tx?.hash || seen.has(tx.hash)) continue
      seen.add(tx.hash)
      items.push({
        hash: tx.hash,
        from: tx.from || '',
        to: tx.to || '',
        value: weiToEthApprox(hexToBigInt(tx.value || '0x0')),
        blockNumber: hexToNumber(tx.blockNumber),
      })
      if (items.length >= 8) return items
    }
  }

  return items
}

function getAverageBlockTime(blocks: any[]) {
  const ordered = [...blocks].filter(Boolean).sort((a, b) => hexToNumber(a?.number) - hexToNumber(b?.number))
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

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

function isTxHash(value: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(value)
}

function isBlockNumber(value: string) {
  return /^\d+$/.test(value)
}

export function NetworkPulse() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [pulse, setPulse] = useState<PulseState>(initialState)
  const [recentBlocks, setRecentBlocks] = useState<RecentBlock[]>([])
  const [latestTxs, setLatestTxs] = useState<LatestTx[]>([])
  const [poolPaymentsList, setPoolPaymentsList] = useState<PoolPayment[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchBusy, setSearchBusy] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [searchResult, setSearchResult] = useState<SearchResult>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [blockHex, peerHex, chainIdHex, latestBlock, poolPulse] = await Promise.all([
          rpc('eth_blockNumber'),
          rpc('net_peerCount'),
          rpc('eth_chainId'),
          rpc('eth_getBlockByNumber', ['latest', true]),
          loadPoolWidget(),
        ])

        const latestBlockNumber = hexToNumber(blockHex)
        const targets = Array.from({ length: 8 }, (_, index) => latestBlockNumber - (7 - index)).filter((value) => value >= 0)
        const rawRecentBlocks = await Promise.all(
          targets.map((blockNumber) => rpc('eth_getBlockByNumber', [numberToHex(blockNumber), true]))
        )

        const averageBlockTime = getAverageBlockTime(rawRecentBlocks)
        const gasUsed = hexToNumber(latestBlock?.gasUsed)
        const gasLimit = Math.max(hexToNumber(latestBlock?.gasLimit), 1)
        const difficultyHex = latestBlock?.difficulty || '0x0'
        const difficultyBig = hexToBigInt(difficultyHex)
        const safeDifficulty = Number(
          difficultyBig > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : difficultyBig
        )
        const estimatedHashrate = averageBlockTime > 0 ? safeDifficulty / averageBlockTime : 0
        const latestTransactions = Array.isArray(latestBlock?.transactions) ? latestBlock.transactions.length : 0

        const poolMiners = Number(poolPulse?.totals?.connectedMiners || 0)
        const poolWorkers = Number(poolPulse?.totals?.activeWorkers || 0)
        const poolPayments = Array.isArray(poolPulse?.merged?.payments) ? poolPulse?.merged?.payments?.length || 0 : 0

        if (!mounted) return

        const gasPriceHex = (await rpc('eth_gasPrice')) as string

        setPulse({
          latestBlock: latestBlockNumber,
          peers: hexToNumber(peerHex),
          chainId: String(hexToNumber(chainIdHex) || 3777),
          baseFee: formatGwei(latestBlock?.baseFeePerGas),
          gasPrice: formatGwei(gasPriceHex),
          gasUsedRatio: `${((gasUsed / gasLimit) * 100).toFixed(1)}%`,
          avgBlockTime: averageBlockTime > 0 ? `${averageBlockTime.toFixed(1)}s` : '-',
          difficulty: formatBigHexShort(difficultyHex),
          hashrate: formatHashrate(estimatedHashrate),
          latestTxs: latestTransactions,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: poolPulse ? 'ok' : 'partial',
          poolMiners,
          poolWorkers,
          pplnsHashrate: formatHashrate(Number(poolPulse?.pplns?.poolHashrate || 0)),
          soloHashrate: formatHashrate(Number(poolPulse?.solo?.poolHashrate || 0)),
          poolPayments,
        })
        setRecentBlocks(buildRecentBlocks(rawRecentBlocks))
        setLatestTxs(buildLatestTxs(rawRecentBlocks))
        setPoolPaymentsList(Array.isArray(poolPulse?.merged?.payments) ? (poolPulse?.merged?.payments as PoolPayment[]) : [])
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

  async function handleSearch() {
    const query = searchInput.trim()
    if (!query) return

    try {
      setSearchBusy(true)
      setSearchError('')
      setSearchResult(null)

      if (isAddress(query)) {
        const [balanceHex, nonceHex, codeHex, latestBlockHex] = await Promise.all([
          rpc('eth_getBalance', [query, 'latest']),
          rpc('eth_getTransactionCount', [query, 'latest']),
          rpc('eth_getCode', [query, 'latest']),
          rpc('eth_blockNumber'),
        ])

        const latestBlockNumber = hexToNumber(latestBlockHex)
        const fromBlock = Math.max(0, latestBlockNumber - ADDRESS_SCAN_BLOCKS + 1)
        const blockPromises = []
        for (let blockNumber = latestBlockNumber; blockNumber >= fromBlock; blockNumber -= 1) {
          blockPromises.push(rpc('eth_getBlockByNumber', [numberToHex(blockNumber), true]))
        }

        const blocks = await Promise.all(blockPromises)
        const lower = query.toLowerCase()
        const recent: Array<{ hash: string; direction: string; counterparty: string; value: string; blockNumber: number }> = []

        for (const block of blocks) {
          if (!block?.transactions) continue
          for (const tx of block.transactions) {
            const from = String(tx.from || '').toLowerCase()
            const to = String(tx.to || '').toLowerCase()
            if (from === lower || to === lower) {
              recent.push({
                hash: tx.hash,
                direction: from === lower ? 'Outgoing' : 'Incoming',
                counterparty: from === lower ? tx.to || 'Contract creation' : tx.from,
                value: weiToEthApprox(hexToBigInt(tx.value || '0x0')),
                blockNumber: hexToNumber(tx.blockNumber),
              })
            }
          }
          if (recent.length >= 6) break
        }

        setSearchResult({
          kind: 'address',
          address: query,
          balance: weiToEthApprox(hexToBigInt(balanceHex)),
          nonce: hexToNumber(nonceHex),
          codeSize: Math.max(0, (String(codeHex).length - 2) / 2),
          blockNumber: latestBlockNumber,
          recent: recent.slice(0, 6),
        })
        return
      }

      if (isTxHash(query)) {
        const [tx, receipt] = await Promise.all([
          rpc('eth_getTransactionByHash', [query]),
          rpc('eth_getTransactionReceipt', [query]).catch(() => null),
        ])
        if (!tx) throw new Error('Transaction not found')

        setSearchResult({
          kind: 'tx',
          hash: tx.hash,
          status: receipt?.status === '0x1' ? 'Success' : receipt?.status === '0x0' ? 'Failed' : 'Pending / unknown',
          blockNumber: tx.blockNumber ? hexToNumber(tx.blockNumber) : 0,
          from: tx.from || '',
          to: tx.to || 'Contract creation',
          value: weiToEthApprox(hexToBigInt(tx.value || '0x0')),
          gas: tx.gas ? hexToNumber(tx.gas) : 0,
          gasPrice: tx.gasPrice ? formatGwei(tx.gasPrice) : '-',
          nonce: tx.nonce ? hexToNumber(tx.nonce) : 0,
        })
        return
      }

      if (isBlockNumber(query)) {
        const block = await rpc('eth_getBlockByNumber', [numberToHex(Number.parseInt(query, 10)), true])
        if (!block) throw new Error('Block not found')

        setSearchResult({
          kind: 'block',
          number: hexToNumber(block.number),
          hash: block.hash || '',
          parentHash: block.parentHash || '',
          miner: block.miner || '',
          txCount: Array.isArray(block.transactions) ? block.transactions.length : 0,
          gasUsed: hexToNumber(block.gasUsed),
          gasLimit: hexToNumber(block.gasLimit),
          timestamp: new Date(hexToNumber(block.timestamp) * 1000).toLocaleString(),
        })
        return
      }

      throw new Error('Search by address, tx hash or block number')
    } catch (error: any) {
      setSearchError(error?.message || 'Search failed')
    } finally {
      setSearchBusy(false)
    }
  }

  const quickStats = useMemo(
    () => [
      { label: 'Block', value: pulse.latestBlock ? formatShortNumber(pulse.latestBlock) : '-', icon: Blocks },
      { label: 'Peers', value: pulse.peers !== null ? formatShortNumber(pulse.peers) : '-', icon: Network },
      { label: 'Block time', value: pulse.avgBlockTime, icon: Clock3 },
      { label: 'Base fee', value: pulse.baseFee, icon: Flame },
      { label: 'Txs', value: formatShortNumber(pulse.latestTxs), icon: Activity },
      { label: 'Pool miners', value: formatShortNumber(pulse.poolMiners), icon: Pickaxe },
    ],
    [pulse]
  )

  const displayedBlocks = [...recentBlocks].reverse().slice(0, 5)
  const chartBlocks = recentBlocks.slice(1)
  const maxInterval = Math.max(...chartBlocks.map((item) => item.interval), 1)
  const sectionTabs: Array<{ key: ActiveTab; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'explorer', label: 'Explorer' },
    { key: 'mining', label: 'Mining' },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-20">
      <div className="inri-panel overflow-hidden">
        <div className="border-b border-white/10 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Live network</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">Real activity, cleaner alignment.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58 sm:text-base">
                Bigger containers, calmer spacing and more useful information keep the homepage live without turning it into a messy dashboard.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
              <Activity className="h-4 w-4 text-primary" />
              {pulse.status === 'ok'
                ? `Updated ${pulse.updatedAt}`
                : pulse.status === 'partial'
                  ? `Partial ${pulse.updatedAt}`
                  : pulse.status === 'loading'
                    ? 'Loading'
                    : 'Offline'}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {quickStats.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="inri-card min-h-[110px] px-4 py-4 sm:px-5">
                  <div className="flex items-center gap-2 text-white/46">
                    <Icon className="h-4 w-4 text-primary" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em]">{item.label}</p>
                  </div>
                  <p className="mt-4 break-words text-lg leading-tight font-bold text-white sm:text-2xl">{item.value}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {sectionTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? 'border-primary/40 bg-primary text-black'
                    : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-primary/30 hover:bg-primary/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' ? (
          <div className="grid gap-0 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="border-b border-white/10 p-6 sm:p-8 xl:border-b-0 xl:border-r">
              <div className="inri-panel-strong p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Recent rhythm</p>
                    <p className="mt-2 text-sm leading-7 text-white/60">Recent block timing, gas use and latest chain rhythm in one clearer view.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inri-chip">Chain {pulse.chainId}</span>
                    <span className="inri-chip">Difficulty {pulse.difficulty}</span>
                    <span className="inri-chip">Hashrate {pulse.hashrate}</span>
                    <span className="inri-chip">Gas {pulse.gasUsedRatio}</span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-5 items-end gap-3 sm:gap-4">
                  {chartBlocks.map((item) => {
                    const height = `${Math.max(36, (item.interval / maxInterval) * 132)}px`
                    return (
                      <div key={item.block} className="min-w-0 text-center">
                        <div className="flex h-40 items-end justify-center rounded-[1.2rem] border border-white/10 bg-white/[0.02] p-3">
                          <div
                            className="w-full rounded-full bg-[linear-gradient(180deg,rgba(19,164,255,0.98),rgba(19,164,255,0.16))] shadow-[0_14px_28px_rgba(19,164,255,0.20)]"
                            style={{ height }}
                          />
                        </div>
                        <p className="mt-3 text-sm font-bold text-white">{item.interval}s</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/42">#{String(item.block).slice(-4)}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 grid gap-3">
                  {displayedBlocks.map((item) => (
                    <div key={item.block} className="inri-card flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">Block #{item.block}</p>
                        <p className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-white/42">
                          {item.interval}s • {item.txs} txs • {shortHash(item.miner)}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/40">Gas used</p>
                        <p className="mt-1 text-sm font-bold text-primary">{item.gasUsedPct}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-4">
                <div className="inri-card p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Chain facts</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Gas price', pulse.gasPrice],
                      ['Base fee', pulse.baseFee],
                      ['Block time', pulse.avgBlockTime],
                      ['Peers', pulse.peers !== null ? formatShortNumber(pulse.peers) : '-'],
                      ['Difficulty', pulse.difficulty],
                      ['Hashrate', pulse.hashrate],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">{label}</p>
                        <p className="mt-3 break-words text-base font-bold text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="inri-card p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Useful routes</p>
                  <h3 className="mt-3 text-2xl font-bold text-white">Keep the homepage useful from the first second.</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    Fast access to wallet, explorer, mining and pool makes the site feel valuable instead of decorative.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      { title: 'Wallet', text: 'Use the official INRI wallet.', href: 'https://wallet.inri.life', external: true, icon: Wallet },
                      { title: 'Explorer', text: 'Verify blocks, txs and addresses.', href: 'https://explorer.inri.life', external: true, icon: Blocks },
                      { title: 'Mining', text: 'Windows and Ubuntu routes.', href: '/mining', icon: Pickaxe },
                      { title: 'Pool', text: 'See miners, blocks and payments.', href: '/pool', icon: Gauge },
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                          className="group rounded-[1.25rem] border border-white/10 bg-black/30 p-4 transition hover:border-primary/35 hover:bg-primary/10"
                        >
                          <div className="inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="mt-4 text-lg font-bold text-white">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
                          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                            Open <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'explorer' ? (
          <div className="grid gap-0 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="border-b border-white/10 p-6 sm:p-8 xl:border-b-0 xl:border-r">
              <div className="inri-card p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Mini explorer</p>
                    <p className="mt-2 text-sm leading-7 text-white/60">Search an address, transaction hash or block number without leaving the homepage.</p>
                  </div>
                  <Link
                    href="https://explorer.inri.life"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary"
                  >
                    Full explorer <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <label className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                    <input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSearch()
                      }}
                      placeholder="Search address, tx hash or block number"
                      className="w-full rounded-[1.2rem] border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/32 focus:border-primary/35"
                    />
                  </label>
                  <button
                    onClick={handleSearch}
                    disabled={searchBusy}
                    className="inline-flex min-h-11 items-center justify-center rounded-[1.2rem] border border-primary/40 bg-primary px-5 py-3 text-sm font-bold text-black transition hover:bg-[#33b0ff] disabled:opacity-60"
                  >
                    {searchBusy ? 'Searching…' : 'Search'}
                  </button>
                </div>

                {searchError ? <p className="mt-4 text-sm text-red-300">{searchError}</p> : null}

                {searchResult ? (
                  <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/40">
                    {searchResult.kind === 'address' ? (
                      <div>
                        <div className="border-b border-white/10 px-5 py-4">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Address</p>
                          <p className="mt-2 break-all text-sm font-semibold text-white">{searchResult.address}</p>
                        </div>
                        <div className="grid gap-0 sm:grid-cols-2">
                          {[
                            ['Balance', `${searchResult.balance} INRI`],
                            ['Nonce', String(searchResult.nonce)],
                            ['Code size', `${searchResult.codeSize} bytes`],
                            ['Current block', formatShortNumber(searchResult.blockNumber)],
                          ].map(([label, value]) => (
                            <div key={label} className="border-b border-white/10 px-5 py-4 sm:border-r even:sm:border-r-0">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">{label}</p>
                              <p className="mt-2 break-words text-sm font-semibold text-white">{value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="px-5 py-5">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">Recent activity</p>
                          <div className="mt-4 grid gap-3">
                            {searchResult.recent.length > 0 ? (
                              searchResult.recent.map((item) => (
                                <div key={item.hash} className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-4">
                                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm font-bold text-white">{item.direction}</p>
                                    <p className="text-xs uppercase tracking-[0.16em] text-white/42">Block #{item.blockNumber}</p>
                                  </div>
                                  <p className="mt-2 truncate text-xs text-white/56">{shortHash(item.hash)}</p>
                                  <p className="mt-2 truncate text-sm text-white/72">{shortHash(item.counterparty)}</p>
                                  <p className="mt-2 text-sm font-semibold text-primary">{item.value} INRI</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-white/56">No recent transactions found in the scanned block window.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {searchResult.kind === 'tx' ? (
                      <div className="grid gap-0 sm:grid-cols-2">
                        {[
                          ['Hash', searchResult.hash],
                          ['Status', searchResult.status],
                          ['Block', formatShortNumber(searchResult.blockNumber)],
                          ['Value', `${searchResult.value} INRI`],
                          ['From', searchResult.from],
                          ['To', searchResult.to],
                          ['Gas', formatShortNumber(searchResult.gas)],
                          ['Gas price', searchResult.gasPrice],
                          ['Nonce', formatShortNumber(searchResult.nonce)],
                        ].map(([label, value]) => (
                          <div key={label} className="border-b border-white/10 px-5 py-4 sm:border-r even:sm:border-r-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">{label}</p>
                            <p className="mt-2 break-words text-sm font-semibold text-white">{value}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {searchResult.kind === 'block' ? (
                      <div className="grid gap-0 sm:grid-cols-2">
                        {[
                          ['Block', formatShortNumber(searchResult.number)],
                          ['Transactions', formatShortNumber(searchResult.txCount)],
                          ['Hash', searchResult.hash],
                          ['Parent hash', searchResult.parentHash],
                          ['Miner', searchResult.miner],
                          ['Timestamp', searchResult.timestamp],
                          ['Gas used', formatShortNumber(searchResult.gasUsed)],
                          ['Gas limit', formatShortNumber(searchResult.gasLimit)],
                        ].map(([label, value]) => (
                          <div key={label} className="border-b border-white/10 px-5 py-4 sm:border-r even:sm:border-r-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">{label}</p>
                            <p className="mt-2 break-words text-sm font-semibold text-white">{value}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-6 rounded-[1.35rem] border border-dashed border-white/12 bg-white/[0.02] px-5 py-6 text-sm leading-7 text-white/52">
                    Search address, tx hash or block number to open details here.
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-4">
                <div className="inri-card p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Latest transactions</p>
                  <div className="mt-5 grid gap-3">
                    {latestTxs.length > 0 ? (
                      latestTxs.map((tx) => (
                        <Link
                          key={tx.hash}
                          href={`https://explorer.inri.life/tx/${tx.hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/35 hover:bg-primary/10"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="truncate font-semibold text-white">{shortHash(tx.hash)}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-white/42">Block #{tx.blockNumber}</p>
                          </div>
                          <p className="mt-2 truncate text-sm text-white/56">{shortHash(tx.from)} → {shortHash(tx.to || 'contract')}</p>
                          <p className="mt-3 text-sm font-bold text-primary">{tx.value} INRI</p>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-white/56">No recent transactions available.</p>
                    )}
                  </div>
                </div>

                <div className="inri-card p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Latest blocks</p>
                  <div className="mt-5 grid gap-3">
                    {displayedBlocks.map((block) => (
                      <Link
                        key={block.block}
                        href={`https://explorer.inri.life/block/${block.block}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/35 hover:bg-primary/10"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold text-white">Block #{block.block}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-white/42">{formatAge(block.timestamp)}</p>
                        </div>
                        <p className="mt-2 truncate text-sm text-white/56">{shortHash(block.hash)}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-white/42">
                          <span>{block.txs} txs</span>
                          <span>{block.interval}s</span>
                          <span>gas {block.gasUsedPct}%</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'mining' ? (
          <div className="grid gap-0 xl:grid-cols-[1fr_1fr]">
            <div className="border-b border-white/10 p-6 sm:p-8 xl:border-b-0 xl:border-r">
              <div className="inri-card p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Mining pulse</p>
                    <p className="mt-2 text-sm leading-7 text-white/60">Bring pool activity, recent payments and setup routes closer to the homepage.</p>
                  </div>
                  <span className="inri-chip">Pool + network</span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Pool miners', formatShortNumber(pulse.poolMiners)],
                    ['Pool workers', formatShortNumber(pulse.poolWorkers)],
                    ['PPLNS rate', pulse.pplnsHashrate],
                    ['SOLO rate', pulse.soloHashrate],
                    ['Pool payments', formatShortNumber(pulse.poolPayments)],
                    ['Chain hashrate', pulse.hashrate],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/42">{label}</p>
                      <p className="mt-3 break-words text-base font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { title: 'Windows mining', text: 'Open the Windows setup route.', href: '/mining/windows' },
                    { title: 'Ubuntu mining', text: 'Open the Ubuntu setup route.', href: '/mining/ubuntu' },
                    { title: 'Pool page', text: 'See the full mining page.', href: '/pool' },
                    { title: 'Explorer', text: 'Verify mined blocks.', href: 'https://explorer.inri.life', external: true },
                  ].map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="group rounded-[1.2rem] border border-white/10 bg-black/30 p-4 transition hover:border-primary/35 hover:bg-primary/10"
                    >
                      <p className="text-base font-bold text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                        Open <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-4">
                <div className="inri-card p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Recent payments</p>
                  <div className="mt-5 grid gap-3">
                    {poolPaymentsList.length > 0 ? (
                      poolPaymentsList.slice(0, 6).map((payment, index) => (
                        <Link
                          key={`${payment.transactionConfirmationData || payment.address || index}`}
                          href={payment.transactionConfirmationData ? `https://explorer.inri.life/tx/${payment.transactionConfirmationData}` : '/pool'}
                          {...(payment.transactionConfirmationData ? { target: '_blank', rel: 'noreferrer' } : {})}
                          className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-primary/35 hover:bg-primary/10"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="truncate font-semibold text-white">{shortHash(payment.address || '')}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-white/42">{payment.poolId || payment.poolid || 'Pool'}</p>
                          </div>
                          <p className="mt-2 text-sm text-white/56">{payment.created ? new Date(payment.created).toLocaleString() : 'Recent payment'}</p>
                          <p className="mt-3 text-sm font-bold text-primary">{formatCoinAmount(payment.amount)} INRI</p>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-white/56">Pool widget data is unavailable right now.</p>
                    )}
                  </div>
                </div>

                <div className="inri-card p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Why this matters</p>
                  <div className="mt-5 grid gap-3">
                    {[
                      { icon: Pickaxe, title: 'Mining should feel visible', text: 'Make real participation a first-class route, not a hidden page.' },
                      { icon: Coins, title: 'Utility should stay inside the site', text: 'Wallet, pool, explorer and staking should work as one system.' },
                      { icon: ShieldCheck, title: 'Proof builds trust', text: 'Live data makes the brand feel more credible than generic marketing copy.' },
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <div key={item.title} className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
                          <div className="inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="mt-4 text-base font-bold text-white">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
