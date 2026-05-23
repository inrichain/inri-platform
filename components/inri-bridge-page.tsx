'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowLeftRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { ConnectWalletButton } from '@/components/connect-wallet-button'

const BRIDGE_ORIGIN = 'https://iusd-bridge.inri.life'
const CLAIM_API = `${BRIDGE_ORIGIN}/api/claim`
const RELEASE_API = `${BRIDGE_ORIGIN}/api/release`

const POLYGON_CHAIN_ID = '0x89'
const INRI_CHAIN_ID = '0xec1'
const FEE_BPS = 20n
const BPS_DENOMINATOR = 10_000n

const POLYGON_USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const POLYGON_LOCKBOX = '0x7E2e6d4881e1470D541599397b4876b449296071'
const INRI_EXECUTOR = '0x07DE046e96c33a8E575234282e1CccAC56d3d880'
const INRI_IUSD = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'

const SELECTORS = {
  approve: '0x095ea7b3',
  allowance: '0xdd62ed3e',
  balanceOf: '0x70a08231',
  deposit: '0xb6b55f25',
}

type ProviderLike = {
  request: (args: { method: string; params?: unknown[] | object; chainId?: string }) => Promise<any>
}

type ActiveWalletState = {
  connector: '' | 'injected' | 'walletconnect'
  address: string
  chainId: string
  provider?: ProviderLike
} | null

type BridgeDirection = 'buy' | 'sell'
type StepStatus = 'idle' | 'working' | 'done' | 'warning' | 'error'
type SettlementStatus = 'idle' | 'checking' | 'waiting' | 'ready' | 'claimed' | 'error'

type SettlementTx = {
  to: string
  data: string
  value?: string
}

type SettlementState = {
  status: SettlementStatus
  message: string
  raw?: unknown
  tx?: SettlementTx | null
  lastCheckedAt?: number
}

type BridgeOperation = {
  id: string
  direction: BridgeDirection
  amount: string
  receive: string
  sourceTx: string
  settlementTx?: string
  createdAt: number
  status: 'submitted' | 'ready' | 'done' | 'fallback'
}

type BridgeStep = {
  label: string
  text: string
  status: StepStatus
}

function getActiveWalletState(): ActiveWalletState {
  if (typeof window === 'undefined') return null
  return (window as Window & { __INRI_ACTIVE_WALLET__?: ActiveWalletState }).__INRI_ACTIVE_WALLET__ ?? null
}

function normalizeChainId(chainId?: string | null) {
  return (chainId || '').toLowerCase()
}

function isAddress(value?: string | null) {
  return /^0x[a-fA-F0-9]{40}$/.test(value || '')
}

function shortAddress(value?: string | null) {
  if (!value) return '-'
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function shortHash(value?: string | null) {
  if (!value) return '-'
  return `${value.slice(0, 10)}...${value.slice(-8)}`
}

function explorerTx(chainId: string, hash: string) {
  if (!hash) return '#'
  return normalizeChainId(chainId) === POLYGON_CHAIN_ID
    ? `https://polygonscan.com/tx/${hash}`
    : `https://explorer.inri.life/tx/${hash}`
}

function pad64(value: string) {
  return value.replace(/^0x/, '').padStart(64, '0')
}

function encodeAddress(address: string) {
  return pad64(address.toLowerCase())
}

function encodeUint256(value: bigint) {
  return value.toString(16).padStart(64, '0')
}

function encodeApprove(spender: string, amount: bigint) {
  return `${SELECTORS.approve}${encodeAddress(spender)}${encodeUint256(amount)}`
}

function encodeAllowance(owner: string, spender: string) {
  return `${SELECTORS.allowance}${encodeAddress(owner)}${encodeAddress(spender)}`
}

function encodeBalanceOf(owner: string) {
  return `${SELECTORS.balanceOf}${encodeAddress(owner)}`
}

function encodeDeposit(amount: bigint) {
  return `${SELECTORS.deposit}${encodeUint256(amount)}`
}

function parseUnits(value: string, decimals: number) {
  const clean = value.trim().replace(',', '.')
  if (!/^\d*(\.\d*)?$/.test(clean) || clean === '' || clean === '.') return 0n
  const [wholeRaw, fractionRaw = ''] = clean.split('.')
  const whole = wholeRaw || '0'
  const fraction = fractionRaw.slice(0, decimals).padEnd(decimals, '0')
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction || '0')
}

