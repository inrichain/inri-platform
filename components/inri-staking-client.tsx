'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Copy, ExternalLink, LoaderCircle, ShieldCheck, Sparkles, Wallet2 } from 'lucide-react'

const STAKING_ADDRESS = '0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9'
const EXPLORER_URL = `https://explorer.inri.life/address/${STAKING_ADDRESS}`
const INRI_CHAIN_ID_HEX = '0xec1'

const PLAN_META = [
  { id: 0, title: 'Plan 90', days: 90, multiplier: '1.00x', penalty: '5%', accent: 'Balanced entry' },
  { id: 1, title: 'Plan 180', days: 180, multiplier: '1.30x', penalty: '7%', accent: 'Higher weight' },
  { id: 2, title: 'Plan 360', days: 360, multiplier: '1.60x', penalty: '9%', accent: 'Maximum long lock' },
] as const

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

type SelectorMap = Record<string, string>

type ContractStats = {
  started: boolean
  newStakesPaused: boolean
  emergencyExitEnabled: boolean
  startTime: bigint
  programEnd: bigint
  totalWeight: bigint
  baseRewardsRemaining: bigint
  minStake: bigint
  maxPerPlan: bigint
  claimCooldown: bigint
  currentEra: bigint
  emissionPerDay: bigint
  contractBalance: bigint
}

type PlanView = {
  principal: bigint
  weight: bigint
  unlockAt: bigint
  rewardDebt: bigint
  pendingRewards: bigint
  active: boolean
}

type UserState = {
  pendingRewards: bigint
  canClaim: boolean
  nextClaimAt: bigint
  positions: PlanView[]
  timeUntilUnlock: bigint[]
}

const initialContractStats: ContractStats = {
  started: false,
  newStakesPaused: false,
  emergencyExitEnabled: false,
  startTime: 0n,
  programEnd: 0n,
  totalWeight: 0n,
  baseRewardsRemaining: 0n,
  minStake: 0n,
  maxPerPlan: 0n,
  claimCooldown: 0n,
  currentEra: 0n,
  emissionPerDay: 0n,
  contractBalance: 0n,
}

function getEthereum(): EthereumProvider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { ethereum?: EthereumProvider }).ethereum
}

function strip0x(value: string) {
  return value.startsWith('0x') ? value.slice(2) : value
}

function asciiToHex(value: string) {
  return `0x${Array.from(value).map((char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join('')}`
}

function encodeUint(value: bigint) {
  return value.toString(16).padStart(64, '0')
}

function encodeAddress(address: string) {
  return strip0x(address).toLowerCase().padStart(64, '0')
}

function chunkWords(data: string) {
  const clean = strip0x(data)
  const chunks: string[] = []
  for (let i = 0; i < clean.length; i += 64) chunks.push(clean.slice(i, i + 64))
  return chunks
}

function parseWordToBigInt(word?: string) {
  if (!word) return 0n
  return BigInt(`0x${word}`)
}

function parseBoolWord(word?: string) {
  return parseWordToBigInt(word) !== 0n
}

function formatAmount(value: bigint, decimals = 18, precision = 4) {
  const base = 10n ** BigInt(decimals)
  const whole = value / base
  const fraction = value % base
  if (fraction === 0n) return whole.toLocaleString('en-US')
  const fractionText = fraction.toString().padStart(decimals, '0').slice(0, precision).replace(/0+$/, '')
  return `${whole.toLocaleString('en-US')}${fractionText ? `.${fractionText}` : ''}`
}

function parseDecimalToWei(input: string, decimals = 18) {
  const clean = input.trim().replace(/,/g, '')
  if (!/^\d+(\.\d+)?$/.test(clean)) throw new Error('Enter a valid INRI amount')
  const [whole, fraction = ''] = clean.split('.')
  const fractionPadded = (fraction + '0'.repeat(decimals)).slice(0, decimals)
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fractionPadded || '0')
}

