'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Copy, ExternalLink, LoaderCircle, ShieldCheck, Sparkles, Wallet2 } from 'lucide-react'

const STAKING_ADDRESS = '0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9'
const EXPLORER_URL = `https://explorer.inri.life/address/${STAKING_ADDRESS}`
const INRI_CHAIN_ID_HEX = '0xec1'
const INRI_CHAIN_ID_DECIMAL = '3777'
const FOURBYTE_API = 'https://www.4byte.directory/api/v1/signatures/?text_signature='

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

function pad32(hex: string) {
  return strip0x(hex).padStart(64, '0')
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
  const response = await fetch(`${FOURBYTE_API}${encodeURIComponent(signature)}`)
  if (!response.ok) throw new Error(`4byte HTTP ${response.status}`)
  const data = (await response.json()) as { results?: Array<{ hex_signature: string; text_signature: string }> }
  const match = data.results?.find((item) => item.text_signature === signature)
  if (!match?.hex_signature) throw new Error(`Selector not found for ${signature}`)
  return match.hex_signature
}

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,15,26,0.96),rgba(2,8,15,0.985))] shadow-[0_28px_90px_rgba(0,0,0,0.34)] ${className}`}>{children}</div>
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-white/46">{note}</div>
    </div>
  )
}

function ActionButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-12 items-center justify-center rounded-full border px-5 text-sm font-black transition ${className}`}
    >
      {children}
    </button>
  )
}

