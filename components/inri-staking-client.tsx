'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Wallet2,
} from 'lucide-react'
import type { EthereumProvider } from '@/lib/inri-active-wallet'
import {
  INRI_CHAIN_ID_HEX,
  estimateGasWithFallback,
  getActiveWalletProvider,
  getErrorMessage,
  getInjectedEthereum,
  getLegacyGasPrice,
  normalizeChainId,
  readActiveWalletSnapshot,
  requestFromActiveWallet,
  rpcCall,
  switchProviderToInri,
  toHex,
} from '@/lib/inri-active-wallet'

const STAKING_ADDRESS = '0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9'
const EXPLORER_URL = `https://explorer.inri.life/address/${STAKING_ADDRESS}`
const ONE_INRI = 10n ** 18n
const GAS_RESERVE = 2n * 10n ** 16n // 0.02 INRI kept for gas when using Max

const PLAN_META = [
  { id: 0, title: 'Plan 90', days: 90, multiplier: '1.00x', penalty: '5%', accent: 'Balanced entry' },
  { id: 1, title: 'Plan 180', days: 180, multiplier: '1.30x', penalty: '7%', accent: 'Higher weight' },
  { id: 2, title: 'Plan 360', days: 360, multiplier: '1.60x', penalty: '9%', accent: 'Maximum long lock' },
] as const

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
  walletBalance: bigint
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
  const clean = strip0x(data || '0x')
  const chunks: string[] = []
  for (let i = 0; i < clean.length; i += 64) chunks.push(clean.slice(i, i + 64))
  return chunks
}

function parseWordToBigInt(word?: string) {
  if (!word) return 0n
  return BigInt(`0x${word}`)
}

function parseHexToBigInt(value?: unknown) {
  if (typeof value !== 'string' || !value.startsWith('0x')) return 0n
  return BigInt(value)
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

function minBigInt(a: bigint, b: bigint) {
  return a < b ? a : b
}

function percentOf(value: bigint, max: bigint) {
  if (max <= 0n || value <= 0n) return 0
  const scaled = Number((value * 10000n) / max) / 100
  return Math.max(0, Math.min(100, scaled))
}

async function fetchSelector(signature: string) {
  const result = await rpcCall('web3_sha3', [asciiToHex(signature)])
  if (typeof result !== 'string' || result.length < 10) throw new Error(`Selector not found for ${signature}`)
  return result.slice(0, 10)
}

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[2rem] border-[1.5px] border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.12),transparent_30%),linear-gradient(180deg,rgba(7,15,26,0.97),rgba(2,8,15,0.99))] shadow-[0_28px_90px_rgba(0,0,0,0.34)] ${className}`}>
      {children}
    </div>
  )
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="inri-subcard min-w-0 rounded-[1.35rem] p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">{label}</div>
      <div className="mt-3 break-words text-[1.35rem] font-black leading-tight text-white sm:text-[1.5rem]">{value}</div>
      <div className="mt-2 text-sm leading-6 text-white/52">{note}</div>
    </div>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-black/25 p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">{label}</div>
      <div className={`mt-1 break-words text-sm font-bold text-white/82 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

function ActionButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-[52px] min-h-[52px] items-center justify-center gap-2 rounded-[1rem] border px-5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

