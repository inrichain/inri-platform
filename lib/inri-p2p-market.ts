'use client'

import { ethers } from 'ethers'
import { INRI_RPC_URL } from '@/lib/inri-active-wallet'

export const P2P_MARKET_ADDRESS = '0x2C556882c11B6DddD9CEFB1a9307515055bb7cdA'
export const P2P_IUSD_ADDRESS = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'
export const P2P_EXPLORER_ADDRESS_URL = `https://explorer.inri.life/address/${P2P_MARKET_ADDRESS}`
export const IUSD_EXPLORER_TOKEN_URL = `https://explorer.inri.life/token/${P2P_IUSD_ADDRESS}`
export const EXPLORER_TX_URL = 'https://explorer.inri.life/tx/'

export type P2PSide = 'sell' | 'buy'
export type P2PView = 'market' | 'create' | 'mine' | 'activity'
export type P2POrderStatus = 'active' | 'partial' | 'filled' | 'cancelled' | 'expired'

export type P2POrder = {
  id: number
  side: P2PSide
  maker: string
  priceRaw: bigint
  priceDisplay: string
  remainingInri: bigint
  remainingInriDisplay: string
  remainingIusd: bigint
  remainingIusdDisplay: string
  initialInri: bigint
  initialInriDisplay: string
  initialIusd: bigint
  initialIusdDisplay: string
  filledInri: bigint
  filledInriDisplay: string
  lockedLabel: string
  progressPercent: number
  deadline: number
  active: boolean
  expired: boolean
  status: P2POrderStatus
  statusLabel: string
}

export type P2PStats = {
  nextOrderId: number
  feeBps: number
  feePercentLabel: string
  treasury: string
  totalOrders: number
  activeOrders: number
  historicalOrders: number
  referencePriceRaw: bigint
  referencePriceDisplay: string
  referenceSource: string
}

export type P2PLockedBalances = {
  lockedInri: bigint
  lockedIusd: bigint
  sellOrders: number
  buyOrders: number
}

export type P2PEventItem = {
  kind: 'created' | 'filled' | 'cancelled' | 'price' | 'deadline' | 'sell-add' | 'sell-remove' | 'buy-add' | 'buy-reduce'
  orderId: number
  txHash: string
  blockNumber: number
  timestamp?: number
  maker?: string
  taker?: string
  inri?: string
  iusd?: string
  fee?: string
  price?: string
}

type CreatedMeta = {
  inriAmount: bigint
  iusdAmount: bigint
  maker: string
  side: P2PSide
}

type EventMeta = {
  created: Map<number, CreatedMeta>
  cancelled: Set<number>
  filledInri: Map<number, bigint>
  latestFillPriceRaw: bigint
}