function formatUnits(value: bigint, decimals: number, maxFraction = 6) {
  const base = 10n ** BigInt(decimals)
  const whole = value / base
  const fraction = value % base
  const padded = fraction.toString().padStart(decimals, '0').slice(0, maxFraction)
  const trimmed = padded.replace(/0+$/, '')
  return trimmed ? `${whole}.${trimmed}` : whole.toString()
}

function safeJsonString(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function loadHistory() {
  if (typeof window === 'undefined') return [] as BridgeOperation[]
  try {
    const parsed = JSON.parse(localStorage.getItem('inri_site_bridge_history_v1') || '[]')
    return Array.isArray(parsed) ? parsed.slice(0, 8) as BridgeOperation[] : []
  } catch {
    return [] as BridgeOperation[]
  }
}

function saveHistory(items: BridgeOperation[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('inri_site_bridge_history_v1', JSON.stringify(items.slice(0, 8)))
  } catch {}
}

function findTxPayload(value: any): SettlementTx | null {
  if (!value || typeof value !== 'object') return null

  const directCandidates = [
    value,
    value.tx,
    value.transaction,
    value.request,
    value.claimTx,
    value.releaseTx,
    value.call,
    value.payload,
    value.data,
    value.result,
  ]

  for (const item of directCandidates) {
    if (!item || typeof item !== 'object') continue
    const to = item.to || item.target || item.contract || item.contractAddress
    const data = item.data || item.calldata || item.input
    if (typeof to === 'string' && typeof data === 'string' && isAddress(to) && data.startsWith('0x')) {
      return {
        to,
        data,
        value: typeof item.value === 'string' ? item.value : undefined,
      }
    }
  }

  for (const item of Object.values(value)) {
    const nested = findTxPayload(item)
    if (nested) return nested
  }

  return null
}

function settlementLooksReady(value: any) {
  if (!value || typeof value !== 'object') return false
  if (findTxPayload(value)) return true
  const status = String(value.status || value.state || value.phase || '').toLowerCase()
  if (['ready', 'claimable', 'release_ready', 'claim_ready', 'ok'].includes(status)) return true
  if (value.ready === true || value.claimable === true || value.releaseReady === true) return true
  if (Array.isArray(value.signatures) && value.signatures.length >= 2) return true
  return false
}

async function waitForReceipt(provider: ProviderLike, txHash: string, onTick?: () => void) {
  for (let i = 0; i < 60; i += 1) {
    const receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [txHash] })
    if (receipt) return receipt
    onTick?.()
    await new Promise((resolve) => window.setTimeout(resolve, 3000))
  }
  return null
}

async function callContract(provider: ProviderLike, to: string, data: string, from?: string) {
  const result = await provider.request({
    method: 'eth_call',
    params: [{ to, data, ...(from ? { from } : {}) }, 'latest'],
  })
  return typeof result === 'string' && result.startsWith('0x') ? result : '0x0'
}

async function sendContractTx(provider: ProviderLike, from: string, to: string, data: string, value?: string) {
  const tx = { from, to, data, ...(value ? { value } : {}) }
  await provider.request({ method: 'eth_estimateGas', params: [tx] })
  const hash = await provider.request({ method: 'eth_sendTransaction', params: [tx] })
  if (typeof hash !== 'string') throw new Error('Wallet did not return a transaction hash.')
  return hash
}

