'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Award,
  Blocks,
  Clock3,
  Cpu,
  ExternalLink,
  Pickaxe,
  Search,
  ShieldCheck,
  Trophy,
  Wallet2,
} from 'lucide-react'

const START_BLOCK = 1_000_000
const END_BLOCK = 1_500_000
const BASE_REWARD_PER_BLOCK = 0.2
const FEED_URL = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/mining-championship.json`

const RANK_PRIZES: Record<number, number> = {
  1: 15000,
  2: 10000,
  3: 7000,
  4: 5000,
  5: 3500,
  6: 2500,
  7: 2000,
  8: 1800,
  9: 1700,
  10: 1500,
}

type Participant = {
  address: string
  blocks: number
  nickname?: string
  lastBlock?: number
  updatedAt?: string
}

type ChampionshipFeed = {
  mode?: 'preview' | 'live'
  updatedAt?: string
  currentBlock?: number
  startBlock?: number
  endBlock?: number
  baseRewardPerBlock?: number
  participants?: Participant[]
}

const FALLBACK_FEED: ChampionshipFeed = {
  mode: 'preview',
  updatedAt: '2026-04-14T22:20:00Z',
  currentBlock: 1_104_286,
  startBlock: START_BLOCK,
  endBlock: END_BLOCK,
  baseRewardPerBlock: BASE_REWARD_PER_BLOCK,
  participants: [
    { address: '0x4A1b6f7D0f1E7f9A4B6E3a0D4eB31C7B0A99E101', blocks: 1286, nickname: 'Solo Alpha', lastBlock: 1104265 },
    { address: '0x7D9912d77c03c01F18F7e3e0992F0e79416A8822', blocks: 1119, nickname: 'Night Hash', lastBlock: 1104233 },
    { address: '0x0C84d96f2D49398Df0eCA44C8D58A74D5c155633', blocks: 978, nickname: 'CPU Storm', lastBlock: 1104219 },
    { address: '0xA61a4c39d4b0dA7685b9d7438E9d0647c5b67A40', blocks: 841, nickname: 'INRI Forge', lastBlock: 1104201 },
    { address: '0x9d6cD5A45E2b612A0bB65E23B5b5e4C98D8A1177', blocks: 790, nickname: 'Hash River', lastBlock: 1104186 },
    { address: '0x3f7C4f9E4B57cAAc4fEd7D1e72eaB7BecD2f5411', blocks: 689, nickname: 'Solo South', lastBlock: 1104172 },
    { address: '0x219aA1675b22b9c66B76850F2b95d4a85Bd930c7', blocks: 611, nickname: 'Blue Rack', lastBlock: 1104161 },
    { address: '0xB82f67aA7706f2B57e617b0E6232F83f3d1bAa18', blocks: 577, nickname: 'Node Pilot', lastBlock: 1104150 },
    { address: '0x53c42B197c34F7093571A403CAf33B4FbB0A7724', blocks: 551, nickname: 'Core Miner', lastBlock: 1104139 },
    { address: '0xEA9C6B9697D8E3e1ce0A9A1e5cE4864f38B9857B', blocks: 498, nickname: 'Final Push', lastBlock: 1104111 },
    { address: '0x71B945C7cDC9A74af8aE5c4B6499d3fD3B1fBB84', blocks: 442, nickname: 'GPU Ladder', lastBlock: 1104091 },
    { address: '0x5caD4eF4B0A1840Bd5D35F18d4e372AAc100A56b', blocks: 403, nickname: 'Quiet Solo', lastBlock: 1104068 },
  ],
}

function formatInt(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatReward(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function totalReward(blocks: number, rank: number, baseRewardPerBlock: number) {
  return blocks * baseRewardPerBlock + (RANK_PRIZES[rank] || 0)
}

function StatCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string
  value: string
  helper: string
  icon: React.ReactNode
}) {
  return (
    <div className="inri-stat-card rounded-[1.6rem] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/44">{title}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
          {icon}
        </div>
      </div>
      <div className="mt-4 text-3xl font-black text-white sm:text-[2rem]">{value}</div>
      <p className="mt-2 text-sm leading-6 text-white/58">{helper}</p>
    </div>
  )
}


function ActionLink({ href, children, secondary = false, external = false }: { href: string; children: React.ReactNode; secondary?: boolean; external?: boolean }) {
  return (
    <Link
      href={href}
      className={secondary ? 'inri-button-secondary' : 'inri-button-primary'}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </Link>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const styles =
    rank === 1
      ? 'border-amber-300/40 bg-amber-300/12 text-amber-200'
      : rank === 2
        ? 'border-slate-300/30 bg-slate-300/10 text-slate-100'
        : rank === 3
          ? 'border-orange-300/35 bg-orange-300/12 text-orange-200'
          : 'border-primary/25 bg-primary/[0.10] text-primary'

  return (
    <span
      className={`inline-flex min-w-[56px] items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${styles}`}
    >
      #{rank}
    </span>
  )
}

export function InriMiningChampionshipClient() {
  const [feed, setFeed] = useState<ChampionshipFeed>(FALLBACK_FEED)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true

    async function loadFeed() {
      try {
        const response = await fetch(FEED_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error('Feed not available')
        const json = (await response.json()) as ChampionshipFeed
        if (active && json && Array.isArray(json.participants)) {
          setFeed({ ...FALLBACK_FEED, ...json })
          setLoadError(json.mode === 'preview' ? 'Preview feed loaded. Replace public/mining-championship.json with official data to go live.' : '')
        }
      } catch {
        if (active) {
          setFeed(FALLBACK_FEED)
          setLoadError('Using preview feed until the official championship JSON is updated.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadFeed()
    const timer = window.setInterval(loadFeed, 30000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  const currentBlock = feed.currentBlock ?? START_BLOCK
  const startBlock = feed.startBlock ?? START_BLOCK
  const endBlock = feed.endBlock ?? END_BLOCK
  const baseRewardPerBlock = feed.baseRewardPerBlock ?? BASE_REWARD_PER_BLOCK

  const participants = useMemo(() => {
    const rows = [...(feed.participants || [])]
    rows.sort((a, b) => b.blocks - a.blocks || a.address.localeCompare(b.address))
    return rows.map((item, index) => ({
      ...item,
      rank: index + 1,
      baseReward: item.blocks * baseRewardPerBlock,
      rankPrize: RANK_PRIZES[index + 1] || 0,
      totalReward: totalReward(item.blocks, index + 1, baseRewardPerBlock),
    }))
  }, [feed.participants, baseRewardPerBlock])

  const totalSoloBlocks = participants.reduce((sum, item) => sum + item.blocks, 0)
  const progress = Math.max(0, Math.min(100, ((currentBlock - startBlock) / Math.max(1, endBlock - startBlock)) * 100))
  const blocksRemaining = Math.max(0, endBlock - currentBlock)
  const topTen = participants.slice(0, 10)
  const searchResult = query.trim()
    ? participants.find((item) => item.address.toLowerCase() === query.trim().toLowerCase())
    : null

  return (
    <div className="grid gap-7">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Competition window"
          value={`${formatInt(startBlock)} → ${formatInt(endBlock)}`}
          helper="Official block range for the independent mining championship."
          icon={<Blocks className="h-5 w-5" />}
        />
        <StatCard
          title="Current chain block"
          value={formatInt(currentBlock)}
          helper={`${formatInt(blocksRemaining)} blocks remain before the championship closes.`}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Solo blocks counted"
          value={formatInt(totalSoloBlocks)}
          helper="Every legitimate solo block in the range counts toward the championship."
          icon={<Pickaxe className="h-5 w-5" />}
        />
        <StatCard
          title="Tracked miners"
          value={formatInt(participants.length)}
          helper="Wallet addresses already present in the current championship feed."
          icon={<Wallet2 className="h-5 w-5" />}
        />
      </section>

      <section className="inri-section-surface rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/[0.10] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
              <Trophy className="h-4 w-4" />
              Independent Mining Championship
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-[2.4rem]">
              Real-time style ranking page for solo miners, built in the same premium INRI site standard.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">
              Users can search their INRI address, see current position, estimated base reward, top-10 ranking bonus and direct links to the official explorer.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px] xl:max-w-[470px]">
            <ActionLink href="https://explorer.inri.life" external secondary>Official explorer</ActionLink>
            <ActionLink href="/mining">Mining hub</ActionLink>
            <ActionLink href="https://wallet.inri.life" external secondary>Open INRI Wallet</ActionLink>
            <ActionLink href="/pool" secondary>Pool + stats</ActionLink>
          </div>
        </div>

        <div className="mt-6 rounded-[1.35rem] border border-white/12 bg-black/28 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                Chain progress inside the competition range
              </div>
              <div className="mt-2 text-sm text-white/58">
                The widget refreshes automatically and is ready to read the public championship feed.
              </div>
            </div>
            <div
              className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${feed.mode === 'live' ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200' : 'border-amber-300/30 bg-amber-300/12 text-amber-200'}`}
            >
              {feed.mode === 'live' ? 'Live feed' : 'Preview feed'}
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#0b9fff,#7ee1ff)] shadow-[0_0_24px_rgba(19,164,255,0.55)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
            <span>Start: {formatInt(startBlock)}</span>
            <span>{progress.toFixed(2)}% complete</span>
            <span>End: {formatInt(endBlock)}</span>
          </div>
          <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">
            Updated: {feed.updatedAt ? new Date(feed.updatedAt).toLocaleString() : 'Not informed'}
          </div>
          {loadError ? (
            <div className="mt-3 rounded-[1rem] border border-amber-300/22 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100">
              {loadError}
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-[minmax(0,1.12fr)_400px]">
        <div className="inri-section-surface rounded-[2rem] p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Top 10 live board</div>
              <h3 className="mt-2 text-2xl font-black text-white">Current championship leaders</h3>
            </div>
            <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/64">
              Top 10 share an extra 50,000 INRI ranking prize.
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {topTen.map((item) => (
              <div key={item.address} className="inri-subcard rounded-[1.35rem] p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <RankBadge rank={item.rank} />
                      <div className="text-lg font-black text-white">{item.nickname || shortAddress(item.address)}</div>
                      <a
                        href={`https://explorer.inri.life/address/${item.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-white"
                      >
                        Explorer <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="mt-2 break-all font-mono text-sm text-white/54">{item.address}</div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1rem] border border-white/10 bg-black/24 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">Solo blocks</div>
                      <div className="mt-2 text-xl font-black text-white">{formatInt(item.blocks)}</div>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-black/24 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">Base reward</div>
                      <div className="mt-2 text-xl font-black text-white">{formatReward(item.baseReward)} INRI</div>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-black/24 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">Total projected</div>
                      <div className="mt-2 text-xl font-black text-white">{formatReward(item.totalReward)} INRI</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-7">
          <div className="inri-section-surface rounded-[2rem] p-6 sm:p-7">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Search your address</div>
            <h3 className="mt-2 text-2xl font-black text-white">Check your current position.</h3>
            <p className="mt-3 text-sm leading-7 text-white/62">
              Paste an INRI wallet address to see live placement, blocks counted, ranking bonus and estimated total reward.
            </p>

            <div className="mt-5 rounded-[1.2rem] border border-white/12 bg-black/26 p-2">
              <div className="flex items-center gap-3 rounded-[0.95rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                <Search className="h-4 w-4 text-primary" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Paste wallet address..."
                  className="h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/28"
                />
              </div>
            </div>

            {query.trim() ? (
              searchResult ? (
                <div className="mt-5 rounded-[1.35rem] border border-primary/24 bg-primary/[0.08] p-5 shadow-[0_18px_40px_rgba(19,164,255,0.12)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <RankBadge rank={searchResult.rank} />
                    <div className="text-lg font-black text-white">
                      {searchResult.nickname || shortAddress(searchResult.address)}
                    </div>
                  </div>
                  <div className="mt-3 break-all font-mono text-sm text-white/62">{searchResult.address}</div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-white/10 bg-black/24 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/36">Solo blocks found</div>
                      <div className="mt-2 text-2xl font-black text-white">{formatInt(searchResult.blocks)}</div>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-black/24 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/36">Estimated total reward</div>
                      <div className="mt-2 text-2xl font-black text-white">{formatReward(searchResult.totalReward)} INRI</div>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-black/24 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/36">Base reward</div>
                      <div className="mt-2 text-2xl font-black text-white">{formatReward(searchResult.baseReward)} INRI</div>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-black/24 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/36">Top-10 bonus</div>
                      <div className="mt-2 text-2xl font-black text-white">{formatReward(searchResult.rankPrize)} INRI</div>
                    </div>
                  </div>
                  <a
                    href={`https://explorer.inri.life/address/${searchResult.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inri-button-secondary mt-5 w-full"
                  >
                    Open address in official explorer
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.25rem] border border-white/12 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/60">
                  This address is not present in the current championship feed yet.
                </div>
              )
            ) : (
              <div className="mt-5 rounded-[1.25rem] border border-white/12 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/60">
                Search stays ready for any valid INRI address included in the championship feed.
              </div>
            )}
          </div>

          <div className="inri-section-surface rounded-[2rem] p-6 sm:p-7">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Rules + reward structure</div>
            <div className="mt-5 grid gap-3">
              {[
                {
                  icon: <Award className="h-5 w-5" />,
                  title: '150,000 INRI total',
                  text: '100,000 INRI as 0.20 INRI per legitimate solo block plus 50,000 INRI distributed to the top 10 miners.',
                },
                {
                  icon: <ShieldCheck className="h-5 w-5" />,
                  title: 'Solo mining only',
                  text: 'Pool miners can participate only when the effective block is their own solo mining result. Regular pool share ranking does not count.',
                },
                {
                  icon: <Cpu className="h-5 w-5" />,
                  title: 'CPU mining is valid',
                  text: 'The page highlights that CPU miners are eligible, as long as the blocks are legitimate solo blocks on the official network.',
                },
                {
                  icon: <Clock3 className="h-5 w-5" />,
                  title: 'Wallet address required',
                  text: 'Rewards must be tied to a valid INRI wallet address so the final distribution can be made correctly.',
                },
              ].map((item) => (
                <div key={item.title} className="inri-subcard rounded-[1.3rem] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-base font-black text-white">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-white/62">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="inri-section-surface rounded-[2rem] p-6 sm:p-7">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Top 10 prize ladder</div>
          <h3 className="mt-2 text-2xl font-black text-white">Ranking distribution</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {Object.entries(RANK_PRIZES).map(([rank, prize]) => (
              <div key={rank} className="inri-subcard rounded-[1.25rem] p-4 text-center">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Place {rank}</div>
                <div className="mt-3 text-2xl font-black text-white">{formatReward(prize)}</div>
                <div className="mt-1 text-sm text-white/58">INRI</div>
              </div>
            ))}
          </div>
        </div>

        <div className="inri-section-surface rounded-[2rem] p-6 sm:p-7">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">How miners use this page</div>
          <div className="mt-5 grid gap-3">
            {[
              'Create or import an INRI wallet before mining and save the mnemonic phrase safely.',
              'Mine on the official network only and make sure the block result is solo mining.',
              'Open this page to search your address and check position, base reward and ranking bonus.',
              'Use the official explorer links to confirm the address and block activity on-chain.',
            ].map((item, index) => (
              <div key={item} className="rounded-[1.2rem] border border-white/12 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/66">
                <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.10] text-[11px] font-black text-primary">
                  {index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[1.4rem] border border-white/12 bg-white/[0.03] px-5 py-4 text-sm text-white/60">
          Loading championship feed...
        </div>
      ) : null}
    </div>
  )
}
