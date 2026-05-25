'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Copy,
  Droplets,
  ExternalLink,
  Gauge,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Contract, Interface, JsonRpcProvider, MaxUint256, ZeroAddress, formatUnits, parseUnits } from 'ethers'
import { InriShell } from '@/components/inri-site-shell'
import {
  getErrorMessage,
  isInriChain,
  readActiveWalletSnapshot,
  requestFromActiveWallet,
  toHex,
  type EthereumProvider,
} from '@/lib/inri-active-wallet'

const RPC_URL = 'https://rpc.inri.life'
const EXPLORER_URL = 'https://explorer.inri.life'
const FACTORY_ADDRESS = '0x43F12f9f707840595c45c4f85f2ecC3bc5cCF190'
const ROUTER_ADDRESS = '0xcd5E469b9f6E3BA80F03B1De7B202EbE5DEB8DcD'
const WINRI_ADDRESS = '0x8731F1709745173470821eAeEd9BC600EEC9A3D1'
const IUSD_ADDRESS = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'
const OFFICIAL_PAIR_ADDRESS = '0xcaFFACD05499d005d8441337811bAd227Fa24643'
const NATIVE_INRI = 'NATIVE_INRI'
const IMPORTED_TOKENS_KEY = 'inri_swap_imported_tokens_v1'

const erc20Abi = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
]

const factoryAbi = [
  'function getPair(address,address) view returns (address)',
  'function allPairsLength() view returns (uint256)',
]

const pairAbi = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112,uint112,uint32)',
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
]

const routerAbi = [
  'function factory() view returns (address)',
  'function WINRI() view returns (address)',
  'function getAmountsOut(uint256,address[]) view returns (uint256[])',
  'function wrapINRI(address) payable returns (uint256)',
  'function unwrapINRI(uint256,address) returns (uint256)',
  'function addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256) returns (uint256,uint256,uint256)',
  'function addLiquidityINRI(address,uint256,uint256,uint256,address,uint256) payable returns (uint256,uint256,uint256)',
  'function removeLiquidity(address,address,uint256,uint256,uint256,address,uint256) returns (uint256,uint256)',
  'function removeLiquidityINRI(address,uint256,uint256,uint256,address,uint256) returns (uint256,uint256)',
  'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)',
  'function swapExactINRIForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256) payable',
  'function swapExactTokensForINRISupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)',
]

const erc20Iface = new Interface(erc20Abi)
const routerIface = new Interface(routerAbi)
const rpc = new JsonRpcProvider(RPC_URL)

type TokenInfo = {
  address: string
  symbol: string
  name: string
  decimals: number
  native?: boolean
  verified?: boolean
  warning?: string
}

type WalletState = {
  provider: EthereumProvider | null
  account: string | null
  chainId: string | null
  ready: boolean
}

type SwapTab = 'swap' | 'liquidity' | 'remove' | 'tokens'

type PoolSnapshot = {
  pair: string
  reserveInri: bigint
  reserveIusd: bigint
  lpBalance: bigint
  lpTotalSupply: bigint
  price: string
}

type LiquidityPairInfo = {
  pair: string | null
  exists: boolean
  reserveA: bigint
  reserveB: bigint
}

const tabItems: { key: SwapTab; label: string; icon: LucideIcon }[] = [
  { key: 'swap', label: 'Swap', icon: Zap },
  { key: 'liquidity', label: 'Pool', icon: Droplets },
  { key: 'remove', label: 'Positions', icon: Gauge },
  { key: 'tokens', label: 'Tokens', icon: Search },
]

const baseTokens: TokenInfo[] = [
  {
    address: NATIVE_INRI,
    symbol: 'INRI',
    name: 'Native INRI',
    decimals: 18,
    native: true,
    verified: true,
  },
  {
    address: IUSD_ADDRESS,
    symbol: 'iUSD',
    name: 'INRI USD',
    decimals: 6,
    verified: true,
  },
  {
    address: WINRI_ADDRESS,
    symbol: 'WINRI',
    name: 'Wrapped INRI',
    decimals: 18,
    verified: true,
  },
]

function normalizeAddress(value: string) {
  return value.trim()
}

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}

function sameAddress(a?: string, b?: string) {
  return String(a || '').toLowerCase() === String(b || '').toLowerCase()
}

function tokenKey(token: TokenInfo) {
  return token.native ? NATIVE_INRI : token.address.toLowerCase()
}

function tokenLogo(token: TokenInfo) {
  if (token.native || sameAddress(token.address, WINRI_ADDRESS)) return '/inri-logo.png'
  if (sameAddress(token.address, IUSD_ADDRESS)) return '/iusd-logo.png'
  return ''
}

function tokenAccent(token: TokenInfo) {
  if (token.native || sameAddress(token.address, WINRI_ADDRESS)) return 'from-cyan-300/30 to-blue-500/10 text-cyan-100 border-cyan-300/30'
  if (sameAddress(token.address, IUSD_ADDRESS)) return 'from-emerald-300/25 to-cyan-400/10 text-emerald-100 border-emerald-300/25'
  return 'from-white/12 to-cyan-300/10 text-white border-white/14'
}

function shortAddress(value?: string | null, left = 6, right = 4) {
  if (!value) return '—'
  return value.length <= left + right + 2 ? value : `${value.slice(0, left)}…${value.slice(-right)}`
}

function cleanDecimalInput(value: string) {
  return value.replace(/,/g, '.').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
}

function safeParseUnits(value: string, decimals: number) {
  const clean = cleanDecimalInput(value.trim())
  if (!clean || clean === '.') return 0n
  return parseUnits(clean, decimals)
}

function formatTokenAmount(value: bigint, decimals: number, digits = 6) {
  const text = formatUnits(value, decimals)
  const [whole, fraction = ''] = text.split('.')
  const trimmedFraction = fraction.slice(0, digits).replace(/0+$/, '')
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole
}

function formatDisplayNumber(value: number, maximumFractionDigits = 6) {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', { maximumFractionDigits })
}

function deadlineFromNow(minutes = 20) {
  return Math.floor(Date.now() / 1000) + minutes * 60
}

function getTokenAddressForPath(token: TokenInfo) {
  return token.native ? WINRI_ADDRESS : token.address
}