export function InriStakingClient() {
  const [selectors, setSelectors] = useState<SelectorMap>({})
  const [providerReady, setProviderReady] = useState(false)
  const [activeProvider, setActiveProvider] = useState<EthereumProvider | null>(null)
  const [connectionType, setConnectionType] = useState<'injected' | 'walletconnect' | ''>('')
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [contractStats, setContractStats] = useState<ContractStats>(initialContractStats)
  const [userState, setUserState] = useState<UserState | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<0 | 1 | 2>(0)
  const [amount, setAmount] = useState('100')
  const [status, setStatus] = useState('Use the top header to connect INRI Wallet, then confirm INRI CHAIN before staking.')
  const [error, setError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const networkReady = normalizeChainId(chainId) === INRI_CHAIN_ID_HEX

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
      const [balanceHex, pendingHex, canClaimHex, nextClaimHex, plan0, plan1, plan2, unlock0, unlock1, unlock2] = await Promise.all([
        rpcCall('eth_getBalance', [account, 'latest']),
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
        walletBalance: parseHexToBigInt(balanceHex),
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

  const syncWalletState = useCallback(async () => {
    const snapshot = await readActiveWalletSnapshot()
    setActiveProvider(snapshot.provider)
    setProviderReady(snapshot.providerReady)
    setAccount(snapshot.account)
    setChainId(snapshot.chainId)
    setConnectionType(snapshot.connector)
  }, [])

  useEffect(() => {
    const eth = getInjectedEthereum()

    const handleWalletState = () => {
      void syncWalletState()
    }
    const handleAccountsChanged = (accounts: unknown) => {
      const next = Array.isArray(accounts) ? (accounts[0] as string | undefined) : undefined
      setAccount(next || null)
      void syncWalletState()
    }
    const handleChainChanged = (nextChainId: unknown) => {
      if (typeof nextChainId === 'string') setChainId(nextChainId)
      void syncWalletState()
    }

    void syncWalletState()
    window.addEventListener('inri:wallet-state', handleWalletState as EventListener)
    eth?.on?.('accountsChanged', handleAccountsChanged)
    eth?.on?.('chainChanged', handleChainChanged)

    return () => {
      window.removeEventListener('inri:wallet-state', handleWalletState as EventListener)
      eth?.removeListener?.('accountsChanged', handleAccountsChanged)
      eth?.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [syncWalletState])

  useEffect(() => {
    refreshContract().catch(() => undefined)
  }, [refreshContract])

  useEffect(() => {
    refreshUser().catch(() => undefined)
  }, [refreshUser])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshContract().catch(() => undefined)
      refreshUser().catch(() => undefined)
      syncWalletState().catch(() => undefined)
    }, 10000)
    return () => window.clearInterval(intervalId)
  }, [refreshContract, refreshUser, syncWalletState])

  const connectWallet = async () => {
    try {
      setBusyAction('connect')
      setError(null)

      const snapshot = await readActiveWalletSnapshot()
      if (snapshot.provider && snapshot.account) {
        setActiveProvider(snapshot.provider)
        setProviderReady(true)
        setAccount(snapshot.account)
        setChainId(snapshot.chainId)
        setConnectionType(snapshot.connector)
        setStatus('Active wallet synced from the top header. Review your plan and continue.')
        return
      }

      const provider = snapshot.provider || getActiveWalletProvider()
      if (!provider) {
        setError('No wallet detected. Use the Connect Wallet button in the top header or open this page with an EVM wallet.')
        return
      }

      const accounts = (await requestFromActiveWallet(provider, 'eth_requestAccounts')) as string[]
      const currentChainId = (await requestFromActiveWallet(provider, 'eth_chainId')) as string
      const selected = Array.isArray(accounts) ? accounts[0] : ''

      setActiveProvider(provider)
      setProviderReady(true)
      setAccount(selected || null)
      setChainId(currentChainId)
      setStatus(selected ? 'Wallet connected. Review your plan and continue.' : 'Wallet connection canceled.')
    } catch (cause) {
      setError(getErrorMessage(cause, 'Wallet connection failed'))
    } finally {
      setBusyAction(null)
    }
  }

  const switchNetwork = async () => {
    const provider = activeProvider || getActiveWalletProvider()
    if (!provider) {
      setError('No wallet detected.')
      return
    }
    try {
      setBusyAction('network')
      setError(null)
      const nextChainId = await switchProviderToInri(provider)
      setChainId(nextChainId || INRI_CHAIN_ID_HEX)
      setStatus('INRI CHAIN ready. You can use the staking app now.')
    } catch (cause) {
      setError(getErrorMessage(cause, 'Unable to switch network'))
    } finally {
      setBusyAction(null)
    }
  }

  const ensureCanWrite = () => {
    const provider = activeProvider || getActiveWalletProvider()
    if (!provider || !account) throw new Error('Connect INRI Wallet from the top header first.')
    if (!networkReady) throw new Error('Select INRI CHAIN before using staking.')
    return provider
  }

  const sendTransaction = async (signature: string, encodedArgs = '', value?: bigint, pendingText?: string) => {
    const provider = ensureCanWrite()
    const selector = selectors[signature]
    if (!selector) throw new Error(`Missing selector for ${signature}`)
    const baseTx = {
      from: account,
      to: STAKING_ADDRESS,
      data: `${selector}${encodedArgs}`,
      ...(typeof value === 'bigint' ? { value: toHex(value) } : {}),
    }
    const fallbackGas = signature === 'claimAll()' ? 350000n : 450000n

    const [gasLimit, gasPrice] = await Promise.all([
      estimateGasWithFallback(baseTx, fallbackGas),
      getLegacyGasPrice(),
    ])

    const tx = {
      ...baseTx,
      gas: toHex(gasLimit),
      gasPrice: toHex(gasPrice),
      type: '0x0',
    }

    const txResult = (await requestFromActiveWallet(provider, 'eth_sendTransaction', [tx])) as string
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

  const selectedPosition = userState?.positions[selectedPlan] || null
  const selectedPlanInfo = PLAN_META[selectedPlan]
  const maxPerPlan = contractStats.maxPerPlan || 10000n * ONE_INRI
  const minStake = contractStats.minStake || 100n * ONE_INRI
  const planRemaining = maxPerPlan > (selectedPosition?.principal || 0n) ? maxPerPlan - (selectedPosition?.principal || 0n) : 0n
  const balanceAfterGas = userState?.walletBalance && userState.walletBalance > GAS_RESERVE ? userState.walletBalance - GAS_RESERVE : 0n
  const maxStakeNow = minBigInt(planRemaining, balanceAfterGas)

  const parsedAmount = useMemo(() => {
    try {
      return parseDecimalToWei(amount, 18)
    } catch {
      return null
    }
  }, [amount])

  const amountValidation = useMemo(() => {
    if (!amount.trim()) return 'Enter an amount to stake.'
    if (parsedAmount === null || parsedAmount <= 0n) return 'Enter a valid INRI amount.'
    if (!userState) return ''
    if (parsedAmount > userState.walletBalance) return 'Wallet balance is too low.'
    if (parsedAmount > planRemaining) return `This plan only has ${formatAmount(planRemaining)} INRI remaining.`
    if ((selectedPosition?.principal || 0n) === 0n && parsedAmount < minStake) return `First stake in a plan must be at least ${formatAmount(minStake)} INRI.`
    return ''
  }, [amount, minStake, parsedAmount, planRemaining, selectedPosition?.principal, userState])

  const canStake = Boolean(
    providerReady &&
      account &&
      networkReady &&
      contractStats.started &&
      !contractStats.newStakesPaused &&
      !contractStats.emergencyExitEnabled &&
      parsedAmount !== null &&
      parsedAmount > 0n &&
      !amountValidation,
  )

  const canClaim = Boolean(providerReady && account && networkReady && userState?.canClaim && userState.pendingRewards > 0n)
  const canRestake = Boolean(providerReady && account && networkReady && !contractStats.newStakesPaused && userState && userState.pendingRewards > 0n)
  const canUnstake = Boolean(providerReady && account && networkReady && selectedPosition && selectedPosition.principal > 0n)

  const stakeNow = async () => {
    try {
      setBusyAction('stake')
      setError(null)
      if (!canStake) throw new Error(amountValidation || 'Staking is not ready yet.')
      await sendTransaction('stake(uint8)', encodeUint(BigInt(selectedPlan)), parsedAmount || 0n, 'Stake transaction sent. Waiting for confirmation...')
      setAmount('')
      await Promise.all([refreshContract(), refreshUser()])
    } catch (cause) {
      setError(getErrorMessage(cause, 'Stake failed'))
    } finally {
      setBusyAction(null)
    }
  }

  const claimAll = async () => {
    try {
      setBusyAction('claim')
      setError(null)
      if (!canClaim) throw new Error('No rewards are ready to claim yet.')
      await sendTransaction('claimAll()', '', undefined, 'Claim transaction sent. Waiting for confirmation...')
      await Promise.all([refreshContract(), refreshUser()])
    } catch (cause) {
      setError(getErrorMessage(cause, 'Claim failed'))
    } finally {
      setBusyAction(null)
    }
  }

  const restake = async (planId = selectedPlan) => {
    try {
      setBusyAction(`restake-${planId}`)
      setError(null)
      if (!canRestake) throw new Error('No pending rewards are available to restake yet.')
      await sendTransaction('restakeToPlan(uint8)', encodeUint(BigInt(planId)), undefined, 'Restake transaction sent. Waiting for confirmation...')
      await Promise.all([refreshContract(), refreshUser()])
    } catch (cause) {
      setError(getErrorMessage(cause, 'Restake failed'))
    } finally {
      setBusyAction(null)
    }
  }

  const unstake = async (planId = selectedPlan) => {
    const position = userState?.positions[planId]
    try {
      setBusyAction(`unstake-${planId}`)
      setError(null)
      if (!position || position.principal <= 0n) throw new Error('No active position in this plan.')
      if (!networkReady) throw new Error('Select INRI CHAIN before unstaking.')
      await sendTransaction('unstake(uint8)', encodeUint(BigInt(planId)), undefined, 'Unstake transaction sent. Waiting for confirmation...')
      await Promise.all([refreshContract(), refreshUser()])
    } catch (cause) {
      setError(getErrorMessage(cause, 'Unstake failed'))
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

  const setMaxAmount = () => {
    if (maxStakeNow <= 0n) {
      setAmount('')
      return
    }
    setAmount(formatAmount(maxStakeNow, 18, 4).replace(/,/g, ''))
  }

  const totalPrincipal = userState?.positions.reduce((sum, position) => sum + position.principal, 0n) || 0n
  const activePlans = userState?.positions.filter((position) => position.principal > 0n).length || 0
  const networkLabel = networkReady ? 'INRI CHAIN ready' : chainId ? `Wrong network · ${chainId}` : 'Network not selected'
  const connectionLabel = connectionType === 'walletconnect' ? 'INRI Wallet · WalletConnect' : connectionType === 'injected' ? 'Browser wallet' : 'No provider'

  return (
    <div className="space-y-8">
      <Surface className="p-6 sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-4 w-4" />
              Staking workspace
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-white sm:text-[2.3rem]">
              Manage staking like the INRI Wallet: balance, plan limits, claim, restake and unstake.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
              The site now listens to the active wallet from the top header, including INRI Wallet via WalletConnect. Once connected, staking actions use that same approved provider.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Wallet" value={shortAddress(account)} note={connectionLabel} />
              <StatCard label="Network" value={networkReady ? 'INRI CHAIN' : 'Not ready'} note={networkLabel} />
              <StatCard label="Balance" value={`${formatAmount(userState?.walletBalance || 0n)} INRI`} note="Available in connected wallet" />
              <StatCard label="Pending" value={`${formatAmount(userState?.pendingRewards || 0n)} INRI`} note="Claimable or restakable rewards" />
            </div>
          </div>

          <div className="inri-sidebar-card rounded-[1.7rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Wallet status</div>
                <div className="mt-2 text-xl font-black text-white">{account ? 'Wallet connected' : 'Connect a wallet'}</div>
              </div>
              <div className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${networkReady ? 'border-primary/30 bg-primary/[0.12] text-primary' : 'border-white/12 bg-white/[0.04] text-white/56'}`}>
                {networkReady ? 'INRI ready' : 'Network required'}
              </div>
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/28 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Current address</div>
              <div className="mt-2 break-all text-sm font-semibold text-white">{account || 'Not connected yet'}</div>
              <div className="mt-3 text-sm leading-6 text-white/56">
                {connectionType === 'walletconnect'
                  ? 'Connected through the official INRI Wallet session approved by WalletConnect.'
                  : 'Use the top Connect Wallet button. Browser wallets and INRI Wallet are both supported.'}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {!account ? (
                <ActionButton
                  onClick={connectWallet}
                  disabled={busyAction === 'connect'}
                  className="border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] text-black shadow-[0_18px_44px_rgba(19,164,255,0.26)] hover:-translate-y-px hover:brightness-105"
                >
                  {busyAction === 'connect' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Wallet2 className="h-4 w-4" />}
                  Connect wallet
                </ActionButton>
              ) : null}
              <ActionButton
                onClick={switchNetwork}
                disabled={busyAction === 'network' || !providerReady}
                className="border-white/14 bg-white/[0.04] text-white hover:-translate-y-px hover:border-primary/55 hover:bg-primary/10"
              >
                {busyAction === 'network' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {networkReady ? 'INRI CHAIN ready' : 'Add / switch INRI'}
              </ActionButton>
            </div>
          </div>
        </div>
      </Surface>

      <div className="grid gap-8 2xl:grid-cols-[minmax(0,1.08fr)_390px] 2xl:items-start">
        <div className="space-y-6">
          <Surface className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Staking contract</div>
                <div className="mt-2 break-all font-mono text-sm font-semibold text-white">{STAKING_ADDRESS}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={copyAddress} className="inri-button-secondary min-w-[132px]">
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a href={EXPLORER_URL} target="_blank" rel="noreferrer" className="inri-button-secondary min-w-[168px]">
                  Official explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <StatCard label="Total staked by you" value={`${formatAmount(totalPrincipal)} INRI`} note={`${activePlans} active plan${activePlans === 1 ? '' : 's'}`} />
              <StatCard label="Min first stake" value={`${formatAmount(minStake)} INRI`} note="Required to open a fresh plan" />
              <StatCard label="Max per plan" value={`${formatAmount(maxPerPlan)} INRI`} note="Principal cap inside each plan" />
            </div>
          </Surface>

          <Surface className="p-6 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Choose your plan</div>
                <h3 className="mt-2 text-2xl font-black text-white sm:text-[2rem]">Pick a lock period and see your live position.</h3>
              </div>
              <div className="text-sm leading-6 text-white/54">Early penalty is disabled if emergency exit is active.</div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {PLAN_META.map((plan) => {
                const position = userState?.positions[plan.id]
                const active = Boolean(position && position.principal > 0n)
                const fill = percentOf(position?.principal || 0n, maxPerPlan)
                const restakeBusy = busyAction === `restake-${plan.id}`
                const unstakeBusy = busyAction === `unstake-${plan.id}`
                return (
                  <div
                    key={plan.id}
                    className={`min-w-0 rounded-[1.55rem] border p-5 transition ${selectedPlan === plan.id ? 'border-primary/50 bg-primary/[0.10] shadow-[0_0_0_1px_rgba(19,164,255,0.10)]' : 'border-white/10 bg-white/[0.03]'}`}
                  >
                    <button onClick={() => setSelectedPlan(plan.id)} className="block w-full text-left" type="button">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{plan.title}</div>
                          <div className="mt-2 text-3xl font-black leading-none text-white">{plan.days} days</div>
                        </div>
                        <div className="rounded-full border border-white/12 bg-black/25 px-3 py-1.5 text-sm font-black text-white">{plan.multiplier}</div>
                      </div>
                      <div className="mt-4 text-sm leading-7 text-white/58">Penalty {contractStats.emergencyExitEnabled ? 'disabled' : plan.penalty} before unlock. {plan.accent}.</div>
                    </button>

                    <div className="mt-4 grid gap-2">
                      <InfoRow label="Your principal" value={`${formatAmount(position?.principal || 0n)} INRI`} />
                      <InfoRow label="Plan pending" value={`${formatAmount(position?.pendingRewards || 0n, 18, 6)} INRI`} />
                      <InfoRow label="Unlock at" value={position?.unlockAt ? formatTimestamp(position.unlockAt) : '—'} />
                      <InfoRow label="Time left" value={active ? formatTime(userState?.timeUntilUnlock[plan.id] || 0n) : 'No active position'} />
                    </div>

                    <div className="mt-4 grid gap-2">
                      <div className="flex items-center justify-between gap-3 text-xs font-bold text-white/52">
                        <span>Plan fill</span>
                        <span>{fill.toFixed(fill >= 10 ? 0 : 1)}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#33c3ff_0%,#5a7cff_100%)]" style={{ width: `${fill}%` }} />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
                        disabled={selectedPlan === plan.id}
                        className="rounded-full border border-white/12 bg-black/25 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:border-primary/40 disabled:opacity-60"
                      >
                        {selectedPlan === plan.id ? 'Selected' : 'Use for stake'}
                      </button>
                      <button
                        type="button"
                        onClick={() => restake(plan.id)}
                        disabled={!canRestake || Boolean(busyAction)}
                        className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:border-primary/40 disabled:opacity-50"
                      >
                        {restakeBusy ? 'Processing' : 'Restake here'}
                      </button>
                      <button
                        type="button"
                        onClick={() => unstake(plan.id)}
                        disabled={!active || !networkReady || Boolean(busyAction)}
                        className="rounded-full border border-rose-300/20 bg-rose-500/[0.06] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-rose-100 transition hover:border-rose-300/45 disabled:opacity-50"
                      >
                        {unstakeBusy ? 'Processing' : 'Unstake'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Surface>

          <Surface className="p-6 sm:p-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Create position</div>
                <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_150px]">
                  <label className="block min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Amount in INRI</div>
                    <input
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value.replace(/,/g, '.'))}
                      placeholder="100"
                      className="mt-2 h-14 w-full rounded-[1.1rem] border border-white/12 bg-black/30 px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/24 focus:border-primary/55"
                    />
                  </label>
                  <div className="grid gap-2">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Selected</div>
                    <div className="flex h-14 items-center rounded-[1.1rem] border border-white/12 bg-black/30 px-4 text-base font-semibold text-white">
                      {selectedPlanInfo.title}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <InfoRow label="Wallet available" value={`${formatAmount(userState?.walletBalance || 0n)} INRI`} />
                  <InfoRow label="Plan remaining" value={`${formatAmount(planRemaining)} INRI`} />
                  <InfoRow label="Minimum now" value={`${selectedPosition?.principal && selectedPosition.principal > 0n ? 'No minimum' : `${formatAmount(minStake)} INRI`}`} />
                </div>

                {amountValidation ? (
                  <div className="mt-4 rounded-[1.1rem] border border-amber-300/20 bg-amber-400/[0.08] p-4 text-sm font-bold leading-6 text-amber-100">
                    {amountValidation}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[1.1rem] border border-primary/20 bg-primary/[0.07] p-4 text-sm font-bold leading-6 text-cyan-100">
                    Ready to stake into {selectedPlanInfo.title}. A small gas reserve is kept when using Max.
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <ActionButton
                    onClick={setMaxAmount}
                    disabled={!userState || maxStakeNow <= 0n || Boolean(busyAction)}
                    className="border-white/14 bg-white/[0.04] text-white hover:-translate-y-px hover:border-primary/55 hover:bg-primary/10"
                  >
                    Max
                  </ActionButton>
                  <ActionButton
                    onClick={stakeNow}
                    disabled={!canStake || Boolean(busyAction)}
                    className="border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] text-black shadow-[0_18px_44px_rgba(19,164,255,0.26)] hover:-translate-y-px hover:brightness-105"
                  >
                    {busyAction === 'stake' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    Stake INRI
                  </ActionButton>
                  <ActionButton
                    onClick={claimAll}
                    disabled={!canClaim || Boolean(busyAction)}
                    className="border-white/14 bg-white/[0.04] text-white hover:-translate-y-px hover:border-primary/55 hover:bg-primary/10"
                  >
                    {busyAction === 'claim' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    Claim daily
                  </ActionButton>
                </div>
              </div>

              <div className="inri-sidebar-card rounded-[1.6rem] p-5">
                <div className="flex items-center gap-2 text-xl font-black text-white">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Position summary
                </div>
                <div className="mt-5 grid gap-3">
                  <StatCard label="Selected principal" value={`${formatAmount(selectedPosition?.principal || 0n)} INRI`} note="Principal in the selected plan" />
                  <StatCard label="Unlocks at" value={formatTimestamp(selectedPosition?.unlockAt || 0n)} note={selectedPosition?.principal ? `Time left: ${formatTime(userState?.timeUntilUnlock[selectedPlan] || 0n)}` : 'No active position on this plan'} />
                  <StatCard label="Can claim" value={userState?.canClaim ? 'Yes' : 'Not yet'} note={userState?.nextClaimAt ? `Next claim: ${formatTimestamp(userState.nextClaimAt)}` : 'Claim availability updates automatically'} />
                  <StatCard label="Rewards left" value={`${formatAmount(contractStats.baseRewardsRemaining)} INRI`} note="Base rewards still waiting to be emitted" />
                </div>
              </div>
            </div>
          </Surface>
        </div>

        <div className="space-y-6">
          <Surface className="p-5 sm:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Live status</div>
            <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-black/30 p-4">
              <div className="flex items-start gap-3">
                {error ? <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-400" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />}
                <div className="min-w-0">
                  <div className="text-base font-black text-white">{error ? 'Action needs attention' : 'Staking app online'}</div>
                  <div className="mt-2 break-words text-sm leading-7 text-white/60">{error || status}</div>
                </div>
              </div>
              {txHash ? (
                <a href={`https://explorer.inri.life/tx/${txHash}`} target="_blank" rel="noreferrer" className="mt-4 block rounded-[1.2rem] border border-primary/24 bg-primary/[0.08] p-4 transition hover:bg-primary/[0.12]">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Latest transaction</div>
                  <div className="mt-2 break-all font-mono text-sm font-semibold text-white">{txHash}</div>
                </a>
              ) : null}
            </div>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Program state</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <StatCard label="Program started" value={contractStats.started ? 'Yes' : 'No'} note={`Started at ${formatTimestamp(contractStats.startTime)}`} />
              <StatCard label="Program ends" value={formatTimestamp(contractStats.programEnd)} note="Five-year staking schedule" />
              <StatCard label="New stakes" value={contractStats.newStakesPaused ? 'Paused' : 'Open'} note="Controls fresh stake and restake entry" />
              <StatCard label="Emergency exit" value={contractStats.emergencyExitEnabled ? 'Enabled' : 'Off'} note="When enabled, unstake has no penalty" />
              <StatCard label="Current era" value={contractStats.currentEra.toString()} note={`${formatAmount(contractStats.emissionPerDay)} INRI emitted per day`} />
              <StatCard label="Contract balance" value={`${formatAmount(contractStats.contractBalance)} INRI`} note="Current balance reported by the staking contract" />
            </div>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Useful routes</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              {([
                { title: 'INRI Wallet', text: 'Open the official wallet before staking.', href: 'https://wallet.inri.life', external: true },
                { title: 'Official explorer', text: 'Inspect the staking contract and transactions.', href: EXPLORER_URL, external: true },
                { title: 'Whitepaper', text: 'Read the tokenomics and program context.', href: '/whitepaper' },
                { title: 'Pool', text: 'Compare mining and staking side by side.', href: '/pool' },
              ] as { title: string; text: string; href: string; external?: boolean }[]).map((item) => (
                <Link key={item.title} href={item.href} {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})} className="block rounded-[1.3rem] border border-white/10 bg-black/28 p-4 transition hover:border-primary/40 hover:bg-primary/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-black text-white">{item.title}</div>
                      <div className="mt-2 text-sm leading-7 text-white/56">{item.text}</div>
                    </div>
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