export const P2P_ABI = [
  'event OrderCreated(uint256 indexed orderId, uint8 side, address indexed maker, uint256 priceIusdPer1e18Inri, uint256 inriAmount, uint256 iusdAmount, uint64 deadline)',
  'event OrderFilled(uint256 indexed orderId, address indexed maker, address indexed taker, uint256 inriFilled, uint256 iusdGross, uint256 feeIusd, uint256 iusdNetToMakerOrTaker)',
  'event OrderCancelled(uint256 indexed orderId, address indexed maker, uint256 refundInri, uint256 refundIusd)',
  'event OrderPriceUpdated(uint256 indexed orderId, uint256 oldPrice, uint256 newPrice)',
  'event OrderDeadlineUpdated(uint256 indexed orderId, uint64 oldDeadline, uint64 newDeadline)',
  'event SellOrderInriAdded(uint256 indexed orderId, uint256 inriAdded, uint256 newRemainingInri)',
  'event SellOrderInriRemoved(uint256 indexed orderId, uint256 inriRemoved, uint256 newRemainingInri)',
  'event BuyOrderIusdAdded(uint256 indexed orderId, uint256 iusdAdded, uint256 newRemainingIusd, uint256 newRemainingInri)',
  'event BuyOrderReduced(uint256 indexed orderId, uint256 inriReduced, uint256 iusdRefunded, uint256 newRemainingInri, uint256 newRemainingIusd)',
  'function iUSD() view returns (address)',
  'function treasury() view returns (address)',
  'function FEE_BPS() view returns (uint256)',
  'function BPS_DENOM() view returns (uint256)',
  'function nextOrderId() view returns (uint256)',
  'function orders(uint256) view returns (uint8 side, address maker, uint256 priceIusdPer1e18Inri, uint256 remainingInri, uint256 remainingIusd, uint64 deadline, bool active)',
  'function quoteIusdGross(uint256 inriAmount, uint256 priceIusdPer1e18Inri) view returns (uint256)',
  'function feeOf(uint256 iusdGross) view returns (uint256)',
  'function createSellOrder(uint256 priceIusdPer1e18Inri, uint64 deadline) payable returns (uint256)',
  'function createBuyOrder(uint256 inriWanted, uint256 priceIusdPer1e18Inri, uint64 deadline) returns (uint256)',
  'function fillSellOrder(uint256 orderId, uint256 inriToBuy, uint256 maxIusdGross)',
  'function fillBuyOrder(uint256 orderId, uint256 inriToSell, uint256 minIusdNet) payable',
  'function updatePrice(uint256 orderId, uint256 newPriceIusdPer1e18Inri)',
  'function updateDeadline(uint256 orderId, uint64 newDeadline)',
  'function addInriToSellOrder(uint256 orderId) payable',
  'function removeInriFromSellOrder(uint256 orderId, uint256 inriToRemove)',
  'function addIusdToBuyOrder(uint256 orderId, uint256 iusdToAdd)',
  'function reduceBuyOrder(uint256 orderId, uint256 inriToReduce)',
  'function cancelOrder(uint256 orderId)',
] as const

export const P2P_IUSD_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
] as const

export const p2pInterface = new ethers.Interface(P2P_ABI)
export const iusdInterface = new ethers.Interface(P2P_IUSD_ABI)

const MAX_ORDER_SCAN = 1000
const P2P_EVENT_SCAN_BLOCKS = 250_000

export function getP2PReadProvider() {
  return new ethers.JsonRpcProvider(INRI_RPC_URL, { chainId: 3777, name: 'INRI CHAIN' })
}

export function getP2PContract() {
  return new ethers.Contract(P2P_MARKET_ADDRESS, P2P_ABI, getP2PReadProvider())
}

export function getIusdContract() {
  return new ethers.Contract(P2P_IUSD_ADDRESS, P2P_IUSD_ABI, getP2PReadProvider())
}

export function normalizeDecimalInput(value: string) {
  const raw = String(value || '').trim().replace(/\s+/g, '')
  if (!raw) return '0'
  const lastComma = raw.lastIndexOf(',')
  const lastDot = raw.lastIndexOf('.')
  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) return raw.replace(/\./g, '').replace(',', '.')
    return raw.replace(/,/g, '')
  }
  if (lastComma >= 0) return raw.replace(',', '.')
  return raw
}

export function parseInriAmount(value: string) {
  return ethers.parseEther(normalizeDecimalInput(value))
}

export function parseIusdAmount(value: string) {
  return ethers.parseUnits(normalizeDecimalInput(value), 6)
}

export function parsePrice(value: string) {
  return ethers.parseUnits(normalizeDecimalInput(value), 6)
}

export function formatCompactNumber(value: number, digits = 4) {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString('en-US', { maximumFractionDigits: digits })
}

export function formatInri(value: bigint | number | string, digits = 4) {
  try {
    return formatCompactNumber(Number(ethers.formatEther(BigInt(value))), digits)
  } catch {
    return '0'
  }
}

export function formatIusd(value: bigint | number | string, digits = 4) {
  try {
    return formatCompactNumber(Number(ethers.formatUnits(BigInt(value), 6)), digits)
  } catch {
    return '0'
  }
}

export function formatPriceDisplay(priceRaw: bigint, digits = 6) {
  try {
    return formatCompactNumber(Number(ethers.formatUnits(priceRaw, 6)), digits)
  } catch {
    return '0'
  }
}

