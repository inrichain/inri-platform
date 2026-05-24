'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Copy,
  Edit3,
  ExternalLink,
  Minus,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Wallet,
  XCircle,
} from 'lucide-react'
import {
  estimateGasWithFallback,
  getActiveWalletProvider,
  getErrorMessage,
  getLegacyGasPrice,
  INRI_CHAIN_ID_HEX,
  isInriChain,
  readActiveWalletSnapshot,
  requestFromActiveWallet,
  rpcCall,
  switchProviderToInri,
  toHex,
  type ActiveWalletSnapshot,
  type EthereumProvider,
} from '@/lib/inri-active-wallet'
import {
  EXPLORER_TX_URL,
  feeOfLocal,
  formatInri,
  formatIusd,
  getInriBalance,
  getIusdAllowance,
  getIusdBalance,
  IUSD_EXPLORER_TOKEN_URL,
  iusdInterface,
  loadP2PEvents,
  loadP2PStats,
  loadRecentP2POrders,
  P2P_EXPLORER_ADDRESS_URL,
  P2P_IUSD_ADDRESS,
  P2P_MARKET_ADDRESS,
  p2pInterface,
  parseInriAmount,
  parseIusdAmount,
  parsePrice,
  quoteIusdGrossLocal,
  shortAddress,
  type P2PEventItem,
  type P2POrder,
  type P2PStats,
  type P2PView,
} from '@/lib/inri-p2p-market'

type TxTarget = 'market' | 'iusd'
type ToastTone = 'success' | 'error' | 'warning' | 'info'
type SideFilter = 'all' | 'sell' | 'buy'
type BusyAction = string | null

type DraftMap = Record<number, string>
type EditDraft = { price: string; deadlineMinutes: string }

type Toast = {
  tone: ToastTone
  message: string
  txHash?: string
}

const ORDER_PAGE_LIMIT = 42
const ACTIVE_ONLY_DEFAULT = true
const FEE_DENOM = 10_000

function eventLabel(kind: P2PEventItem['kind']) {
  switch (kind) {
    case 'created': return 'Order created'
    case 'filled': return 'Order filled'
    case 'cancelled': return 'Order cancelled'
    case 'price': return 'Price updated'
    case 'deadline': return 'Deadline updated'
    case 'sell-add': return 'SELL size increased'
    case 'sell-remove': return 'SELL size reduced'
    case 'buy-add': return 'BUY iUSD added'
    case 'buy-reduce': return 'BUY order reduced'
    default: return 'P2P event'
  }
}

