'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Copy,
  Edit3,
  ExternalLink,
  Info,
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
  loadP2PLockedBalances,
  loadP2PStats,
  loadRecentP2POrders,
  P2P_EXPLORER_ADDRESS_URL,
  P2P_IUSD_ADDRESS,
  P2P_MARKET_ADDRESS,
  p2pInterface,
  parseInriAmount,
  parseIusdAmount,
  parsePrice,
  percentVsReference,
  quoteIusdGrossLocal,
  shortAddress,
  type P2PEventItem,
  type P2PLockedBalances,
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
type MyOrderTab = 'active' | 'filled' | 'cancelled'

type Toast = {
  tone: ToastTone
  message: string
  txHash?: string
}

const ORDER_PAGE_LIMIT = 42

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

function fullDeadlineLabel(deadline: number) {
  if (!deadline) return 'No deadline. Order stays open until filled or cancelled.'
  return `${new Date(deadline * 1000).toLocaleString()} · auto-expires if unfilled; maker can cancel/refund.`
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

function statusClass(tone: ToastTone | 'neutral' | 'partial' = 'neutral') {
  if (tone === 'success') return 'border-emerald-400/24 bg-emerald-400/10 text-emerald-100'
  if (tone === 'warning') return 'border-amber-300/26 bg-amber-300/10 text-amber-100'
  if (tone === 'error') return 'border-red-400/24 bg-red-400/10 text-red-100'
  if (tone === 'info') return 'border-cyan-300/24 bg-cyan-300/10 text-cyan-100'
  if (tone === 'partial') return 'border-violet-300/24 bg-violet-300/10 text-violet-100'
  return 'border-white/12 bg-white/[0.045] text-white/72'
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.7rem] border border-cyan-300/15 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.08),transparent_28%),linear-gradient(180deg,rgba(7,17,29,0.96),rgba(2,7,13,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  )
}