export function shortAddress(value?: string | null, size = 4) {
  if (!value) return '—'
  return `${value.slice(0, 2 + size)}...${value.slice(-size)}`
}

export function quoteIusdGrossLocal(inriAmount: bigint, priceRaw: bigint) {
  return (inriAmount * priceRaw) / 10n ** 18n
}

export function feeOfLocal(iusdGross: bigint, feeBps: number) {
  return (iusdGross * BigInt(feeBps || 0)) / 10_000n
}

export function percentVsReference(priceRaw: bigint, referencePriceRaw: bigint) {
  if (priceRaw <= 0n || referencePriceRaw <= 0n) return '—'
  const price = Number(ethers.formatUnits(priceRaw, 6))
  const reference = Number(ethers.formatUnits(referencePriceRaw, 6))
  if (!Number.isFinite(price) || !Number.isFinite(reference) || reference <= 0) return '—'
  const pct = ((price - reference) / reference) * 100
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}% vs reference`
}

function statusForOrder(active: boolean, expired: boolean, remainingInri: bigint, initialInri: bigint, cancelled: boolean): P2POrderStatus {
  if (cancelled) return 'cancelled'
  if (active && expired) return 'expired'
  if (active && initialInri > 0n && remainingInri < initialInri) return 'partial'
  if (active) return 'active'
  return 'filled'
}

function statusLabel(status: P2POrderStatus, filledInriDisplay: string) {
  if (status === 'partial') return `Active · partial filled: ${filledInriDisplay} INRI`
  if (status === 'filled') return 'Filled / completed'
  if (status === 'cancelled') return 'Cancelled / refunded'
  if (status === 'expired') return 'Expired · must be cancelled by maker'
  return 'Active · no fill yet'
}

export function normalizeOrder(id: number, raw: any, meta?: EventMeta): P2POrder {
  const sideNum = Number(raw?.side ?? raw?.[0] ?? 0)
  const side: P2PSide = sideNum === 0 ? 'sell' : 'buy'
  const priceRaw = BigInt(raw?.priceIusdPer1e18Inri ?? raw?.[2] ?? 0)
  const remainingInri = BigInt(raw?.remainingInri ?? raw?.[3] ?? 0)
  const remainingIusd = BigInt(raw?.remainingIusd ?? raw?.[4] ?? 0)
  const deadline = Number(raw?.deadline ?? raw?.[5] ?? 0)
  const active = Boolean(raw?.active ?? raw?.[6] ?? false)
  const expired = deadline !== 0 && Date.now() / 1000 > deadline
  const created = meta?.created.get(id)
  const cancelled = Boolean(meta?.cancelled.has(id))
  const initialInri = created?.inriAmount && created.inriAmount > 0n ? created.inriAmount : remainingInri
  const initialIusd = created?.iusdAmount && created.iusdAmount > 0n ? created.iusdAmount : remainingIusd
  const filledFromEvents = meta?.filledInri.get(id) || 0n
  let filledInri = filledFromEvents
  if (filledInri === 0n && initialInri > remainingInri) filledInri = initialInri - remainingInri

  const status = statusForOrder(active, expired, remainingInri, initialInri, cancelled)
  const progressPercent = initialInri > 0n
    ? Math.max(0, Math.min(100, Number(((initialInri - remainingInri) * 10_000n) / initialInri) / 100))
    : 0

  return {
    id,
    side,
    maker: String(raw?.maker ?? raw?.[1] ?? '0x0000000000000000000000000000000000000000'),
    priceRaw,
    priceDisplay: formatPriceDisplay(priceRaw),
    remainingInri,
    remainingInriDisplay: formatInri(remainingInri),
    remainingIusd,
    remainingIusdDisplay: formatIusd(remainingIusd),
    initialInri,
    initialInriDisplay: formatInri(initialInri),
    initialIusd,
    initialIusdDisplay: formatIusd(initialIusd),
    filledInri,
    filledInriDisplay: formatInri(filledInri),
    lockedLabel: side === 'sell' ? `Locked INRI: ${formatInri(remainingInri)}` : `Locked iUSD: ${formatIusd(remainingIusd)}`,
    progressPercent,
    deadline,
    active,
    expired,
    status,
    statusLabel: statusLabel(status, formatInri(filledInri)),
  }
}

async function queryNamedEvents(contract: ethers.Contract, filterName: string, fromBlock: number, toBlock: number) {
  try {
    const filterBuilder = (contract.filters as any)[filterName] as (() => unknown) | undefined
    if (!filterBuilder) return [] as ethers.EventLog[]
    return (await contract.queryFilter(filterBuilder() as any, fromBlock, toBlock)) as ethers.EventLog[]
  } catch {
    return [] as ethers.EventLog[]
  }
}

async function loadEventMeta(): Promise<EventMeta> {
  const provider = getP2PReadProvider()
  const contract = getP2PContract()
  const latestBlock = await provider.getBlockNumber().catch(() => 0)
  const fromBlock = latestBlock > P2P_EVENT_SCAN_BLOCKS ? latestBlock - P2P_EVENT_SCAN_BLOCKS : 0

  const [created, filled, cancelled] = await Promise.all([
    queryNamedEvents(contract, 'OrderCreated', fromBlock, latestBlock),
    queryNamedEvents(contract, 'OrderFilled', fromBlock, latestBlock),
    queryNamedEvents(contract, 'OrderCancelled', fromBlock, latestBlock),
  ])

  const meta: EventMeta = {
    created: new Map(),
    cancelled: new Set(),
    filledInri: new Map(),
    latestFillPriceRaw: 0n,
  }

  for (const event of created) {
    const args: any = event.args || []
    const orderId = Number(args.orderId ?? args[0] ?? 0)
    const sideNum = Number(args.side ?? args[1] ?? 0)
    if (!orderId) continue
    meta.created.set(orderId, {
      side: sideNum === 0 ? 'sell' : 'buy',
      maker: String(args.maker ?? args[2] ?? ''),
      inriAmount: BigInt(args.inriAmount ?? args[4] ?? 0),
      iusdAmount: BigInt(args.iusdAmount ?? args[5] ?? 0),
    })
  }

  const sortedFilled = [...filled].sort((a, b) => Number(b.blockNumber || 0) - Number(a.blockNumber || 0))
  for (const event of sortedFilled) {
    const args: any = event.args || []
    const orderId = Number(args.orderId ?? args[0] ?? 0)
    const inri = BigInt(args.inriFilled ?? args[3] ?? 0)
    const iusd = BigInt(args.iusdGross ?? args[4] ?? 0)
    if (!orderId) continue
    meta.filledInri.set(orderId, (meta.filledInri.get(orderId) || 0n) + inri)
    if (meta.latestFillPriceRaw === 0n && inri > 0n && iusd > 0n) {
      meta.latestFillPriceRaw = (iusd * 10n ** 18n) / inri
    }
  }

  for (const event of cancelled) {
    const args: any = event.args || []
    const orderId = Number(args.orderId ?? args[0] ?? 0)
    if (orderId) meta.cancelled.add(orderId)
  }

  return meta
}

async function readOrdersByIds(ids: number[], meta?: EventMeta) {
  const contract = getP2PContract()
  const raws = await Promise.all(ids.map((id) => contract.orders(id).catch(() => null)))
  return raws
    .map((raw, index) => (raw ? normalizeOrder(ids[index], raw, meta) : null))
    .filter(Boolean) as P2POrder[]
}

async function readLatestOrderIds(totalOrders: number, limit: number, page: number) {
  const newestId = Math.max(1, totalOrders - (page - 1) * limit)
  const ids: number[] = []
  for (let id = newestId; id >= 1 && ids.length < limit; id -= 1) ids.push(id)
  return ids
}

export async function loadP2PStats(): Promise<P2PStats> {
  const contract = getP2PContract()
  const [nextOrderId, feeBps, treasury, meta] = await Promise.all([
    contract.nextOrderId(),
    contract.FEE_BPS(),
    contract.treasury(),
    loadEventMeta().catch(() => ({ created: new Map(), cancelled: new Set(), filledInri: new Map(), latestFillPriceRaw: 0n } as EventMeta)),
  ])
  const next = Number(nextOrderId)
  const totalOrders = Math.max(0, next - 1)
  const scanCount = Math.min(totalOrders, MAX_ORDER_SCAN)
  const firstId = Math.max(1, totalOrders - scanCount + 1)
  const ids: number[] = []
  for (let id = firstId; id <= totalOrders; id += 1) ids.push(id)
  const orders = await readOrdersByIds(ids, meta)
  const activeOrders = orders.filter((order) => order.active && !order.expired).length
  const activePrices = orders.filter((order) => order.active && !order.expired && order.priceRaw > 0n).map((order) => order.priceRaw).sort((a, b) => Number(a - b))
  const medianActivePrice = activePrices.length ? activePrices[Math.floor(activePrices.length / 2)] : 0n
  const referencePriceRaw = meta.latestFillPriceRaw > 0n ? meta.latestFillPriceRaw : medianActivePrice
  const referenceSource = meta.latestFillPriceRaw > 0n
    ? 'Last on-chain fill price'
    : medianActivePrice > 0n
      ? 'Median active order price'
      : 'No market reference yet'

  return {
    nextOrderId: next,
    totalOrders,
    activeOrders,
    historicalOrders: Math.max(0, totalOrders - activeOrders),
    feeBps: Number(feeBps),
    feePercentLabel: `${(Number(feeBps) / 100).toFixed(2)}%`,
    treasury: String(treasury),
    referencePriceRaw,
    referencePriceDisplay: referencePriceRaw > 0n ? formatPriceDisplay(referencePriceRaw) : '—',
    referenceSource,
  }
}

export async function loadRecentP2POrders(options?: {
  limit?: number
  page?: number
  activeOnly?: boolean
  maker?: string
  status?: P2POrderStatus | 'all'
}) {
  const contract = getP2PContract()
  const [nextOrderId, meta] = await Promise.all([
    contract.nextOrderId(),
    loadEventMeta().catch(() => ({ created: new Map(), cancelled: new Set(), filledInri: new Map(), latestFillPriceRaw: 0n } as EventMeta)),
  ])
  const totalOrders = Math.max(0, Number(nextOrderId) - 1)
  const limit = Math.max(1, Math.min(100, options?.limit || 42))
  const page = Math.max(1, Number(options?.page || 1))
  const maker = options?.maker?.toLowerCase() || ''

  let scanLimit = limit
  if (maker || options?.status || options?.activeOnly) scanLimit = Math.min(MAX_ORDER_SCAN, totalOrders)
  const ids = maker || options?.status || options?.activeOnly
    ? Array.from({ length: scanLimit }, (_, index) => totalOrders - index).filter((id) => id >= 1)
    : await readLatestOrderIds(totalOrders, limit, page)

  let items = await readOrdersByIds(ids, meta)
  if (options?.activeOnly) items = items.filter((item) => item.active && !item.expired)
  if (maker) items = items.filter((item) => item.maker.toLowerCase() === maker)
  if (options?.status && options.status !== 'all') items = items.filter((item) => item.status === options.status || (options.status === 'active' && item.active && !item.expired))

  const offset = maker || options?.status || options?.activeOnly ? (page - 1) * limit : 0
  const paged = maker || options?.status || options?.activeOnly ? items.slice(offset, offset + limit) : items

  return {
    items: paged,
    hasMore: maker || options?.status || options?.activeOnly ? offset + limit < items.length : totalOrders - page * limit > 0,
    page,
    totalApprox: totalOrders,
  }
}

export async function loadP2PLockedBalances(address: string): Promise<P2PLockedBalances> {
  if (!address) return { lockedInri: 0n, lockedIusd: 0n, sellOrders: 0, buyOrders: 0 }
  const contract = getP2PContract()
  const [nextOrderId, meta] = await Promise.all([
    contract.nextOrderId(),
    loadEventMeta().catch(() => ({ created: new Map(), cancelled: new Set(), filledInri: new Map(), latestFillPriceRaw: 0n } as EventMeta)),
  ])
  const totalOrders = Math.max(0, Number(nextOrderId) - 1)
  const scanCount = Math.min(totalOrders, MAX_ORDER_SCAN)
  const ids = Array.from({ length: scanCount }, (_, index) => totalOrders - index).filter((id) => id >= 1)
  const mine = (await readOrdersByIds(ids, meta)).filter((order) => order.maker.toLowerCase() === address.toLowerCase() && order.active && !order.expired)
  return mine.reduce((acc, order) => {
    if (order.side === 'sell') {
      acc.lockedInri += order.remainingInri
      acc.sellOrders += 1
    } else {
      acc.lockedIusd += order.remainingIusd
      acc.buyOrders += 1
    }
    return acc
  }, { lockedInri: 0n, lockedIusd: 0n, sellOrders: 0, buyOrders: 0 } as P2PLockedBalances)
}

export async function getIusdBalance(address: string) {
  if (!address) return 0n
  return BigInt(await getIusdContract().balanceOf(address))
}

export async function getIusdAllowance(address: string) {
  if (!address) return 0n
  return BigInt(await getIusdContract().allowance(address, P2P_MARKET_ADDRESS))
}

export async function getInriBalance(address: string) {
  if (!address) return 0n
  return BigInt(await getP2PReadProvider().getBalance(address))
}

export async function loadP2PEvents(limit = 24, scanBlocks = P2P_EVENT_SCAN_BLOCKS): Promise<P2PEventItem[]> {
  const provider = getP2PReadProvider()
  const contract = getP2PContract()
  const latestBlock = await provider.getBlockNumber().catch(() => 0)
  const fromBlock = latestBlock > scanBlocks ? latestBlock - scanBlocks : 0

  const [created, filled, cancelled, price, deadline, sellAdd, sellRemove, buyAdd, buyReduce] = await Promise.all([
    queryNamedEvents(contract, 'OrderCreated', fromBlock, latestBlock),
    queryNamedEvents(contract, 'OrderFilled', fromBlock, latestBlock),
    queryNamedEvents(contract, 'OrderCancelled', fromBlock, latestBlock),
    queryNamedEvents(contract, 'OrderPriceUpdated', fromBlock, latestBlock),
    queryNamedEvents(contract, 'OrderDeadlineUpdated', fromBlock, latestBlock),
    queryNamedEvents(contract, 'SellOrderInriAdded', fromBlock, latestBlock),
    queryNamedEvents(contract, 'SellOrderInriRemoved', fromBlock, latestBlock),
    queryNamedEvents(contract, 'BuyOrderIusdAdded', fromBlock, latestBlock),
    queryNamedEvents(contract, 'BuyOrderReduced', fromBlock, latestBlock),
  ])

  const allEvents = [...created, ...filled, ...cancelled, ...price, ...deadline, ...sellAdd, ...sellRemove, ...buyAdd, ...buyReduce]
  const uniqueBlocks = [...new Set(allEvents.map((event) => Number(event.blockNumber || 0)).filter(Boolean))]
  const blockMap = new Map<number, number>()

  await Promise.all(uniqueBlocks.slice(0, 300).map(async (blockNumber) => {
    try {
      const block = await provider.getBlock(blockNumber)
      if (block?.timestamp) blockMap.set(blockNumber, Number(block.timestamp))
    } catch {}
  }))

  const items: P2PEventItem[] = []

  for (const event of created) {
    const args: any = event.args || []
    items.push({
      kind: 'created',
      orderId: Number(args.orderId ?? args[0] ?? 0),
      txHash: String(event.transactionHash || ''),
      blockNumber: Number(event.blockNumber || 0),
      timestamp: blockMap.get(Number(event.blockNumber || 0)),
      maker: String(args.maker ?? args[2] ?? ''),
      inri: formatInri(BigInt(args.inriAmount ?? args[4] ?? 0)),
      iusd: formatIusd(BigInt(args.iusdAmount ?? args[5] ?? 0)),
      price: formatPriceDisplay(BigInt(args.priceIusdPer1e18Inri ?? args[3] ?? 0)),
    })
  }

  for (const event of filled) {
    const args: any = event.args || []
    items.push({
      kind: 'filled',
      orderId: Number(args.orderId ?? args[0] ?? 0),
      txHash: String(event.transactionHash || ''),
      blockNumber: Number(event.blockNumber || 0),
      timestamp: blockMap.get(Number(event.blockNumber || 0)),
      maker: String(args.maker ?? args[1] ?? ''),
      taker: String(args.taker ?? args[2] ?? ''),
      inri: formatInri(BigInt(args.inriFilled ?? args[3] ?? 0)),
      iusd: formatIusd(BigInt(args.iusdGross ?? args[4] ?? 0)),
      fee: formatIusd(BigInt(args.feeIusd ?? args[5] ?? 0)),
    })
  }

  for (const event of cancelled) {
    const args: any = event.args || []
    items.push({
      kind: 'cancelled',
      orderId: Number(args.orderId ?? args[0] ?? 0),
      txHash: String(event.transactionHash || ''),
      blockNumber: Number(event.blockNumber || 0),
      timestamp: blockMap.get(Number(event.blockNumber || 0)),
      maker: String(args.maker ?? args[1] ?? ''),
      inri: formatInri(BigInt(args.refundInri ?? args[2] ?? 0)),
      iusd: formatIusd(BigInt(args.refundIusd ?? args[3] ?? 0)),
    })
  }

  for (const event of price) {
    const args: any = event.args || []
    items.push({ kind: 'price', orderId: Number(args.orderId ?? args[0] ?? 0), txHash: String(event.transactionHash || ''), blockNumber: Number(event.blockNumber || 0), timestamp: blockMap.get(Number(event.blockNumber || 0)), price: formatPriceDisplay(BigInt(args.newPrice ?? args[2] ?? 0)) })
  }

  for (const event of deadline) {
    const args: any = event.args || []
    items.push({ kind: 'deadline', orderId: Number(args.orderId ?? args[0] ?? 0), txHash: String(event.transactionHash || ''), blockNumber: Number(event.blockNumber || 0), timestamp: blockMap.get(Number(event.blockNumber || 0)) })
  }

  for (const event of sellAdd) {
    const args: any = event.args || []
    items.push({ kind: 'sell-add', orderId: Number(args.orderId ?? args[0] ?? 0), txHash: String(event.transactionHash || ''), blockNumber: Number(event.blockNumber || 0), timestamp: blockMap.get(Number(event.blockNumber || 0)), inri: formatInri(BigInt(args.inriAdded ?? args[1] ?? 0)) })
  }

  for (const event of sellRemove) {
    const args: any = event.args || []
    items.push({ kind: 'sell-remove', orderId: Number(args.orderId ?? args[0] ?? 0), txHash: String(event.transactionHash || ''), blockNumber: Number(event.blockNumber || 0), timestamp: blockMap.get(Number(event.blockNumber || 0)), inri: formatInri(BigInt(args.inriRemoved ?? args[1] ?? 0)) })
  }

  for (const event of buyAdd) {
    const args: any = event.args || []
    items.push({ kind: 'buy-add', orderId: Number(args.orderId ?? args[0] ?? 0), txHash: String(event.transactionHash || ''), blockNumber: Number(event.blockNumber || 0), timestamp: blockMap.get(Number(event.blockNumber || 0)), iusd: formatIusd(BigInt(args.iusdAdded ?? args[1] ?? 0)), inri: formatInri(BigInt(args.newRemainingInri ?? args[3] ?? 0)) })
  }

  for (const event of buyReduce) {
    const args: any = event.args || []
    items.push({ kind: 'buy-reduce', orderId: Number(args.orderId ?? args[0] ?? 0), txHash: String(event.transactionHash || ''), blockNumber: Number(event.blockNumber || 0), timestamp: blockMap.get(Number(event.blockNumber || 0)), inri: formatInri(BigInt(args.inriReduced ?? args[1] ?? 0)), iusd: formatIusd(BigInt(args.iusdRefunded ?? args[2] ?? 0)) })
  }

  return items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0) || b.blockNumber - a.blockNumber).slice(0, Math.max(1, Math.min(limit, 250)))
}