async function readPairInfoForTokens(tokenA: TokenInfo, tokenB: TokenInfo): Promise<LiquidityPairInfo> {
  const addressA = getTokenAddressForPath(tokenA)
  const addressB = getTokenAddressForPath(tokenB)
  const pairAddress = await getPair(addressA, addressB)
  if (!pairAddress || pairAddress === ZeroAddress) {
    return { pair: null, exists: false, reserveA: 0n, reserveB: 0n }
  }

  const pair = new Contract(pairAddress, pairAbi, rpc)
  const [token0, reserves] = (await Promise.all([pair.token0(), pair.getReserves()])) as [string, [bigint, bigint, number]]
  const [reserve0, reserve1] = reserves
  const reserveA = sameAddress(token0, addressA) ? reserve0 : reserve1
  const reserveB = sameAddress(token0, addressA) ? reserve1 : reserve0
  return { pair: pairAddress, exists: true, reserveA, reserveB }
}

function dedupeTokens(tokens: TokenInfo[]) {
  const seen = new Set<string>()
  return tokens.filter((token) => {
    const key = tokenKey(token)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function getPair(tokenA: string, tokenB: string) {
  const factory = new Contract(FACTORY_ADDRESS, factoryAbi, rpc)
  return (await factory.getPair(tokenA, tokenB)) as string
}

async function resolveSwapPath(from: TokenInfo, to: TokenInfo) {
  const input = getTokenAddressForPath(from)
  const output = getTokenAddressForPath(to)

  if (sameAddress(input, output)) return [input, output]

  const direct = await getPair(input, output)
  if (direct && direct !== ZeroAddress) return [input, output]

  if (!sameAddress(input, WINRI_ADDRESS) && !sameAddress(output, WINRI_ADDRESS)) {
    const pairA = await getPair(input, WINRI_ADDRESS)
    const pairB = await getPair(WINRI_ADDRESS, output)
    if (pairA !== ZeroAddress && pairB !== ZeroAddress) return [input, WINRI_ADDRESS, output]
  }

  return [input, output]
}

function amountWithSlippage(amount: bigint, slippageBps: number) {
  if (amount <= 0n) return 0n
  const safeBps = Math.max(0, Math.min(5000, Math.trunc(slippageBps)))
  return (amount * BigInt(10000 - safeBps)) / 10000n
}

function statusClass(kind: 'ok' | 'warn' | 'info' | 'bad') {
  if (kind === 'ok') return 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100'
  if (kind === 'warn') return 'border-amber-300/25 bg-amber-400/10 text-amber-100'
  if (kind === 'bad') return 'border-red-300/25 bg-red-400/10 text-red-100'
  return 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100'
}

function TokenAvatar({ token, size = 'md' }: { token: TokenInfo; size?: 'sm' | 'md' | 'lg' }) {
  const logo = tokenLogo(token)
  const sizeClass = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  return (
    <span className={`${sizeClass} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-transparent`}>
      {logo ? (
        <img src={logo} alt={token.symbol} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className={`inline-flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${tokenAccent(token)} text-[10px] font-black`}>
          {token.symbol.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  )
}

function TokenBadge({ token }: { token: TokenInfo }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-3 py-1.5 text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <TokenAvatar token={token} size="sm" />
      {token.symbol}
      {token.verified ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : null}
    </span>
  )
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <label className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">{label}</label>
      {hint ? <span className="text-xs font-bold text-cyan-200/70">{hint}</span> : null}
    </div>
  )
}

function TokenSelect({
  value,
  tokens,
  onChange,
  disabledToken,
  onOpenImport,
  compact = false,
}: {
  value: TokenInfo
  tokens: TokenInfo[]
  onChange: (token: TokenInfo) => void
  disabledToken?: TokenInfo
  onOpenImport?: () => void
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!query) return tokens
    return tokens.filter((token) => {
      const haystack = `${token.symbol} ${token.name} ${token.address}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [query, tokens])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group flex min-w-0 items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-[#081727] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-cyan-300/30 hover:bg-cyan-300/6 focus:border-cyan-300/45 focus:outline-none ${compact ? 'h-[54px] px-3' : 'h-[60px] px-3.5'}`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden pr-1">
          <TokenAvatar token={value} size={compact ? 'sm' : 'md'} />
          <span className="min-w-0 flex-1">
            <span className={`block truncate font-black text-white ${compact ? 'text-[14px]' : 'text-[15px]'}`}>{value.symbol}</span>
            <span className={`block truncate font-bold uppercase tracking-[0.16em] text-white/42 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{value.native ? 'Native' : value.verified ? 'Verified' : 'Imported'}</span>
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-cyan-200/70 transition group-hover:text-white" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 p-4 backdrop-blur-xl" onMouseDown={() => setOpen(false)}>
          <div className="w-full max-w-[460px] overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[#06111f] shadow-[0_40px_140px_rgba(0,0,0,0.70),inset_0_1px_0_rgba(255,255,255,0.08)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Select token</p>
                  <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-white">Search assets</h3>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/70 transition hover:border-cyan-300/35 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 flex h-12 items-center gap-3 rounded-[16px] border border-white/12 bg-black/30 px-4 focus-within:border-cyan-300/50">
                <Search className="h-4 w-4 text-cyan-200/65" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, symbol or paste address"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/32"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-[390px] overflow-y-auto p-3">
              {filtered.map((token) => {
                const disabled = disabledToken ? tokenKey(disabledToken) === tokenKey(token) : false
                const selected = tokenKey(value) === tokenKey(token)
                return (
                  <button
                    key={tokenKey(token)}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return
                      onChange(token)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-[18px] border p-3 text-left transition ${
                      selected
                        ? 'border-cyan-300/40 bg-cyan-300/12'
                        : 'border-transparent bg-transparent hover:border-white/12 hover:bg-white/[0.045]'
                    } ${disabled ? 'cursor-not-allowed opacity-35' : ''}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <TokenAvatar token={token} size="lg" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-base font-black text-white">
                          {token.symbol}
                          {token.verified ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : null}
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-bold text-white/50">{token.name}</span>
                        {!token.native ? <span className="mt-0.5 block truncate text-[11px] font-bold text-cyan-200/58">{shortAddress(token.address, 10, 8)}</span> : null}
                      </span>
                    </span>
                    {selected ? <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">Selected</span> : null}
                  </button>
                )
              })}

              {filtered.length === 0 ? (
                <div className="rounded-[18px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50/85">
                  Token not found. Use Import Token and paste the contract address to add any INRI Chain token.
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 p-4">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setSearch('')
                  onOpenImport?.()
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-cyan-300/25 bg-cyan-300/10 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/16"
              >
                <Plus className="h-4 w-4" /> Import custom token
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function ActionButton({
  children,
  onClick,
  disabled,
  busy,
}: {
  children: ReactNode
  onClick: () => void | Promise<void>
  disabled?: boolean
  busy?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={disabled || busy}
      className="inline-flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-[16px] border border-cyan-300/35 bg-cyan-300 px-5 text-sm font-black text-black shadow-[0_18px_50px_rgba(19,164,255,0.22)] transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

function MiniButton({ children, onClick }: { children: ReactNode; onClick: () => void | Promise<void> }) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-[12px] border border-white/12 bg-white/[0.045] px-3 text-xs font-black text-white/82 transition hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white"
    >
      {children}
    </button>
  )
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[28px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(5,19,34,0.96),rgba(4,14,26,0.98))] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl ${className}`}>
      {children}
    </div>
  )
}

export function InriSwapClient() {
  const [wallet, setWallet] = useState<WalletState>({ provider: null, account: null, chainId: null, ready: false })
  const [tokens, setTokens] = useState<TokenInfo[]>(baseTokens)
  const [tab, setTab] = useState<SwapTab>('swap')
  const [fromToken, setFromToken] = useState<TokenInfo>(baseTokens[1])
  const [toToken, setToToken] = useState<TokenInfo>(baseTokens[0])
  const [swapAmount, setSwapAmount] = useState('0.005')
  const [quoteOut, setQuoteOut] = useState<bigint>(0n)
  const [quotePath, setQuotePath] = useState<string[]>([])
  const [slippage, setSlippage] = useState('1')
  const [balances, setBalances] = useState<Record<string, bigint>>({})
  const [pool, setPool] = useState<PoolSnapshot | null>(null)
  const [poolLoading, setPoolLoading] = useState(false)
  const [liqTokenA, setLiqTokenA] = useState<TokenInfo>(baseTokens[0])
  const [liqTokenB, setLiqTokenB] = useState<TokenInfo>(baseTokens[1])
  const [liqAmountA, setLiqAmountA] = useState('10')
  const [liqAmountB, setLiqAmountB] = useState('0.18')
  const [liqPairInfo, setLiqPairInfo] = useState<LiquidityPairInfo>({ pair: null, exists: false, reserveA: 0n, reserveB: 0n })
  const [liqEditedSide, setLiqEditedSide] = useState<'A' | 'B'>('A')
  const [removePercent, setRemovePercent] = useState('25')
  const [importAddress, setImportAddress] = useState('')
  const [message, setMessage] = useState<{ kind: 'ok' | 'warn' | 'info' | 'bad'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState('')

  const slippageBps = useMemo(() => {
    const parsed = Number(cleanDecimalInput(slippage || '1'))
    if (!Number.isFinite(parsed)) return 100
    return Math.max(1, Math.min(5000, Math.round(parsed * 100)))
  }, [slippage])

  const connected = Boolean(wallet.account && wallet.provider)
  const networkReady = isInriChain(wallet.chainId)

  const syncWallet = useCallback(async () => {
    const snapshot = await readActiveWalletSnapshot()
    setWallet({
      provider: snapshot.provider,
      account: snapshot.account,
      chainId: snapshot.chainId,
      ready: snapshot.providerReady,
    })
  }, [])

  const refreshPool = useCallback(async (account?: string | null) => {
    try {
      setPoolLoading(true)
      const pairAddress = await getPair(IUSD_ADDRESS, WINRI_ADDRESS)
      if (!pairAddress || pairAddress === ZeroAddress) {
        setPool(null)
        return
      }

      const pair = new Contract(pairAddress, pairAbi, rpc)
      const [token0, reserves, lpTotalSupply] = (await Promise.all([
        pair.token0(),
        pair.getReserves(),
        pair.totalSupply(),
      ])) as [string, [bigint, bigint, number], bigint]

      const lpBalance = account ? ((await pair.balanceOf(account)) as bigint) : 0n
      const [reserve0, reserve1] = reserves
      const iusdIs0 = sameAddress(token0, IUSD_ADDRESS)
      const reserveIusd = iusdIs0 ? reserve0 : reserve1
      const reserveInri = iusdIs0 ? reserve1 : reserve0
      const price = reserveInri > 0n ? Number(formatUnits(reserveIusd, 6)) / Number(formatUnits(reserveInri, 18)) : 0

      setPool({
        pair: pairAddress,
        reserveInri,
        reserveIusd,
        lpBalance,
        lpTotalSupply,
        price: formatDisplayNumber(price, 8),
      })
    } catch (cause) {
      setMessage({ kind: 'warn', text: getErrorMessage(cause, 'Unable to read INRISwap pool data.') })
    } finally {
      setPoolLoading(false)
    }
  }, [])

  const refreshBalances = useCallback(async (account?: string | null, nextTokens = tokens) => {
    if (!account) {
      setBalances({})
      return
    }

    const next: Record<string, bigint> = {}
    await Promise.all(
      nextTokens.map(async (token) => {
        try {
          if (token.native) {
            next[tokenKey(token)] = await rpc.getBalance(account)
          } else {
            const contract = new Contract(token.address, erc20Abi, rpc)
            next[tokenKey(token)] = (await contract.balanceOf(account)) as bigint
          }
        } catch {
          next[tokenKey(token)] = 0n
        }
      }),
    )
    setBalances(next)
  }, [tokens])

  const refreshAll = useCallback(async () => {
    await syncWallet()
    const snapshot = await readActiveWalletSnapshot()
    await Promise.all([refreshBalances(snapshot.account, tokens), refreshPool(snapshot.account)])
  }, [refreshBalances, refreshPool, syncWallet, tokens])

  useEffect(() => {
    void syncWallet()
    const handler = () => void syncWallet()
    window.addEventListener('inri:wallet-state', handler)
    return () => window.removeEventListener('inri:wallet-state', handler)
  }, [syncWallet])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(IMPORTED_TOKENS_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved) as TokenInfo[]
      if (Array.isArray(parsed)) setTokens(dedupeTokens([...baseTokens, ...parsed.filter((token) => isAddress(token.address))]))
    } catch {
      // no-op
    }
  }, [])

  useEffect(() => {
    void refreshBalances(wallet.account, tokens)
    void refreshPool(wallet.account)
  }, [wallet.account, tokens, refreshBalances, refreshPool])

  useEffect(() => {
    let cancelled = false

    async function loadLiquidityPairInfo() {
      try {
        const next = await readPairInfoForTokens(liqTokenA, liqTokenB)
        if (!cancelled) setLiqPairInfo(next)
      } catch {
        if (!cancelled) setLiqPairInfo({ pair: null, exists: false, reserveA: 0n, reserveB: 0n })
      }
    }

    void loadLiquidityPairInfo()
    return () => {
      cancelled = true
    }
  }, [liqTokenA, liqTokenB])

  useEffect(() => {
    if (!liqPairInfo.exists || liqPairInfo.reserveA <= 0n || liqPairInfo.reserveB <= 0n) return

    if (liqEditedSide === 'A') {
      const amountA = safeParseUnits(liqAmountA, liqTokenA.decimals)
      if (amountA <= 0n) return
      const amountB = (amountA * liqPairInfo.reserveB) / liqPairInfo.reserveA
      const next = formatTokenAmount(amountB, liqTokenB.decimals, 6)
      if (next !== liqAmountB) setLiqAmountB(next)
      return
    }

    const amountB = safeParseUnits(liqAmountB, liqTokenB.decimals)
    if (amountB <= 0n) return
    const amountA = (amountB * liqPairInfo.reserveA) / liqPairInfo.reserveB
    const next = formatTokenAmount(amountA, liqTokenA.decimals, 6)
    if (next !== liqAmountA) setLiqAmountA(next)
  }, [liqPairInfo, liqEditedSide, liqAmountA, liqAmountB, liqTokenA, liqTokenB])

  useEffect(() => {
    let cancelled = false

    async function loadQuote() {
      try {
        setQuoteOut(0n)
        setQuotePath([])
        const amountIn = safeParseUnits(swapAmount, fromToken.decimals)
        if (amountIn <= 0n) return

        if ((fromToken.native && sameAddress(toToken.address, WINRI_ADDRESS)) || (toToken.native && sameAddress(fromToken.address, WINRI_ADDRESS))) {
          if (!cancelled) {
            setQuoteOut(amountIn)
            setQuotePath([getTokenAddressForPath(fromToken), getTokenAddressForPath(toToken)])
          }
          return
        }

        if (tokenKey(fromToken) === tokenKey(toToken)) return

        const path = await resolveSwapPath(fromToken, toToken)
        const router = new Contract(ROUTER_ADDRESS, routerAbi, rpc)
        const amounts = (await router.getAmountsOut(amountIn, path)) as bigint[]
        if (!cancelled) {
          setQuoteOut(amounts[amounts.length - 1] || 0n)
          setQuotePath(path)
        }
      } catch {
        if (!cancelled) {
          setQuoteOut(0n)
          setQuotePath([])
        }
      }
    }

    void loadQuote()
    return () => {
      cancelled = true
    }
  }, [fromToken, toToken, swapAmount])

  async function sendTx(provider: EthereumProvider, account: string, to: string, data: string, value = 0n) {
    const tx: { from: string; to: string; data: string; value?: string } = { from: account, to, data }
    if (value > 0n) tx.value = toHex(value)
    return requestFromActiveWallet(provider, 'eth_sendTransaction', [tx])
  }

  async function ensureWallet() {
    const snapshot = await readActiveWalletSnapshot()
    if (!snapshot.provider || !snapshot.account) throw new Error('Connect your wallet using the button at the top of the page.')
    if (!isInriChain(snapshot.chainId)) throw new Error('Switch your wallet to INRI CHAIN 3777 before continuing.')
    return { provider: snapshot.provider, account: snapshot.account }
  }

  async function ensureApproval(tokenAddress: string, owner: string, spender: string, amount: bigint, provider: EthereumProvider) {
    const token = new Contract(tokenAddress, erc20Abi, rpc)
    const allowance = (await token.allowance(owner, spender)) as bigint
    if (allowance >= amount) return

    if (allowance > 0n) {
      const resetData = erc20Iface.encodeFunctionData('approve', [spender, 0n])
      await sendTx(provider, owner, tokenAddress, resetData)
    }

    const approveData = erc20Iface.encodeFunctionData('approve', [spender, MaxUint256])
    await sendTx(provider, owner, tokenAddress, approveData)
  }

  async function handleSwap() {
    try {
      setBusy(true)
      setMessage({ kind: 'info', text: 'Preparing swap transaction...' })
      const { provider, account } = await ensureWallet()
      const amountIn = safeParseUnits(swapAmount, fromToken.decimals)
      if (amountIn <= 0n) throw new Error('Enter a valid amount.')
      if (tokenKey(fromToken) === tokenKey(toToken)) throw new Error('Select two different assets.')

      const deadline = deadlineFromNow()

      if (fromToken.native && sameAddress(toToken.address, WINRI_ADDRESS)) {
        const data = routerIface.encodeFunctionData('wrapINRI', [account])
        await sendTx(provider, account, ROUTER_ADDRESS, data, amountIn)
        setMessage({ kind: 'ok', text: 'INRI wrapped into WINRI successfully.' })
        await refreshAll()
        return
      }

      if (toToken.native && sameAddress(fromToken.address, WINRI_ADDRESS)) {
        await ensureApproval(WINRI_ADDRESS, account, ROUTER_ADDRESS, amountIn, provider)
        const data = routerIface.encodeFunctionData('unwrapINRI', [amountIn, account])
        await sendTx(provider, account, ROUTER_ADDRESS, data)
        setMessage({ kind: 'ok', text: 'WINRI unwrapped into INRI successfully.' })
        await refreshAll()
        return
      }

      const path = quotePath.length >= 2 ? quotePath : await resolveSwapPath(fromToken, toToken)
      const router = new Contract(ROUTER_ADDRESS, routerAbi, rpc)
      const amounts = (await router.getAmountsOut(amountIn, path)) as bigint[]
      const expectedOut = amounts[amounts.length - 1] || 0n
      if (expectedOut <= 0n) throw new Error('No valid quote for this route. The pool may not exist yet.')
      const minOut = amountWithSlippage(expectedOut, slippageBps)

      if (fromToken.native) {
        const data = routerIface.encodeFunctionData('swapExactINRIForTokensSupportingFeeOnTransferTokens', [minOut, path, account, deadline])
        await sendTx(provider, account, ROUTER_ADDRESS, data, amountIn)
      } else if (toToken.native) {
        await ensureApproval(fromToken.address, account, ROUTER_ADDRESS, amountIn, provider)
        const data = routerIface.encodeFunctionData('swapExactTokensForINRISupportingFeeOnTransferTokens', [amountIn, minOut, path, account, deadline])
        await sendTx(provider, account, ROUTER_ADDRESS, data)
      } else {
        await ensureApproval(fromToken.address, account, ROUTER_ADDRESS, amountIn, provider)
        const data = routerIface.encodeFunctionData('swapExactTokensForTokensSupportingFeeOnTransferTokens', [amountIn, minOut, path, account, deadline])
        await sendTx(provider, account, ROUTER_ADDRESS, data)
      }

      setMessage({ kind: 'ok', text: 'Swap sent successfully. Refresh balances after the transaction confirms.' })
      await refreshAll()
    } catch (cause) {
      setMessage({ kind: 'bad', text: getErrorMessage(cause, 'Swap failed.') })
    } finally {
      setBusy(false)
    }
  }

  function handleLiquidityAmountAChange(value: string) {
    setLiqEditedSide('A')
    setLiqAmountA(cleanDecimalInput(value))
  }

  function handleLiquidityAmountBChange(value: string) {
    setLiqEditedSide('B')
    setLiqAmountB(cleanDecimalInput(value))
  }

  function handleLiquidityTokenAChange(token: TokenInfo) {
    setLiqEditedSide('A')
    setLiqTokenA(token)
  }

  function handleLiquidityTokenBChange(token: TokenInfo) {
    setLiqEditedSide('B')
    setLiqTokenB(token)
  }

  async function handleAddLiquidity() {
    try {
      setBusy(true)
      setMessage({ kind: 'info', text: 'Preparing liquidity transaction...' })
      const { provider, account } = await ensureWallet()
      if (tokenKey(liqTokenA) === tokenKey(liqTokenB)) throw new Error('Select two different assets.')

      const amountA = safeParseUnits(liqAmountA, liqTokenA.decimals)
      const amountB = safeParseUnits(liqAmountB, liqTokenB.decimals)
      if (amountA <= 0n || amountB <= 0n) throw new Error('Enter valid amounts for both assets.')

      const deadline = deadlineFromNow()
      const aNative = Boolean(liqTokenA.native)
      const bNative = Boolean(liqTokenB.native)

      if (aNative && bNative) throw new Error('A pool cannot be INRI against INRI.')

      if (aNative || bNative) {
        const token = aNative ? liqTokenB : liqTokenA
        const tokenAmount = aNative ? amountB : amountA
        const nativeAmount = aNative ? amountA : amountB
        if (sameAddress(token.address, WINRI_ADDRESS)) throw new Error('Use wrap/unwrap for INRI and WINRI, not a liquidity pool.')
        await ensureApproval(token.address, account, ROUTER_ADDRESS, tokenAmount, provider)
        const data = routerIface.encodeFunctionData('addLiquidityINRI', [token.address, tokenAmount, 0n, 0n, account, deadline])
        await sendTx(provider, account, ROUTER_ADDRESS, data, nativeAmount)
      } else {
        await ensureApproval(liqTokenA.address, account, ROUTER_ADDRESS, amountA, provider)
        await ensureApproval(liqTokenB.address, account, ROUTER_ADDRESS, amountB, provider)
        const data = routerIface.encodeFunctionData('addLiquidity', [liqTokenA.address, liqTokenB.address, amountA, amountB, 0n, 0n, account, deadline])
        await sendTx(provider, account, ROUTER_ADDRESS, data)
      }

      setMessage({ kind: 'ok', text: 'Liquidity transaction sent. The pair is created automatically if it did not exist.' })
      await refreshAll()
    } catch (cause) {
      setMessage({ kind: 'bad', text: getErrorMessage(cause, 'Add liquidity failed.') })
    } finally {
      setBusy(false)
    }
  }

  async function handleRemoveLiquidity() {
    try {
      setBusy(true)
      setMessage({ kind: 'info', text: 'Preparing remove liquidity transaction...' })
      const { provider, account } = await ensureWallet()
      if (!pool || pool.lpBalance <= 0n) throw new Error('No iUSD/INRI LP balance found in this wallet.')

      const percent = Math.max(1, Math.min(100, Number(cleanDecimalInput(removePercent || '0')) || 0))
      const liquidity = (pool.lpBalance * BigInt(Math.round(percent * 100))) / 10000n
      if (liquidity <= 0n) throw new Error('Liquidity amount is too small.')

      await ensureApproval(pool.pair, account, ROUTER_ADDRESS, liquidity, provider)
      const data = routerIface.encodeFunctionData('removeLiquidityINRI', [IUSD_ADDRESS, liquidity, 0n, 0n, account, deadlineFromNow()])
      await sendTx(provider, account, ROUTER_ADDRESS, data)
      setMessage({ kind: 'ok', text: 'Remove liquidity transaction sent.' })
      await refreshAll()
    } catch (cause) {
      setMessage({ kind: 'bad', text: getErrorMessage(cause, 'Remove liquidity failed.') })
    } finally {
      setBusy(false)
    }
  }

  async function handleImportToken() {
    try {
      setBusy(true)
      const address = normalizeAddress(importAddress)
      if (!isAddress(address)) throw new Error('Enter a valid INRI Chain token contract address.')
      if (tokens.some((token) => !token.native && sameAddress(token.address, address))) {
        throw new Error('This token is already in the list.')
      }

      const contract = new Contract(address, erc20Abi, rpc)
      const [name, symbol, decimals] = (await Promise.all([
        contract.name().catch(() => 'Imported Token'),
        contract.symbol().catch(() => 'TOKEN'),
        contract.decimals(),
      ])) as [string, string, bigint | number]

      const nextToken: TokenInfo = {
        address,
        name: String(name || 'Imported Token'),
        symbol: String(symbol || 'TOKEN').slice(0, 16),
        decimals: Number(decimals),
        verified: false,
        warning: 'Imported token. Anyone can create tokens on INRI Chain. Verify the contract before trading.',
      }

      const nextTokens = dedupeTokens([...tokens, nextToken])
      setTokens(nextTokens)
      localStorage.setItem(IMPORTED_TOKENS_KEY, JSON.stringify(nextTokens.filter((token) => !token.native && !token.verified)))
      setImportAddress('')
      setMessage({ kind: 'ok', text: `${nextToken.symbol} imported successfully.` })
      await refreshBalances(wallet.account, nextTokens)
    } catch (cause) {
      setMessage({ kind: 'bad', text: getErrorMessage(cause, 'Token import failed.') })
    } finally {
      setBusy(false)
    }
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(''), 1300)
  }

  const fromBalance = balances[tokenKey(fromToken)] ?? 0n
  const toBalance = balances[tokenKey(toToken)] ?? 0n
  const minReceived = amountWithSlippage(quoteOut, slippageBps)
  const routeLabel = quotePath.length > 0
    ? quotePath
        .map((address) => {
          if (sameAddress(address, WINRI_ADDRESS)) return 'WINRI'
          const token = tokens.find((item) => !item.native && sameAddress(item.address, address))
          return token?.symbol || shortAddress(address, 4, 4)
        })
        .join(' → ')
    : '—'

  const maxFromBalance = fromToken.native && fromBalance > parseUnits('0.02', 18) ? fromBalance - parseUnits('0.02', 18) : fromBalance
  const swapActionLabel = !connected ? 'Connect wallet' : !networkReady ? 'Switch to INRI Chain' : quoteOut <= 0n ? 'Enter amount / no route' : 'Review swap'
  const poolTvlApprox = pool ? Number(formatUnits(pool.reserveIusd, 6)) * 2 : 0
  const liqRatioText = liqPairInfo.exists && liqPairInfo.reserveA > 0n && liqPairInfo.reserveB > 0n
    ? `1 ${liqTokenA.symbol} ≈ ${formatDisplayNumber(Number(formatUnits(liqPairInfo.reserveB, liqTokenB.decimals)) / Math.max(Number(formatUnits(liqPairInfo.reserveA, liqTokenA.decimals)), 1e-18), 8)} ${liqTokenB.symbol}`
    : 'This pair does not exist yet. Your first deposit sets the starting price.'
  const liqPairStatus = liqPairInfo.exists ? 'Existing pair detected · amounts auto-sync to current pool ratio.' : 'New pair · choose the initial price ratio you want to create.'
  const liqBalanceA = balances[tokenKey(liqTokenA)] ?? 0n
  const liqBalanceB = balances[tokenKey(liqTokenB)] ?? 0n
  const contentWidthClass = tab === 'swap' ? 'max-w-[660px]' : tab === 'liquidity' ? 'max-w-[760px]' : 'max-w-[720px]'
  const infoWidthClass = contentWidthClass

  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#04101d] text-white">
        <section className="relative bg-[radial-gradient(circle_at_16%_0%,rgba(19,164,255,0.26),transparent_22rem),radial-gradient(circle_at_88%_8%,rgba(103,212,255,0.12),transparent_24rem),linear-gradient(135deg,#071b2f_0%,#06111f_48%,#04101d_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="relative mx-auto max-w-[820px] px-4 py-5 sm:px-5 lg:px-5 lg:py-5">
            <div className="mx-auto max-w-[660px]">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.20em] text-cyan-100">
                    <img src="/inri-logo.png" alt="INRI logo" className="h-4 w-4 object-contain" /> Official INRISwap V1
                  </div>
                  <h1 className="mt-3 text-[26px] font-black tracking-[-0.055em] text-white sm:text-[30px]">INRISwap</h1>
                  <p className="mt-2 max-w-[580px] text-sm font-semibold leading-6 text-cyan-50/62">
                    Swap tokens, add liquidity and discover assets on INRI Chain. Native INRI is wrapped into WINRI automatically.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] md:min-w-[228px]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-2.5 py-2.5 text-center">
                    <p className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.12em] text-white/40">Fee</p>
                    <p className="mt-1 text-[13px] font-black text-white">0.3%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-2.5 py-2.5 text-center">
                    <p className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.12em] text-white/40">Route</p>
                    <p className="mt-1 text-[13px] font-black text-white">WINRI</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-2.5 py-2.5 text-center">
                    <p className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.12em] text-white/40">Chain</p>
                    <p className="mt-1 text-[13px] font-black text-white">3777</p>
                  </div>
                </div>
              </div>

              {!connected ? (
                <div className="mb-4 rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.08] px-4 py-3 text-sm font-semibold text-cyan-50/88">
                  Use the <span className="font-black text-white">Connect wallet</span> button in the top navigation to start.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="relative border-b border-cyan-300/15 bg-[radial-gradient(circle_at_16%_0%,rgba(19,164,255,0.18),transparent_24rem),radial-gradient(circle_at_88%_8%,rgba(103,212,255,0.10),transparent_24rem),linear-gradient(135deg,#071b2f_0%,#06111f_48%,#02050a_100%)] py-7">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="relative mx-auto max-w-[820px] px-4 sm:px-5 lg:px-5">
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
              {tabItems.map((item) => {
                const ActiveIcon = item.icon
                const active = tab === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black transition ${
                      active
                        ? 'border-cyan-300/55 bg-cyan-300/14 text-white shadow-[0_0_0_4px_rgba(34,211,238,0.08)]'
                        : 'border-white/10 bg-white/[0.035] text-white/62 hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white'
                    }`}
                  >
                    <ActiveIcon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
              <MiniButton onClick={refreshAll}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </MiniButton>
            </div>

            {message ? <div className={`mb-5 rounded-[18px] border p-4 text-sm font-bold leading-6 ${statusClass(message.kind)}`}>{message.text}</div> : null}
            {copied ? <div className="mb-5 rounded-[18px] border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100">{copied} copied.</div> : null}

            <div className={`mx-auto w-full ${contentWidthClass}`}>
              {tab === 'swap' ? (
                <Panel className="rounded-[22px] border-cyan-300/16 bg-[#071827]/92 p-3.5 shadow-[0_28px_84px_rgba(0,0,0,0.30)] sm:p-4">
                  <div className="border-b border-white/10 px-3 pb-4 pt-1 sm:px-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Trade</p>
                        <h2 className="mt-1 text-[20px] font-black tracking-[-0.045em] text-white sm:text-[22px]">Swap tokens</h2>
                      </div>
                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/[0.06] px-3.5 py-2 text-[11px] font-black text-cyan-100">
                        {connected ? shortAddress(wallet.account) : 'Connect wallet from top'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[11px] font-black text-cyan-100">
                      <ArrowRight className="h-3.5 w-3.5" /> Route {routeLabel}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-cyan-100">
                        Slippage {slippage || '1'}%
                      </div>
                      <button type="button" onClick={() => void refreshAll()} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-300/10">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[22px] border border-white/10 bg-[#091727] p-4 transition focus-within:border-cyan-300/35">
                    <FieldLabel label="From" hint={`Balance ${formatTokenAmount(fromBalance, fromToken.decimals)}`} />
                    <div className="grid gap-3 sm:grid-cols-[1fr_190px] lg:grid-cols-[1fr_205px]">
                      <div>
                        <input
                          value={swapAmount}
                          onChange={(event) => setSwapAmount(cleanDecimalInput(event.target.value))}
                          placeholder="0"
                          inputMode="decimal"
                          className="h-16 w-full rounded-[22px] border border-white/10 bg-[#06111d] px-4 text-3xl font-black tracking-[-0.04em] text-white outline-none transition placeholder:text-white/24 focus:border-cyan-300/50"
                        />
                        <button type="button" onClick={() => setSwapAmount(formatTokenAmount(maxFromBalance, fromToken.decimals, fromToken.decimals))} className="mt-2 text-xs font-black text-cyan-300 transition hover:text-white">
                          MAX
                        </button>
                      </div>
                      <TokenSelect value={fromToken} tokens={tokens} onChange={setFromToken} disabledToken={toToken} onOpenImport={() => setTab('tokens')} />
                    </div>
                  </div>

                  <div className="relative z-10 mx-auto -my-2 flex h-12 w-12 items-center justify-center rounded-[18px] border border-cyan-300/30 bg-[#071525] text-cyan-100 shadow-[0_14px_45px_rgba(0,0,0,0.35)]">
                    <button
                      type="button"
                      onClick={() => {
                        setFromToken(toToken)
                        setToToken(fromToken)
                        setSwapAmount('')
                      }}
                      className="flex h-full w-full items-center justify-center rounded-[18px] transition hover:bg-cyan-300/10"
                      aria-label="Invert tokens"
                    >
                      <ArrowDownUp className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-[#091727] p-4 transition focus-within:border-cyan-300/35">
                    <FieldLabel label="To" hint={`Balance ${formatTokenAmount(toBalance, toToken.decimals)}`} />
                    <div className="grid gap-3 sm:grid-cols-[1fr_190px] lg:grid-cols-[1fr_205px]">
                      <div className="flex h-16 items-center rounded-[22px] border border-white/10 bg-[#06111d] px-4 text-3xl font-black tracking-[-0.04em] text-white/92">
                        {quoteOut > 0n ? formatTokenAmount(quoteOut, toToken.decimals, 6) : '0'}
                      </div>
                      <TokenSelect value={toToken} tokens={tokens} onChange={setToToken} disabledToken={fromToken} onOpenImport={() => setTab('tokens')} />
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/24">
                    <div className="grid gap-px bg-white/10 sm:grid-cols-3">
                      <div className="bg-[#06111f] p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Route</div>
                        <div className="mt-2 truncate text-sm font-black text-white">{routeLabel}</div>
                      </div>
                      <div className="bg-[#06111f] p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Minimum received</div>
                        <div className="mt-2 truncate text-sm font-black text-white">{quoteOut > 0n ? `${formatTokenAmount(minReceived, toToken.decimals, 6)} ${toToken.symbol}` : '—'}</div>
                      </div>
                      <div className="bg-[#06111f] p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Slippage</div>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            value={slippage}
                            onChange={(event) => setSlippage(cleanDecimalInput(event.target.value))}
                            className="h-8 w-20 rounded-[10px] border border-white/10 bg-black/30 px-2 text-sm font-black text-white outline-none focus:border-cyan-300/45"
                          />
                          <span className="text-sm font-black text-white/70">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <MiniButton onClick={() => setSlippage('0.5')}>0.5%</MiniButton>
                    <MiniButton onClick={() => setSlippage('1')}>1%</MiniButton>
                    <MiniButton onClick={() => setSlippage('2')}>2%</MiniButton>
                  </div>

                  <div className="mt-5">
                    <ActionButton onClick={handleSwap} busy={busy} disabled={!connected || !networkReady || quoteOut <= 0n}>
                      {swapActionLabel}
                    </ActionButton>
                  </div>
                </Panel>
              ) : null}

              {tab === 'liquidity' ? (
                <Panel className="rounded-[32px] border-cyan-300/24 bg-[#06111f]/92 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Pools</p>
                      <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Supply liquidity</h2>
                      <p className="mt-3 text-sm leading-7 text-white/60">Add liquidity to an existing pair or create a new INRI Chain pool. Native INRI is wrapped into WINRI automatically.</p>
                    </div>
                    <Droplets className="h-7 w-7 text-cyan-300" />
                  </div>

                  <div className="mt-6 rounded-[22px] border border-cyan-300/14 bg-cyan-300/[0.05] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Pair status</div>
                        <div className="mt-1 text-sm font-bold text-white/82">{liqPairStatus}</div>
                      </div>
                      <div className="rounded-full border border-cyan-300/16 bg-black/24 px-3 py-1.5 text-xs font-black text-cyan-100">{liqRatioText}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div className="rounded-[24px] border border-white/10 bg-[#091727] p-4">
                      <FieldLabel label="Asset A" hint={`Balance ${formatTokenAmount(liqBalanceA, liqTokenA.decimals)}`} />
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px]">
                        <div className="min-w-0">
                          <input value={liqAmountA} onChange={(event) => handleLiquidityAmountAChange(event.target.value)} className="h-14 w-full rounded-[18px] border border-white/10 bg-[#06111d] px-4 text-2xl font-black text-white outline-none focus:border-cyan-300/45" />
                          <button type="button" onClick={() => handleLiquidityAmountAChange(formatTokenAmount(liqBalanceA, liqTokenA.decimals, liqTokenA.decimals))} className="mt-2 text-xs font-black text-cyan-300 transition hover:text-white">MAX</button>
                        </div>
                        <TokenSelect value={liqTokenA} tokens={tokens} onChange={handleLiquidityTokenAChange} disabledToken={liqTokenB} onOpenImport={() => setTab('tokens')} compact />
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-[#091727] p-4">
                      <FieldLabel label="Asset B" hint={`Balance ${formatTokenAmount(liqBalanceB, liqTokenB.decimals)}`} />
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px]">
                        <div className="min-w-0">
                          <input value={liqAmountB} onChange={(event) => handleLiquidityAmountBChange(event.target.value)} className="h-14 w-full rounded-[18px] border border-white/10 bg-[#06111d] px-4 text-2xl font-black text-white outline-none focus:border-cyan-300/45" />
                          <button type="button" onClick={() => handleLiquidityAmountBChange(formatTokenAmount(liqBalanceB, liqTokenB.decimals, liqTokenB.decimals))} className="mt-2 text-xs font-black text-cyan-300 transition hover:text-white">MAX</button>
                        </div>
                        <TokenSelect value={liqTokenB} tokens={tokens} onChange={handleLiquidityTokenBChange} disabledToken={liqTokenA} onOpenImport={() => setTab('tokens')} compact />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[18px] border border-amber-300/22 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50/86">
                    <AlertTriangle className="mr-2 inline h-4 w-4" /> Tokens with transfer fees may deposit less than typed. INRISwap measures the real amount received by the pair.
                  </div>

                  <div className="mt-5">
                    <ActionButton onClick={handleAddLiquidity} busy={busy} disabled={!connected || !networkReady}>
                      Supply liquidity
                    </ActionButton>
                  </div>
                </Panel>
              ) : null}

              {tab === 'remove' ? (
                <Panel className="rounded-[32px] border-cyan-300/24 bg-[#06111f]/92 p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">LP position</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">iUSD / INRI liquidity</h2>
                  <p className="mt-3 text-sm leading-7 text-white/60">Remove liquidity from the official iUSD/WINRI pair and receive iUSD plus native INRI.</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] border border-white/10 bg-[#0a1727] p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Your LP</div>
                      <div className="mt-2 text-2xl font-black text-white">{pool ? formatTokenAmount(pool.lpBalance, 18) : '0'}</div>
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-[#0a1727] p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Remove percent</div>
                      <input value={removePercent} onChange={(event) => setRemovePercent(cleanDecimalInput(event.target.value))} className="mt-2 h-12 w-full rounded-[16px] border border-white/10 bg-[#050d18] px-3 text-xl font-black text-white outline-none focus:border-cyan-300/45" />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {['25', '50', '75', '100'].map((percent) => <MiniButton key={percent} onClick={() => setRemovePercent(percent)}>{percent}%</MiniButton>)}
                  </div>

                  <div className="mt-5">
                    <ActionButton onClick={handleRemoveLiquidity} busy={busy} disabled={!connected || !networkReady || !pool || pool.lpBalance <= 0n}>
                      Remove liquidity
                    </ActionButton>
                  </div>
                </Panel>
              ) : null}

              {tab === 'tokens' ? (
                <Panel className="rounded-[32px] border-cyan-300/24 bg-[#06111f]/92 p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Tokens</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Import any INRI token</h2>
                  <p className="mt-3 text-sm leading-7 text-white/60">Paste a contract. The interface reads symbol, name and decimals automatically.</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      value={importAddress}
                      onChange={(event) => setImportAddress(event.target.value)}
                      placeholder="0x token contract"
                      className="h-[3.25rem] rounded-[18px] border border-white/10 bg-[#050d18] px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/28 focus:border-cyan-300/50"
                    />
                    <button type="button" onClick={() => void handleImportToken()} disabled={busy} className="inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-[18px] border border-cyan-300/35 bg-cyan-300/10 px-5 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/16 disabled:opacity-50">
                      <Plus className="h-4 w-4" /> Import
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {tokens.map((token) => (
                      <div key={tokenKey(token)} className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-[#0a1727] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <TokenBadge token={token} />
                            {token.verified ? <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">Verified</span> : <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">Imported</span>}
                          </div>
                          <p className="mt-2 text-sm text-white/60">{token.name} · decimals {token.decimals}</p>
                          {!token.native ? <p className="mt-1 text-xs font-bold text-cyan-200/70">{shortAddress(token.address, 10, 8)}</p> : null}
                        </div>
                        {!token.native ? (
                          <Link href={`${EXPLORER_URL}/address/${token.address}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-cyan-300 hover:text-white">
                            Explorer <ExternalLink className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Panel>
              ) : null}
            </div>

            <div className={`mx-auto mt-6 w-full ${infoWidthClass}`}>
              <div className="grid gap-5">
                <Panel className="rounded-[22px] border-cyan-300/22 bg-[#06111f]/82">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Official market</p>
                      <h2 className="mt-2 text-2xl font-black text-white">iUSD / INRI</h2>
                      <p className="mt-2 text-sm text-white/50">Primary liquidity pair on INRISwap V1</p>
                    </div>
                    {poolLoading ? <RefreshCw className="h-5 w-5 animate-spin text-cyan-300" /> : <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Price</div>
                      <div className="mt-2 text-2xl font-black text-white">{pool?.price || '—'} <span className="text-sm text-white/45">iUSD</span></div>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">TVL est.</div>
                      <div className="mt-2 text-2xl font-black text-white">{poolTvlApprox ? `$${formatDisplayNumber(poolTvlApprox, 4)}` : '—'}</div>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Reserve INRI</div>
                      <div className="mt-2 text-xl font-black text-white">{pool ? formatTokenAmount(pool.reserveInri, 18, 4) : '—'}</div>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Reserve iUSD</div>
                      <div className="mt-2 text-xl font-black text-white">{pool ? formatTokenAmount(pool.reserveIusd, 6, 6) : '—'}</div>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-black/25 p-4 sm:col-span-2">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Your LP</div>
                      <div className="mt-2 text-xl font-black text-white">{pool ? formatTokenAmount(pool.lpBalance, 18, 6) : '—'}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 text-sm font-bold text-white/60 sm:grid-cols-2">
                    <Link href={`${EXPLORER_URL}/address/${OFFICIAL_PAIR_ADDRESS}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.035] px-3 py-3 text-cyan-300 transition hover:border-cyan-300/35 hover:text-white">
                      LP contract <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link href={`${EXPLORER_URL}/address/${ROUTER_ADDRESS}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.035] px-3 py-3 text-cyan-300 transition hover:border-cyan-300/35 hover:text-white">
                      Router <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button type="button" onClick={() => void copy(FACTORY_ADDRESS, 'Factory')} className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.035] px-3 py-3 text-left text-cyan-300 transition hover:border-cyan-300/35 hover:text-white">
                      Factory <Copy className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => void copy(ROUTER_ADDRESS, 'Router')} className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.035] px-3 py-3 text-left text-cyan-300 transition hover:border-cyan-300/35 hover:text-white">
                      Copy Router <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </Panel>

                <Panel className="rounded-[22px] border-cyan-300/18 bg-[#06111f]/72">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Execution details</p>
                  <div className="mt-4 grid gap-3 text-sm leading-7 text-white/66">
                    <p><ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-300" />Native INRI swaps use WINRI automatically.</p>
                    <p><ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-300" />Token decimals are read automatically, including iUSD with 6 decimals.</p>
                    <p><ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-300" />Imported tokens can be searched by name, symbol or contract.</p>
                    <p><AlertTriangle className="mr-2 inline h-4 w-4 text-amber-300" />Low liquidity can cause high price impact. Add liquidity before public use.</p>
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