function deadlineLabel(deadline: number) {
  if (!deadline) return 'No deadline'
  const diff = deadline - Math.floor(Date.now() / 1000)
  if (diff <= 0) return 'Expired'
  const minutes = Math.floor(diff / 60)
  if (minutes < 60) return `${Math.max(1, minutes)}m left`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours}h left`
  return new Date(deadline * 1000).toLocaleDateString()
}

function normalizeHash(result: unknown) {
  if (typeof result === 'string') return result
  if (result && typeof result === 'object' && 'hash' in result) return String((result as { hash: unknown }).hash)
  return ''
}

function buttonBase(primary = false) {
  return primary
    ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-200/50 bg-cyan-300 px-4 py-2 text-sm font-black text-[#03111a] shadow-[0_14px_34px_rgba(19,164,255,0.18)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
    : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.045] px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
}

function inputClass() {
  return 'min-h-12 w-full rounded-2xl border border-white/12 bg-black/28 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/32 focus:border-cyan-300/60 focus:bg-black/36'
}

function selectClass() {
  return 'min-h-12 w-full rounded-2xl border border-white/12 bg-[#040b14] px-4 py-3 text-sm font-extrabold text-white outline-none transition focus:border-cyan-300/60'
}

function statusClass(tone: ToastTone | 'neutral' = 'neutral') {
  if (tone === 'success') return 'border-emerald-400/24 bg-emerald-400/10 text-emerald-100'
  if (tone === 'warning') return 'border-amber-300/26 bg-amber-300/10 text-amber-100'
  if (tone === 'error') return 'border-red-400/24 bg-red-400/10 text-red-100'
  if (tone === 'info') return 'border-cyan-300/24 bg-cyan-300/10 text-cyan-100'
  return 'border-white/12 bg-white/[0.045] text-white/72'
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.7rem] border border-cyan-300/15 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.08),transparent_28%),linear-gradient(180deg,rgba(7,17,29,0.96),rgba(2,7,13,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/58">{label}</div>
          <div className="mt-2 text-xl font-black tracking-tight text-white">{value}</div>
          {sub ? <div className="mt-1 text-xs font-semibold text-white/46">{sub}</div> : null}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-200">{icon}</div>
      </div>
    </div>
  )
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/54">{label}</span>
      {children}
      {hint ? <span className="text-xs font-semibold leading-5 text-white/44">{hint}</span> : null}
    </label>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-black/24 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
        <Store className="h-5 w-5" />
      </div>
      <div className="mt-4 text-lg font-black text-white">{title}</div>
      <div className="mx-auto mt-2 max-w-xl text-sm leading-7 text-white/54">{body}</div>
    </div>
  )
}

export function InriP2PClient() {
  const [view, setView] = useState<P2PView>('market')
  const [wallet, setWallet] = useState<ActiveWalletSnapshot>({ provider: null, providerReady: false, account: null, chainId: null, connector: '' })
  const [stats, setStats] = useState<P2PStats | null>(null)
  const [orders, setOrders] = useState<P2POrder[]>([])
  const [events, setEvents] = useState<P2PEventItem[]>([])
  const [inriBalance, setInriBalance] = useState<bigint>(0n)
  const [iusdBalance, setIusdBalance] = useState<bigint>(0n)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState<BusyAction>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [query, setQuery] = useState('')
  const [sideFilter, setSideFilter] = useState<SideFilter>('all')
  const [activeOnly, setActiveOnly] = useState(ACTIVE_ONLY_DEFAULT)

  const [createSide, setCreateSide] = useState<'sell' | 'buy'>('sell')
  const [createInriAmount, setCreateInriAmount] = useState('')
  const [createPrice, setCreatePrice] = useState('')
  const [createDeadlineMinutes, setCreateDeadlineMinutes] = useState('0')

  const [fillAmounts, setFillAmounts] = useState<DraftMap>({})
  const [resizeAmounts, setResizeAmounts] = useState<DraftMap>({})
  const [editDrafts, setEditDrafts] = useState<Record<number, EditDraft>>({})
  const [editingId, setEditingId] = useState<number | null>(null)
  const [copied, setCopied] = useState('')

  const account = wallet.account || ''
  const networkReady = isInriChain(wallet.chainId || '')
  const providerReady = Boolean(wallet.providerReady && wallet.provider)

  const createPreview = useMemo(() => {
    try {
      const inri = parseInriAmount(createInriAmount)
      const price = parsePrice(createPrice)
      const gross = quoteIusdGrossLocal(inri, price)
      const fee = feeOfLocal(gross, stats?.feeBps || 0)
      return { inri, price, gross, fee, net: gross - fee }
    } catch {
      return { inri: 0n, price: 0n, gross: 0n, fee: 0n, net: 0n }
    }
  }, [createInriAmount, createPrice, stats?.feeBps])

  const showToast = useCallback((message: string, tone: ToastTone = 'info', txHash?: string) => {
    setToast({ message, tone, txHash })
    window.setTimeout(() => setToast((current) => (current?.message === message ? null : current)), 9000)
  }, [])

  const syncWallet = useCallback(async (switchNetwork = false) => {
    const snap = await readActiveWalletSnapshot()
    if (switchNetwork && snap.provider) {
      const nextChainId = await switchProviderToInri(snap.provider)
      setWallet({ ...snap, chainId: nextChainId || INRI_CHAIN_ID_HEX })
      return { ...snap, chainId: nextChainId || INRI_CHAIN_ID_HEX }
    }
    setWallet(snap)
    return snap
  }, [])

  const refreshData = useCallback(async (nextPage = page) => {
    setLoading(true)
    try {
      const snap = await readActiveWalletSnapshot()
      setWallet(snap)
      const maker = view === 'mine' && snap.account ? snap.account : undefined
      const [nextStats, orderPage, nextEvents, nextInri, nextIusd, nextAllowance] = await Promise.all([
        loadP2PStats(),
        loadRecentP2POrders({ limit: ORDER_PAGE_LIMIT, page: nextPage, activeOnly, maker }),
        loadP2PEvents(32),
        snap.account ? getInriBalance(snap.account) : Promise.resolve(0n),
        snap.account ? getIusdBalance(snap.account) : Promise.resolve(0n),
        snap.account ? getIusdAllowance(snap.account) : Promise.resolve(0n),
      ])
      setStats(nextStats)
      setOrders(orderPage.items)
      setEvents(nextEvents)
      setInriBalance(nextInri)
      setIusdBalance(nextIusd)
      setAllowance(nextAllowance)
      setHasMore(orderPage.hasMore)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Unable to load P2P market'), 'error')
    } finally {
      setLoading(false)
    }
  }, [activeOnly, page, showToast, view])

  useEffect(() => {
    void refreshData(page)
    const interval = window.setInterval(() => void refreshData(page), 25000)
    return () => window.clearInterval(interval)
  }, [page, refreshData])

  const filteredOrders = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return orders
      .filter((order) => sideFilter === 'all' || order.side === sideFilter)
      .filter((order) => {
        if (!needle) return true
        return (
          String(order.id).includes(needle) ||
          order.maker.toLowerCase().includes(needle) ||
          order.priceDisplay.toLowerCase().includes(needle)
        )
      })
  }, [orders, query, sideFilter])

  const ensureWriteReady = useCallback(async () => {
    let snap = await syncWallet(false)
    const provider = snap.provider || getActiveWalletProvider()
    if (!provider) throw new Error('Connect wallet in the top header first.')

    if (!snap.account) {
      const accounts = (await requestFromActiveWallet(provider, 'eth_requestAccounts')) as string[]
      snap = await readActiveWalletSnapshot()
      snap = { ...snap, account: accounts?.[0] || snap.account }
      setWallet(snap)
    }

    if (!snap.account) throw new Error('Wallet connected, but no account was returned.')

    if (!isInriChain(snap.chainId || '')) {
      const nextChainId = await switchProviderToInri(provider)
      snap = { ...snap, chainId: nextChainId || INRI_CHAIN_ID_HEX }
      setWallet(snap)
    }

    return { provider, account: snap.account }
  }, [syncWallet])

  const waitForReceipt = useCallback(async (hash: string) => {
    for (let attempt = 0; attempt < 90; attempt += 1) {
      const receipt = (await rpcCall('eth_getTransactionReceipt', [hash]).catch(() => null)) as { status?: string } | null
      if (receipt?.status === '0x1') return receipt
      if (receipt?.status === '0x0') throw new Error('Transaction reverted on INRI CHAIN. Check the explorer details.')
      await new Promise((resolve) => window.setTimeout(resolve, 2500))
    }
    return null
  }, [])

  const sendContractTx = useCallback(async (
    target: TxTarget,
    functionName: string,
    args: readonly unknown[] = [],
    value = 0n,
    fallbackGas = 520000n,
  ) => {
    const { provider, account: from } = await ensureWriteReady()
    const isToken = target === 'iusd'
    const to = isToken ? P2P_IUSD_ADDRESS : P2P_MARKET_ADDRESS
    const data = isToken
      ? iusdInterface.encodeFunctionData(functionName, args)
      : p2pInterface.encodeFunctionData(functionName, args)

    const baseTx: Record<string, unknown> = {
      from,
      to,
      data,
      ...(value > 0n ? { value: toHex(value) } : {}),
    }

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

    const hash = normalizeHash(await requestFromActiveWallet(provider as EthereumProvider, 'eth_sendTransaction', [tx]))
    if (!hash) throw new Error('Wallet did not return a transaction hash.')
    setToast({ message: 'Transaction sent. Waiting for confirmation...', tone: 'info', txHash: hash })
    await waitForReceipt(hash)
    return hash
  }, [ensureWriteReady, waitForReceipt])

  const approveIusd = useCallback(async (amount: bigint, label = 'Approve iUSD') => {
    if (amount <= 0n) throw new Error('Invalid approval amount.')
    setBusyAction(label)
    try {
      const hash = await sendContractTx('iusd', 'approve', [P2P_MARKET_ADDRESS, amount], 0n, 120000n)
      showToast('iUSD approval confirmed.', 'success', hash)
      await refreshData(page)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Approval failed'), 'error')
    } finally {
      setBusyAction(null)
    }
  }, [page, refreshData, sendContractTx, showToast])

  const createOrder = useCallback(async () => {
    setBusyAction('create')
    try {
      const inriAmount = parseInriAmount(createInriAmount)
      const priceRaw = parsePrice(createPrice)
      if (inriAmount <= 0n || priceRaw <= 0n) throw new Error('Enter a valid INRI amount and iUSD price.')

      const minutes = Math.max(0, Number(createDeadlineMinutes || 0))
      const deadline = minutes > 0 ? Math.floor(Date.now() / 1000) + Math.floor(minutes * 60) : 0
      const gross = quoteIusdGrossLocal(inriAmount, priceRaw)

      if (createSide === 'buy') {
        if (gross <= 0n) throw new Error('The buy order iUSD amount is too small.')
        if (iusdBalance < gross) throw new Error('Not enough iUSD balance for this buy order.')
        if (allowance < gross) throw new Error('Approve iUSD for the P2P contract before creating this buy order.')
      }

      const hash = createSide === 'sell'
        ? await sendContractTx('market', 'createSellOrder', [priceRaw, deadline], inriAmount, 420000n)
        : await sendContractTx('market', 'createBuyOrder', [inriAmount, priceRaw, deadline], 0n, 520000n)

      showToast(`${createSide === 'sell' ? 'SELL' : 'BUY'} order created.`, 'success', hash)
      setCreateInriAmount('')
      setCreatePrice('')
      setCreateDeadlineMinutes('0')
      setView('mine')
      setPage(1)
      await refreshData(1)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Could not create order'), 'error')
    } finally {
      setBusyAction(null)
    }
  }, [allowance, createDeadlineMinutes, createInriAmount, createPrice, createSide, iusdBalance, refreshData, sendContractTx, showToast])

  const fillOrder = useCallback(async (order: P2POrder) => {
    const action = `fill-${order.id}`
    setBusyAction(action)
    try {
      const amount = parseInriAmount(fillAmounts[order.id] || '')
      if (amount <= 0n) throw new Error('Enter the INRI amount to fill.')
      if (amount > order.remainingInri) throw new Error('Fill amount is larger than the remaining order size.')
      const gross = quoteIusdGrossLocal(amount, order.priceRaw)
      const fee = feeOfLocal(gross, stats?.feeBps || 0)
      const net = gross - fee

      if (order.side === 'sell') {
        if (allowance < gross) throw new Error('Approve enough iUSD before buying INRI from this SELL order.')
        const hash = await sendContractTx('market', 'fillSellOrder', [order.id, amount, gross], 0n, 620000n)
        showToast(`Order #${order.id} filled.`, 'success', hash)
      } else {
        const hash = await sendContractTx('market', 'fillBuyOrder', [order.id, amount, net], amount, 620000n)
        showToast(`Order #${order.id} filled.`, 'success', hash)
      }

      setFillAmounts((previous) => ({ ...previous, [order.id]: '' }))
      await refreshData(page)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Fill failed'), 'error')
    } finally {
      setBusyAction(null)
    }
  }, [allowance, fillAmounts, page, refreshData, sendContractTx, showToast, stats?.feeBps])

  const cancelOrder = useCallback(async (order: P2POrder) => {
    const action = `cancel-${order.id}`
    setBusyAction(action)
    try {
      const hash = await sendContractTx('market', 'cancelOrder', [order.id], 0n, 360000n)
      showToast(`Order #${order.id} cancelled.`, 'success', hash)
      await refreshData(page)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Cancel failed'), 'error')
    } finally {
      setBusyAction(null)
    }
  }, [page, refreshData, sendContractTx, showToast])

  const startEdit = (order: P2POrder) => {
    setEditingId(order.id)
    const currentRemainingMinutes = order.deadline ? Math.max(0, Math.round((order.deadline - Math.floor(Date.now() / 1000)) / 60)) : 0
    setEditDrafts((previous) => ({
      ...previous,
      [order.id]: {
        price: order.priceDisplay.replace(/,/g, ''),
        deadlineMinutes: String(currentRemainingMinutes),
      },
    }))
  }

  const saveEdit = useCallback(async (order: P2POrder) => {
    const draft = editDrafts[order.id]
    if (!draft) return
    const action = `edit-${order.id}`
    setBusyAction(action)
    try {
      const newPriceRaw = parsePrice(draft.price)
      const newDeadlineMinutes = Math.max(0, Number(draft.deadlineMinutes || 0))
      const newDeadline = newDeadlineMinutes > 0 ? Math.floor(Date.now() / 1000) + Math.floor(newDeadlineMinutes * 60) : 0
      const txHashes: string[] = []

      if (newPriceRaw > 0n && newPriceRaw !== order.priceRaw) {
        txHashes.push(await sendContractTx('market', 'updatePrice', [order.id, newPriceRaw], 0n, 520000n))
      }

      const oldMinutes = order.deadline ? Math.max(0, Math.round((order.deadline - Math.floor(Date.now() / 1000)) / 60)) : 0
      if (Math.abs(newDeadlineMinutes - oldMinutes) > 1) {
        txHashes.push(await sendContractTx('market', 'updateDeadline', [order.id, newDeadline], 0n, 280000n))
      }

      if (txHashes.length === 0) throw new Error('Nothing changed in this order.')
      showToast(`Order #${order.id} updated.`, 'success', txHashes[txHashes.length - 1])
      setEditingId(null)
      await refreshData(page)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Update failed'), 'error')
    } finally {
      setBusyAction(null)
    }
  }, [editDrafts, page, refreshData, sendContractTx, showToast])

  const resizeOrder = useCallback(async (order: P2POrder, mode: 'add' | 'remove') => {
    const action = `resize-${mode}-${order.id}`
    setBusyAction(action)
    try {
      const rawValue = resizeAmounts[order.id] || ''
      if (!rawValue) throw new Error('Enter an amount first.')
      let hash = ''

      if (order.side === 'sell') {
        const inriAmount = parseInriAmount(rawValue)
        if (inriAmount <= 0n) throw new Error('Enter a valid INRI amount.')
        hash = mode === 'add'
          ? await sendContractTx('market', 'addInriToSellOrder', [order.id], inriAmount, 420000n)
          : await sendContractTx('market', 'removeInriFromSellOrder', [order.id, inriAmount], 0n, 420000n)
      } else if (mode === 'add') {
        const iusdAmount = parseIusdAmount(rawValue)
        if (iusdAmount <= 0n) throw new Error('Enter a valid iUSD amount.')
        if (allowance < iusdAmount) throw new Error('Approve enough iUSD before adding to this BUY order.')
        hash = await sendContractTx('market', 'addIusdToBuyOrder', [order.id, iusdAmount], 0n, 520000n)
      } else {
        const inriAmount = parseInriAmount(rawValue)
        if (inriAmount <= 0n) throw new Error('Enter a valid INRI amount.')
        hash = await sendContractTx('market', 'reduceBuyOrder', [order.id, inriAmount], 0n, 420000n)
      }

      showToast(`Order #${order.id} size updated.`, 'success', hash)
      setResizeAmounts((previous) => ({ ...previous, [order.id]: '' }))
      await refreshData(page)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Resize failed'), 'error')
    } finally {
      setBusyAction(null)
    }
  }, [allowance, page, refreshData, resizeAmounts, sendContractTx, showToast])

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      window.setTimeout(() => setCopied(''), 1800)
    } catch {}
  }

  const needsCreateApproval = createSide === 'buy' && createPreview.gross > 0n && allowance < createPreview.gross

  const viewButton = (target: P2PView, label: string, icon: ReactNode) => (
    <button
      type="button"
      onClick={() => { setView(target); setPage(1) }}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black transition ${
        view === target
          ? 'border-cyan-200/60 bg-cyan-300 text-[#03111a] shadow-[0_14px_34px_rgba(19,164,255,0.18)]'
          : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className="notranslate grid gap-6 text-white" translate="no">
      <div className="rounded-[2rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_20%_0%,rgba(19,164,255,0.16),transparent_34%),linear-gradient(180deg,rgba(7,18,31,0.98),rgba(1,5,10,0.98))] p-5 shadow-[0_34px_110px_rgba(0,0,0,0.42)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/22 bg-cyan-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100">
              <ShieldCheck className="h-4 w-4" /> Live INRI contract
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">INRI / iUSD P2P Market</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
              Create buy and sell orders, fill partially, edit price or deadline, resize your open positions and cancel safely. Native INRI is held by the contract for SELL orders; iUSD is locked for BUY orders.
            </p>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap sm:justify-end">
            <button type="button" onClick={() => void syncWallet(true).then(() => refreshData(page))} className={buttonBase(false)} disabled={busyAction !== null}>
              <Wallet className="h-4 w-4" /> {providerReady ? shortAddress(account, 5) : 'Use top wallet'}
            </button>
            <button type="button" onClick={() => void refreshData(page)} className={buttonBase(true)} disabled={loading || busyAction !== null}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <StatCard icon={<Store className="h-4 w-4" />} label="Orders" value={String(stats?.totalOrders ?? '—')} sub="created on-chain" />
          <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="Fee" value={`${((stats?.feeBps || 0) / 100).toFixed(2)}%`} sub={`${stats?.feeBps || 0} bps to treasury`} />
          <StatCard icon={<Wallet className="h-4 w-4" />} label="INRI balance" value={formatInri(inriBalance)} sub="native wallet balance" />
          <StatCard icon={<BadgeCheck className="h-4 w-4" />} label="iUSD balance" value={formatIusd(iusdBalance)} sub={shortAddress(P2P_IUSD_ADDRESS, 5)} />
          <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Allowance" value={formatIusd(allowance)} sub="approved for P2P" />
        </div>

        <div className="mt-5 grid gap-3 rounded-[1.35rem] border border-white/10 bg-black/22 p-4 text-sm leading-7 text-white/60 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-1">
            <div>
              Wallet: <span className="font-black text-white">{account ? shortAddress(account, 6) : 'not connected'}</span> · Network: <span className={networkReady ? 'font-black text-emerald-200' : 'font-black text-amber-200'}>{networkReady ? 'INRI CHAIN' : wallet.chainId || 'not ready'}</span>
            </div>
            <div className="break-all text-xs text-white/42">
              P2P: {P2P_MARKET_ADDRESS} · iUSD: {P2P_IUSD_ADDRESS}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={P2P_EXPLORER_ADDRESS_URL} target="_blank" rel="noreferrer" className={buttonBase(false)}><ExternalLink className="h-4 w-4" /> Contract</a>
            <a href={IUSD_EXPLORER_TOKEN_URL} target="_blank" rel="noreferrer" className={buttonBase(false)}><ExternalLink className="h-4 w-4" /> iUSD</a>
          </div>
        </div>
      </div>

      {toast ? (
        <div className={`flex flex-col gap-3 rounded-[1.35rem] border p-4 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between ${statusClass(toast.tone)}`}>
          <div className="flex items-center gap-3">
            {toast.tone === 'success' ? <CheckCircle2 className="h-5 w-5" /> : toast.tone === 'error' ? <XCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <span>{toast.message}</span>
          </div>
          {toast.txHash ? (
            <a href={`${EXPLORER_TX_URL}${toast.txHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] underline underline-offset-4">
              View TX <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {viewButton('market', 'Market', <Store className="h-4 w-4" />)}
        {viewButton('create', 'Create', <Plus className="h-4 w-4" />)}
        {viewButton('mine', 'My Orders', <Wallet className="h-4 w-4" />)}
        {viewButton('activity', 'Activity', <Activity className="h-4 w-4" />)}
      </div>

      {view === 'create' ? (
        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/58">New order</div>
                <h3 className="mt-2 text-2xl font-black text-white">Create a P2P offer</h3>
              </div>
              <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100">iUSD / INRI</div>
            </div>

            <div className="mt-5 grid gap-4">
              <Field label="Order side">
                <select className={selectClass()} value={createSide} onChange={(event) => setCreateSide(event.target.value as 'sell' | 'buy')}>
                  <option value="sell">SELL INRI for iUSD</option>
                  <option value="buy">BUY INRI with iUSD</option>
                </select>
              </Field>

              <Field label="INRI amount" hint={createSide === 'sell' ? 'This native INRI amount will be locked in the contract.' : 'How much INRI you want to buy.'}>
                <input className={inputClass()} value={createInriAmount} onChange={(event) => setCreateInriAmount(event.target.value)} placeholder="Example: 1000" inputMode="decimal" />
              </Field>

              <Field label="Price: iUSD per 1 INRI" hint="Example: 1 means 1 iUSD for each 1 INRI.">
                <input className={inputClass()} value={createPrice} onChange={(event) => setCreatePrice(event.target.value)} placeholder="Example: 1" inputMode="decimal" />
              </Field>

              <Field label="Deadline in minutes" hint="Use 0 for no deadline. Example: 1440 = 24 hours.">
                <input className={inputClass()} value={createDeadlineMinutes} onChange={(event) => setCreateDeadlineMinutes(event.target.value)} placeholder="0" inputMode="numeric" />
              </Field>

              {needsCreateApproval ? (
                <button type="button" onClick={() => void approveIusd(createPreview.gross, 'approve-create')} disabled={busyAction !== null} className={buttonBase(false)}>
                  <BadgeCheck className="h-4 w-4" /> Approve {formatIusd(createPreview.gross)} iUSD first
                </button>
              ) : null}

              <button type="button" onClick={() => void createOrder()} disabled={busyAction !== null || !providerReady} className={buttonBase(true)}>
                {busyAction === 'create' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create {createSide === 'sell' ? 'SELL' : 'BUY'} order
              </button>
            </div>
          </Card>

          <Card>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/58">Preview</div>
            <h3 className="mt-2 text-2xl font-black text-white">Order summary</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatCard icon={<ArrowDownUp className="h-4 w-4" />} label="INRI size" value={formatInri(createPreview.inri)} sub={createSide === 'sell' ? 'you lock native INRI' : 'you want to receive'} />
              <StatCard icon={<BadgeCheck className="h-4 w-4" />} label="iUSD gross" value={formatIusd(createPreview.gross)} sub={createSide === 'buy' ? 'locked by maker' : 'paid by taker'} />
              <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="Fee estimate" value={formatIusd(createPreview.fee)} sub={`${stats?.feeBps || 0} bps`} />
              <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Net iUSD" value={formatIusd(createPreview.net)} sub="after fee on fill" />
            </div>
            <div className="mt-5 rounded-[1.25rem] border border-cyan-300/14 bg-cyan-300/8 p-4 text-sm leading-7 text-white/64">
              <b className="text-white">How this contract works:</b> SELL orders lock native INRI and takers pay iUSD. BUY orders lock iUSD and takers sell native INRI into the order. Partial fills are supported and slippage protection is automatically passed in every fill transaction.
            </div>
          </Card>
        </div>
      ) : null}

      {view === 'market' || view === 'mine' ? (
        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/58">{view === 'mine' ? 'Wallet orders' : 'Live market'}</div>
              <h3 className="mt-2 text-2xl font-black text-white">{view === 'mine' ? 'Manage your orders' : 'Open INRI/iUSD orders'}</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(180px,1fr)_160px_140px_auto] lg:min-w-[720px]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/36" />
                <input className={`${inputClass()} pl-11`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order or maker" />
              </label>
              <select className={selectClass()} value={sideFilter} onChange={(event) => setSideFilter(event.target.value as SideFilter)}>
                <option value="all">All sides</option>
                <option value="sell">Sell INRI</option>
                <option value="buy">Buy INRI</option>
              </select>
              <select className={selectClass()} value={activeOnly ? 'active' : 'all'} onChange={(event) => setActiveOnly(event.target.value === 'active')}>
                <option value="active">Active only</option>
                <option value="all">All orders</option>
              </select>
              <button type="button" onClick={() => void refreshData(page)} className={buttonBase(false)} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Reload
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {filteredOrders.length === 0 ? (
              <div className="xl:col-span-2">
                <EmptyState title={loading ? 'Loading orders...' : 'No orders found'} body={view === 'mine' ? 'Connect your wallet or create a new order to see it here.' : 'There are no matching orders in the current page/filter.'} />
              </div>
            ) : filteredOrders.map((order) => {
              const isMaker = account && order.maker.toLowerCase() === account.toLowerCase()
              const amountText = fillAmounts[order.id] || ''
              let fillGross = 0n
              try {
                const amount = parseInriAmount(amountText)
                fillGross = quoteIusdGrossLocal(amount, order.priceRaw)
              } catch {}

              const fillFee = feeOfLocal(fillGross, stats?.feeBps || 0)
              const fillNet = fillGross - fillFee
              const canFill = order.active && !order.expired && !isMaker
              const draft = editDrafts[order.id] || { price: order.priceDisplay.replace(/,/g, ''), deadlineMinutes: '0' }

              return (
                <div key={order.id} className="rounded-[1.5rem] border border-white/10 bg-black/22 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] ${order.side === 'sell' ? 'border-cyan-300/22 bg-cyan-300/10 text-cyan-100' : 'border-emerald-300/22 bg-emerald-300/10 text-emerald-100'}`}>
                          {order.side === 'sell' ? 'SELL INRI' : 'BUY INRI'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-white/60">#{order.id}</span>
                        {isMaker ? <span className="rounded-full border border-amber-300/24 bg-amber-300/10 px-3 py-1.5 text-xs font-black text-amber-100">Your order</span> : null}
                      </div>
                      <div className="mt-3 text-xs font-semibold text-white/46">Maker</div>
                      <button type="button" onClick={() => void copyText(order.maker, `maker-${order.id}`)} className="mt-1 inline-flex items-center gap-2 break-all text-left text-sm font-black text-white hover:text-cyan-100">
                        {shortAddress(order.maker, 8)} <Copy className="h-3.5 w-3.5" />
                      </button>
                      {copied === `maker-${order.id}` ? <span className="ml-2 text-xs font-black text-emerald-200">copied</span> : null}
                    </div>

                    <div className={`rounded-full border px-3 py-1.5 text-xs font-black ${order.active && !order.expired ? statusClass('success') : statusClass(order.expired ? 'warning' : 'neutral')}`}>
                      {order.active ? (order.expired ? 'Expired' : 'Active') : 'Closed'}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Remaining INRI</div>
                      <div className="mt-1 text-lg font-black text-white">{order.remainingInriDisplay}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Price</div>
                      <div className="mt-1 text-lg font-black text-white">{order.priceDisplay} iUSD</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Locked iUSD</div>
                      <div className="mt-1 text-lg font-black text-white">{order.remainingIusdDisplay}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Deadline</div>
                      <div className="mt-1 text-lg font-black text-white">{deadlineLabel(order.deadline)}</div>
                    </div>
                  </div>

                  {canFill ? (
                    <div className="mt-4 rounded-[1.25rem] border border-cyan-300/12 bg-cyan-300/[0.055] p-3">
                      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                        <Field label={order.side === 'sell' ? 'INRI to buy' : 'INRI to sell'} hint={order.side === 'sell' ? `Needs ${formatIusd(fillGross)} iUSD allowance.` : `You receive about ${formatIusd(fillNet)} iUSD net.`}>
                          <input className={inputClass()} value={amountText} onChange={(event) => setFillAmounts((previous) => ({ ...previous, [order.id]: event.target.value }))} placeholder="Amount" inputMode="decimal" />
                        </Field>
                        <div className="flex flex-wrap gap-2">
                          {order.side === 'sell' && fillGross > 0n && allowance < fillGross ? (
                            <button type="button" onClick={() => void approveIusd(fillGross, `approve-fill-${order.id}`)} disabled={busyAction !== null} className={buttonBase(false)}>
                              <BadgeCheck className="h-4 w-4" /> Approve iUSD
                            </button>
                          ) : null}
                          <button type="button" onClick={() => void fillOrder(order)} disabled={busyAction !== null || !providerReady} className={buttonBase(true)}>
                            {busyAction === `fill-${order.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowDownUp className="h-4 w-4" />}
                            Fill
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs font-semibold text-white/50 sm:grid-cols-3">
                        <span>Gross: <b className="text-white">{formatIusd(fillGross)}</b></span>
                        <span>Fee: <b className="text-white">{formatIusd(fillFee)}</b></span>
                        <span>Net: <b className="text-white">{formatIusd(fillNet)}</b></span>
                      </div>
                    </div>
                  ) : null}

                  {isMaker && order.active ? (
                    <div className="mt-4 grid gap-3 rounded-[1.25rem] border border-amber-300/14 bg-amber-300/[0.045] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm font-black text-white">Manage order</div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => startEdit(order)} className={buttonBase(false)} disabled={busyAction !== null}>
                            <Edit3 className="h-4 w-4" /> Edit
                          </button>
                          <button type="button" onClick={() => void cancelOrder(order)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-red-300/24 bg-red-400/10 px-4 py-2 text-sm font-black text-red-100 transition hover:bg-red-400/14 disabled:cursor-not-allowed disabled:opacity-50" disabled={busyAction !== null}>
                            {busyAction === `cancel-${order.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancel
                          </button>
                        </div>
                      </div>

                      {editingId === order.id ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          <Field label="New price iUSD / INRI">
                            <input className={inputClass()} value={draft.price} onChange={(event) => setEditDrafts((previous) => ({ ...previous, [order.id]: { ...draft, price: event.target.value } }))} inputMode="decimal" />
                          </Field>
                          <Field label="New deadline minutes">
                            <input className={inputClass()} value={draft.deadlineMinutes} onChange={(event) => setEditDrafts((previous) => ({ ...previous, [order.id]: { ...draft, deadlineMinutes: event.target.value } }))} inputMode="numeric" />
                          </Field>
                          <button type="button" onClick={() => void saveEdit(order)} className={buttonBase(true)} disabled={busyAction !== null}>
                            {busyAction === `edit-${order.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save changes
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className={buttonBase(false)} disabled={busyAction !== null}>Close edit</button>
                        </div>
                      ) : null}

                      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                        <Field label={order.side === 'sell' ? 'Resize INRI amount' : 'Resize amount'} hint={order.side === 'buy' ? 'Add uses iUSD amount. Remove/reduce uses INRI amount.' : 'Add/remove native INRI from this SELL order.'}>
                          <input className={inputClass()} value={resizeAmounts[order.id] || ''} onChange={(event) => setResizeAmounts((previous) => ({ ...previous, [order.id]: event.target.value }))} placeholder={order.side === 'buy' ? 'iUSD for add, INRI for reduce' : 'INRI amount'} inputMode="decimal" />
                        </Field>
                        {order.side === 'buy' ? (
                          <button type="button" onClick={() => {
                            try { void approveIusd(parseIusdAmount(resizeAmounts[order.id] || ''), `approve-resize-${order.id}`) } catch { showToast('Enter an iUSD amount first.', 'warning') }
                          }} className={buttonBase(false)} disabled={busyAction !== null}>
                            <BadgeCheck className="h-4 w-4" /> Approve add
                          </button>
                        ) : null}
                        <button type="button" onClick={() => void resizeOrder(order, 'add')} className={buttonBase(false)} disabled={busyAction !== null}>
                          {busyAction === `resize-add-${order.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
                        </button>
                        <button type="button" onClick={() => void resizeOrder(order, 'remove')} className={buttonBase(false)} disabled={busyAction !== null}>
                          {busyAction === `resize-remove-${order.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />} {order.side === 'buy' ? 'Reduce' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-white/48">Page {page} · showing {filteredOrders.length} orders</div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} className={buttonBase(false)} disabled={page <= 1 || loading}>Previous</button>
              <button type="button" onClick={() => setPage((current) => current + 1)} className={buttonBase(false)} disabled={!hasMore || loading}>Next</button>
            </div>
          </div>
        </Card>
      ) : null}

      {view === 'activity' ? (
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/58">Recent events</div>
              <h3 className="mt-2 text-2xl font-black text-white">On-chain P2P activity</h3>
            </div>
            <button type="button" onClick={() => void refreshData(page)} className={buttonBase(false)} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Reload events</button>
          </div>

          <div className="mt-5 grid gap-3">
            {events.length === 0 ? <EmptyState title="No recent events loaded" body="The contract may be new or the explorer/RPC event window has no matching logs yet." /> : events.map((event, index) => (
              <div key={`${event.txHash}-${index}`} className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-black/22 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1.5 text-xs font-black text-cyan-100">#{event.orderId}</span>
                    <span className="text-sm font-black text-white">{eventLabel(event.kind)}</span>
                    {event.timestamp ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/42"><Clock3 className="h-3.5 w-3.5" /> {new Date(event.timestamp * 1000).toLocaleString()}</span> : null}
                  </div>
                  <div className="mt-2 grid gap-1 text-xs font-semibold text-white/50 sm:grid-cols-2 lg:grid-cols-4">
                    {event.inri ? <span>INRI: <b className="text-white">{event.inri}</b></span> : null}
                    {event.iusd ? <span>iUSD: <b className="text-white">{event.iusd}</b></span> : null}
                    {event.fee ? <span>Fee: <b className="text-white">{event.fee}</b></span> : null}
                    {event.price ? <span>Price: <b className="text-white">{event.price}</b></span> : null}
                  </div>
                  <div className="mt-2 break-all text-xs font-semibold text-white/36">TX: {event.txHash}</div>
                </div>
                <a href={`${EXPLORER_TX_URL}${event.txHash}`} target="_blank" rel="noreferrer" className={buttonBase(false)}><ExternalLink className="h-4 w-4" /> Explorer</a>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