function shortAddress(address?: string | null) {
  if (!address) return 'Not connected'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatTime(seconds: bigint) {
  if (seconds <= 0n) return 'Ready'
  const total = Number(seconds)
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  const minutes = Math.floor((total % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function formatTimestamp(timestamp: bigint) {
  if (timestamp === 0n) return '—'
  return new Date(Number(timestamp) * 1000).toLocaleString()
}

async function rpcCall(method: string, params: unknown[] = []) {
  const response = await fetch('https://rpc.inri.life', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`)
  const data = (await response.json()) as { result?: unknown; error?: { message?: string } }
  if (data.error) throw new Error(data.error.message || 'RPC error')
  return data.result
}

async function fetchSelector(signature: string) {
  const result = await rpcCall('web3_sha3', [asciiToHex(signature)])
  if (typeof result !== 'string' || result.length < 10) throw new Error(`Selector not found for ${signature}`)
  return result.slice(0, 10)
}

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="space-y-6">
      <Surface className="p-5 sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-4 w-4" />
            Staking workspace
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ActionButton
              onClick={connectWallet}
              disabled={busyAction === 'connect'}
              className="border-primary/35 bg-primary text-black hover:bg-primary/90"
            >
              {busyAction === 'connect' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : account ? 'Reconnect wallet' : 'Connect wallet'}
            </ActionButton>
            <ActionButton
              onClick={switchNetwork}
              disabled={busyAction === 'network'}
              className="border-white/14 bg-white/[0.04] text-white hover:border-primary/55 hover:bg-primary/10"
            >
              {busyAction === 'network' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : networkReady ? 'INRI CHAIN ready' : 'Switch network'}
            </ActionButton>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Wallet" value={shortAddress(account)} note={providerReady ? 'Connected wallet status' : 'Open with an EVM wallet'} />
          <StatCard label="Pending rewards" value={`${formatAmount(userState?.pendingRewards || 0n)} INRI`} note="All unclaimed rewards" />
          <StatCard label="Current era" value={contractStats.currentEra.toString()} note="Year in the 5-year schedule" />
          <StatCard label="Emission / day" value={`${formatAmount(contractStats.emissionPerDay)} INRI`} note="Current scheduled emission" />
          <StatCard label="Rewards left" value={`${formatAmount(contractStats.baseRewardsRemaining)} INRI`} note="Base rewards still not emitted" />
        </div>
      </Surface>

      <Surface className="p-5 sm:p-6 lg:p-7">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Staking contract</div>
                  <div className="mt-2 break-all font-mono text-sm font-semibold text-white">{STAKING_ADDRESS}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={copyAddress}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={EXPLORER_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
                  >
                    Explorer
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <StatCard label="Min stake" value={`${formatAmount(contractStats.minStake)} INRI`} note="Minimum entry" />
                <StatCard label="Max / plan" value={`${formatAmount(contractStats.maxPerPlan)} INRI`} note="Maximum principal per plan" />
                <StatCard label="Claim cooldown" value={`${Number(contractStats.claimCooldown / 86400n || 0n)} day`} note="Cooldown between claims" />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {PLAN_META.map((plan) => {
                const position = userState?.positions[plan.id]
                const active = position?.active
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`min-w-0 rounded-[1.55rem] border p-5 text-left transition ${selectedPlan === plan.id ? 'border-primary/50 bg-primary/[0.09] shadow-[0_0_0_1px_rgba(19,164,255,0.08)]' : 'border-white/10 bg-white/[0.03] hover:border-primary/35 hover:bg-primary/[0.05]'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{plan.title}</div>
                        <div className="mt-2 text-[2rem] font-black leading-none text-white">{plan.days}<span className="ml-2 text-base text-white/52">days</span></div>
                      </div>
                      <div className="rounded-full border border-white/12 px-3 py-1.5 text-sm font-black text-white">{plan.multiplier}</div>
                    </div>
                    <div className="mt-4 text-sm leading-7 text-white/58">Penalty {plan.penalty} before unlock · {plan.accent}</div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] ${active ? 'border-primary/35 bg-primary/[0.10] text-primary' : 'border-white/12 bg-white/[0.03] text-white/50'}`}>
                        {active ? 'Active' : 'No position'}
                      </span>
                      <span className="text-sm font-semibold text-white/46">{active ? `${formatAmount(position?.principal || 0n)} INRI` : '—'}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Create or manage position</div>
                  <div className="mt-2 text-lg font-black text-white">Choose a plan and manage the full flow from one panel.</div>
                </div>
                <div className="rounded-full border border-white/12 bg-black/20 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/48">
                  Selected · {PLAN_META[selectedPlan].title}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Selected plan</div>
                  <div className="mt-2 flex h-14 items-center rounded-[1.1rem] border border-white/12 bg-black/30 px-4 text-base font-semibold text-white">
                    {PLAN_META[selectedPlan].title} · {PLAN_META[selectedPlan].multiplier}
                  </div>
                </label>
                <label className="block min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Amount in INRI</div>
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="100"
                    className="mt-2 h-14 w-full rounded-[1.1rem] border border-white/12 bg-black/30 px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-primary/55"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white/58">
                The contract stakes native INRI directly. Use a whole-number amount, claim when cooldown is over, restake rewards into the selected plan, or exit the selected plan when needed.
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ActionButton
                  onClick={stakeNow}
                  disabled={busyAction === 'stake' || !providerReady}
                  className="border-primary/35 bg-primary text-black hover:bg-primary/90"
                >
                  {busyAction === 'stake' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Stake INRI'}
                </ActionButton>
                <ActionButton
                  onClick={claimAll}
                  disabled={busyAction === 'claim' || !userState?.canClaim}
                  className="border-white/14 bg-white/[0.04] text-white hover:border-primary/55 hover:bg-primary/10"
                >
                  {busyAction === 'claim' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Claim rewards'}
                </ActionButton>
                <ActionButton
                  onClick={restake}
                  disabled={busyAction === 'restake'}
                  className="border-white/14 bg-white/[0.04] text-white hover:border-primary/55 hover:bg-primary/10"
                >
                  {busyAction === 'restake' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Restake rewards'}
                </ActionButton>
                <ActionButton
                  onClick={unstake}
                  disabled={busyAction === 'unstake'}
                  className="border-white/14 bg-white/[0.04] text-white hover:border-primary/55 hover:bg-primary/10"
                >
                  {busyAction === 'unstake' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Unstake selected'}
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xl font-black text-white">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Position summary
              </div>
              <div className="mt-5 grid gap-3">
                <StatCard label="Selected principal" value={`${formatAmount(selectedPosition?.principal || 0n)} INRI`} note="Current principal in the selected plan" />
                <StatCard label="Selected plan unlock" value={formatTimestamp(selectedPosition?.unlockAt || 0n)} note={selectedPosition ? `Time left: ${formatTime(userState?.timeUntilUnlock[selectedPlan] || 0n)}` : 'No active position on this plan'} />
                <StatCard label="Can claim now" value={userState?.canClaim ? 'Yes' : 'Not yet'} note={userState?.nextClaimAt ? `Next claim: ${formatTimestamp(userState.nextClaimAt)}` : 'Claim availability updates automatically'} />
                <StatCard label="Total weight" value={formatAmount(contractStats.totalWeight)} note="Current effective weight across all active positions" />
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Program state</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <StatCard label="Program started" value={contractStats.started ? 'Yes' : 'No'} note="Started with the funded amount" />
                <StatCard label="New stakes" value={contractStats.newStakesPaused ? 'Paused' : 'Open'} note="Controls fresh stake and restake entry" />
                <StatCard label="Emergency exit" value={contractStats.emergencyExitEnabled ? 'Enabled' : 'Off'} note="When enabled, unstake has no penalty" />
                <StatCard label="Contract balance" value={`${formatAmount(contractStats.contractBalance)} INRI`} note="Native INRI currently held by the staking contract" />
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Live status</div>
              <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-black/30 p-4">
                <div className="flex items-start gap-3">
                  {error ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}
                  <div className="min-w-0">
                    <div className="text-base font-black text-white">{error ? 'Action needs attention' : 'Staking app online'}</div>
                    <div className="mt-2 break-words text-sm leading-7 text-white/60">{error || status}</div>
                  </div>
                </div>
                {txHash ? (
                  <a
                    href={`https://explorer.inri.life/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block rounded-[1.2rem] border border-primary/24 bg-primary/[0.08] p-4 transition hover:bg-primary/[0.12]"
                  >
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Latest transaction</div>
                    <div className="mt-2 break-all font-mono text-sm font-semibold text-white">{txHash}</div>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface className="p-5 sm:p-6">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Plan notes</div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <StatCard label="Plan 90" value="1.00x" note="90-day lock with 5% early exit penalty" />
            <StatCard label="Plan 180" value="1.30x" note="180-day lock with 7% early exit penalty" />
            <StatCard label="Plan 360" value="1.60x" note="360-day lock with 9% early exit penalty" />
          </div>
        </Surface>

        <Surface className="p-5 sm:p-6">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Useful routes</div>
          <div className="mt-4 grid gap-3">
            {([
              { title: 'INRI Wallet', text: 'Open the official wallet before staking.', href: 'https://wallet.inri.life', external: true },
              { title: 'Explorer', text: 'Inspect the staking contract and transactions.', href: '/explorer' },
              { title: 'Whitepaper', text: 'Read the tokenomics and program context.', href: '/whitepaper' },
              { title: 'Pool', text: 'Compare mining and staking side by side.', href: '/pool' },
            ] as { title: string; text: string; href: string; external?: boolean }[]).map((item) => (
              <Link
                key={item.title}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/10 bg-black/28 px-4 py-4 transition hover:border-primary/40 hover:bg-primary/10"
              >
                <div className="min-w-0">
                  <div className="text-base font-black text-white">{item.title}</div>
                  <div className="mt-1 text-sm leading-6 text-white/56">{item.text}</div>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
              </Link>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  )
}
