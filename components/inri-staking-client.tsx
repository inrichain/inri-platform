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
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [contractStats, setContractStats] = useState<ContractStats>(initialContractStats)
  const [userState, setUserState] = useState<UserState | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<0 | 1 | 2>(0)
  const [amount, setAmount] = useState('100')
  const [status, setStatus] = useState('Use the top header to connect your wallet and confirm INRI CHAIN before staking.')
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
    if (!eth || !account) throw new Error('Connect your wallet from the top header first')
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
      setError('Select INRI CHAIN from the top header before staking.')
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
      setError('Select INRI CHAIN from the top header before claiming.')
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
      setError('Select INRI CHAIN from the top header before restaking.')
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
      setError('Select INRI CHAIN from the top header before unstaking.')
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
  const selectedPlanInfo = PLAN_META[selectedPlan]
  const networkLabel = networkReady ? 'INRI CHAIN ready' : chainId ? `Wrong network · ${chainId}` : 'Network not selected'

  return (
    <div className="space-y-8">
      <Surface className="p-6 sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/24 bg-primary/[0.08] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-4 w-4" />
              Staking workspace
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-white sm:text-[2.3rem]">
              Manage the whole staking flow from one clearer control panel.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
              Connect any compatible EVM wallet, add INRI CHAIN, review the live program stats and execute stake, claim, restake or unstake without the layout feeling compressed.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Wallet" value={shortAddress(account)} note={providerReady ? 'Connected wallet status' : 'Open this route with an EVM wallet'} />
              <StatCard label="Network" value={networkReady ? 'INRI CHAIN' : 'Not ready'} note={networkLabel} />
              <StatCard label="Current era" value={contractStats.currentEra.toString()} note="Year in the fixed 5-year schedule" />
              <StatCard label="Emission / day" value={`${formatAmount(contractStats.emissionPerDay)} INRI`} note="Current scheduled emission" />
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
                Compatible wallets: INRI Wallet, MetaMask, Rabby, OKX, Coinbase Wallet and similar EVM wallets that support custom networks.
              </div>
            </div>

            <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/66">
              Use the Connect Wallet button in the top header. Once the wallet is connected and INRI CHAIN is selected there, the staking actions below become ready here automatically.
            </div>
          </div>
        </div>
      </Surface>

      <div className="grid gap-8 2xl:grid-cols-[minmax(0,1.08fr)_380px] 2xl:items-start">
        <div className="space-y-6">
          <Surface className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Staking contract</div>
                <div className="mt-2 break-all font-mono text-sm font-semibold text-white">{STAKING_ADDRESS}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyAddress}
                  className="inri-button-secondary min-w-[132px]"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={EXPLORER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inri-button-secondary min-w-[168px]"
                >
                  Official explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <StatCard label="Min stake" value={`${formatAmount(contractStats.minStake)} INRI`} note="Minimum amount required to enter" />
              <StatCard label="Max per plan" value={`${formatAmount(contractStats.maxPerPlan)} INRI`} note="Maximum principal allowed in each plan" />
              <StatCard label="Rewards left" value={`${formatAmount(contractStats.baseRewardsRemaining)} INRI`} note="Base rewards still waiting to be emitted" />
            </div>
          </Surface>

          <Surface className="p-6 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Choose your plan</div>
                <h3 className="mt-2 text-2xl font-black text-white sm:text-[2rem]">Pick the lock period before sending INRI.</h3>
              </div>
              <div className="text-sm leading-6 text-white/54">Penalties only apply to early unlocks.</div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {PLAN_META.map((plan) => {
                const position = userState?.positions[plan.id]
                const active = position?.active
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`min-w-0 rounded-[1.55rem] border p-5 text-left transition ${selectedPlan === plan.id ? 'border-primary/50 bg-primary/[0.10] shadow-[0_0_0_1px_rgba(19,164,255,0.10)]' : 'border-white/10 bg-white/[0.03] hover:border-primary/35 hover:bg-primary/[0.05]'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{plan.title}</div>
                        <div className="mt-2 text-3xl font-black leading-none text-white">{plan.days} days</div>
                      </div>
                      <div className="rounded-full border border-white/12 bg-black/25 px-3 py-1.5 text-sm font-black text-white">{plan.multiplier}</div>
                    </div>
                    <div className="mt-4 text-sm leading-7 text-white/58">Penalty {plan.penalty} before unlock. {plan.accent}.</div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                      <span className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] ${active ? 'border-primary/35 bg-primary/[0.10] text-primary' : 'border-white/12 bg-white/[0.03] text-white/50'}`}>
                        {active ? 'Active position' : 'No position'}
                      </span>
                      <span className="text-white/44">{active ? `${formatAmount(position?.principal || 0n)} INRI` : '—'}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </Surface>

          <Surface className="p-6 sm:p-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Create or manage position</div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Selected plan</div>
                    <div className="mt-2 flex h-14 items-center rounded-[1.1rem] border border-white/12 bg-black/30 px-4 text-base font-semibold text-white">
                      {selectedPlanInfo.title} · {selectedPlanInfo.multiplier}
                    </div>
                  </label>
                  <label className="block min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Amount in INRI</div>
                    <input
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="100"
                      className="mt-2 h-14 w-full rounded-[1.1rem] border border-white/12 bg-black/30 px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/24 focus:border-primary/55"
                    />
                  </label>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white/58">
                  Stake native INRI into the selected plan. Claim, restake and unstake continue using the same connected wallet, so the whole staking flow stays in one place.
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <ActionButton
                    onClick={stakeNow}
                    disabled={busyAction === 'stake' || !providerReady}
                    className="border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] text-black shadow-[0_18px_44px_rgba(19,164,255,0.26)] hover:-translate-y-px hover:brightness-105"
                  >
                    {busyAction === 'stake' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Stake INRI'}
                  </ActionButton>
                  <ActionButton
                    onClick={claimAll}
                    disabled={busyAction === 'claim' || !userState?.canClaim}
                    className="border-white/14 bg-white/[0.04] text-white hover:-translate-y-px hover:border-primary/55 hover:bg-primary/10"
                  >
                    {busyAction === 'claim' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Claim rewards'}
                  </ActionButton>
                  <ActionButton
                    onClick={restake}
                    disabled={busyAction === 'restake'}
                    className="border-white/14 bg-white/[0.04] text-white hover:-translate-y-px hover:border-primary/55 hover:bg-primary/10"
                  >
                    {busyAction === 'restake' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Restake rewards'}
                  </ActionButton>
                  <ActionButton
                    onClick={unstake}
                    disabled={busyAction === 'unstake'}
                    className="border-white/14 bg-white/[0.04] text-white hover:-translate-y-px hover:border-primary/55 hover:bg-primary/10"
                  >
                    {busyAction === 'unstake' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Unstake selected'}
                  </ActionButton>
                </div>
              </div>

              <div className="inri-sidebar-card rounded-[1.6rem] p-5">
                <div className="flex items-center gap-2 text-xl font-black text-white">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Position summary
                </div>
                <div className="mt-5 grid gap-3">
                  <StatCard label="Pending rewards" value={`${formatAmount(userState?.pendingRewards || 0n)} INRI`} note="All unclaimed rewards across plans" />
                  <StatCard label="Selected principal" value={`${formatAmount(selectedPosition?.principal || 0n)} INRI`} note="Principal in the selected plan" />
                  <StatCard label="Unlocks at" value={formatTimestamp(selectedPosition?.unlockAt || 0n)} note={selectedPosition ? `Time left: ${formatTime(userState?.timeUntilUnlock[selectedPlan] || 0n)}` : 'No active position on this plan'} />
                  <StatCard label="Can claim" value={userState?.canClaim ? 'Yes' : 'Not yet'} note={userState?.nextClaimAt ? `Next claim: ${formatTimestamp(userState.nextClaimAt)}` : 'Claim availability updates automatically'} />
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
            <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <StatCard label="Program started" value={contractStats.started ? 'Yes' : 'No'} note="Started once with the funded amount" />
              <StatCard label="New stakes" value={contractStats.newStakesPaused ? 'Paused' : 'Open'} note="Controls fresh stake and restake entry" />
              <StatCard label="Emergency exit" value={contractStats.emergencyExitEnabled ? 'Enabled' : 'Off'} note="When enabled, unstake has no penalty" />
              <StatCard label="Contract balance" value={`${formatAmount(contractStats.contractBalance)} INRI`} note="Current balance reported by the staking contract" />
            </div>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Useful routes</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              {([
                { title: 'INRI Wallet', text: 'Open the official wallet before staking.', href: 'https://wallet.inri.life', external: true },
                { title: 'Official explorer', text: 'Inspect the staking contract and transactions.', href: 'https://explorer.inri.life/address/0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9', external: true },
                { title: 'Whitepaper', text: 'Read the tokenomics and program context.', href: '/whitepaper' },
                { title: 'Pool', text: 'Compare mining and staking side by side.', href: '/pool' },
              ] as { title: string; text: string; href: string; external?: boolean }[]).map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="block rounded-[1.3rem] border border-white/10 bg-black/28 p-4 transition hover:border-primary/40 hover:bg-primary/10"
                >
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