export function InriStakingClient() {
  const [selectors, setSelectors] = useState<SelectorMap>({})
  const [providerReady, setProviderReady] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [contractStats, setContractStats] = useState<ContractStats>(initialContractStats)
  const [userState, setUserState] = useState<UserState | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<0 | 1 | 2>(0)
  const [amount, setAmount] = useState('100')
  const [status, setStatus] = useState('Connect the wallet and review the staking plans.')
  const [error, setError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const networkReady = chainId?.toLowerCase() === INRI_CHAIN_ID_HEX

  const selectorSignatures = useMemo(
    () => [
      'started()',
      'newStakesPaused()',
      'emergencyExitEnabled()',
      'startTime()',
      'programEnd()',
      'totalWeight()',
      'baseRewardsRemaining()',
      'MIN_STAKE()',
      'MAX_PER_PLAN()',
      'CLAIM_COOLDOWN()',
      'currentEra()',
      'emissionPerDayCurrentEra()',
      'currentContractBalance()',
      'pendingRewardsOf(address)',
      'canClaim(address)',
      'nextClaimAt(address)',
      'positionOf(address,uint8)',
      'timeUntilUnlock(address,uint8)',
      'stake(uint8)',
      'claimAll()',
      'restakeToPlan(uint8)',
      'unstake(uint8)',
    ],
    [],
  )

  useEffect(() => {
    let cancelled = false
    const loadSelectors = async () => {
      try {
        const entries = await Promise.all(selectorSignatures.map(async (signature) => [signature, await fetchSelector(signature)] as const))
        if (!cancelled) setSelectors(Object.fromEntries(entries))
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unable to load staking selectors')
      }
    }
    loadSelectors().catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [selectorSignatures])

  const runRead = useCallback(
    async (signature: string, encodedArgs = '') => {
      const selector = selectors[signature]
      if (!selector) throw new Error(`Missing selector for ${signature}`)
      const result = await rpcCall('eth_call', [{ to: STAKING_ADDRESS, data: `${selector}${encodedArgs}` }, 'latest'])
      if (typeof result !== 'string') throw new Error(`Unexpected result for ${signature}`)
      return result
    },
    [selectors],
  )

  const refreshContract = useCallback(async () => {
    if (Object.keys(selectors).length === 0) return
    try {
      const [
        startedHex,
        pausedHex,
        emergencyHex,
        startTimeHex,
        programEndHex,
        totalWeightHex,
        baseRemainingHex,
        minStakeHex,
        maxPerPlanHex,
        claimCooldownHex,
        currentEraHex,
        emissionPerDayHex,
        contractBalanceHex,
      ] = await Promise.all([
        runRead('started()'),
        runRead('newStakesPaused()'),
        runRead('emergencyExitEnabled()'),
        runRead('startTime()'),
        runRead('programEnd()'),
        runRead('totalWeight()'),
        runRead('baseRewardsRemaining()'),
        runRead('MIN_STAKE()'),
        runRead('MAX_PER_PLAN()'),
        runRead('CLAIM_COOLDOWN()'),
        runRead('currentEra()'),
        runRead('emissionPerDayCurrentEra()'),
        runRead('currentContractBalance()'),
      ])

      const words = (hex: string) => chunkWords(hex)
      setContractStats({
        started: parseBoolWord(words(startedHex)[0]),
        newStakesPaused: parseBoolWord(words(pausedHex)[0]),
        emergencyExitEnabled: parseBoolWord(words(emergencyHex)[0]),
        startTime: parseWordToBigInt(words(startTimeHex)[0]),
        programEnd: parseWordToBigInt(words(programEndHex)[0]),
        totalWeight: parseWordToBigInt(words(totalWeightHex)[0]),
        baseRewardsRemaining: parseWordToBigInt(words(baseRemainingHex)[0]),
        minStake: parseWordToBigInt(words(minStakeHex)[0]),
        maxPerPlan: parseWordToBigInt(words(maxPerPlanHex)[0]),
        claimCooldown: parseWordToBigInt(words(claimCooldownHex)[0]),
        currentEra: parseWordToBigInt(words(currentEraHex)[0]),
        emissionPerDay: parseWordToBigInt(words(emissionPerDayHex)[0]),
        contractBalance: parseWordToBigInt(words(contractBalanceHex)[0]),
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load staking contract')
    }
  }, [runRead, selectors])

  const refreshUser = useCallback(async () => {
    if (!account || Object.keys(selectors).length === 0) {
      setUserState(null)
      return
    }
    try {
      const encodedAddress = encodeAddress(account)
      const [pendingHex, canClaimHex, nextClaimHex, plan0, plan1, plan2, unlock0, unlock1, unlock2] = await Promise.all([
        runRead('pendingRewardsOf(address)', encodedAddress),
        runRead('canClaim(address)', encodedAddress),
        runRead('nextClaimAt(address)', encodedAddress),
        runRead('positionOf(address,uint8)', `${encodedAddress}${encodeUint(0n)}`),
        runRead('positionOf(address,uint8)', `${encodedAddress}${encodeUint(1n)}`),
        runRead('positionOf(address,uint8)', `${encodedAddress}${encodeUint(2n)}`),
        runRead('timeUntilUnlock(address,uint8)', `${encodedAddress}${encodeUint(0n)}`),
        runRead('timeUntilUnlock(address,uint8)', `${encodedAddress}${encodeUint(1n)}`),
        runRead('timeUntilUnlock(address,uint8)', `${encodedAddress}${encodeUint(2n)}`),
      ])

      const parsePosition = (hex: string): PlanView => {
        const words = chunkWords(hex)
        return {
          principal: parseWordToBigInt(words[0]),
          weight: parseWordToBigInt(words[1]),
          unlockAt: parseWordToBigInt(words[2]),
          rewardDebt: parseWordToBigInt(words[3]),
          pendingRewards: parseWordToBigInt(words[4]),
          active: parseBoolWord(words[5]),
        }
      }

      setUserState({
        pendingRewards: parseWordToBigInt(chunkWords(pendingHex)[0]),
        canClaim: parseBoolWord(chunkWords(canClaimHex)[0]),
        nextClaimAt: parseWordToBigInt(chunkWords(nextClaimHex)[0]),
        positions: [parsePosition(plan0), parsePosition(plan1), parsePosition(plan2)],
        timeUntilUnlock: [
          parseWordToBigInt(chunkWords(unlock0)[0]),
          parseWordToBigInt(chunkWords(unlock1)[0]),
          parseWordToBigInt(chunkWords(unlock2)[0]),
        ],
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load your staking data')
    }
  }, [account, runRead, selectors])

  useEffect(() => {
    const eth = getEthereum()
    setProviderReady(Boolean(eth))
    if (!eth) return

    const syncState = async () => {
      try {
        const [accounts, currentChainId] = (await Promise.all([
          eth.request({ method: 'eth_accounts' }),
          eth.request({ method: 'eth_chainId' }),
        ])) as [string[], string]
        setAccount(accounts[0] || null)
        setChainId(currentChainId || null)
      } catch {
        // noop
      }
    }

    const handleAccountsChanged = (accounts: unknown) => {
      const next = Array.isArray(accounts) ? (accounts[0] as string | undefined) : undefined
      setAccount(next || null)
    }
    const handleChainChanged = (nextChainId: unknown) => {
      if (typeof nextChainId === 'string') setChainId(nextChainId)
    }

    syncState().catch(() => undefined)
    eth.on?.('accountsChanged', handleAccountsChanged)
    eth.on?.('chainChanged', handleChainChanged)

    return () => {
      eth.removeListener?.('accountsChanged', handleAccountsChanged)
      eth.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [])

  useEffect(() => {
    refreshContract().catch(() => undefined)
  }, [refreshContract])

  useEffect(() => {
    refreshUser().catch(() => undefined)
  }, [refreshUser])

  const connectWallet = async () => {
    const eth = getEthereum()
    if (!eth) {
      setError('No wallet detected. Open this page with INRI Wallet, MetaMask or another EVM wallet.')
      return
    }
    try {
      setBusyAction('connect')
      setError(null)
      const [selected] = (await eth.request({ method: 'eth_requestAccounts' })) as string[]
      const currentChainId = (await eth.request({ method: 'eth_chainId' })) as string
      setAccount(selected || null)
      setChainId(currentChainId)
      setStatus(selected ? 'Wallet connected. Review your plan and continue.' : 'Wallet connection canceled.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Wallet connection failed')
    } finally {
      setBusyAction(null)
    }
  }

  const switchNetwork = async () => {
    const eth = getEthereum()
    if (!eth) {
      setError('No wallet detected.')
      return
    }
    try {
      setBusyAction('network')
      setError(null)
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: INRI_CHAIN_ID_HEX }] })
      setChainId(INRI_CHAIN_ID_HEX)
      setStatus('INRI CHAIN ready. You can use the staking app now.')
    } catch (cause) {
      try {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: INRI_CHAIN_ID_HEX,
            chainName: 'INRI CHAIN',
            nativeCurrency: { name: 'INRI', symbol: 'INRI', decimals: 18 },
            rpcUrls: ['https://rpc.inri.life'],
            blockExplorerUrls: ['https://explorer.inri.life'],
          }],
        })
        setChainId(INRI_CHAIN_ID_HEX)
        setStatus('INRI CHAIN added to the wallet.')
      } catch (inner) {
        setError(inner instanceof Error ? inner.message : (cause instanceof Error ? cause.message : 'Unable to switch network'))
      }
    } finally {
      setBusyAction(null)
    }
  }

  const sendTransaction = async (signature: string, encodedArgs = '', value?: bigint, pendingText?: string) => {
    const eth = getEthereum()
    if (!eth || !account) throw new Error('Connect the wallet first')
    const selector = selectors[signature]
    if (!selector) throw new Error(`Missing selector for ${signature}`)
    const tx = {
      from: account,
      to: STAKING_ADDRESS,
      data: `${selector}${encodedArgs}`,
      ...(typeof value === 'bigint' ? { value: `0x${value.toString(16)}` } : {}),
    }
    const txResult = (await eth.request({ method: 'eth_sendTransaction', params: [tx] })) as string
    setTxHash(txResult)
    setStatus(pendingText || 'Transaction sent. Waiting for confirmation on INRI CHAIN...')

    for (let i = 0; i < 90; i += 1) {
      const receipt = await rpcCall('eth_getTransactionReceipt', [txResult])
      if (receipt && typeof receipt === 'object') {
        const statusHex = (receipt as { status?: string }).status
        if (statusHex === '0x1') {
          setStatus('Transaction confirmed on INRI CHAIN.')
          return txResult
        }
        if (statusHex === '0x0') throw new Error('Transaction reverted. Check the explorer or wallet details.')
      }
      await new Promise((resolve) => setTimeout(resolve, 2500))
    }
    return txResult
  }

  const stakeNow = async () => {
    if (!networkReady) {
      setError('Switch to INRI CHAIN before staking.')
      return
    }
    try {
      setBusyAction('stake')
      setError(null)
      const wei = parseDecimalToWei(amount, 18)
      if (wei <= 0n) throw new Error('Stake amount must be greater than zero')
      await sendTransaction('stake(uint8)', encodeUint(BigInt(selectedPlan)), wei, 'Stake transaction sent. Waiting for confirmation...')
      await Promise.all([refreshContract(), refreshUser()])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Stake failed')
    } finally {
      setBusyAction(null)
    }
  }

  const claimAll = async () => {
    if (!networkReady) {
      setError('Switch to INRI CHAIN before claiming.')
      return
    }
    try {
      setBusyAction('claim')
      setError(null)
      await sendTransaction('claimAll()', '', undefined, 'Claim transaction sent. Waiting for confirmation...')
      await Promise.all([refreshContract(), refreshUser()])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Claim failed')
    } finally {
      setBusyAction(null)
    }
  }

  const restake = async () => {
    if (!networkReady) {
      setError('Switch to INRI CHAIN before restaking.')
      return
    }
    try {
      setBusyAction('restake')
      setError(null)
      await sendTransaction('restakeToPlan(uint8)', encodeUint(BigInt(selectedPlan)), undefined, 'Restake transaction sent. Waiting for confirmation...')
      await Promise.all([refreshContract(), refreshUser()])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Restake failed')
    } finally {
      setBusyAction(null)
    }
  }

  const unstake = async () => {
    if (!networkReady) {
      setError('Switch to INRI CHAIN before unstaking.')
      return
    }
    try {
      setBusyAction('unstake')
      setError(null)
      await sendTransaction('unstake(uint8)', encodeUint(BigInt(selectedPlan)), undefined, 'Unstake transaction sent. Waiting for confirmation...')
      await Promise.all([refreshContract(), refreshUser()])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unstake failed')
    } finally {
      setBusyAction(null)
    }
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(STAKING_ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const selectedPosition = userState?.positions[selectedPlan] || null

  return (
    <div className="space-y-6">
      <Surface className="p-5 sm:p-6 lg:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-4 w-4" />
            Staking control panel
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

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">Wallet</div>
            <div className="mt-3 text-2xl font-black text-white">{shortAddress(account)}</div>
            <div className="mt-2 text-sm leading-6 text-white/46">{providerReady ? 'Active connected wallet' : 'Open with an EVM wallet'}</div>
          </div>
          <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">Current era</div>
            <div className="mt-3 text-2xl font-black text-white">{contractStats.currentEra.toString()}</div>
            <div className="mt-2 text-sm leading-6 text-white/46">Program year in the fixed 5 year schedule</div>
          </div>
          <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">Emission / day</div>
            <div className="mt-3 text-2xl font-black text-white">{formatAmount(contractStats.emissionPerDay)} INRI</div>
            <div className="mt-2 text-sm leading-6 text-white/46">Current scheduled emission</div>
          </div>
          <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">Pending rewards</div>
            <div className="mt-3 text-2xl font-black text-white">{formatAmount(userState?.pendingRewards || 0n)} INRI</div>
            <div className="mt-2 text-sm leading-6 text-white/46">All unclaimed rewards across your plans</div>
          </div>
        </div>

        <div className="mt-5 rounded-[1.65rem] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Staking contract</div>
              <div className="mt-3 break-all font-mono text-sm font-bold text-white">{STAKING_ADDRESS}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyAddress}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy'}
              </button>
              <a
                href={EXPLORER_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
              >
                Explorer
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40">Min stake</div>
              <div className="mt-2 text-xl font-black text-white">{formatAmount(contractStats.minStake)} INRI</div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40">Max / plan</div>
              <div className="mt-2 text-xl font-black text-white">{formatAmount(contractStats.maxPerPlan)} INRI</div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40">Claim cooldown</div>
              <div className="mt-2 text-xl font-black text-white">{Number(contractStats.claimCooldown / 86400n || 0n)} day</div>
            </div>
          </div>
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Surface className="p-5 sm:p-6 lg:p-7">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Choose your plan</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {PLAN_META.map((plan) => {
              const position = userState?.positions[plan.id]
              const active = position?.active
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`rounded-[1.55rem] border p-5 text-left transition ${selectedPlan === plan.id ? 'border-primary/50 bg-primary/[0.10] shadow-[0_0_0_1px_rgba(19,164,255,0.08)]' : 'border-white/10 bg-white/[0.03] hover:border-primary/35 hover:bg-primary/[0.05]'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{plan.title}</div>
                      <div className="mt-2 text-2xl font-black text-white">{plan.days} days</div>
                    </div>
                    <div className="rounded-full border border-white/12 px-3 py-1.5 text-sm font-black text-white">{plan.multiplier}</div>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-white/58">Early exit penalty {plan.penalty} · {plan.accent}</div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] ${active ? 'border-primary/35 bg-primary/[0.10] text-primary' : 'border-white/12 bg-white/[0.03] text-white/50'}`}>
                      {active ? 'Active position' : 'No position'}
                    </span>
                    <span className="text-white/40">{active ? `${formatAmount(position?.principal || 0n)} INRI` : '—'}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.92fr]">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Stake or manage</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Selected plan</div>
                  <div className="mt-2 flex h-14 items-center rounded-[1.1rem] border border-white/12 bg-black/30 px-4 text-base font-semibold text-white">
                    {PLAN_META[selectedPlan].title} · {PLAN_META[selectedPlan].multiplier}
                  </div>
                </label>
                <label className="block">
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

              <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white/56">
                Staking uses native INRI. Enter the amount you want to lock in the selected plan. Claims follow a daily cooldown and restake sends available rewards back into the selected plan.
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ActionButton
                  onClick={stakeNow}
                  disabled={busyAction === 'stake' || !providerReady}
                  className="border-primary/35 bg-primary text-black hover:bg-primary/90"
                >
                  {busyAction === 'stake' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Stake now'}
                </ActionButton>
                <ActionButton
                  onClick={claimAll}
                  disabled={busyAction === 'claim' || !userState?.canClaim}
                  className="border-white/14 bg-white/[0.04] text-white hover:border-primary/55 hover:bg-primary/10 disabled:opacity-50"
                >
                  {busyAction === 'claim' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Claim rewards'}
                </ActionButton>
                <ActionButton
                  onClick={restake}
                  disabled={busyAction === 'restake'}
                  className="border-white/14 bg-white/[0.04] text-white hover:border-primary/55 hover:bg-primary/10 disabled:opacity-50"
                >
                  {busyAction === 'restake' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Restake rewards'}
                </ActionButton>
                <ActionButton
                  onClick={unstake}
                  disabled={busyAction === 'unstake'}
                  className="border-white/14 bg-white/[0.04] text-white hover:border-primary/55 hover:bg-primary/10 disabled:opacity-50"
                >
                  {busyAction === 'unstake' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Unstake selected plan'}
                </ActionButton>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-black/28 p-5">
              <div className="flex items-center gap-2 text-xl font-black text-white">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Position summary
              </div>
              <div className="mt-5 grid gap-3">
                <StatCard label="Pending rewards" value={`${formatAmount(userState?.pendingRewards || 0n)} INRI`} note="Total unclaimed rewards across all plans" />
                <StatCard label="Selected principal" value={`${formatAmount(selectedPosition?.principal || 0n)} INRI`} note="Current principal in the chosen plan" />
                <StatCard label="Unlocks at" value={formatTimestamp(selectedPosition?.unlockAt || 0n)} note={selectedPosition ? `Time left: ${formatTime(userState?.timeUntilUnlock[selectedPlan] || 0n)}` : 'No active position on this plan'} />
                <StatCard label="Can claim" value={userState?.canClaim ? 'Yes' : 'Not yet'} note={userState?.nextClaimAt ? `Next claim: ${formatTimestamp(userState.nextClaimAt)}` : 'Claim availability updates automatically'} />
              </div>
            </div>
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface className="p-5 sm:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Live status</div>
            <div className="mt-4 rounded-[1.45rem] border border-white/10 bg-black/28 p-4">
              <div className="flex items-start gap-3">
                {error ? <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-400" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />}
                <div>
                  <div className="text-base font-black text-white">{error ? 'Action needs attention' : 'Staking app online'}</div>
                  <div className="mt-2 text-sm leading-7 text-white/60">{error || status}</div>
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
          </Surface>

          <Surface className="p-5 sm:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Program state</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <StatCard label="Program started" value={contractStats.started ? 'Yes' : 'No'} note="Funded once with 5,000,000 INRI" />
              <StatCard label="New stakes" value={contractStats.newStakesPaused ? 'Paused' : 'Open'} note="Controls fresh stake and restake entry" />
              <StatCard label="Emergency exit" value={contractStats.emergencyExitEnabled ? 'Enabled' : 'Off'} note="When on, unstake has no penalty" />
              <StatCard label="Base rewards left" value={`${formatAmount(contractStats.baseRewardsRemaining)} INRI`} note="Scheduled rewards still not emitted" />
            </div>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Useful routes</div>
            <div className="mt-4 space-y-3">
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
                  className="block rounded-[1.35rem] border border-white/10 bg-black/28 p-4 transition hover:border-primary/40 hover:bg-primary/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-black text-white">{item.title}</div>
                      <div className="mt-2 text-sm leading-7 text-white/56">{item.text}</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  )
}
