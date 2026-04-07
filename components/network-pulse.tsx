'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Globe2, Radar, Sparkles } from 'lucide-react'

type PulseState = {
  block: string
  peers: string
  difficulty: string
  hashrate: string
  updatedAt: string
  status: 'ok' | 'error' | 'loading'
}

const initialState: PulseState = {
  block: '-',
  peers: '-',
  difficulty: '-',
  hashrate: '-',
  updatedAt: '—',
  status: 'loading',
}

const nodes = [
  { left: '12%', top: '34%', size: 'h-3 w-3' },
  { left: '22%', top: '56%', size: 'h-2.5 w-2.5' },
  { left: '34%', top: '30%', size: 'h-3 w-3' },
  { left: '48%', top: '48%', size: 'h-4 w-4' },
  { left: '61%', top: '38%', size: 'h-3 w-3' },
  { left: '72%', top: '60%', size: 'h-2.5 w-2.5' },
  { left: '84%', top: '28%', size: 'h-3 w-3' },
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
    i++
  }
  return `${value >= 10 ? value.toFixed(1) : value.toFixed(2)}${units[i]}`
}

function formatBigHexShort(hex?: string) {
  if (!hex) return '-'
  try {
    let value = BigInt(hex)
    const units = ['', 'K', 'M', 'G', 'T', 'P']
    let i = 0
    while (value >= 1000n && i < units.length - 1) {
      value /= 1000n
      i++
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
    i++
  }
  return `${v.toFixed(2)} ${units[i]}`
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

export function NetworkPulse() {
  const [pulse, setPulse] = useState<PulseState>(initialState)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [blockHex, peerHex, latestBlock] = await Promise.all([
          rpc('eth_blockNumber'),
          rpc('net_peerCount'),
          rpc('eth_getBlockByNumber', ['latest', false]),
        ])

        const block = parseInt(blockHex, 16)
        const peers = parseInt(peerHex, 16)
        const difficultyHex = latestBlock?.difficulty || '0x0'
        const difficultyNum = Number(BigInt(difficultyHex) > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : Number(BigInt(difficultyHex)))
        const estimatedHashrate = difficultyNum > 0 ? difficultyNum / 15 : 0

        if (!mounted) return
        setPulse({
          block: formatShortNumber(block),
          peers: formatShortNumber(peers),
          difficulty: formatBigHexShort(difficultyHex),
          hashrate: formatHashrate(estimatedHashrate),
          updatedAt: new Date().toLocaleTimeString(),
          status: 'ok',
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
    const interval = setInterval(load, REFRESH_INTERVAL)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const feed = useMemo(() => [
    { label: 'Latest block', value: pulse.block },
    { label: 'Connected peers', value: pulse.peers },
    { label: 'Difficulty', value: pulse.difficulty },
    { label: 'Estimated hashrate', value: pulse.hashrate },
  ], [pulse])

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_25px_120px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">
                Network pulse
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Live network signals, not just static cards.
              </h2>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Globe2 className="h-6 w-6" />
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-8 text-white/70 sm:text-base">
            This section now reads live data from the INRI RPC and refreshes automatically, creating a stronger network signal on the homepage.
          </p>

          <div className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#06111d] p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(19,164,255,0.18),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(19,164,255,0.12),transparent_24%),radial-gradient(circle_at_55%_75%,rgba(19,164,255,0.12),transparent_20%)]" />
            <div className="relative aspect-[16/9] rounded-[1.25rem] border border-white/6 bg-[linear-gradient(180deg,rgba(8,18,33,0.84),rgba(6,12,22,0.96))]">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:22px_22px] opacity-40" />
              {nodes.map((node, index) => (
                <div key={index} className="absolute" style={{ left: node.left, top: node.top }}>
                  <span className={`absolute -left-3 -top-3 rounded-full bg-primary/20 blur-md ${node.size === 'h-4 w-4' ? 'h-10 w-10' : 'h-8 w-8'}`} />
                  <span className={`relative block rounded-full bg-primary shadow-[0_0_0_6px_rgba(19,164,255,0.12)] ${node.size}`} />
                </div>
              ))}
              <div className="absolute inset-x-10 bottom-10 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="absolute left-[14%] top-[35%] h-px w-[22%] rotate-[14deg] bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
              <div className="absolute left-[35%] top-[31%] h-px w-[26%] rotate-[18deg] bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
              <div className="absolute left-[49%] top-[49%] h-px w-[23%] -rotate-[8deg] bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10" />
              <div className="absolute right-[9%] top-[16%] flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <Activity className="h-3.5 w-3.5" />
                {pulse.status === 'ok' ? 'live pulse' : pulse.status === 'loading' ? 'loading' : 'offline'}
              </div>
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/75">
                <Radar className="h-3.5 w-3.5 text-primary" />
                Updated {pulse.updatedAt}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)] sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">
              Real-time metrics
            </p>
            <div className="mt-6 grid gap-4">
              {feed.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">status</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary/15 bg-primary/10 p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-4 w-4" />
              Real-time upgrade path
            </p>
            <p className="mt-4 text-sm leading-8 text-white/80">
              This version uses live RPC reads. If you want a world map with live website visitors, the next step is connecting presence events through Supabase Realtime, Ably, Pusher, or another backend service.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
