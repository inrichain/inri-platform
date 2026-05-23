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
    <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
      <section className="relative border-b border-cyan-300/15 bg-[radial-gradient(circle_at_18%_14%,rgba(0,174,255,0.55),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(122,232,255,0.30),transparent_34rem),linear-gradient(135deg,#071a32_0%,#02040a_42%,#000_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.055)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute -left-28 top-24 h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-[1460px] px-4 py-8 sm:px-8 lg:py-10 xl:px-12">
          <div className="grid gap-5 lg:grid-cols-[0.74fr_0.92fr] lg:items-start">
            <aside className="rounded-[24px] border border-cyan-300/18 bg-white/[0.055] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl sm:p-6 lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 rounded-[10px] border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Official iUSD Bridge
              </div>

              <h1 className="mt-5 max-w-2xl text-[2.7rem] font-black leading-[0.88] tracking-[-0.075em] text-white sm:text-[3.6rem] xl:text-[4.6rem]">
                Bridge USDT and iUSD inside INRI.
              </h1>

              <p className="mt-5 max-w-xl text-sm font-semibold leading-7 text-cyan-50/70 sm:text-base">
                Tela única para o bridge que já funciona: conecta, aprova quando precisar, faz deposit/burn,
                detecta o watcher e mostra o claim no lugar certo.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ['0.2%', 'Fee'],
                  ['2 / 4', 'Signatures'],
                  ['3777', 'Chain ID'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[16px] border border-white/10 bg-white/[0.045] px-4 py-3">
                    <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-200/70">{label}</div>
                    <div className="mt-2 text-lg font-black text-white">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-2 text-xs font-bold text-white/56">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                  Polygon USDT → INRI iUSD
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                  INRI iUSD → Polygon USDT
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                  Auto-check a cada 5 segundos após a transação
                </div>
              </div>
            </aside>

            <div className="rounded-[24px] border border-cyan-300/20 bg-white/[0.065] p-3 shadow-[0_34px_110px_rgba(0,0,0,0.44),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl sm:p-4">
              <div className="rounded-[20px] border border-white/12 bg-[#061321]/82 p-4 sm:p-5">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Bridge</p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.045em] text-white sm:text-3xl">iUSD Transfer</h2>
                  </div>
                  <div className="w-full sm:w-auto">
                    <ConnectWalletButton compact />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-[16px] border border-white/10 bg-white/[0.035] p-1">
                  {(['buy', 'sell'] as Direction[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDirection(item)}
                      className={`rounded-[13px] px-4 py-2.5 text-sm font-black transition ${
                        direction === item
                          ? 'bg-cyan-300 text-black shadow-[0_12px_30px_rgba(19,164,255,0.22)]'
                          : 'text-white/55 hover:bg-white/[0.055] hover:text-white'
                      }`}
                    >
                      {item === 'buy' ? 'Buy iUSD' : 'Sell iUSD'}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-2.5">
                  <div className="rounded-[18px] border border-cyan-300/16 bg-white/[0.045] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">From</p>
                        <p className="mt-2 text-2xl font-black text-white">{route.fromToken}</p>
                        <p className="mt-1 text-sm font-bold text-cyan-200/72">{route.fromChain}</p>
                      </div>
                      <span className="rounded-full border border-cyan-300/22 bg-cyan-300/[0.09] px-3 py-1.5 text-xs font-black text-cyan-100">
                        Source
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setDirection(direction === 'buy' ? 'sell' : 'buy')}
                      className="-my-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300 text-black shadow-[0_14px_32px_rgba(19,164,255,0.24)] transition hover:scale-105"
                      aria-label="Reverse bridge route"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-[18px] border border-cyan-300/16 bg-white/[0.045] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">To</p>
                        <p className="mt-2 text-2xl font-black text-white">{route.toToken}</p>
                        <p className="mt-1 text-sm font-bold text-cyan-200/72">{route.toChain}</p>
                      </div>
                      <span className="rounded-full border border-emerald-300/22 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-black text-emerald-100">
                        Auto claim
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[18px] border border-cyan-300/16 bg-white/[0.045] p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-white/44">Amount</label>
                    <button type="button" onClick={setMax} className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200/80 hover:text-cyan-100">
                      Max
                    </button>
                  </div>

                  <div className="flex items-center gap-3 rounded-[15px] border border-white/10 bg-[#020914]/58 px-3 py-2.5">
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      inputMode="decimal"
                      className="min-w-0 flex-1 bg-transparent text-2xl font-black tracking-[-0.035em] text-white outline-none placeholder:text-white/22 sm:text-3xl"
                      placeholder="0.00"
                    />
                    <span className="shrink-0 rounded-[12px] border border-cyan-300/25 bg-cyan-300/[0.10] px-3 py-2 text-sm font-black text-cyan-100">
                      {route.fromToken}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                    <div className="rounded-[14px] border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-white/42">You receive</p>
                      <p className="mt-1 font-black text-white">≈ {receiveText} {route.toToken}</p>
                    </div>
                    <div className="rounded-[14px] border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-white/42">Fee</p>
                      <p className="mt-1 font-black text-white">0.2%</p>
                    </div>
                    <div className="rounded-[14px] border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-white/42">Balance</p>
                      <p className="mt-1 truncate font-black text-white">
                        {balance === null ? '-' : `${formatUnits(balance, decimals, 4)} ${route.fromToken}`}
                      </p>
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="mt-3 rounded-[16px] border border-red-300/25 bg-red-300/[0.08] p-3 text-sm leading-6 text-red-100">
                    <div className="flex gap-2">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void submitSourceTx()}
                    disabled={busy || !connected || amountRaw <= 0n || !balanceEnough}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-cyan-300 px-4 py-3 text-sm font-black text-black shadow-[0_18px_45px_rgba(19,164,255,0.26)] transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {busy ? 'Processing...' : mainButtonText}
                  </button>

                  <button
                    type="button"
                    onClick={() => void claimDestination()}
                    disabled={busy || !connected || !claim.id || (claim.status !== 'ready' && !claim.tx)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-white/12 bg-white/[0.045] px-4 py-3 text-sm font-black text-white/72 transition hover:border-cyan-300/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-42"
                  >
                    {claim.status === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {claim.status === 'ready'
                      ? onClaimNetwork
                        ? route.claimAction
                        : `Switch to ${route.toChain} to claim`
                      : 'Claim when ready'}
                  </button>
                </div>

                <div className="mt-4 rounded-[16px] border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-white/60">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-white/82">Status</p>
                      <p className="mt-1">{status}</p>
                      <p className="mt-1">{claim.message}</p>
                    </div>
                    {bridgeIds.length ? (
                      <button
                        type="button"
                        onClick={() => void checkApi(bridgeIds)}
                        className="mt-2 inline-flex items-center gap-2 rounded-[12px] border border-cyan-300/18 bg-cyan-300/[0.08] px-3 py-2 text-xs font-black text-cyan-100 sm:mt-0"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Check
                      </button>
                    ) : null}
                  </div>
                  {claim.id ? <p className="mt-2 break-all text-xs font-bold text-cyan-200/70">ID: {claim.id}</p> : null}
                  {sourceTx ? (
                    <p className="mt-2 text-xs">
                      TX:{' '}
                      <Link href={explorerTx(route.sourceChain, sourceTx)} target="_blank" rel="noreferrer" className="font-black text-cyan-200 hover:text-cyan-100">
                        {short(sourceTx, 10, 8)}
                      </Link>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[24px] border border-cyan-300/18 bg-white/[0.055] p-5 shadow-[0_26px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Process</p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">Live bridge steps</h3>
                </div>
                <button
                  type="button"
                  onClick={() => bridgeIds.length ? void checkApi(bridgeIds) : undefined}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/12 bg-white/[0.04] text-white/70 transition hover:border-cyan-300/35 hover:text-cyan-100"
                  aria-label="Refresh status"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Step label="Wallet" value={connected ? `${short(address)} connected` : 'Connect wallet in the header or bridge card.'} done={connected} />
                <Step label="Network" value={onSourceNetwork ? `${route.fromChain} selected` : `Switch to ${route.fromChain}.`} active={connected && !onSourceNetwork} done={onSourceNetwork} />
                <Step label={direction === 'buy' ? 'Approve / Deposit' : 'Burn'} value={sourceTx ? `Submitted: ${short(sourceTx, 10, 8)}` : direction === 'buy' ? 'Approve USDT only if needed, then deposit.' : 'Burn iUSD to request Polygon release.'} active={busy} done={Boolean(sourceTx)} />
                <Step label="Claim" value={claim.status === 'ready' ? 'Ready to claim.' : claim.status === 'done' ? 'Completed.' : claim.message} active={claim.status === 'checking'} done={claim.status === 'done'} />
              </div>
            </div>

            <div className="rounded-[24px] border border-cyan-300/18 bg-white/[0.055] p-5 shadow-[0_26px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Tools</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">Safe helpers</h3>
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => void addIusdToken()}
                  className="inline-flex items-center justify-center gap-2 rounded-[15px] border border-cyan-300/22 bg-cyan-300/[0.09] px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/[0.14]"
                >
                  Add iUSD token
                  <Wallet className="h-4 w-4" />
                </button>
                <Link
                  href={`${BRIDGE_ORIGIN}/${direction === 'buy' ? 'buy.html' : 'sell.html'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[15px] border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/72 transition hover:border-cyan-300/30 hover:text-white"
                >
                  Recovery old page
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-4 text-xs leading-6 text-white/50">
                Esta página só controla a experiência do usuário. Não altera contratos, watchers, PM2, claims nem releases.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-cyan-300/18 bg-white/[0.055] p-5 shadow-[0_26px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Recent</p>
                <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">Local bridge history</h3>
              </div>
              <p className="text-xs font-bold text-white/45">{copied ? 'Copied.' : 'Saved only in this browser.'}</p>
            </div>

            <div className="mt-4 grid gap-2">
              {history.length === 0 ? (
                <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-4 text-sm text-white/52">
                  No bridge operations from this page yet.
                </div>
              ) : history.map((item) => (
                <div key={`${item.id}-${item.tx}`} className="rounded-[16px] border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-black text-white">
                        {item.direction === 'buy' ? 'Buy iUSD' : 'Sell iUSD'} · {item.amount} {item.direction === 'buy' ? 'USDT' : 'iUSD'} → {item.receive} {item.direction === 'buy' ? 'iUSD' : 'USDT'}
                      </p>
                      <p className="mt-1 text-xs text-white/45">{new Date(item.createdAt).toLocaleString()} · {item.status}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-black">
                      <Link href={explorerTx(item.direction === 'buy' ? POLYGON_CHAIN_ID : INRI_CHAIN_ID, item.tx)} target="_blank" rel="noreferrer" className="rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-white/68 hover:text-cyan-100">
                        {short(item.tx, 10, 8)}
                      </Link>
                      <button type="button" onClick={() => copyText(item.id, 'id')} className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-white/68 hover:text-cyan-100">
                        <Copy className="h-3.5 w-3.5" />
                        Copy ID
                      </button>
                      {item.status !== 'done' ? (
                        <button type="button" onClick={() => { setDirection(item.direction); setBridgeIds([item.id]); setSourceTx(item.tx); void checkApi([item.id]) }} className="rounded-[12px] border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-cyan-100">
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