function StatCard({ icon, label, value, sub, children }: { icon: ReactNode; label: string; value: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/58">{label}</div>
          <div className="mt-2 text-xl font-black tracking-tight text-white">{value}</div>
          {sub ? <div className="mt-1 text-xs font-semibold leading-5 text-white/50">{sub}</div> : null}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-200">{icon}</div>
      </div>
      {children ? <div className="mt-3 border-t border-white/10 pt-3">{children}</div> : null}
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

function orderStatusTone(order: P2POrder): ToastTone | 'partial' | 'neutral' {
  if (order.status === 'partial') return 'partial'
  if (order.status === 'active') return 'success'
  if (order.status === 'expired') return 'warning'
  if (order.status === 'cancelled') return 'error'
  if (order.status === 'filled') return 'info'
  return 'neutral'
}

function confirmAction(message: string) {
  if (typeof window === 'undefined') return true
  return window.confirm(message)
}

export function InriP2PClient() {
  const [view, setView] = useState<P2PView>('market')
  const [myOrderTab, setMyOrderTab] = useState<MyOrderTab>('active')
  const [wallet, setWallet] = useState<ActiveWalletSnapshot>({ provider: null, providerReady: false, account: null, chainId: null, connector: '' })
  const [stats, setStats] = useState<P2PStats | null>(null)
  const [orders, setOrders] = useState<P2POrder[]>([])
  const [events, setEvents] = useState<P2PEventItem[]>([])
  const [inriBalance, setInriBalance] = useState<bigint>(0n)
  const [iusdBalance, setIusdBalance] = useState<bigint>(0n)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [locked, setLocked] = useState<P2PLockedBalances>({ lockedInri: 0n, lockedIusd: 0n, sellOrders: 0, buyOrders: 0 })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState<BusyAction>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [query, setQuery] = useState('')
  const [sideFilter, setSideFilter] = useState<SideFilter>('all')

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
      const switched = { ...snap, chainId: nextChainId || INRI_CHAIN_ID_HEX }
      setWallet(switched)
      return switched
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
      const status = view === 'mine' ? myOrderTab : undefined
      const [nextStats, orderPage, nextEvents, nextInri, nextIusd, nextAllowance, nextLocked] = await Promise.all([
        loadP2PStats(),
        loadRecentP2POrders({ limit: ORDER_PAGE_LIMIT, page: nextPage, activeOnly: view === 'market', maker, status }),
        loadP2PEvents(36),
        snap.account ? getInriBalance(snap.account) : Promise.resolve(0n),
        snap.account ? getIusdBalance(snap.account) : Promise.resolve(0n),
        snap.account ? getIusdAllowance(snap.account) : Promise.resolve(0n),
        snap.account ? loadP2PLockedBalances(snap.account) : Promise.resolve({ lockedInri: 0n, lockedIusd: 0n, sellOrders: 0, buyOrders: 0 }),
      ])
      setStats(nextStats)
      setOrders(orderPage.items)
      setEvents(nextEvents)
      setInriBalance(nextInri)
      setIusdBalance(nextIusd)
      setAllowance(nextAllowance)
      setLocked(nextLocked)
      setHasMore(orderPage.hasMore)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Unable to load P2P market'), 'error')
    } finally {
      setLoading(false)
    }
  }, [myOrderTab, page, showToast, view])

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
          order.priceDisplay.toLowerCase().includes(needle) ||
          order.statusLabel.toLowerCase().includes(needle)
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
      const ok = confirmAction(`Approve ${formatIusd(amount)} iUSD for the P2P escrow contract?\n\nThis only gives allowance to the P2P contract. It does not create or fill an order by itself.`)
      if (!ok) return
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
      const fee = feeOfLocal(gross, stats?.feeBps || 0)
      const net = gross - fee

      if (createSide === 'buy') {
        if (gross <= 0n) throw new Error('The buy order iUSD amount is too small.')
        if (iusdBalance < gross) throw new Error('Not enough available iUSD balance for this buy order.')
        if (allowance < gross) throw new Error('Approve iUSD for the P2P contract before creating this buy order.')
      }

      const ok = confirmAction(
        createSide === 'sell'
          ? `Confirm SELL order\n\nLock INRI: ${formatInri(inriAmount)}\nPrice per INRI: ${createPrice} iUSD\nIf fully filled, maker receives about ${formatIusd(net)} iUSD after ${formatIusd(fee)} iUSD fee.\nDeadline: ${deadline ? new Date(deadline * 1000).toLocaleString() : 'No deadline'}`
          : `Confirm BUY order\n\nWant INRI: ${formatInri(inriAmount)}\nLock iUSD: ${formatIusd(gross)}\nPrice per INRI: ${createPrice} iUSD\nFee is charged only when fills happen, from filled amount.\nDeadline: ${deadline ? new Date(deadline * 1000).toLocaleString() : 'No deadline'}`,
      )
      if (!ok) return

      const hash = createSide === 'sell'
        ? await sendContractTx('market', 'createSellOrder', [priceRaw, deadline], inriAmount, 420000n)
        : await sendContractTx('market', 'createBuyOrder', [inriAmount, priceRaw, deadline], 0n, 520000n)

      showToast(`${createSide === 'sell' ? 'SELL' : 'BUY'} order created.`, 'success', hash)
      setCreateInriAmount('')
      setCreatePrice('')
      setCreateDeadlineMinutes('0')
      setView('mine')
      setMyOrderTab('active')
      setPage(1)
      await refreshData(1)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Could not create order'), 'error')
    } finally {
      setBusyAction(null)
    }
  }, [allowance, createDeadlineMinutes, createInriAmount, createPrice, createSide, iusdBalance, refreshData, sendContractTx, showToast, stats?.feeBps])

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

      const ok = confirmAction(
        order.side === 'sell'
          ? `Confirm fill SELL order #${order.id}\n\nYou receive: ${formatInri(amount)} INRI\nGross iUSD paid: ${formatIusd(gross)}\nTransaction fee: ${formatIusd(fee)} iUSD credited to treasury\nMaker receives net: ${formatIusd(net)} iUSD\n\nContinue?`
          : `Confirm fill BUY order #${order.id}\n\nYou send: ${formatInri(amount)} INRI\nGross iUSD matched: ${formatIusd(gross)}\nTransaction fee: ${formatIusd(fee)} iUSD credited to treasury\nYou receive net: ${formatIusd(net)} iUSD\n\nContinue?`,
      )
      if (!ok) return

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
      const refund = order.side === 'sell'
        ? `Remaining ${order.remainingInriDisplay} INRI will be refunded to your wallet.`
        : `Remaining ${order.remainingIusdDisplay} iUSD will be refunded to your wallet.`
      const ok = confirmAction(`Confirm cancel order #${order.id}?\n\n${refund}\nThis operation is irreversible; to trade again, create a new order.`)
      if (!ok) return
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
      const currentDeadlineText = order.deadline ? new Date(order.deadline * 1000).toLocaleString() : 'No deadline'
      const newDeadlineText = newDeadline ? new Date(newDeadline * 1000).toLocaleString() : 'No deadline'

      const ok = confirmAction(
        `Confirm edit order #${order.id}\n\nCurrent order:\nRemaining: ${order.remainingInriDisplay} INRI\nPrice: ${order.priceDisplay} iUSD per INRI\nDeadline: ${currentDeadlineText}\n\nModified order:\nRemaining: ${order.remainingInriDisplay} INRI\nPrice: ${draft.price} iUSD per INRI\nDeadline: ${newDeadlineText}\n\nFor BUY orders, changing price may add or refund locked iUSD automatically.`,
      )
      if (!ok) return

      const txHashes: string[] = []
      if (newPriceRaw > 0n && newPriceRaw !== order.priceRaw) {
        txHashes.push(await sendContractTx('market', 'updatePrice', [order.id, newPriceRaw], 0n, 520000n))
      }

      const oldMinutes = order.deadline ? Math.max(0, Math.round((order.deadline - Math.floor(Date.now() / 1000)) / 60)) : 0
      if (Math.abs(newDeadlineMinutes - oldMinutes) > 1) {
        txHashes.push(await sendContractTx('market', 'updateDeadline', [order.id, newDeadline], 0n, 260000n))
      }

      if (txHashes.length === 0) showToast('No edit changes detected.', 'warning')
      else showToast(`Order #${order.id} updated.`, 'success', txHashes[txHashes.length - 1])
      setEditingId(null)
      await refreshData(page)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Edit failed'), 'error')
    } finally {
      setBusyAction(null)
    }
  }, [editDrafts, page, refreshData, sendContractTx, showToast])

  const resizeOrder = useCallback(async (order: P2POrder, direction: 'add' | 'remove') => {
    const action = `resize-${direction}-${order.id}`
    setBusyAction(action)
    try {
      const raw = resizeAmounts[order.id] || ''
      if (!raw) throw new Error('Enter an amount first.')
      let hash = ''

      if (order.side === 'sell') {
        const amount = parseInriAmount(raw)
        if (amount <= 0n) throw new Error('Enter a valid INRI amount.')
        const ok = confirmAction(
          direction === 'add'
            ? `Confirm add to SELL order #${order.id}\n\nCurrent remaining: ${order.remainingInriDisplay} INRI\nAdd: ${formatInri(amount)} INRI\nNew estimated remaining: ${formatInri(order.remainingInri + amount)} INRI`
            : `Confirm remove from SELL order #${order.id}\n\nCurrent remaining: ${order.remainingInriDisplay} INRI\nRemove/refund: ${formatInri(amount)} INRI\nThis reduces the open order size.`,
        )
        if (!ok) return
        hash = direction === 'add'
          ? await sendContractTx('market', 'addInriToSellOrder', [order.id], amount, 360000n)
          : await sendContractTx('market', 'removeInriFromSellOrder', [order.id, amount], 0n, 360000n)
      } else if (direction === 'add') {
        const amount = parseIusdAmount(raw)
        if (amount <= 0n) throw new Error('Enter a valid iUSD amount.')
        if (allowance < amount) throw new Error('Approve iUSD before adding size to this BUY order.')
        const deltaInri = order.priceRaw > 0n ? (amount * 10n ** 18n) / order.priceRaw : 0n
        const ok = confirmAction(
          `Confirm add to BUY order #${order.id}\n\nCurrent locked iUSD: ${order.remainingIusdDisplay}\nAdd locked iUSD: ${formatIusd(amount)}\nEstimated extra INRI wanted: ${formatInri(deltaInri)}\nNew estimated remaining INRI: ${formatInri(order.remainingInri + deltaInri)}`,
        )
        if (!ok) return
        hash = await sendContractTx('market', 'addIusdToBuyOrder', [order.id, amount], 0n, 420000n)
      } else {
        const amount = parseInriAmount(raw)
        if (amount <= 0n) throw new Error('Enter a valid INRI amount.')
        const refundIusd = quoteIusdGrossLocal(amount, order.priceRaw)
        const ok = confirmAction(
          `Confirm reduce BUY order #${order.id}\n\nCurrent remaining: ${order.remainingInriDisplay} INRI wanted\nReduce: ${formatInri(amount)} INRI\nEstimated iUSD refund: ${formatIusd(refundIusd)}\nThis reduces the open order size.`,
        )
        if (!ok) return
        hash = await sendContractTx('market', 'reduceBuyOrder', [order.id, amount], 0n, 420000n)
      }

      showToast(`Order #${order.id} resized.`, 'success', hash)
      setResizeAmounts((previous) => ({ ...previous, [order.id]: '' }))
      await refreshData(page)
    } catch (cause) {
      showToast(getErrorMessage(cause, 'Resize failed'), 'error')
    } finally {
      setBusyAction(null)
    }
  }, [allowance, page, refreshData, resizeAmounts, sendContractTx, showToast])

  const copyValue = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      window.setTimeout(() => setCopied(''), 1600)
    } catch {
      showToast('Could not copy to clipboard.', 'warning')
    }
  }, [showToast])

  const setMainView = (nextView: P2PView) => {
    setView(nextView)
    setPage(1)
    setQuery('')
    setSideFilter('all')
  }

  const navButton = (key: P2PView, label: string, icon: ReactNode) => (
    <button key={key} type="button" onClick={() => setMainView(key)} className={`${view === key ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-50' : 'border-white/10 bg-white/[0.035] text-white/58'} inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-black transition hover:border-cyan-300/35 hover:text-white`}>
      {icon}{label}
    </button>
  )

  const disconnectedNotice = !providerReady ? 'Connect wallet in the top header to trade.' : !networkReady ? 'Switch wallet to INRI CHAIN before trading.' : ''

  return (
    <div className="grid gap-6">
      {toast ? (
        <div className={`flex flex-col gap-3 rounded-[1.25rem] border p-4 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between ${statusClass(toast.tone)}`}>
          <span>{toast.message}</span>
          {toast.txHash ? <a href={`${EXPLORER_TX_URL}${toast.txHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-black underline"><ExternalLink className="h-4 w-4" /> View tx</a> : null}
        </div>
      ) : null}

      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/22 bg-cyan-300/10 px-3 py-1.5 text-xs font-black text-cyan-100">
              <ShieldCheck className="h-4 w-4" /> Official INRI P2P Escrow
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">Market, orders and wallet balances</h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-white/58">
              Trade native INRI against iUSD with on-chain escrow. The P2P fee is charged only on filled amounts and is automatically credited to treasury.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void refreshData(page)} className={buttonBase(false)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Reload
            </button>
            <button type="button" onClick={() => void syncWallet(true)} className={buttonBase(!networkReady && providerReady)}>
              <Wallet className="h-4 w-4" /> {account ? shortAddress(account, 5) : 'Connect header wallet'}
            </button>
          </div>
        </div>

        {disconnectedNotice ? (
          <div className="mt-5 flex gap-3 rounded-[1.15rem] border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-semibold leading-6 text-amber-50">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{disconnectedNotice}</span>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <StatCard icon={<Store className="h-5 w-5" />} label="Orders" value={`${stats?.activeOrders ?? 0} active / ${stats?.totalOrders ?? 0} total`} sub={`${stats?.historicalOrders ?? 0} historical filled/cancelled/expired records`} />
          <StatCard icon={<BadgeCheck className="h-5 w-5" />} label="Fee" value={`${stats?.feePercentLabel ?? '0.00%'} on fills`} sub="Credited to treasury. Not charged for creating, editing or cancelling orders.">
            <div className="text-xs font-semibold leading-5 text-white/48">Treasury: <span className="font-black text-white/70">{shortAddress(stats?.treasury, 6)}</span></div>
          </StatCard>
          <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Reference price" value={`${stats?.referencePriceDisplay ?? '—'} iUSD`} sub={stats?.referenceSource || 'Median active order price'} />
          <StatCard icon={<Wallet className="h-5 w-5" />} label="Balance" value="Available / Locked">
            <div className="grid gap-2 text-xs font-semibold leading-5 text-white/60">
              <div>INRI: <b className="text-white">Available {formatInri(inriBalance)}</b> · Locked in sell orders <b className="text-white">{formatInri(locked.lockedInri)}</b></div>
              <div>iUSD: <b className="text-white">Available {formatIusd(iusdBalance)}</b> · Locked in buy orders <b className="text-white">{formatIusd(locked.lockedIusd)}</b></div>
            </div>
          </StatCard>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {navButton('market', 'Market', <Store className="h-4 w-4" />)}
        {navButton('create', 'Create order', <Plus className="h-4 w-4" />)}
        {navButton('mine', 'My Orders', <Wallet className="h-4 w-4" />)}
        {navButton('activity', 'Activity', <Activity className="h-4 w-4" />)}
      </div>

      {view === 'create' ? (
        <Card>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/58">Create order</div>
              <h3 className="mt-2 text-2xl font-black text-white">Open a BUY or SELL position</h3>
              <p className="mt-2 text-sm leading-7 text-white/54">SELL locks native INRI. BUY locks iUSD. Funds stay in the P2P escrow until filled, cancelled or resized.</p>

              <div className="mt-5 grid gap-4">
                <Field label="Order side">
                  <select className={selectClass()} value={createSide} onChange={(event) => setCreateSide(event.target.value as 'sell' | 'buy')}>
                    <option value="sell">SELL INRI for iUSD</option>
                    <option value="buy">BUY INRI with iUSD</option>
                  </select>
                </Field>
                <Field label={createSide === 'sell' ? 'INRI amount to sell' : 'INRI amount wanted'} hint={createSide === 'sell' ? 'This INRI amount will be locked in the escrow order.' : 'The matching iUSD amount will be locked in the escrow order.'}>
                  <input className={inputClass()} value={createInriAmount} onChange={(event) => setCreateInriAmount(event.target.value)} placeholder="0.00" inputMode="decimal" />
                </Field>
                <Field label="Price per INRI" hint="Example: 0.019 means 1 INRI = 0.019 iUSD.">
                  <input className={inputClass()} value={createPrice} onChange={(event) => setCreatePrice(event.target.value)} placeholder="0.019" inputMode="decimal" />
                </Field>
                <Field label="Deadline in minutes" hint="Use 0 for no deadline. Expired orders stop filling and maker can cancel/refund.">
                  <input className={inputClass()} value={createDeadlineMinutes} onChange={(event) => setCreateDeadlineMinutes(event.target.value)} placeholder="0" inputMode="numeric" />
                </Field>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-cyan-300/14 bg-cyan-300/[0.055] p-5">
              <div className="flex items-center gap-2 text-sm font-black text-cyan-100"><Info className="h-4 w-4" /> Preview before submit</div>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-white/62">
                <div className="flex justify-between gap-3"><span>INRI amount</span><b className="text-white">{formatInri(createPreview.inri)} INRI</b></div>
                <div className="flex justify-between gap-3"><span>Gross iUSD value</span><b className="text-white">{formatIusd(createPreview.gross)} iUSD</b></div>
                <div className="flex justify-between gap-3"><span>Estimated fee on full fill</span><b className="text-white">{formatIusd(createPreview.fee)} iUSD</b></div>
                <div className="flex justify-between gap-3"><span>Estimated net iUSD</span><b className="text-white">{formatIusd(createPreview.net)} iUSD</b></div>
                <div className="rounded-2xl border border-white/10 bg-black/22 p-3 text-xs leading-6 text-white/50">Fee is not paid when creating the order. It is applied only to filled order amounts.</div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {createSide === 'buy' && createPreview.gross > 0n && allowance < createPreview.gross ? (
                  <button type="button" onClick={() => void approveIusd(createPreview.gross, 'approve-create')} disabled={busyAction !== null} className={buttonBase(false)}>
                    <BadgeCheck className="h-4 w-4" /> Approve iUSD
                  </button>
                ) : null}
                <button type="button" onClick={() => void createOrder()} disabled={busyAction !== null || !providerReady} className={buttonBase(true)}>
                  {busyAction === 'create' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Create order
                </button>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {(view === 'market' || view === 'mine') ? (
        <Card>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/58">{view === 'market' ? 'Open orders' : 'My order history'}</div>
              <h3 className="mt-2 text-2xl font-black text-white">{view === 'market' ? 'Available P2P orders' : 'Active, filled and cancelled orders'}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/54">
                Reference price: <b className="text-white">{stats?.referencePriceDisplay ?? '—'} iUSD</b> · {stats?.referenceSource || 'No reference yet'}. Deadlines expire open orders and stop new fills.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div className="relative min-w-[240px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/32" />
                <input className={`${inputClass()} pl-11`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search id, maker, price..." />
              </div>
              <select className={selectClass()} value={sideFilter} onChange={(event) => setSideFilter(event.target.value as SideFilter)}>
                <option value="all">All sides</option>
                <option value="sell">SELL orders</option>
                <option value="buy">BUY orders</option>
              </select>
            </div>
          </div>

          {view === 'mine' ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {(['active', 'filled', 'cancelled'] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => { setMyOrderTab(tab); setPage(1) }} className={`${myOrderTab === tab ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-50' : 'border-white/10 bg-white/[0.035] text-white/58'} rounded-2xl border px-4 py-2 text-sm font-black capitalize transition hover:border-cyan-300/35 hover:text-white`}>
                  {tab}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-black/18 p-4 text-xs font-semibold leading-6 text-white/52">
            <b className="text-white">How to read cards:</b> SELL orders lock INRI and takers pay iUSD to receive INRI. BUY orders lock iUSD and takers send INRI to receive iUSD. The estimate panel shows gross amount, fee and net amount before you fill.
          </div>

          <div className="mt-5 grid gap-4">
            {filteredOrders.length === 0 ? <EmptyState title="No matching orders" body={view === 'market' ? 'No active open orders matched the current filters.' : 'No orders were found in this tab for your wallet.'} /> : null}

            {filteredOrders.map((order) => {
              const isMaker = account && order.maker.toLowerCase() === account.toLowerCase()
              const amountText = fillAmounts[order.id] || ''
              let fillAmount = 0n
              try { fillAmount = parseInriAmount(amountText) } catch { fillAmount = 0n }
              const fillGross = fillAmount > 0n ? quoteIusdGrossLocal(fillAmount, order.priceRaw) : 0n
              const fillFee = feeOfLocal(fillGross, stats?.feeBps || 0)
              const fillNet = fillGross - fillFee
              const draft = editDrafts[order.id] || { price: order.priceDisplay.replace(/,/g, ''), deadlineMinutes: '0' }
              const priceDiff = stats?.referencePriceRaw ? percentVsReference(order.priceRaw, stats.referencePriceRaw) : '—'

              return (
                <div key={order.id} className="rounded-[1.45rem] border border-white/10 bg-black/22 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`${order.side === 'sell' ? 'border-emerald-300/28 bg-emerald-400/10 text-emerald-100' : 'border-cyan-300/28 bg-cyan-300/10 text-cyan-100'} rounded-full border px-3 py-1.5 text-xs font-black`}>{order.side === 'sell' ? 'SELL INRI' : 'BUY INRI'}</span>
                        <span className="rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5 text-xs font-black text-white/72">#{order.id}</span>
                        <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${statusClass(orderStatusTone(order))}`}>{order.statusLabel}</span>
                      </div>
                      <div className="mt-3 text-2xl font-black text-white">{order.priceDisplay} iUSD <span className="text-sm font-semibold text-white/45">per INRI</span></div>
                      <div className="mt-1 text-xs font-semibold text-white/42">{priceDiff}</div>
                    </div>
                    <div className="grid gap-2 text-xs font-semibold text-white/48 xl:text-right">
                      <button type="button" onClick={() => void copyValue(String(order.id), `order-${order.id}`)} className="inline-flex items-center gap-2 hover:text-white"><Copy className="h-3.5 w-3.5" /> {copied === `order-${order.id}` ? 'Copied order id' : 'Copy order id'}</button>
                      <div>Maker: <button type="button" onClick={() => void copyValue(order.maker, `maker-${order.id}`)} className="font-black text-white/70 hover:text-white">{shortAddress(order.maker, 6)}</button></div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">Remaining INRI to {order.side === 'sell' ? 'sell' : 'buy'}</div>
                      <div className="mt-1 text-lg font-black text-white">{order.remainingInriDisplay}</div>
                      <div className="mt-1 text-xs font-semibold text-white/42">Original size: {order.initialInriDisplay} INRI</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">{order.side === 'sell' ? 'Locked INRI' : 'Locked iUSD'}</div>
                      <div className="mt-1 text-lg font-black text-white">{order.side === 'sell' ? order.remainingInriDisplay : order.remainingIusdDisplay}</div>
                      <div className="mt-1 text-xs font-semibold text-white/42">{order.lockedLabel}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">Order expires</div>
                      <div className="mt-1 text-lg font-black text-white">{deadlineLabel(order.deadline)}</div>
                      <div className="mt-1 text-xs font-semibold text-white/42">{fullDeadlineLabel(order.deadline)}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">Fill progress</div>
                      <div className="mt-1 text-lg font-black text-white">{order.progressPercent.toFixed(2)}%</div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300" style={{ width: `${order.progressPercent}%` }} /></div>
                    </div>
                  </div>

                  {order.active && view === 'market' ? (
                    <div className="mt-4 rounded-[1.25rem] border border-cyan-300/14 bg-cyan-300/[0.045] p-4">
                      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[1fr_auto] lg:items-end">
                        <Field label={order.side === 'sell' ? 'INRI to buy' : 'INRI to sell'} hint={order.side === 'sell' ? 'You pay iUSD and receive native INRI.' : 'You send native INRI and receive iUSD net after fee.'}>
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
                      <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/22 p-3 text-xs font-semibold text-white/56 sm:grid-cols-3">
                        <span>Gross amount: <b className="text-white">{formatIusd(fillGross)} iUSD</b></span>
                        <span>Fee: <b className="text-white">{formatIusd(fillFee)} iUSD</b></span>
                        <span>{order.side === 'sell' ? 'Net maker receives' : 'Net you receive'}: <b className="text-white">{formatIusd(fillNet)} iUSD</b></span>
                      </div>
                    </div>
                  ) : null}

                  {isMaker && order.active ? (
                    <div className="mt-4 grid gap-3 rounded-[1.25rem] border border-amber-300/14 bg-amber-300/[0.045] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-black text-white">Manage order</div>
                          <div className="text-xs font-semibold text-white/45">Edit, add, remove or cancel. Every operation shows a confirmation preview before wallet signing.</div>
                        </div>
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
                        <Field label={order.side === 'sell' ? 'Resize INRI amount' : 'Resize amount'} hint={order.side === 'buy' ? 'Add uses iUSD amount. Reduce uses INRI amount.' : 'Add/remove native INRI from this SELL order.'}>
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
              <p className="mt-2 text-sm leading-7 text-white/54">Create, fill, cancel, price/deadline edits and resize events from the official P2P contract.</p>
            </div>
            <button type="button" onClick={() => void refreshData(page)} className={buttonBase(false)} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Reload events</button>
          </div>

          <div className="mt-5 grid gap-3">
            {events.length === 0 ? <EmptyState title="No recent events loaded" body="The contract may be new or the RPC event window has no matching logs yet." /> : events.map((event, index) => (
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

      <Card className="p-4">
        <div className="grid gap-3 text-xs font-semibold leading-6 text-white/48 md:grid-cols-3">
          <a href={P2P_EXPLORER_ADDRESS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white"><ExternalLink className="h-4 w-4" /> P2P contract: {shortAddress(P2P_MARKET_ADDRESS, 6)}</a>
          <a href={IUSD_EXPLORER_TOKEN_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white"><ExternalLink className="h-4 w-4" /> iUSD token: {shortAddress(P2P_IUSD_ADDRESS, 6)}</a>
          <span className="inline-flex items-center gap-2"><Info className="h-4 w-4" /> Fee estimate shown before every fill.</span>
        </div>
      </Card>
    </div>
  )
}
