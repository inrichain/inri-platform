'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDown,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wallet,
  Zap,
} from 'lucide-react'
import { ConnectWalletButton } from '@/components/connect-wallet-button'

const BRIDGE_ORIGIN = 'https://iusd-bridge.inri.life'
const CLAIM_API = `${BRIDGE_ORIGIN}/api/claim`
const RELEASE_API = `${BRIDGE_ORIGIN}/api/release`

const POLYGON_CHAIN_ID = '0x89'
const INRI_CHAIN_ID = '0xec1'
const POLYGON_USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const POLYGON_LOCKBOX = '0x7E2e6d4881e1470D541599397b4876b449296071'
const INRI_IUSD = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'

const FEE_BPS = 20n
const BPS_DENOMINATOR = 10_000n

const SELECTOR = {
  approve: '0x095ea7b3',
  allowance: '0xdd62ed3e',
  balanceOf: '0x70a08231',
  decimals: '0x313ce567',
  deposit: '0xb6b55f25',
  burn: '0x42966c68',
}

type ProviderLike = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>
}

type ActiveWalletState = {
  connector: '' | 'injected' | 'walletconnect'
  address: string
  chainId: string
  provider?: ProviderLike
} | null

type Direction = 'buy' | 'sell'
type ApiTx = { to: string; data: string; value?: string }
type ClaimState = {
  status: 'idle' | 'checking' | 'waiting' | 'ready' | 'done' | 'error'
  message: string
  id?: string
  tx?: ApiTx | null
  raw?: unknown
}
type HistoryItem = {
  id: string
  direction: Direction
  amount: string
  receive: string
  tx: string
  status: string
  createdAt: number
}

function getWalletState(): ActiveWalletState {
  if (typeof window === 'undefined') return null
  return (window as Window & { __INRI_ACTIVE_WALLET__?: ActiveWalletState }).__INRI_ACTIVE_WALLET__ ?? null
}

function normalizeChainId(chainId?: string | number | null) {
  if (chainId === null || chainId === undefined) return ''
  const value = String(chainId).trim().toLowerCase()
  if (value.startsWith('0x')) return value
  const asNumber = Number(value)
  return Number.isFinite(asNumber) ? `0x${asNumber.toString(16)}` : value
}

function isAddress(value?: string | null) {
  return /^0x[a-fA-F0-9]{40}$/.test(value || '')
}

function short(value?: string | null, left = 6, right = 4) {
  if (!value) return '-'
  return `${value.slice(0, left)}...${value.slice(-right)}`
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
  return `${SELECTOR.approve}${encodeAddress(spender)}${encodeUint256(amount)}`
}

function encodeAllowance(owner: string, spender: string) {
  return `${SELECTOR.allowance}${encodeAddress(owner)}${encodeAddress(spender)}`
}

function encodeBalanceOf(owner: string) {
  return `${SELECTOR.balanceOf}${encodeAddress(owner)}`
}

function encodeAmount(selector: string, amount: bigint) {
  return `${selector}${encodeUint256(amount)}`
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

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(localStorage.getItem('inri_site_bridge_history_v3') || '[]')
    return Array.isArray(parsed) ? parsed.slice(0, 6) : []
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('inri_site_bridge_history_v3', JSON.stringify(items.slice(0, 6)))
}

function looksLikeBridgeId(value: string) {
  const v = value.toLowerCase()
  if (!/^0x[a-f0-9]{64}$/.test(v)) return false
  if (/^0x0+$/.test(v)) return false
  if (/^0x0{24,}/.test(v)) return false
  return true
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean).map((value) => value.toLowerCase()))]
}

function extractBridgeIds(receipt: any, preferredAddress: string, fallbackHash: string) {
  const logs = Array.isArray(receipt?.logs) ? receipt.logs : []
  const preferred = preferredAddress.toLowerCase()
  const first: string[] = []
  const fallback: string[] = []

  for (const log of logs) {
    const target = String(log?.address || '').toLowerCase() === preferred ? first : fallback
    const topics = Array.isArray(log?.topics) ? log.topics.slice(1) : []

    for (const topic of topics) {
      if (typeof topic === 'string' && looksLikeBridgeId(topic)) target.push(topic)
    }

    const data = typeof log?.data === 'string' ? log.data.replace(/^0x/, '') : ''
    for (let offset = 0; offset + 64 <= data.length; offset += 64) {
      const chunk = `0x${data.slice(offset, offset + 64)}`
      if (looksLikeBridgeId(chunk)) target.push(chunk)
    }
  }

  return unique([...first, ...fallback, fallbackHash])
}

