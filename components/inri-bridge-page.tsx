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
import { Interface } from 'ethers'
import { ConnectWalletButton } from '@/components/connect-wallet-button'

const BRIDGE_ORIGIN = 'https://iusd-bridge.inri.life'
const CLAIM_API = `${BRIDGE_ORIGIN}/api/claim`
const RELEASE_API = `${BRIDGE_ORIGIN}/api/release`
const PENDING_API = `${BRIDGE_ORIGIN}/api/pending`

const POLYGON_CHAIN_ID = '0x89'
const INRI_CHAIN_ID = '0xec1'
const POLYGON_USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const POLYGON_LOCKBOX = '0x7E2e6d4881e1470D541599397b4876b449296071'
const INRI_IUSD = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'
const INRI_EXECUTOR = '0x07DE046e96c33a8E575234282e1CccAC56d3d880'

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

type PendingItem = {
  id: string
  kind: 'claim' | 'release'
  direction: Direction
  status?: string
  recipient?: string
  amount?: string
  grossAmount?: string
  fee?: string
  createdAt?: string
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

const MINT_IFACE = new Interface([
  'function mintFromPolygonDeposit(address recipient,uint256 amount,bytes32 depositId,uint256 deadline,bytes[] signatures)',
])

const RELEASE_IFACE = new Interface([
  'function release(address recipient,uint256 amount,uint256 nonce,uint256 deadline,bytes[] signatures)',
])

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

function formatTokenAmount(value?: string, decimals = 6) {
  try {
    if (!value) return '-'
    return formatUnits(BigInt(value), decimals, 6)
  } catch {
    return value || '-'
  }
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

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(localStorage.getItem('inri_site_bridge_history_v5') || '[]')
    return Array.isArray(parsed) ? parsed.slice(0, 6) : []
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('inri_site_bridge_history_v5', JSON.stringify(items.slice(0, 6)))
}

function hasTwoSignatures(value: any) {
  return Array.isArray(value?.signatures) && value.signatures.length >= 2
}

function buildTxFromBridgeApi(value: any): ApiTx | null {
  if (!value || typeof value !== 'object') return null

  const claim = value.claim && typeof value.claim === 'object' ? value.claim : value.type === 'mint' ? value : null
  if (claim && claim.recipient && claim.amount && claim.depositId && claim.deadline && hasTwoSignatures(claim)) {
    return {
      to: typeof value.executor === 'string' && isAddress(value.executor) ? value.executor : INRI_EXECUTOR,
      data: MINT_IFACE.encodeFunctionData('mintFromPolygonDeposit', [
        claim.recipient,
        claim.amount,
        claim.depositId,
        claim.deadline,
        claim.signatures,
      ]),
      value: '0x0',
    }
  }

  const release = value.release && typeof value.release === 'object' ? value.release : value.type === 'release' ? value : null
  if (release && release.recipient && release.amount && release.nonce && release.deadline && hasTwoSignatures(release)) {
    return {
      to: typeof value.lockbox === 'string' && isAddress(value.lockbox) ? value.lockbox : POLYGON_LOCKBOX,
      data: RELEASE_IFACE.encodeFunctionData('release', [
        release.recipient,
        release.amount,
        release.nonce,
        release.deadline,
        release.signatures,
      ]),
      value: '0x0',
    }
  }

  return null
}

function findReadyTx(value: any): ApiTx | null {
  if (!value || typeof value !== 'object') return null
  const built = buildTxFromBridgeApi(value)
  if (built) return built

  const candidates = [value, value.tx, value.transaction, value.request, value.claimTx, value.releaseTx, value.payload, value.result]
  for (const item of candidates) {
    if (!item || typeof item !== 'object') continue
    const to = item.to || item.target || item.contract || item.contractAddress
    const data = item.data || item.calldata || item.input
    if (typeof to === 'string' && typeof data === 'string' && isAddress(to) && data.startsWith('0x')) {
      return { to, data, value: typeof item.value === 'string' ? item.value : undefined }
    }
  }

  for (const item of Object.values(value)) {
    const nested = findReadyTx(item)
    if (nested) return nested
  }

  return null
}

async function ethCall(provider: ProviderLike, to: string, data: string, from?: string) {
  const result = await provider.request({ method: 'eth_call', params: [{ to, data, ...(from ? { from } : {}) }, 'latest'] })
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
  return normalizeChainId(chainId) === POLYGON_CHAIN_ID ? `https://polygonscan.com/tx/${tx}` : `https://explorer.inri.life/tx/${tx}`
}

function StepBox({ label, text, done, active }: { label: string; text: string; done?: boolean; active?: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-3 ${done ? 'border-emerald-300/25 bg-emerald-300/[0.08]' : active ? 'border-cyan-300/35 bg-cyan-300/[0.10]' : 'border-white/10 bg-white/[0.04]'}`}>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
        {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" /> : active ? <Clock3 className="h-3.5 w-3.5 text-cyan-200" /> : <span className="h-2 w-2 rounded-full bg-white/25" />}
        {label}
      </div>
      <p className="mt-1 text-xs font-semibold leading-relaxed text-white/72">{text}</p>
    </div>
  )
}

export function InriBridgePage() {
  const [wallet, setWallet] = useState<ActiveWalletState>(null)
  const [direction, setDirection] = useState<Direction>('buy')
  const [amount, setAmount] = useState('1')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('Ready. Connect wallet and choose Buy or Sell.')
  const [error, setError] = useState('')
  const [balance, setBalance] = useState<bigint | null>(null)
  const [allowance, setAllowance] = useState<bigint | null>(null)
  const [decimals, setDecimals] = useState(6)
  const [sourceTx, setSourceTx] = useState('')
  const [bridgeIds, setBridgeIds] = useState<string[]>([])
  const [manualClaimId, setManualClaimId] = useState('')
  const [claim, setClaim] = useState<ClaimState>({ status: 'idle', message: 'No active transfer yet.' })
  const [pending, setPending] = useState<PendingItem[]>([])
  const [pendingStatus, setPendingStatus] = useState('Connect wallet to search pending claims.')
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
        sourceContract: POLYGON_LOCKBOX,
        sourceAction: 'Deposit USDT',
        mainAction: 'Bridge USDT to iUSD',
        claimTitle: 'Claim iUSD',
        claimAction: 'Claim iUSD on INRI',
        checkAction: 'Check iUSD claim',
        api: CLAIM_API,
        recoveryUrl: (id: string) => `${BRIDGE_ORIGIN}/claim.html?id=${encodeURIComponent(id)}`,
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
        sourceContract: INRI_IUSD,
        sourceAction: 'Burn iUSD',
        mainAction: 'Bridge iUSD to USDT',
        claimTitle: 'Claim USDT',
        claimAction: 'Claim USDT on Polygon',
        checkAction: 'Check USDT release',
        api: RELEASE_API,
        recoveryUrl: () => `${BRIDGE_ORIGIN}/sell.html`,
      }

  const amountRaw = useMemo(() => parseUnits(amount, decimals), [amount, decimals])
  const receiveRaw = useMemo(() => (amountRaw * (BPS_DENOMINATOR - FEE_BPS)) / BPS_DENOMINATOR, [amountRaw])
  const receiveText = useMemo(() => formatUnits(receiveRaw, decimals, 6), [receiveRaw, decimals])
  const connected = Boolean(address && provider)
  const onSourceNetwork = chainId === route.sourceChain
  const onClaimNetwork = chainId === route.destinationChain
  const balanceEnough = balance === null || amountRaw <= balance
  const allowanceEnough = direction === 'sell' || (allowance !== null && allowance >= amountRaw && amountRaw > 0n)
  const activeClaimId = (manualClaimId || claim.id || bridgeIds[0] || '').trim()

  useEffect(() => {
    setWallet(getWalletState())
    setHistory(loadHistory())
    const onWallet = () => setWallet(getWalletState())
    window.addEventListener('inri:wallet-state', onWallet)
    return () => window.removeEventListener('inri:wallet-state', onWallet)
  }, [])

  useEffect(() => {
    setError('')
    setSourceTx('')
    setBridgeIds([])
    setManualClaimId('')
    setClaim({ status: 'idle', message: 'No active transfer yet.' })
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
    if (!address) return
    void loadPendingForWallet()
  }, [address])

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
    setStatus('Approving USDT for the official Polygon lockbox...')
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
      const data = direction === 'buy' ? encodeAmount(SELECTOR.deposit, amountRaw) : encodeAmount(SELECTOR.burn, amountRaw)

      setStatus(direction === 'buy' ? 'Depositing USDT into the Polygon lockbox...' : 'Burning iUSD on INRI...')
      const txHash = await sendTx(provider, address, to, data)
      setSourceTx(txHash)
      setStatus(`Transaction sent: ${short(txHash, 10, 8)}. Waiting confirmation...`)

      const receipt = await waitForReceipt(provider, txHash)
      const ids = extractBridgeIds(receipt, to, txHash)
      const firstId = ids[0] || txHash
      setBridgeIds(ids)
      setManualClaimId(firstId)
      setClaim({ status: 'checking', message: 'Transaction confirmed. Checking watcher signatures...', id: firstId })

      addHistory({ id: firstId, direction, amount, receive: receiveText, tx: txHash, status: 'submitted', createdAt: Date.now() })
      startPolling(ids.length ? ids : [firstId])
      window.setTimeout(() => void loadPendingForWallet(), 5000)
    } catch (err: any) {
      setError(err?.message || 'Bridge transaction failed.')
    } finally {
      setBusy(false)
    }
  }

  async function checkApi(ids = bridgeIds, silent = false) {
    const nextIds = unique(ids.map((id) => id.trim()).filter(Boolean))
    if (!nextIds.length) {
      setError('Paste the claim/release ID first, select a pending item, or submit a bridge transaction.')
      return
    }

    if (!silent) setClaim({ status: 'checking', message: 'Checking watcher signatures...', id: nextIds[0] })

    for (const id of nextIds) {
      try {
        const response = await fetch(`${route.api}/${encodeURIComponent(id)}`, { cache: 'no-store' })
        if (!response.ok) continue
        const json = await response.json()
        const tx = findReadyTx(json)
        const ready = Boolean(tx)
        setManualClaimId(id)
        setClaim({
          status: ready ? 'ready' : 'waiting',
          message: ready ? `${route.claimTitle} is ready. Confirm the final wallet transaction.` : 'Watcher found the transfer and is still preparing signatures.',
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

    setClaim({ status: 'waiting', message: `${route.claimTitle} is not published yet. Keep this page open or press Check again.`, id: nextIds[0] })
  }

  function startPolling(ids: string[]) {
    const nextIds = unique(ids)
    if (pollingRef.current) clearInterval(pollingRef.current)
    void checkApi(nextIds)
    pollingRef.current = setInterval(() => void checkApi(nextIds, true), 5000)
  }

  async function claimDestination() {
    if (!provider || !address) return
    const id = activeClaimId
    if (!id) {
      setError('No claim/release ID selected.')
      return
    }

    if (!claim.tx || claim.id !== id) {
      await checkApi([id])
      return
    }

    if (!onClaimNetwork) {
      await switchNetwork(route.destinationChain)
      return
    }

    setBusy(true)
    setError('')

    try {
      setStatus(`${route.claimTitle}: sending final transaction...`)
      const hash = await sendTx(provider, address, claim.tx.to, claim.tx.data, claim.tx.value)
      setStatus(`${route.claimTitle} sent: ${short(hash, 10, 8)}. Waiting confirmation...`)
      await waitForReceipt(provider, hash)
      setClaim((prev) => ({ ...prev, status: 'done', message: 'Bridge completed successfully.' }))
      updateHistory(id, 'done')
      await loadPendingForWallet()
    } catch (err: any) {
      setError(err?.message || 'Final claim transaction failed. Use the recovery link below if needed.')
    } finally {
      setBusy(false)
    }
  }

  async function loadPendingForWallet() {
    if (!address) {
      setPending([])
      setPendingStatus('Connect wallet to search pending claims.')
      return
    }

    try {
      setPendingStatus('Searching pending claims for this wallet...')
      const response = await fetch(`${PENDING_API}/${encodeURIComponent(address)}`, { cache: 'no-store' })
      if (!response.ok) {
        setPending([])
        setPendingStatus('Pending auto-search is not enabled on the bridge server yet. Paste the claim ID manually.')
        return
      }
      const json = await response.json()
      const claims: PendingItem[] = Array.isArray(json.claims)
        ? json.claims.map((item: any) => ({ ...item, kind: 'claim', direction: 'buy' as Direction }))
        : []
      const releases: PendingItem[] = Array.isArray(json.releases)
        ? json.releases.map((item: any) => ({ ...item, kind: 'release', direction: 'sell' as Direction }))
        : []
      const next = [...claims, ...releases].slice(0, 12)
      setPending(next)
      setPendingStatus(next.length ? `${next.length} pending operation(s) found.` : 'No pending claims found for this wallet.')
    } catch {
      setPending([])
      setPendingStatus('Could not search pending claims. Paste the claim ID manually.')
    }
  }

  function selectPending(item: PendingItem) {
    setDirection(item.direction)
    setManualClaimId(item.id)
    setClaim({ status: 'checking', message: 'Selected pending operation. Press Check or Claim.', id: item.id })
    window.setTimeout(() => void checkApi([item.id]), 120)
  }

  function setMax() {
    if (balance === null) return
    setAmount(formatUnits(balance, decimals, Math.min(decimals, 6)))
  }

  function copyText(value: string, label: string) {
    if (!value || typeof navigator === 'undefined') return
    void navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1200)
  }

  const mainButtonText = !connected
    ? 'Connect wallet first'
    : !onSourceNetwork
      ? `Switch to ${route.fromChain}`
      : !balanceEnough
        ? `Insufficient ${route.fromToken}`
        : direction === 'buy' && allowance !== null && !allowanceEnough
          ? 'Approve USDT'
          : route.mainAction

  const claimBadge = claim.status === 'ready' ? 'Ready' : claim.status === 'done' ? 'Done' : claim.status === 'checking' ? 'Checking' : 'Waiting'
  const recoveryLink = activeClaimId ? route.recoveryUrl(activeClaimId) : route.recoveryUrl('')

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030711] text-white">
      <section className="relative border-b border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(19,164,255,0.34),transparent_30rem),radial-gradient(circle_at_82%_10%,rgba(103,212,255,0.16),transparent_32rem),linear-gradient(135deg,#061221_0%,#030711_52%,#000_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />
        <div className="relative mx-auto grid max-w-[1500px] gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:py-12 xl:px-12">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-primary/35 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100">
              <ShieldCheck className="h-4 w-4" /> Official iUSD Bridge
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              Bridge simples para USDT e iUSD.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-cyan-50/68">
              Uma tela única para comprar iUSD, vender iUSD, detectar assinaturas do watcher e fazer o claim final sem console e sem links escondidos.
            </p>
            <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
              <StepBox label="Step 1" text={direction === 'buy' ? 'Approve/deposit USDT on Polygon.' : 'Burn iUSD on INRI.'} done={Boolean(sourceTx)} active={!sourceTx} />
              <StepBox label="Step 2" text="Watcher prepares 2 validator signatures." done={claim.status === 'ready' || claim.status === 'done'} active={claim.status === 'checking' || claim.status === 'waiting'} />
              <StepBox label="Step 3" text={direction === 'buy' ? 'Claim iUSD on INRI.' : 'Claim USDT on Polygon.'} done={claim.status === 'done'} active={claim.status === 'ready'} />
            </div>
          </div>

          <div className="rounded-[28px] border border-primary/20 bg-white/[0.07] p-3 shadow-[0_30px_110px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-4">
            <div className="rounded-[24px] border border-white/12 bg-[#06101d]/92 p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Bridge</p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">{route.title}</h2>
                </div>
                <div className="w-full sm:w-auto"><ConnectWalletButton compact /></div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-[16px] border border-white/10 bg-white/[0.04] p-1">
                {(['buy', 'sell'] as Direction[]).map((item) => (
                  <button key={item} type="button" onClick={() => setDirection(item)} className={`rounded-[13px] px-4 py-2.5 text-sm font-black transition ${direction === item ? 'bg-primary text-black shadow-[0_12px_30px_rgba(19,164,255,0.22)]' : 'text-white/58 hover:bg-white/[0.055] hover:text-white'}`}>
                    {item === 'buy' ? 'Buy iUSD' : 'Sell iUSD'}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
                <div className="rounded-[18px] border border-primary/16 bg-white/[0.055] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">From</p>
                  <p className="mt-2 text-2xl font-black text-white">{route.fromToken}</p>
                  <p className="mt-1 text-sm font-bold text-cyan-200/72">{route.fromChain}</p>
                </div>
                <div className="flex items-center justify-center"><button type="button" onClick={() => setDirection(direction === 'buy' ? 'sell' : 'buy')} className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary text-black shadow-[0_14px_32px_rgba(19,164,255,0.24)] transition hover:scale-105"><ArrowDown className="h-5 w-5" /></button></div>
                <div className="rounded-[18px] border border-primary/16 bg-white/[0.055] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">To</p>
                  <p className="mt-2 text-2xl font-black text-white">{route.toToken}</p>
                  <p className="mt-1 text-sm font-bold text-cyan-200/72">{route.toChain}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/12 bg-white/[0.045] p-4">
                <div className="flex items-center justify-between gap-3"><label className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">Amount</label><button type="button" onClick={setMax} className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/82 hover:text-cyan-100">Max</button></div>
                <div className="mt-2 flex items-center gap-3 rounded-[15px] border border-white/10 bg-black/18 px-4 py-3">
                  <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-2xl font-black tracking-[-0.035em] text-white outline-none placeholder:text-white/20 sm:text-3xl" placeholder="0.00" />
                  <span className="rounded-[12px] border border-primary/25 bg-primary/[0.10] px-3 py-2 text-xs font-black text-cyan-100">{route.fromToken}</span>
                </div>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                  <div className="rounded-[14px] border border-white/10 bg-black/16 p-3"><p className="text-white/42">You receive</p><p className="mt-1 font-black text-white">≈ {receiveText} {route.toToken}</p></div>
                  <div className="rounded-[14px] border border-white/10 bg-black/16 p-3"><p className="text-white/42">Fee</p><p className="mt-1 font-black text-white">0.2%</p></div>
                  <div className="rounded-[14px] border border-white/10 bg-black/16 p-3"><p className="text-white/42">Balance</p><p className="mt-1 font-black text-white">{balance === null ? '-' : `${formatUnits(balance, decimals, 4)} ${route.fromToken}`}</p></div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-[18px] border border-primary/18 bg-primary/[0.06] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/75">Step 1</p>
                  <h3 className="mt-1 text-xl font-black text-white">{route.sourceAction}</h3>
                  <p className="mt-2 text-xs font-semibold leading-5 text-white/56">{direction === 'buy' ? 'Approves USDT if needed and deposits into the official Polygon lockbox.' : 'Burns iUSD on INRI and prepares a Polygon USDT release.'}</p>
                  <button type="button" onClick={() => void submitSourceTx()} disabled={busy || !connected || amountRaw <= 0n || !balanceEnough} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-primary px-4 py-3 text-sm font-black text-black shadow-[0_16px_36px_rgba(19,164,255,0.24)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-45">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}{busy ? 'Processing...' : mainButtonText}
                  </button>
                </div>

                <div className="rounded-[18px] border border-emerald-300/18 bg-emerald-300/[0.055] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200/75">Step 2</p><h3 className="mt-1 text-xl font-black text-white">{route.claimTitle}</h3></div>
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-300/[0.10] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100">{claimBadge}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-5 text-white/56">After the watcher prepares signatures, this button sends the final claim transaction directly from this site.</p>
                  <div className="mt-3 rounded-[14px] border border-white/10 bg-black/16 p-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Claim / Release ID</label>
                    <input value={manualClaimId} onChange={(event) => setManualClaimId(event.target.value.trim())} className="mt-2 w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/25" placeholder="0x... deposit/burn/claim/release id" />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={() => void checkApi(activeClaimId ? [activeClaimId] : bridgeIds)} disabled={busy || (!activeClaimId && bridgeIds.length === 0)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-white/12 bg-white/[0.055] px-4 py-3 text-xs font-black text-white/78 transition hover:border-cyan-300/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-45">
                      {claim.status === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}{route.checkAction}
                    </button>
                    <button type="button" onClick={() => void claimDestination()} disabled={busy || !connected || !activeClaimId} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-300 px-4 py-3 text-xs font-black text-black shadow-[0_16px_36px_rgba(16,185,129,0.20)] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-45">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{onClaimNetwork ? route.claimAction : `Switch to ${route.toChain}`}
                    </button>
                  </div>
                  {activeClaimId ? <Link href={recoveryLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-black text-emerald-100/80 hover:text-white">Recovery old claim page <ExternalLink className="h-3.5 w-3.5" /></Link> : null}
                </div>
              </div>

              {error ? <div className="mt-4 rounded-[16px] border border-red-300/25 bg-red-300/[0.08] p-3 text-sm leading-6 text-red-100"><div className="flex gap-2"><CircleAlert className="mt-1 h-4 w-4 shrink-0" /> <span>{error}</span></div></div> : null}
              <div className="mt-4 rounded-[16px] border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-white/60">
                <p className="font-black text-white/82">Status</p>
                <p className="mt-1">{status}</p>
                <p className="mt-1">{claim.message}</p>
                {activeClaimId ? <p className="mt-1 break-all text-cyan-200/72">ID: {activeClaimId}</p> : null}
                {sourceTx ? <Link href={explorerTx(route.sourceChain, sourceTx)} target="_blank" className="mt-1 inline-flex items-center gap-2 text-cyan-100 hover:text-white">Source tx {short(sourceTx, 10, 8)} <ExternalLink className="h-3.5 w-3.5" /></Link> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[linear-gradient(180deg,#030711,#071323)] py-8">
        <div className="mx-auto grid max-w-[1500px] gap-5 px-4 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] xl:px-12">
          <div className="rounded-[24px] border border-primary/18 bg-white/[0.055] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Auto recovery</p><h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">Pending claims for wallet</h2></div>
              <button type="button" onClick={() => void loadPendingForWallet()} className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/12 bg-white/[0.055] px-4 py-3 text-xs font-black text-white/76 hover:border-primary/35 hover:text-white"><RefreshCw className="h-4 w-4" /> Refresh</button>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/58">{pendingStatus}</p>
            <div className="mt-4 grid gap-2">
              {pending.length === 0 ? <div className="rounded-[16px] border border-white/10 bg-black/18 p-4 text-sm text-white/48">No pending item loaded. After the server read-only endpoint is enabled, connected users will see Claim iUSD and Claim USDT here automatically.</div> : pending.map((item) => (
                <button key={`${item.kind}-${item.id}`} type="button" onClick={() => selectPending(item)} className="rounded-[16px] border border-white/10 bg-black/18 p-4 text-left transition hover:border-primary/35 hover:bg-primary/[0.07]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-black text-white">{item.kind === 'claim' ? 'Claim iUSD' : 'Claim USDT'} · {formatTokenAmount(item.amount)} {item.kind === 'claim' ? 'iUSD' : 'USDT'}</p><p className="mt-1 break-all text-xs text-white/46">{item.id}</p></div>
                    <span className="rounded-full border border-primary/25 bg-primary/[0.09] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">{item.status || 'ready'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-primary/18 bg-white/[0.055] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Local history</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">This browser</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">{copied ? 'Copied.' : 'Operations started from this page are stored only in this browser.'}</p>
            <div className="mt-4 grid gap-2">
              {history.length === 0 ? <div className="rounded-[16px] border border-white/10 bg-black/18 p-4 text-sm text-white/48">No bridge operations from this page yet.</div> : history.map((item) => (
                <div key={`${item.id}-${item.tx}`} className="rounded-[16px] border border-white/10 bg-black/18 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-black text-white">{item.direction === 'buy' ? 'Buy iUSD' : 'Sell iUSD'} · {item.amount} → {item.receive}</p><p className="mt-1 text-xs text-white/46">{new Date(item.createdAt).toLocaleString()} · {item.status}</p></div>
                    <div className="flex flex-wrap gap-2 text-xs font-black"><button type="button" onClick={() => copyText(item.id, 'id')} className="rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-white/68 hover:text-cyan-100"><Copy className="inline h-3.5 w-3.5" /> ID</button><button type="button" onClick={() => { setDirection(item.direction); setManualClaimId(item.id); void checkApi([item.id]) }} className="rounded-[12px] border border-primary/20 bg-primary/[0.08] px-3 py-2 text-cyan-100">Check</button></div>
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
