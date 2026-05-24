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
  deadline: number
  active: boolean
  expired: boolean
}

export type P2PStats = {
  nextOrderId: number
  feeBps: number
  treasury: string
  totalOrders: number
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

export function normalizeOrder(id: number, raw: any): P2POrder {
  const sideNum = Number(raw?.side ?? raw?.[0] ?? 0)
  const priceRaw = BigInt(raw?.priceIusdPer1e18Inri ?? raw?.[2] ?? 0)
  const remainingInri = BigInt(raw?.remainingInri ?? raw?.[3] ?? 0)
  const remainingIusd = BigInt(raw?.remainingIusd ?? raw?.[4] ?? 0)
  const deadline = Number(raw?.deadline ?? raw?.[5] ?? 0)
  const active = Boolean(raw?.active ?? raw?.[6] ?? false)
  return {
    id,
    side: sideNum === 0 ? 'sell' : 'buy',
    maker: String(raw?.maker ?? raw?.[1] ?? '0x0000000000000000000000000000000000000000'),
    priceRaw,
    priceDisplay: formatPriceDisplay(priceRaw),
    remainingInri,
    remainingInriDisplay: formatInri(remainingInri),
    remainingIusd,
    remainingIusdDisplay: formatIusd(remainingIusd),
    deadline,
    active,
    expired: deadline !== 0 && Date.now() / 1000 > deadline,
  }
}

export async function loadP2PStats(): Promise<P2PStats> {
  const contract = getP2PContract()
  const [nextOrderId, feeBps, treasury] = await Promise.all([
    contract.nextOrderId(),
    contract.FEE_BPS(),
    contract.treasury(),
  ])
  const next = Number(nextOrderId)
  return {
    nextOrderId: next,
    totalOrders: Math.max(0, next - 1),
    feeBps: Number(feeBps),
    treasury: String(treasury),
  }
}

export async function loadRecentP2POrders(options?: {
  limit?: number
  page?: number
  activeOnly?: boolean
  maker?: string
}) {
  const contract = getP2PContract()
  const nextOrderId = Number(await contract.nextOrderId())
  const limit = Math.max(1, Math.min(80, options?.limit || 36))
  const page = Math.max(1, Number(options?.page || 1))
  const maker = options?.maker?.toLowerCase() || ''
  const newestId = Math.max(1, nextOrderId - 1 - (page - 1) * limit)
  const ids: number[] = []

  for (let id = newestId; id >= 1 && ids.length < limit; id -= 1) ids.push(id)

  const raws = await Promise.all(ids.map((id) => contract.orders(id).catch(() => null)))
  const items = raws
    .map((raw, index) => (raw ? normalizeOrder(ids[index], raw) : null))
    .filter(Boolean)
    .filter((item) => (options?.activeOnly ? item?.active : true))
    .filter((item) => (maker ? item?.maker.toLowerCase() === maker : true)) as P2POrder[]

  return {
    items,
    hasMore: newestId - limit >= 1,
    page,
    totalApprox: Math.max(0, nextOrderId - 1),
  }
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

async function queryNamedEvents(contract: ethers.Contract, filterName: string, fromBlock: number, toBlock: number) {
  try {
    const filterBuilder = (contract.filters as any)[filterName] as (() => unknown) | undefined
    if (!filterBuilder) return [] as ethers.EventLog[]
    return (await contract.queryFilter(filterBuilder() as any, fromBlock, toBlock)) as ethers.EventLog[]
  } catch {
    return [] as ethers.EventLog[]
  }
}

export async function loadP2PEvents(limit = 24, scanBlocks = 12000): Promise<P2PEventItem[]> {
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
    items.push({
      kind: 'price',
      orderId: Number(args.orderId ?? args[0] ?? 0),
      txHash: String(event.transactionHash || ''),
      blockNumber: Number(event.blockNumber || 0),
      timestamp: blockMap.get(Number(event.blockNumber || 0)),
      price: formatPriceDisplay(BigInt(args.newPrice ?? args[2] ?? 0)),
    })
  }

  for (const event of deadline) {
    const args: any = event.args || []
    items.push({
      kind: 'deadline',
      orderId: Number(args.orderId ?? args[0] ?? 0),
      txHash: String(event.transactionHash || ''),
      blockNumber: Number(event.blockNumber || 0),
      timestamp: blockMap.get(Number(event.blockNumber || 0)),
    })
  }

  for (const event of sellAdd) {
    const args: any = event.args || []
    items.push({
      kind: 'sell-add',
      orderId: Number(args.orderId ?? args[0] ?? 0),
      txHash: String(event.transactionHash || ''),
      blockNumber: Number(event.blockNumber || 0),
      timestamp: blockMap.get(Number(event.blockNumber || 0)),
      inri: formatInri(BigInt(args.inriAdded ?? args[1] ?? 0)),
    })
  }

  for (const event of sellRemove) {
    const args: any = event.args || []
    items.push({
      kind: 'sell-remove',
      orderId: Number(args.orderId ?? args[0] ?? 0),
      txHash: String(event.transactionHash || ''),
      blockNumber: Number(event.blockNumber || 0),
      timestamp: blockMap.get(Number(event.blockNumber || 0)),
      inri: formatInri(BigInt(args.inriRemoved ?? args[1] ?? 0)),
    })
  }

  for (const event of buyAdd) {
    const args: any = event.args || []
    items.push({
      kind: 'buy-add',
      orderId: Number(args.orderId ?? args[0] ?? 0),
      txHash: String(event.transactionHash || ''),
      blockNumber: Number(event.blockNumber || 0),
      timestamp: blockMap.get(Number(event.blockNumber || 0)),
      iusd: formatIusd(BigInt(args.iusdAdded ?? args[1] ?? 0)),
      inri: formatInri(BigInt(args.newRemainingInri ?? args[3] ?? 0)),
    })
  }

  for (const event of buyReduce) {
    const args: any = event.args || []
    items.push({
      kind: 'buy-reduce',
      orderId: Number(args.orderId ?? args[0] ?? 0),
      txHash: String(event.transactionHash || ''),
      blockNumber: Number(event.blockNumber || 0),
      timestamp: blockMap.get(Number(event.blockNumber || 0)),
      inri: formatInri(BigInt(args.inriReduced ?? args[1] ?? 0)),
      iusd: formatIusd(BigInt(args.iusdRefunded ?? args[2] ?? 0)),
    })
  }

  return items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0) || b.blockNumber - a.blockNumber).slice(0, Math.max(1, Math.min(limit, 250)))
}