function findApiTx(value: any): ApiTx | null {
  if (!value || typeof value !== 'object') return null
  const candidates = [
    value,
    value.tx,
    value.transaction,
    value.request,
    value.claimTx,
    value.releaseTx,
    value.call,
    value.payload,
    value.result,
  ]

  for (const item of candidates) {
    if (!item || typeof item !== 'object') continue
    const to = item.to || item.target || item.contract || item.contractAddress
    const data = item.data || item.calldata || item.input
    if (typeof to === 'string' && typeof data === 'string' && isAddress(to) && data.startsWith('0x')) {
      return { to, data, value: typeof item.value === 'string' ? item.value : undefined }
    }
  }

  for (const item of Object.values(value)) {
    const nested = findApiTx(item)
    if (nested) return nested
  }

  return null
}

function apiLooksReady(value: any) {
  if (!value || typeof value !== 'object') return false
  if (findApiTx(value)) return true
  const status = String(value.status || value.state || value.phase || '').toLowerCase()
  if (['ready', 'claimable', 'claim_ready', 'release_ready', 'ok'].includes(status)) return true
  if (value.ready === true || value.claimable === true || value.releaseReady === true) return true
  if (Array.isArray(value.signatures) && value.signatures.length >= 2) return true
  return false
}

async function ethCall(provider: ProviderLike, to: string, data: string, from?: string) {
  const result = await provider.request({
    method: 'eth_call',
    params: [{ to, data, ...(from ? { from } : {}) }, 'latest'],
  })
  return typeof result === 'string' && result.startsWith('0x') ? result : '0x0'
}

async function sendTx(provider: ProviderLike, from: string, to: string, data: string, value?: string) {
  const tx = { from, to, data, ...(value ? { value } : {}) }
  await provider.request({ method: 'eth_estimateGas', params: [tx] })
  const hash = await provider.request({ method: 'eth_sendTransaction', params: [tx] })
  if (typeof hash !== 'string') throw new Error('Wallet did not return a transaction hash.')
  return hash
}

async function waitForReceipt(provider: ProviderLike, txHash: string) {
  for (let i = 0; i < 90; i += 1) {
    const receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [txHash] })
    if (receipt) return receipt
    await new Promise((resolve) => window.setTimeout(resolve, 2500))
  }
  return null
}

function explorerTx(chainId: string, tx: string) {
  return normalizeChainId(chainId) === POLYGON_CHAIN_ID
    ? `https://polygonscan.com/tx/${tx}`
    : `https://explorer.inri.life/tx/${tx}`
}

