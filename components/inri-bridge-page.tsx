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

const BRIDGE_ORIGIN = 'https://iusd-bridge.inri.life'
const CLAIM_API = `${BRIDGE_ORIGIN}/api/claim`
const RELEASE_API = `${BRIDGE_ORIGIN}/api/release`

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
    const parsed = JSON.parse(localStorage.getItem('inri_site_bridge_history_v4') || '[]')
    return Array.isArray(parsed) ? parsed.slice(0, 6) : []
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('inri_site_bridge_history_v4', JSON.stringify(items.slice(0, 6)))
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

const MINT_CLAIM_IFACE = new Interface([
  'function mintFromPolygonDeposit(address recipient,uint256 amount,bytes32 depositId,uint256 deadline,bytes[] signatures)',
])

const RELEASE_CLAIM_IFACE = new Interface([
  'function release(address recipient,uint256 amount,uint256 nonce,uint256 deadline,bytes[] signatures)',
])

function hasTwoSignatures(value: any) {
  return Array.isArray(value?.signatures) && value.signatures.length >= 2
}

function buildTxFromRawBridgeApi(value: any): ApiTx | null {
  if (!value || typeof value !== 'object') return null

  const claim = value.claim && typeof value.claim === 'object' ? value.claim : value.type === 'mint' ? value : null
  if (claim && claim.recipient && claim.amount && claim.depositId && claim.deadline && hasTwoSignatures(claim)) {
    return {
      to: typeof value.executor === 'string' && isAddress(value.executor) ? value.executor : INRI_EXECUTOR,
      data: MINT_CLAIM_IFACE.encodeFunctionData('mintFromPolygonDeposit', [
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
      data: RELEASE_CLAIM_IFACE.encodeFunctionData('release', [
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

function findApiTx(value: any): ApiTx | null {
  if (!value || typeof value !== 'object') return null

  const built = buildTxFromRawBridgeApi(value)
  if (built) return built

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
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
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
  const [manualClaimId, setManualClaimId] = useState('')
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
        sourceAction: 'Deposit USDT',
        primaryAction: 'Bridge USDT to iUSD',
        claimTitle: 'Claim iUSD',
        claimAction: 'Claim iUSD on INRI',
        checkAction: 'Check iUSD Claim',
        claimHint: 'Depois do depósito, o site encontra o claim iUSD automaticamente e mostra o botão final.',
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
        sourceAction: 'Burn iUSD',
        primaryAction: 'Bridge iUSD to USDT',
        claimTitle: 'Claim USDT',
        claimAction: 'Claim USDT on Polygon',
        checkAction: 'Check USDT Claim',
        claimHint: 'Depois do burn, o site usa o hash da transação para encontrar o release USDT automaticamente.',
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
      const detectedIds = extractBridgeIds(receipt, to, txHash)

      // SELL IMPORTANT:
      // For iUSD -> USDT the burn transaction hash is NOT the final releaseId,
      // but the bridge API now resolves /api/release/:burnTxHash to the correct release.
      // Keep the burnTxHash first so normal users never need to copy/paste a release ID.
      const ids = direction === 'sell' ? unique([txHash, ...detectedIds]) : detectedIds
      const firstId = direction === 'sell' ? txHash : ids[0] || txHash

      setBridgeIds(ids)
      setManualClaimId(firstId)
      setClaim({
        status: 'checking',
        message: direction === 'sell'
          ? 'Burn confirmed. Preparing your USDT release automatically...'
          : 'Deposit confirmed. Preparing your iUSD claim automatically...',
        id: firstId,
      })

      addHistory({
        id: firstId,
        direction,
        amount,
        receive: receiveText,
        tx: txHash,
        status: 'submitted',
        createdAt: Date.now(),
      })

      startPolling(ids.length ? ids : [firstId])
    } catch (err: any) {
      setError(err?.message || 'Bridge transaction failed.')
    } finally {
      setBusy(false)
    }
  }

  async function checkApi(ids = bridgeIds, silent = false) {
    const nextIds = unique(ids.map((id) => id.trim()).filter(Boolean))
    if (!nextIds.length) {
      setError('Paste the claim/release ID first, or submit a bridge transaction.')
      return
    }

    if (!silent) setClaim({ status: 'checking', message: 'Checking watcher signatures...', id: nextIds[0] })

    for (const id of nextIds) {
      try {
        const response = await fetch(`${route.api}/${encodeURIComponent(id)}`, { cache: 'no-store' })
        if (!response.ok) continue
        const json = await response.json()
        const ready = apiLooksReady(json)
        const tx = findApiTx(json)
        const resolvedId = typeof json.resolvedId === 'string' && json.resolvedId.startsWith('0x') ? json.resolvedId : id

        setManualClaimId(resolvedId)
        setClaim({
          status: ready ? 'ready' : 'waiting',
          message: ready
            ? `${route.claimTitle} is ready. Confirm in your wallet.`
            : direction === 'sell'
              ? 'Burn detected. Preparing your USDT release automatically...'
              : 'Deposit detected. Preparing your iUSD claim automatically...',
          id: resolvedId,
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
      message: `${route.claimTitle} is not published yet. Keep this page open or press Check again.`,
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
    const id = activeClaimId
    if (!id) {
      setError('Paste the claim/release ID first, or submit a bridge transaction.')
      return
    }

    if (claim.status !== 'ready' && !claim.tx) {
      await checkApi([id])
      setStatus('Checked watcher. If signatures are ready, press the claim button again.')
      return
    }

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
      setStatus(`${route.claimTitle} sent: ${short(hash, 10, 8)}. Waiting confirmation...`)
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

  const claimBadge = claim.status === 'ready'
    ? 'Ready'
    : claim.status === 'done'
      ? 'Done'
      : claim.status === 'checking'
        ? 'Checking'
        : 'Waiting'

  const claimButtonText = !activeClaimId
    ? direction === 'buy' ? 'Waiting for iUSD claim' : 'Waiting for USDT release'
    : claim.status !== 'ready' || !claim.tx
      ? direction === 'buy' ? 'Check iUSD claim' : 'Check USDT release'
      : !onClaimNetwork
        ? `Switch to ${route.toChain}`
        : route.claimAction

  return (
    <main className="min-h-screen overflow-hidden bg-[#04101d] text-white">
      <section className="relative border-b border-cyan-300/15 bg-[radial-gradient(circle_at_16%_0%,rgba(19,164,255,0.28),transparent_22rem),radial-gradient(circle_at_88%_10%,rgba(103,212,255,0.12),transparent_24rem),linear-gradient(135deg,#071b2f_0%,#06111f_48%,#02050a_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative mx-auto max-w-[1080px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[860px]">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/28 bg-cyan-300/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100">
                  <ShieldCheck className="h-3.5 w-3.5" /> Official iUSD Bridge
                </div>
                <h1 className="mt-3 text-[34px] font-black tracking-[-0.055em] text-white sm:text-[42px]">Bridge iUSD</h1>
                <p className="mt-2 max-w-[680px] text-sm font-semibold leading-6 text-cyan-50/62">
                  One clean bridge screen: choose Buy or Sell, confirm in MetaMask, then claim from the same page. Wallet connection stays only in the top bar.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs sm:min-w-[280px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/38">Fee</p>
                  <p className="mt-1 font-black text-white">0.2%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/38">Sign</p>
                  <p className="mt-1 font-black text-white">2 / 4</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/38">Chain</p>
                  <p className="mt-1 font-black text-white">3777</p>
                </div>
              </div>
            </div>

            {!connected ? (
              <div className="mb-4 rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.08] px-4 py-3 text-sm font-semibold text-cyan-50/88">
                Use the <span className="font-black text-white">Connect wallet</span> button in the top navigation to start.
              </div>
            ) : null}

            <div className="rounded-[28px] border border-cyan-300/18 bg-white/[0.07] p-3 shadow-[0_28px_84px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl">
              <div className="rounded-[24px] border border-white/12 bg-[#071827]/90 p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Transfer</p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.045em] text-white">{route.title}</h2>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">Wallet</p>
                    <p className="mt-1 text-sm font-black text-white">{connected ? short(address, 8, 4) : 'Not connected'}</p>
                    <p className="text-[11px] font-bold text-cyan-100/70">{normalizeChainId(chainId) === POLYGON_CHAIN_ID ? 'Polygon' : normalizeChainId(chainId) === INRI_CHAIN_ID ? 'INRI Chain' : 'Select network'}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-[16px] border border-white/10 bg-white/[0.035] p-1">
                  {(['buy', 'sell'] as Direction[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDirection(item)}
                      className={`rounded-[13px] px-4 py-2.5 text-sm font-black transition ${direction === item ? 'bg-cyan-300 text-black shadow-[0_12px_30px_rgba(19,164,255,0.22)]' : 'text-white/58 hover:bg-white/[0.055] hover:text-white'}`}
                    >
                      {item === 'buy' ? 'Buy iUSD' : 'Sell iUSD'}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                  <div className="rounded-[18px] border border-cyan-300/14 bg-white/[0.045] p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/38">From</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-2xl font-black text-white">{route.fromToken}</p>
                        <p className="text-xs font-bold text-cyan-200/70">{route.fromChain}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black text-white/55">Source</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setDirection(direction === 'buy' ? 'sell' : 'buy')}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300 text-black shadow-[0_12px_28px_rgba(19,164,255,0.22)] transition hover:scale-105"
                      aria-label="Reverse bridge route"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-[18px] border border-cyan-300/14 bg-white/[0.045] p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/38">To</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-2xl font-black text-white">{route.toToken}</p>
                        <p className="text-xs font-bold text-cyan-200/70">{route.toChain}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black text-white/55">Claim</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[20px] border border-white/10 bg-black/18 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Amount</p>
                    <button type="button" onClick={setMax} className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 hover:text-cyan-100">Max</button>
                  </div>

                  <div className="mt-2 flex items-center gap-3 rounded-[16px] border border-cyan-300/14 bg-white/[0.045] px-4 py-3">
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      inputMode="decimal"
                      placeholder="0.0"
                      className="min-w-0 flex-1 bg-transparent text-3xl font-black tracking-[-0.04em] text-white outline-none placeholder:text-white/22"
                    />
                    <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-white/72">{route.fromToken}</div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/36">You receive</p>
                      <p className="mt-1 text-base font-black text-white">≈ {receiveText} {route.toToken}</p>
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/36">Fee</p>
                      <p className="mt-1 text-base font-black text-white">0.2%</p>
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/36">Balance</p>
                      <p className="mt-1 text-base font-black text-white">{balance === null ? '-' : formatUnits(balance, decimals, 4)} {route.fromToken}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void submitSourceTx()}
                    disabled={busy || !connected || amountRaw <= 0n || !balanceEnough}
                    className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[16px] bg-cyan-300 px-4 py-3.5 text-sm font-black text-black shadow-[0_16px_36px_rgba(19,164,255,0.24)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {busy ? 'Processing...' : mainButtonText}
                  </button>

                  <button
                    type="button"
                    onClick={() => void claimDestination()}
                    disabled={busy || !connected || (!activeClaimId && bridgeIds.length === 0)}
                    className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[16px] border border-emerald-300/30 bg-emerald-300/[0.14] px-4 py-3.5 text-sm font-black text-emerald-50 transition hover:bg-emerald-300/[0.20] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {busy || claim.status === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {claimButtonText}
                  </button>
                </div>

                {error ? (
                  <div className="mt-3 rounded-[16px] border border-red-300/25 bg-red-300/[0.08] p-3 text-sm leading-6 text-red-100">
                    <div className="flex gap-2"><CircleAlert className="mt-1 h-4 w-4 shrink-0" /> <span>{error}</span></div>
                  </div>
                ) : null}

                <div className="mt-3 rounded-[18px] border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/62">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-white/84">{claim.status === 'ready' ? `${route.toToken} ready to claim` : claim.status === 'done' ? 'Bridge completed' : 'Status'}</p>
                      <p className="mt-1">{claim.status === 'idle' ? status : claim.message}</p>
                      {sourceTx ? (
                        <p className="mt-1 text-xs">TX: <Link href={explorerTx(route.sourceChain, sourceTx)} target="_blank" rel="noreferrer" className="font-black text-cyan-200 hover:text-cyan-100">{short(sourceTx, 10, 8)}</Link></p>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">{claimBadge}</span>
                  </div>

                  <details className="mt-4 rounded-[14px] border border-white/10 bg-white/[0.03] p-3">
                    <summary className="cursor-pointer text-xs font-black text-white/58">Advanced recovery</summary>
                    <p className="mt-2 text-xs leading-5 text-white/42">Only use this if you are recovering an old transfer. Most users never need to copy any ID.</p>
                    <input
                      value={manualClaimId}
                      onChange={(event) => setManualClaimId(event.target.value.trim())}
                      className="mt-3 w-full rounded-[12px] border border-white/10 bg-black/20 px-3 py-2 text-sm font-bold text-white outline-none placeholder:text-white/25"
                      placeholder="0x... claim / release id or transaction hash"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => activeClaimId ? void checkApi([activeClaimId]) : undefined} className="inline-flex items-center gap-2 rounded-[12px] border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-xs font-black text-cyan-100"><RefreshCw className="h-3.5 w-3.5" />Check</button>
                      <Link href={`${BRIDGE_ORIGIN}/${direction === 'buy' ? 'buy.html' : 'sell.html'}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/68">Recovery page <ExternalLink className="h-3.5 w-3.5" /></Link>
                      {activeClaimId ? <button type="button" onClick={() => copyText(activeClaimId, 'id')} className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/68"><Copy className="h-3.5 w-3.5" />Copy ID</button> : null}
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[22px] border border-cyan-300/14 bg-white/[0.05] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.30)] backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Progress</p>
                    <h3 className="mt-1 text-xl font-black tracking-[-0.04em] text-white">Transfer steps</h3>
                  </div>
                  <button type="button" onClick={() => activeClaimId ? void checkApi([activeClaimId]) : undefined} className="inline-flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/12 bg-white/[0.04] text-white/70 transition hover:border-cyan-300/35 hover:text-cyan-100" aria-label="Refresh status">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Step label="Wallet" value={connected ? `${short(address)} connected` : 'Use top bar connect.'} done={connected} />
                  <Step label="Source" value={onSourceNetwork ? `${route.fromChain} selected` : `Switch to ${route.fromChain}.`} active={connected && !onSourceNetwork} done={onSourceNetwork} />
                  <Step label={route.sourceAction} value={sourceTx ? `Submitted: ${short(sourceTx, 10, 8)}` : direction === 'buy' ? 'Approve / deposit.' : 'Burn iUSD.'} active={busy} done={Boolean(sourceTx)} />
                  <Step label={route.claimTitle} value={claim.status === 'ready' ? 'Ready.' : claim.status === 'done' ? 'Completed.' : claim.message} active={claim.status === 'checking'} done={claim.status === 'done'} />
                </div>
              </div>

              <div className="rounded-[22px] border border-cyan-300/14 bg-white/[0.05] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.30)] backdrop-blur-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Helpers</p>
                <h3 className="mt-1 text-xl font-black tracking-[-0.04em] text-white">Quick tools</h3>
                <div className="mt-4 grid gap-2">
                  <button type="button" onClick={() => void addIusdToken()} className="inline-flex items-center justify-center gap-2 rounded-[15px] border border-cyan-300/22 bg-cyan-300/[0.09] px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/[0.14]">
                    Add iUSD token <Wallet className="h-4 w-4" />
                  </button>
                  {sourceTx ? <Link href={explorerTx(route.sourceChain, sourceTx)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-[15px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/68 transition hover:text-cyan-100">Open latest TX <ExternalLink className="h-4 w-4" /></Link> : null}
                </div>
                <p className="mt-4 text-xs leading-6 text-white/48">Default flow is simple: top wallet connect, one main action, then one claim action.</p>
              </div>
            </div>

            <details className="mt-4 rounded-[22px] border border-cyan-300/14 bg-white/[0.045] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.30)] backdrop-blur-2xl">
              <summary className="cursor-pointer text-sm font-black text-white/78">Recent local bridge history {history.length ? `(${history.length})` : ''}</summary>
              <div className="mt-4 grid gap-2">
                {history.length === 0 ? (
                  <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-4 text-sm text-white/52">No bridge operations from this page yet.</div>
                ) : history.map((item) => (
                  <div key={`${item.id}-${item.tx}`} className="rounded-[16px] border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-black text-white">{item.direction === 'buy' ? 'Buy iUSD' : 'Sell iUSD'} · {item.amount} {item.direction === 'buy' ? 'USDT' : 'iUSD'} → {item.receive} {item.direction === 'buy' ? 'iUSD' : 'USDT'}</p>
                        <p className="mt-1 text-xs text-white/45">{new Date(item.createdAt).toLocaleString()} · {item.status}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-black">
                        <Link href={explorerTx(item.direction === 'buy' ? POLYGON_CHAIN_ID : INRI_CHAIN_ID, item.tx)} target="_blank" rel="noreferrer" className="rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-white/68 hover:text-cyan-100">{short(item.tx, 10, 8)}</Link>
                        <button type="button" onClick={() => copyText(item.id, 'id')} className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 py-2 text-white/68 hover:text-cyan-100"><Copy className="h-3.5 w-3.5" />Copy</button>
                        {item.status !== 'done' ? (
                          <button type="button" onClick={() => { setDirection(item.direction); setBridgeIds([item.id]); setManualClaimId(item.id); setSourceTx(item.tx); void checkApi([item.id]) }} className="rounded-[12px] border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-cyan-100">Check / Claim</button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs font-bold text-white/45">{copied ? 'Copied.' : 'Saved only in this browser.'}</p>
            </details>
          </div>
        </div>
      </section>
    </main>
  )
}