function StepPill({ step }: { step: BridgeStep }) {
  const icon =
    step.status === 'done' ? <CheckCircle2 className="h-4 w-4" />
      : step.status === 'working' ? <Loader2 className="h-4 w-4 animate-spin" />
        : step.status === 'warning' ? <Clock3 className="h-4 w-4" />
          : step.status === 'error' ? <CircleAlert className="h-4 w-4" />
            : <span className="h-2 w-2 rounded-full bg-current opacity-70" />

  const color =
    step.status === 'done' ? 'border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-100'
      : step.status === 'working' ? 'border-cyan-300/35 bg-cyan-300/[0.10] text-cyan-100'
        : step.status === 'warning' ? 'border-amber-300/30 bg-amber-300/[0.08] text-amber-100'
          : step.status === 'error' ? 'border-red-300/30 bg-red-300/[0.08] text-red-100'
            : 'border-white/12 bg-white/[0.035] text-white/62'

  return (
    <div className={`rounded-[18px] border p-4 ${color}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current/20 bg-black/20">
          {icon}
        </div>
        <div>
          <p className="text-sm font-black text-white">{step.label}</p>
          <p className="mt-1 text-xs leading-5 opacity-75">{step.text}</p>
        </div>
      </div>
    </div>
  )
}

function RouteBox({ label, chain, token, note }: { label: string; chain: string; token: string; note: string }) {
  return (
    <div className="rounded-[22px] border border-white/12 bg-black/24 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">{label}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-black text-white">{token}</p>
          <p className="mt-1 text-sm font-bold text-cyan-200/70">{chain}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-cyan-300/25 bg-cyan-300/[0.09] text-cyan-200">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-white/48">{note}</p>
    </div>
  )
}

export function InriBridgePage() {
  const [wallet, setWallet] = useState<ActiveWalletState>(null)
  const [direction, setDirection] = useState<BridgeDirection>('buy')
  const [amount, setAmount] = useState('1')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('Connect wallet in the top header or directly inside this bridge card.')
  const [error, setError] = useState('')
  const [allowance, setAllowance] = useState<bigint | null>(null)
  const [balance, setBalance] = useState<bigint | null>(null)
  const [sourceTx, setSourceTx] = useState('')
  const [settlement, setSettlement] = useState<SettlementState>({ status: 'idle', message: 'No active transfer yet.' })
  const [history, setHistory] = useState<BridgeOperation[]>([])
  const [copied, setCopied] = useState('')
  const pollingRef = useRef<number | null>(null)

  const provider = wallet?.provider || (typeof window !== 'undefined' ? (window as any).ethereum as ProviderLike | undefined : undefined)
  const address = wallet?.address || ''
  const chainId = normalizeChainId(wallet?.chainId)

  const sourceChainId = direction === 'buy' ? POLYGON_CHAIN_ID : INRI_CHAIN_ID
  const destinationChainId = direction === 'buy' ? INRI_CHAIN_ID : POLYGON_CHAIN_ID
  const tokenDecimals = 6
  const amountRaw = useMemo(() => parseUnits(amount, tokenDecimals), [amount])
  const receiveRaw = useMemo(() => (amountRaw * (BPS_DENOMINATOR - FEE_BPS)) / BPS_DENOMINATOR, [amountRaw])
  const receiveText = useMemo(() => formatUnits(receiveRaw, tokenDecimals, 6), [receiveRaw])
  const allowanceEnough = allowance !== null && allowance >= amountRaw && amountRaw > 0n
  useEffect(() => {
    setWallet(getActiveWalletState())
    setHistory(loadHistory())

    const onWallet = () => setWallet(getActiveWalletState())
    window.addEventListener('inri:wallet-state', onWallet)
    return () => window.removeEventListener('inri:wallet-state', onWallet)
  }, [])

  useEffect(() => {
    setAllowance(null)
    setBalance(null)
    setSourceTx('')
    setSettlement({ status: 'idle', message: 'No active transfer yet.' })
    setError('')
  }, [direction])

  useEffect(() => {
    if (!provider || !address || chainId !== sourceChainId || amountRaw <= 0n) return
    void refreshTokenState()
  }, [provider, address, chainId, sourceChainId, direction, amountRaw])

  useEffect(() => {
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current)
    }
  }, [])

  const route = direction === 'buy'
    ? {
        fromChain: 'Polygon',
        toChain: 'INRI Chain',
        fromToken: 'USDT',
        toToken: 'iUSD',
        fromNote: 'Deposit USDT into the Polygon lockbox.',
        toNote: 'Claim iUSD on INRI after validator signatures are ready.',
        primaryAction: 'Bridge USDT to iUSD',
        claimAction: 'Claim iUSD',
      }
    : {
        fromChain: 'INRI Chain',
        toChain: 'Polygon',
        fromToken: 'iUSD',
        toToken: 'USDT',
        fromNote: 'Burn iUSD on INRI through the official bridge engine.',
        toNote: 'Claim USDT on Polygon after release signatures are ready.',
        primaryAction: 'Sell iUSD for USDT',
        claimAction: 'Claim USDT',
      }

  const steps = useMemo<BridgeStep[]>(() => {
    const connected = Boolean(address && provider)
    const rightNetwork = chainId === sourceChainId
    const hasSourceTx = Boolean(sourceTx)
    const settleReady = settlement.status === 'ready'
    const done = settlement.status === 'claimed'

    return [
      {
        label: 'Wallet',
        text: connected ? `${shortAddress(address)} connected` : 'Use the existing site wallet connection.',
        status: connected ? 'done' : 'idle',
      },
      {
        label: 'Route',
        text: `${route.fromToken} on ${route.fromChain} → ${route.toToken} on ${route.toChain}`,
        status: rightNetwork ? 'done' : connected ? 'warning' : 'idle',
      },
      {
        label: direction === 'buy' ? 'Approve + Deposit' : 'Burn',
        text: hasSourceTx ? `Source tx submitted: ${shortHash(sourceTx)}` : direction === 'buy' ? 'Approve USDT once, then deposit into the lockbox.' : 'Sell side is safely handed to the live bridge engine until the exact burn ABI is added here.',
        status: hasSourceTx ? 'done' : busy ? 'working' : 'idle',
      },
      {
        label: direction === 'buy' ? 'Claim' : 'Release',
        text: done ? 'Transfer completed.' : settleReady ? 'Validator signatures are ready.' : settlement.message,
        status: done ? 'done' : settleReady ? 'warning' : settlement.status === 'checking' ? 'working' : settlement.status === 'error' ? 'error' : 'idle',
      },
    ]
  }, [address, provider, chainId, sourceChainId, sourceTx, settlement, route, direction, busy])

  async function refreshTokenState() {
    if (!provider || !address) return
    try {
      const token = direction === 'buy' ? POLYGON_USDT : INRI_IUSD
      const spender = direction === 'buy' ? POLYGON_LOCKBOX : INRI_EXECUTOR
      const [allowanceHex, balanceHex] = await Promise.all([
        callContract(provider, token, encodeAllowance(address, spender), address),
        callContract(provider, token, encodeBalanceOf(address), address),
      ])
      setAllowance(BigInt(allowanceHex || '0x0'))
      setBalance(BigInt(balanceHex || '0x0'))
    } catch (e: any) {
      setError(e?.message || 'Unable to read token balance or allowance.')
    }
  }

  async function switchNetwork(target = sourceChainId) {
    if (!provider) {
      setError('Connect a wallet first.')
      return
    }

    const isPolygon = target === POLYGON_CHAIN_ID
    try {
      setBusy(true)
      setError('')
      try {
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: target }] })
      } catch {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            isPolygon
              ? {
                  chainId: POLYGON_CHAIN_ID,
                  chainName: 'Polygon PoS',
                  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                  rpcUrls: ['https://polygon-rpc.com'],
                  blockExplorerUrls: ['https://polygonscan.com'],
                }
              : {
                  chainId: INRI_CHAIN_ID,
                  chainName: 'INRI CHAIN',
                  nativeCurrency: { name: 'INRI', symbol: 'INRI', decimals: 18 },
                  rpcUrls: ['https://rpc.inri.life'],
                  blockExplorerUrls: ['https://explorer.inri.life'],
                },
          ],
        })
      }
      setStatus(`Network switched to ${isPolygon ? 'Polygon' : 'INRI Chain'}.`)
    } catch (e: any) {
      setError(e?.message || 'Unable to switch network.')
    } finally {
      setBusy(false)
    }
  }

  function upsertOperation(operation: BridgeOperation) {
    const next = [operation, ...history.filter((item) => item.id !== operation.id)].slice(0, 8)
    setHistory(next)
    saveHistory(next)
  }

  function markOperation(id: string, patch: Partial<BridgeOperation>) {
    const next = history.map((item) => item.id === id ? { ...item, ...patch } : item)
    setHistory(next)
    saveHistory(next)
  }

  async function approveToken() {
    if (!provider || !address || amountRaw <= 0n) return
    const token = direction === 'buy' ? POLYGON_USDT : INRI_IUSD
    const spender = direction === 'buy' ? POLYGON_LOCKBOX : INRI_EXECUTOR
    const hash = await sendContractTx(provider, address, token, encodeApprove(spender, amountRaw))
    setStatus(`Approval submitted: ${shortHash(hash)}. Waiting confirmation...`)
    await waitForReceipt(provider, hash)
    await refreshTokenState()
    setStatus('Approval confirmed. You can continue the bridge.')
  }

  async function runBuyFlow() {
    if (!provider || !address || amountRaw <= 0n) return
    if (chainId !== POLYGON_CHAIN_ID) {
      await switchNetwork(POLYGON_CHAIN_ID)
      return
    }

    try {
      setBusy(true)
      setError('')

      if (!allowanceEnough) {
        setStatus('Requesting USDT approval on Polygon...')
        await approveToken()
        setBusy(false)
        return
      }

      setStatus('Depositing USDT into the Polygon lockbox...')
      const txHash = await sendContractTx(provider, address, POLYGON_LOCKBOX, encodeDeposit(amountRaw))
      setSourceTx(txHash)
      setStatus(`Deposit submitted: ${shortHash(txHash)}. Waiting for confirmation...`)
      await waitForReceipt(provider, txHash)

      const operation: BridgeOperation = {
        id: txHash,
        direction: 'buy',
        amount,
        receive: receiveText,
        sourceTx: txHash,
        createdAt: Date.now(),
        status: 'submitted',
      }
      upsertOperation(operation)
      setStatus('Deposit confirmed. Watcher is preparing the iUSD claim.')
      startSettlementPolling('buy', txHash)
    } catch (e: any) {
      setError(e?.message || 'Bridge deposit failed.')
    } finally {
      setBusy(false)
    }
  }

  async function runSellFlow() {
    if (!address) return
    if (chainId !== INRI_CHAIN_ID) {
      await switchNetwork(INRI_CHAIN_ID)
      return
    }

    const url = `${BRIDGE_ORIGIN}/sell.html`
    window.open(url, '_blank', 'noopener,noreferrer')
    setSettlement({
      status: 'waiting',
      message: 'Sell flow opened in the official live bridge engine. The current site zip does not include the exact burnForPolygonRelease ABI, so this page avoids sending a risky guessed burn transaction.',
    })
  }

  async function handlePrimaryAction() {
    if (!address || !provider) return
    if (amountRaw <= 0n) {
      setError('Enter a valid amount first.')
      return
    }
    if (direction === 'buy') {
      await runBuyFlow()
    } else {
      await runSellFlow()
    }
  }

  async function fetchSettlement(directionToCheck: BridgeDirection, id: string, silent = false) {
    const base = directionToCheck === 'buy' ? CLAIM_API : RELEASE_API
    if (!silent) setSettlement((prev) => ({ ...prev, status: 'checking', message: 'Checking bridge watcher and signatures...' }))

    try {
      const response = await fetch(`${base}/${encodeURIComponent(id)}`, { cache: 'no-store' })
      if (!response.ok) {
        setSettlement({
          status: 'waiting',
          message: `Watcher has not published this ${directionToCheck === 'buy' ? 'claim' : 'release'} yet. It will keep checking automatically.`,
          lastCheckedAt: Date.now(),
        })
        return
      }

      const data = await response.json()
      const tx = findTxPayload(data)
      const ready = settlementLooksReady(data)
      setSettlement({
        status: ready ? 'ready' : 'waiting',
        message: ready ? 'Signatures are ready. You can claim now.' : 'Watcher found the operation but it is still preparing signatures.',
        raw: data,
        tx,
        lastCheckedAt: Date.now(),
      })
      if (ready) markOperation(id, { status: 'ready' })
    } catch (e: any) {
      setSettlement({
        status: 'error',
        message: e?.message || 'Unable to reach the bridge API.',
        lastCheckedAt: Date.now(),
      })
    }
  }

  function startSettlementPolling(nextDirection: BridgeDirection, id: string) {
    if (pollingRef.current) window.clearInterval(pollingRef.current)
    void fetchSettlement(nextDirection, id)
    pollingRef.current = window.setInterval(() => {
      void fetchSettlement(nextDirection, id, true)
    }, 5000)
  }

  async function claimSettlement() {
    if (!provider || !address) return
    const id = sourceTx || history.find((item) => item.direction === direction && item.status !== 'done')?.id
    if (!id) return

    const targetChain = destinationChainId
    if (chainId !== targetChain) {
      await switchNetwork(targetChain)
      return
    }

    try {
      setBusy(true)
      setError('')

      const tx = settlement.tx
      if (!tx) {
        const fallback = direction === 'buy'
          ? `${BRIDGE_ORIGIN}/claim.html?id=${encodeURIComponent(id)}`
          : `${BRIDGE_ORIGIN}/claim.html?id=${encodeURIComponent(id)}`
        window.open(fallback, '_blank', 'noopener,noreferrer')
        markOperation(id, { status: 'fallback' })
        setSettlement((prev) => ({
          ...prev,
          status: 'waiting',
          message: 'API says this operation is ready, but did not expose raw tx payload to this site. Opened the existing claim page as a safe fallback.',
        }))
        return
      }

      const hash = await sendContractTx(provider, address, tx.to, tx.data, tx.value)
      setStatus(`${route.claimAction} submitted: ${shortHash(hash)}.`)
      await waitForReceipt(provider, hash)
      setSettlement((prev) => ({ ...prev, status: 'claimed', message: 'Bridge completed successfully.' }))
      markOperation(id, { status: 'done', settlementTx: hash })
    } catch (e: any) {
      setError(e?.message || 'Claim transaction failed.')
    } finally {
      setBusy(false)
    }
  }

  function copy(value: string, label: string) {
    if (!value || typeof navigator === 'undefined') return
    void navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1200)
  }

  const buttonLabel = !address
    ? 'Connect wallet first'
    : chainId !== sourceChainId
      ? `Switch to ${direction === 'buy' ? 'Polygon' : 'INRI Chain'}`
      : direction === 'buy' && allowance !== null && !allowanceEnough
        ? 'Approve USDT'
        : route.primaryAction

  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="relative border-b border-cyan-300/15 bg-[radial-gradient(circle_at_18%_14%,rgba(0,174,255,0.50),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(122,232,255,0.23),transparent_34rem),linear-gradient(135deg,#071a32_0%,#02040a_42%,#000_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute -left-28 top-24 h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1560px] gap-9 px-4 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-16 xl:px-12">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                <ShieldCheck className="h-4 w-4" />
                Official iUSD Bridge
              </div>

              <h1 className="mt-8 max-w-5xl text-[3rem] font-black leading-[0.86] tracking-[-0.075em] text-white sm:text-[4.8rem] xl:text-[6.3rem]">
                Move USDT and iUSD with a cleaner bridge flow.
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-9 text-cyan-50/72">
                A professional bridge surface for the working iUSD infrastructure: one route card, clear fee, automatic watcher checks and safe claim handoff.
              </p>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {[
                  ['0.2%', 'Bridge fee'],
                  ['2 / 4', 'Signature threshold'],
                  ['3777', 'INRI Chain ID'],
                ].map(([value, label]) => (
                  <div key={label} className="border-l-2 border-cyan-300/70 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/70">{label}</div>
                    <div className="mt-2 text-xl font-black text-white">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-3 text-sm font-bold text-white/52">
                <span className="rounded-full border border-white/12 bg-white/[0.035] px-4 py-2">Polygon USDT lockbox</span>
                <span className="rounded-full border border-white/12 bg-white/[0.035] px-4 py-2">INRI iUSD mint/release</span>
                <span className="rounded-full border border-white/12 bg-white/[0.035] px-4 py-2">Auto watcher API</span>
              </div>
            </div>

            <div className="rounded-[30px] border border-cyan-300/20 bg-white/[0.06] p-3 shadow-[0_44px_140px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl sm:p-5">
              <div className="rounded-[25px] border border-white/12 bg-[#030910]/95 p-4 sm:p-6">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Bridge</p>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">iUSD Transfer</h2>
                  </div>
                  <div className="w-full sm:w-auto">
                    <ConnectWalletButton compact />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 rounded-[18px] border border-white/10 bg-black/26 p-1.5">
                  {(['buy', 'sell'] as BridgeDirection[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDirection(item)}
                      className={`rounded-[14px] px-4 py-3 text-sm font-black transition ${direction === item ? 'bg-cyan-300 text-black shadow-[0_12px_35px_rgba(19,164,255,0.26)]' : 'text-white/58 hover:bg-white/[0.055] hover:text-white'}`}
                    >
                      {item === 'buy' ? 'Buy iUSD' : 'Sell iUSD'}
                    </button>
                  ))}
                </div>

                <div className="mt-5 grid gap-3">
                  <RouteBox label="From" chain={route.fromChain} token={route.fromToken} note={route.fromNote} />
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setDirection(direction === 'buy' ? 'sell' : 'buy')}
                      className="-my-1 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300 text-black shadow-[0_18px_45px_rgba(19,164,255,0.25)] transition hover:scale-105"
                      aria-label="Reverse bridge route"
                    >
                      <ArrowDown className="h-5 w-5" />
                    </button>
                  </div>
                  <RouteBox label="To" chain={route.toChain} token={route.toToken} note={route.toNote} />
                </div>

                <div className="mt-5 rounded-[22px] border border-white/12 bg-black/24 p-5">
                  <label className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">Amount</label>
                  <div className="mt-3 flex items-end gap-3">
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      inputMode="decimal"
                      className="min-w-0 flex-1 bg-transparent text-4xl font-black tracking-[-0.05em] text-white outline-none placeholder:text-white/20"
                      placeholder="0.00"
                    />
                    <span className="mb-1 rounded-[12px] border border-cyan-300/25 bg-cyan-300/[0.10] px-3 py-2 text-sm font-black text-cyan-100">{route.fromToken}</span>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-white/42">You receive</p>
                      <p className="mt-1 font-black text-white">≈ {receiveText} {route.toToken}</p>
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-white/42">Fee</p>
                      <p className="mt-1 font-black text-white">0.2%</p>
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-white/42">Balance</p>
                      <p className="mt-1 font-black text-white">{balance === null ? '-' : `${formatUnits(balance, tokenDecimals, 4)} ${route.fromToken}`}</p>
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="mt-4 rounded-[18px] border border-red-300/25 bg-red-300/[0.08] p-4 text-sm leading-6 text-red-100">
                    {error}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3">
                  {!address || !provider ? (
                    <div className="rounded-[20px] border border-cyan-300/20 bg-cyan-300/[0.08] p-4">
                      <div className="flex items-start gap-3">
                        <Wallet className="mt-1 h-5 w-5 shrink-0 text-cyan-200" />
                        <div>
                          <p className="font-black text-white">Use the site wallet connection</p>
                          <p className="mt-1 text-sm leading-6 text-white/60">The bridge reads the same wallet published by the existing header connect button.</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void handlePrimaryAction()}
                    disabled={busy || !address || !provider || amountRaw <= 0n}
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] bg-cyan-300 px-5 py-4 text-base font-black text-black shadow-[0_18px_48px_rgba(19,164,255,0.30)] transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                    {busy ? 'Processing...' : buttonLabel}
                  </button>

                  {settlement.status === 'ready' ? (
                    <button
                      type="button"
                      onClick={() => void claimSettlement()}
                      disabled={busy || !address || !provider}
                      className="inline-flex min-h-13 items-center justify-center gap-2 rounded-[18px] border border-emerald-300/30 bg-emerald-300/[0.12] px-5 py-4 text-base font-black text-emerald-50 transition hover:bg-emerald-300/[0.18] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      {chainId === destinationChainId ? route.claimAction : `Switch to ${direction === 'buy' ? 'INRI Chain' : 'Polygon'} to claim`}
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/58">
                  <p className="font-bold text-white/78">Status</p>
                  <p className="mt-1">{status}</p>
                  <p className="mt-1">{settlement.message}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#02040a] py-12">
          <div className="mx-auto grid max-w-[1560px] gap-5 px-4 sm:px-8 lg:grid-cols-[1fr_0.86fr] xl:px-12">
            <div className="rounded-[26px] border border-cyan-300/18 bg-white/[0.045] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.36)] sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Live process</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Bridge timeline</h2>
                </div>
                <button
                  type="button"
                  onClick={() => sourceTx ? startSettlementPolling(direction, sourceTx) : undefined}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.04] text-white/70 transition hover:border-cyan-300/35 hover:text-cyan-100"
                  aria-label="Refresh bridge status"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {steps.map((step) => <StepPill key={step.label} step={step} />)}
              </div>

              <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
                <div className="rounded-[18px] border border-white/10 bg-black/24 p-4">
                  <p className="text-white/42">Source transaction</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Link href={sourceTx ? explorerTx(sourceChainId, sourceTx) : '#'} target="_blank" className="font-black text-white hover:text-cyan-200">
                      {shortHash(sourceTx)}
                    </Link>
                    {sourceTx ? <button type="button" onClick={() => copy(sourceTx, 'source')} className="text-cyan-200"><Copy className="h-4 w-4" /></button> : null}
                  </div>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-black/24 p-4">
                  <p className="text-white/42">Bridge API</p>
                  <p className="mt-2 break-all font-black text-white">{direction === 'buy' ? '/api/claim/:id' : '/api/release/:id'}</p>
                </div>
              </div>

              {settlement.raw ? (
                <details className="mt-5 rounded-[18px] border border-white/10 bg-black/24 p-4">
                  <summary className="cursor-pointer text-sm font-black text-white/80">Show watcher response</summary>
                  <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-[14px] bg-black/40 p-4 text-xs leading-5 text-white/55">{safeJsonString(settlement.raw)}</pre>
                </details>
              ) : null}
            </div>

            <div className="rounded-[26px] border border-cyan-300/18 bg-white/[0.045] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.36)] sm:p-7">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Safety</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Professional bridge rules</h2>
              <div className="mt-6 grid gap-3">
                {[
                  ['No contract changes', 'This page does not alter the working bridge server, watchers, PM2 processes or contracts.'],
                  ['Clear route preview', 'Users see source chain, destination chain, token, amount, fee and estimated receive before sending.'],
                  ['Safe fallbacks', 'If the API does not expose a raw claim transaction, the existing claim page remains available instead of guessing calldata.'],
                  ['Same wallet state', 'The page reads the wallet already connected by the site header.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[18px] border border-white/10 bg-black/24 p-4">
                    <p className="font-black text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/56">{text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`${BRIDGE_ORIGIN}/buy.html`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[14px] border border-cyan-300/25 bg-cyan-300/[0.09] px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/[0.14]">
                  Existing Buy Engine <ExternalLink className="h-4 w-4" />
                </Link>
                <Link href={`${BRIDGE_ORIGIN}/sell.html`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[14px] border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/72 transition hover:border-cyan-300/30 hover:text-white">
                  Existing Sell Engine <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[linear-gradient(180deg,#02040a,#04101e)] py-12">
          <div className="mx-auto max-w-[1560px] px-4 sm:px-8 xl:px-12">
            <div className="rounded-[26px] border border-cyan-300/18 bg-white/[0.045] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.36)] sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Recent activity</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Local bridge history</h2>
                </div>
                <p className="text-sm font-bold text-white/45">{copied ? 'Copied.' : 'Stored only in this browser.'}</p>
              </div>

              <div className="mt-6 grid gap-3">
                {history.length === 0 ? (
                  <div className="rounded-[18px] border border-white/10 bg-black/24 p-5 text-sm leading-6 text-white/52">
                    No bridge operations from this page yet.
                  </div>
                ) : history.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-white/10 bg-black/24 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-black text-white">{item.direction === 'buy' ? 'Buy iUSD' : 'Sell iUSD'} · {item.amount} → {item.receive}</p>
                        <p className="mt-1 text-sm text-white/45">{new Date(item.createdAt).toLocaleString()} · {item.status}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm font-black">
                        <Link href={explorerTx(item.direction === 'buy' ? POLYGON_CHAIN_ID : INRI_CHAIN_ID, item.sourceTx)} target="_blank" className="rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-white/68 hover:text-cyan-100">
                          {shortHash(item.sourceTx)}
                        </Link>
                        <button type="button" onClick={() => copy(item.id, 'id')} className="rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-white/68 hover:text-cyan-100">
                          Copy ID
                        </button>
                        {item.status !== 'done' ? (
                          <button type="button" onClick={() => { setSourceTx(item.id); startSettlementPolling(item.direction, item.id) }} className="rounded-[12px] border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-cyan-100">
                            Check
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
    </main>
  )
}