function Step({ label, value, active, done }: { label: string; value: string; active?: boolean; done?: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-3 py-3 ${
        done
          ? 'border-emerald-300/25 bg-emerald-300/[0.08]'
          : active
            ? 'border-cyan-300/35 bg-cyan-300/[0.10]'
            : 'border-white/10 bg-white/[0.035]'
      }`}
    >
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
        {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" /> : active ? <Clock3 className="h-3.5 w-3.5 text-cyan-200" /> : <span className="h-2 w-2 rounded-full bg-white/25" />}
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold leading-relaxed text-white/75">{value}</div>
    </div>
  )
}

export function InriBridgePage() {
  const [wallet, setWallet] = useState<ActiveWalletState>(null)
  const [direction, setDirection] = useState<Direction>('buy')
  const [amount, setAmount] = useState('1')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('Ready. Connect wallet and choose an amount.')
  const [error, setError] = useState('')
  const [balance, setBalance] = useState<bigint | null>(null)
  const [allowance, setAllowance] = useState<bigint | null>(null)
  const [decimals, setDecimals] = useState(6)
  const [sourceTx, setSourceTx] = useState('')
  const [bridgeIds, setBridgeIds] = useState<string[]>([])
  const [claim, setClaim] = useState<ClaimState>({ status: 'idle', message: 'No transfer submitted yet.' })
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [copied, setCopied] = useState('')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const injectedProvider = typeof window !== 'undefined' ? ((window as any).ethereum as ProviderLike | undefined) : undefined
  const provider = wallet?.provider || injectedProvider
  const address = wallet?.address || ''
  const chainId = normalizeChainId(wallet?.chainId)

  const route = direction === 'buy'
    ? {
        title: 'Buy iUSD',
        fromToken: 'USDT',
        fromChain: 'Polygon',
        toToken: 'iUSD',
        toChain: 'INRI Chain',
        sourceChain: POLYGON_CHAIN_ID,
        destinationChain: INRI_CHAIN_ID,
        token: POLYGON_USDT,
        bridgeContract: POLYGON_LOCKBOX,
        primaryAction: 'Bridge USDT to iUSD',
        claimAction: 'Claim iUSD',
        api: CLAIM_API,
      }
    : {
        title: 'Sell iUSD',
        fromToken: 'iUSD',
        fromChain: 'INRI Chain',
        toToken: 'USDT',
        toChain: 'Polygon',
        sourceChain: INRI_CHAIN_ID,
        destinationChain: POLYGON_CHAIN_ID,
        token: INRI_IUSD,
        bridgeContract: INRI_IUSD,
        primaryAction: 'Bridge iUSD to USDT',
        claimAction: 'Claim USDT',
        api: RELEASE_API,
      }

  const amountRaw = useMemo(() => parseUnits(amount, decimals), [amount, decimals])
  const receiveRaw = useMemo(() => (amountRaw * (BPS_DENOMINATOR - FEE_BPS)) / BPS_DENOMINATOR, [amountRaw])
  const receiveText = useMemo(() => formatUnits(receiveRaw, decimals, 6), [receiveRaw, decimals])
  const connected = Boolean(address && provider)
  const onSourceNetwork = chainId === route.sourceChain
  const onClaimNetwork = chainId === route.destinationChain
  const balanceEnough = balance === null || amountRaw <= balance
  const allowanceEnough = direction === 'sell' || (allowance !== null && allowance >= amountRaw && amountRaw > 0n)

  useEffect(() => {
    setWallet(getWalletState())
    setHistory(loadHistory())
    const onWallet = () => setWallet(getWalletState())
    window.addEventListener('inri:wallet-state', onWallet)
    window.addEventListener('accountsChanged', onWallet)
    window.addEventListener('chainChanged', onWallet)
    return () => {
      window.removeEventListener('inri:wallet-state', onWallet)
      window.removeEventListener('accountsChanged', onWallet)
      window.removeEventListener('chainChanged', onWallet)
    }
  }, [])

  useEffect(() => {
    setError('')
    setSourceTx('')
    setBridgeIds([])
    setClaim({ status: 'idle', message: 'No transfer submitted yet.' })
    setAllowance(null)
    setBalance(null)
    setDecimals(6)
    if (pollingRef.current) clearInterval(pollingRef.current)
  }, [direction])

  useEffect(() => {
    if (!provider || !address || !onSourceNetwork) return
    void refreshTokenState()
  }, [provider, address, chainId, direction])

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  async function refreshTokenState() {
    if (!provider || !address) return
    try {
      const balanceHex = await ethCall(provider, route.token, encodeBalanceOf(address), address)
      const decimalsHex = await ethCall(provider, route.token, SELECTOR.decimals, address)
      const nextDecimals = Number.parseInt(decimalsHex || '0x6', 16)
      setDecimals(Number.isFinite(nextDecimals) && nextDecimals > 0 && nextDecimals <= 36 ? nextDecimals : 6)
      setBalance(BigInt(balanceHex || '0x0'))

      if (direction === 'buy') {
        const allowanceHex = await ethCall(provider, POLYGON_USDT, encodeAllowance(address, POLYGON_LOCKBOX), address)
        setAllowance(BigInt(allowanceHex || '0x0'))
      }
    } catch (err: any) {
      setError(err?.message || 'Could not read balance/allowance.')
    }
  }

  async function switchNetwork(targetChain = route.sourceChain) {
    if (!provider) {
      setError('Connect wallet first.')
      return false
    }

    const polygon = targetChain === POLYGON_CHAIN_ID
    setBusy(true)
    setError('')

    try {
      try {
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetChain }] })
      } catch {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            polygon
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
      setStatus(`Network switched to ${polygon ? 'Polygon' : 'INRI Chain'}.`)
      return true
    } catch (err: any) {
      setError(err?.message || 'Could not switch network.')
      return false
    } finally {
      setBusy(false)
    }
  }

  function addHistory(item: HistoryItem) {
    const next = [item, ...history.filter((old) => old.id !== item.id)].slice(0, 6)
    setHistory(next)
    saveHistory(next)
  }

  function updateHistory(id: string, statusText: string) {
    const next = history.map((item) => (item.id === id ? { ...item, status: statusText } : item))
    setHistory(next)
    saveHistory(next)
  }

  async function approveUsdt() {
    if (!provider || !address || amountRaw <= 0n) return
    setStatus('Approving USDT for the official lockbox...')
    const hash = await sendTx(provider, address, POLYGON_USDT, encodeApprove(POLYGON_LOCKBOX, amountRaw))
    setStatus(`Approval sent: ${short(hash, 10, 8)}. Waiting confirmation...`)
    await waitForReceipt(provider, hash)
    await refreshTokenState()
    setStatus('USDT approval confirmed. Continue with deposit.')
  }

  async function submitSourceTx() {
    if (!provider || !address) return
    if (amountRaw <= 0n) {
      setError('Enter a valid amount.')
      return
    }
    if (!onSourceNetwork) {
      await switchNetwork(route.sourceChain)
      return
    }
    if (!balanceEnough) {
      setError(`Insufficient ${route.fromToken} balance.`)
      return
    }

    setBusy(true)
    setError('')

    try {
      if (direction === 'buy' && !allowanceEnough) {
        await approveUsdt()
        return
      }

      const to = direction === 'buy' ? POLYGON_LOCKBOX : INRI_IUSD
      const data = direction === 'buy'
        ? encodeAmount(SELECTOR.deposit, amountRaw)
        : encodeAmount(SELECTOR.burn, amountRaw)

      setStatus(direction === 'buy' ? 'Depositing USDT into the Polygon lockbox...' : 'Burning iUSD on INRI...')
      const txHash = await sendTx(provider, address, to, data)
      setSourceTx(txHash)
      setStatus(`Transaction sent: ${short(txHash, 10, 8)}. Waiting confirmation...`)

      const receipt = await waitForReceipt(provider, txHash)
      const ids = extractBridgeIds(receipt, to, txHash)
      setBridgeIds(ids)
      setClaim({ status: 'checking', message: 'Transaction confirmed. Checking watcher signatures...', id: ids[0] })

      addHistory({
        id: ids[0] || txHash,
        direction,
        amount,
        receive: receiveText,
        tx: txHash,
        status: 'submitted',
        createdAt: Date.now(),
      })

      startPolling(ids)
    } catch (err: any) {
      setError(err?.message || 'Bridge transaction failed.')
    } finally {
      setBusy(false)
    }
  }

  async function checkApi(ids = bridgeIds, silent = false) {
    const nextIds = unique(ids)
    if (!nextIds.length) return

    if (!silent) setClaim({ status: 'checking', message: 'Checking watcher signatures...', id: nextIds[0] })

    for (const id of nextIds) {
      try {
        const response = await fetch(`${route.api}/${encodeURIComponent(id)}`, { cache: 'no-store' })
        if (!response.ok) continue
        const json = await response.json()
        const ready = apiLooksReady(json)
        const tx = findApiTx(json)
        setClaim({
          status: ready ? 'ready' : 'waiting',
          message: ready ? 'Ready to claim. Confirm the final wallet transaction.' : 'Watcher found the transfer and is preparing signatures.',
          id,
          tx,
          raw: json,
        })
        if (ready) updateHistory(id, 'ready')
        return
      } catch (err: any) {
        setClaim({ status: 'error', message: err?.message || 'Could not reach bridge API.', id })
      }
    }

    setClaim({
      status: 'waiting',
      message: 'Watcher has not published this claim/release yet. The page keeps checking automatically.',
      id: nextIds[0],
    })
  }

  function startPolling(ids: string[]) {
    const nextIds = unique(ids)
    if (pollingRef.current) clearInterval(pollingRef.current)
    void checkApi(nextIds)
    pollingRef.current = setInterval(() => void checkApi(nextIds, true), 5000)
  }

  async function claimDestination() {
    if (!provider || !address) return
    const id = claim.id || bridgeIds[0]
    if (!id) return

    if (!onClaimNetwork) {
      await switchNetwork(route.destinationChain)
      return
    }

    setBusy(true)
    setError('')

    try {
      if (!claim.tx) {
        window.open(`${BRIDGE_ORIGIN}/claim.html?id=${encodeURIComponent(id)}`, '_blank', 'noopener,noreferrer')
        setStatus('Opened the safe recovery claim page because this API response did not expose raw calldata.')
        return
      }

      const hash = await sendTx(provider, address, claim.tx.to, claim.tx.data, claim.tx.value)
      setStatus(`Claim sent: ${short(hash, 10, 8)}. Waiting confirmation...`)
      await waitForReceipt(provider, hash)
      setClaim((old) => ({ ...old, status: 'done', message: 'Bridge completed successfully.' }))
      updateHistory(id, 'done')
    } catch (err: any) {
      setError(err?.message || 'Claim transaction failed.')
    } finally {
      setBusy(false)
    }
  }

  async function addIusdToken() {
    if (!provider) return
    try {
      await provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: INRI_IUSD,
            symbol: 'iUSD',
            decimals,
            image: 'https://platform.inri.life/inri-logo.png',
          },
        },
      })
    } catch {}
  }

  function copyText(value: string, label: string) {
    if (!value || typeof navigator === 'undefined') return
    void navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1200)
  }

  function setMax() {
    if (balance === null) return
    setAmount(formatUnits(balance, decimals, Math.min(decimals, 6)))
  }

  const mainButtonText = !connected
    ? 'Connect wallet first'
    : !onSourceNetwork
      ? `Switch to ${route.fromChain}`
      : !balanceEnough
        ? `Insufficient ${route.fromToken}`
        : direction === 'buy' && !allowanceEnough
          ? 'Approve USDT'
          : route.primaryAction

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="rounded-[28px] border border-white/10 bg-black/25 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100">
            <ShieldCheck className="h-3.5 w-3.5" /> Official iUSD Bridge
          </div>
          <h1 className="mt-4 max-w-[560px] text-4xl font-black leading-[0.95] tracking-[-0.07em] text-white sm:text-5xl lg:text-6xl">
            Bridge USDT and iUSD inside INRI.
          </h1>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-white/64 sm:text-base">
            One clean screen for the working bridge: connect, approve when needed, deposit or burn, auto-detect watcher signatures and claim.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ['0.2%', 'Fee'],
              ['2 / 4', 'Signatures'],
              ['3777', 'Chain ID'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="text-lg font-black text-white">{value}</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-cyan-300/20 bg-[#071322]/88 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/85">Bridge</div>
              <h2 className="text-2xl font-black tracking-[-0.05em] text-white">iUSD Transfer</h2>
            </div>
            <div className="w-full sm:w-auto">
              <ConnectWalletButton />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/24 p-1.5">
            {(['buy', 'sell'] as Direction[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDirection(item)}
                className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                  direction === item
                    ? 'bg-cyan-300 text-black shadow-[0_12px_35px_rgba(19,164,255,0.22)]'
                    : 'text-white/55 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {item === 'buy' ? 'Buy iUSD' : 'Sell iUSD'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-cyan-300/15 bg-white/[0.035] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">From</div>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <div className="text-2xl font-black text-white">{route.fromToken}</div>
                  <div className="text-sm font-black text-cyan-100/70">{route.fromChain}</div>
                </div>
                <button type="button" onClick={() => void switchNetwork(route.sourceChain)} className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/[0.14]">
                  {onSourceNetwork ? 'Selected' : 'Switch'}
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setDirection(direction === 'buy' ? 'sell' : 'buy')}
                className="-my-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300 text-black shadow-[0_14px_35px_rgba(19,164,255,0.22)] transition hover:scale-105"
                aria-label="Reverse route"
              >
                <ArrowDown className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-cyan-300/15 bg-white/[0.035] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">To</div>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <div className="text-2xl font-black text-white">{route.toToken}</div>
                  <div className="text-sm font-black text-cyan-100/70">{route.toChain}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-black text-white/48">Auto claim</div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Amount</span>
              <button type="button" onClick={setMax} className="text-xs font-black text-cyan-100 hover:text-white">MAX</button>
            </div>
            <div className="flex items-center gap-3">
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent text-4xl font-black tracking-[-0.06em] text-white outline-none placeholder:text-white/20"
                placeholder="0.00"
              />
              <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-sm font-black text-cyan-100">{route.fromToken}</div>
            </div>
            <div className="mt-4 grid gap-2 text-xs font-bold text-white/55 sm:grid-cols-3">
              <div className="rounded-xl bg-white/[0.035] p-3">
                <div className="text-white/35">You receive</div>
                <div className="mt-1 text-white">≈ {receiveText} {route.toToken}</div>
              </div>
              <div className="rounded-xl bg-white/[0.035] p-3">
                <div className="text-white/35">Fee</div>
                <div className="mt-1 text-white">0.2%</div>
              </div>
              <div className="rounded-xl bg-white/[0.035] p-3">
                <div className="text-white/35">Balance</div>
                <div className="mt-1 text-white">{balance === null ? '-' : `${formatUnits(balance, decimals, 4)} ${route.fromToken}`}</div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-300/25 bg-red-300/[0.08] p-3 text-sm font-semibold text-red-100">
              <CircleAlert className="mr-2 inline h-4 w-4" /> {error}
            </div>
          ) : null}

          {!connected ? (
            <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] p-3 text-sm font-semibold text-cyan-50/80">
              <Wallet className="mr-2 inline h-4 w-4" /> Connect once using the site wallet. The bridge uses the same wallet state as the header.
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => void submitSourceTx()}
              disabled={busy || !connected || amountRaw <= 0n || !balanceEnough}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-4 text-base font-black text-black shadow-[0_18px_48px_rgba(19,164,255,0.26)] transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
              {busy ? 'Processing...' : mainButtonText}
            </button>

            <button
              type="button"
              onClick={() => void claimDestination()}
              disabled={busy || !connected || claim.status !== 'ready'}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.10] px-5 py-4 text-base font-black text-emerald-50 transition hover:bg-emerald-300/[0.16] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              {onClaimNetwork ? route.claimAction : `Switch to ${route.toChain} to claim`}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[26px] border border-white/10 bg-black/25 p-4 backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/80">Live process</div>
              <h3 className="text-xl font-black text-white">Bridge timeline</h3>
            </div>
            <button type="button" onClick={() => void checkApi()} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 hover:border-cyan-300/35 hover:text-cyan-100">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Step label="Wallet" value={connected ? `${short(address)} connected` : 'Connect wallet'} done={connected} />
            <Step label="Network" value={onSourceNetwork ? `${route.fromChain} selected` : `Switch to ${route.fromChain}`} done={onSourceNetwork} active={connected && !onSourceNetwork} />
            <Step label={direction === 'buy' ? 'Approve / Deposit' : 'Burn'} value={sourceTx ? short(sourceTx, 10, 8) : direction === 'buy' ? 'Approve only if needed, then deposit' : 'Burn iUSD to request release'} done={Boolean(sourceTx)} active={busy && !sourceTx} />
            <Step label="Claim" value={claim.message} done={claim.status === 'done'} active={claim.status === 'checking' || claim.status === 'ready'} />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm font-semibold text-white/68">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Status</div>
            <div className="mt-2 text-white/82">{status}</div>
            <div className="mt-1 text-white/55">{claim.message}</div>
            {claim.id ? <div className="mt-2 break-all text-xs text-cyan-100/70">Bridge ID: {claim.id}</div> : null}
            {sourceTx ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={explorerTx(route.sourceChain, sourceTx)} target="_blank" className="inline-flex items-center gap-1 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/[0.14]">
                  View source TX <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <button type="button" onClick={() => copyText(sourceTx, 'tx')} className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/70 hover:text-white">
                  <Copy className="h-3.5 w-3.5" /> {copied === 'tx' ? 'Copied' : 'Copy TX'}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-black/25 p-4 backdrop-blur-xl sm:p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/80">Safety</div>
          <h3 className="mt-1 text-xl font-black text-white">Clean user flow</h3>
          <div className="mt-4 space-y-3">
            {[
              ['No backend changes', 'This page does not touch contracts, PM2, watchers, claims or releases.'],
              ['Auto watcher check', 'After deposit or burn, it checks the current bridge APIs automatically.'],
              ['Safe fallback', 'If raw calldata is not exposed, it opens the existing claim page as recovery.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <div className="font-black text-white">{title}</div>
                <div className="mt-1 text-sm font-semibold leading-6 text-white/55">{text}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => void addIusdToken()} className="rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/[0.14]">
              Add iUSD token
            </button>
            <Link href={`${BRIDGE_ORIGIN}/${direction === 'buy' ? 'buy.html' : 'sell.html'}`} target="_blank" className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/70 hover:text-white">
              Recovery page
            </Link>
          </div>
        </div>
      </div>

      {history.length ? (
        <div className="mt-5 rounded-[26px] border border-white/10 bg-black/25 p-4 backdrop-blur-xl sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Recent bridge activity</h3>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Local only</div>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {history.map((item) => (
              <div key={`${item.id}-${item.createdAt}`} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-black text-white">{item.direction === 'buy' ? 'Buy iUSD' : 'Sell iUSD'}</div>
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">{item.status}</div>
                </div>
                <div className="mt-2 font-semibold text-white/55">{item.amount} → ≈ {item.receive}</div>
                <div className="mt-1 break-all text-xs text-white/35">{short(item.id, 10, 8)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
