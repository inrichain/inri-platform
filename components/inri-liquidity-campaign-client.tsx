'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Target,
  Unlock,
  Wallet,
} from 'lucide-react'
import { Contract, Interface, JsonRpcProvider, MaxUint256, formatUnits, parseUnits } from 'ethers'
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
const IUSD_ADDRESS = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'
const ROUTER_ADDRESS = '0xcd5E469b9f6E3BA80F03B1De7B202EbE5DEB8DcD'
const REWARD_VAULT_ADDRESS = '0xCC82Ffd96B647F60CdE65249F21e602b900Ff174'
const SEEDER_ADDRESS = '0x34583A7080d47Af38d76Bae78c51Ecd0C64442cF'
const IUSD_DECIMALS = 6
const INRI_DECIMALS = 18

const erc20Abi = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
]

const seederAbi = [
  'function owner() view returns (address)',
  'function iUSD() view returns (address)',
  'function router() view returns (address)',
  'function rewardVault() view returns (address)',
  'function campaignActive() view returns (bool)',
  'function status() view returns (uint8)',
  'function referencePriceIusdPerInriUnits() view returns (uint256)',
  'function launchTargetIusd() view returns (uint256)',
  'function hardCapIusd() view returns (uint256)',
  'function maxUserIusd() view returns (uint256)',
  'function campaignEnd() view returns (uint256)',
  'function lpLockSeconds() view returns (uint256)',
  'function launchMinBps() view returns (uint256)',
  'function totalIusdDeposited() view returns (uint256)',
  'function totalInriDeposited() view returns (uint256)',
  'function contributorCount() view returns (uint256)',
  'function rewardPool() view returns (uint256)',
  'function rewardPoolAtLaunch() view returns (uint256)',
  'function lpToken() view returns (address)',
  'function lpUnlockTime() view returns (uint256)',
  'function quoteInriForIusd(uint256) view returns (uint256)',
  'function quoteIusdForInri(uint256) view returns (uint256)',
  'function contributions(address) view returns (uint256 iusdAmount,uint256 inriAmount,bool claimed)',
  'function userPendingClaim(address) view returns (uint256 lpAmount,uint256 rewardINRI,uint256 unusedIusd,uint256 unusedINRI)',
  'function depositByIusd(uint256 iusdAmount) payable',
  'function withdrawBeforeLaunchOrAfterCancel()',
  'function claimAfterLpUnlock()',
]

const erc20Iface = new Interface(erc20Abi)
const seederIface = new Interface(seederAbi)
const rpc = new JsonRpcProvider(RPC_URL)

type WalletState = {
  provider: EthereumProvider | null
  account: string | null
  chainId: string | null
  ready: boolean
}

type CampaignSnapshot = {
  owner: string
  iUSD: string
  router: string
  rewardVault: string
  campaignActive: boolean
  status: number
  referencePrice: bigint
  launchTargetIusd: bigint
  hardCapIusd: bigint
  maxUserIusd: bigint
  campaignEnd: bigint
  lpLockSeconds: bigint
  launchMinBps: bigint
  totalIusdDeposited: bigint
  totalInriDeposited: bigint
  contributorCount: bigint
  rewardPool: bigint
  rewardPoolAtLaunch: bigint
  lpToken: string
  lpUnlockTime: bigint
}

type UserSnapshot = {
  iusdBalance: bigint
  inriBalance: bigint
  iusdAllowance: bigint
  contributionIusd: bigint
  contributionInri: bigint
  contributionClaimed: boolean
  pendingLp: bigint
  pendingReward: bigint
  pendingUnusedIusd: bigint
  pendingUnusedInri: bigint
}

const emptyCampaign: CampaignSnapshot = {
  owner: '',
  iUSD: IUSD_ADDRESS,
  router: ROUTER_ADDRESS,
  rewardVault: REWARD_VAULT_ADDRESS,
  campaignActive: false,
  status: 0,
  referencePrice: 18000n,
  launchTargetIusd: 0n,
  hardCapIusd: 0n,
  maxUserIusd: 0n,
  campaignEnd: 0n,
  lpLockSeconds: 0n,
  launchMinBps: 0n,
  totalIusdDeposited: 0n,
  totalInriDeposited: 0n,
  contributorCount: 0n,
  rewardPool: 0n,
  rewardPoolAtLaunch: 0n,
  lpToken: '0x0000000000000000000000000000000000000000',
  lpUnlockTime: 0n,
}

const emptyUser: UserSnapshot = {
  iusdBalance: 0n,
  inriBalance: 0n,
  iusdAllowance: 0n,
  contributionIusd: 0n,
  contributionInri: 0n,
  contributionClaimed: false,
  pendingLp: 0n,
  pendingReward: 0n,
  pendingUnusedIusd: 0n,
  pendingUnusedInri: 0n,
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

function formatCompact(value: bigint, decimals: number, digits = 2) {
  const number = Number(formatUnits(value, decimals))
  if (!Number.isFinite(number)) return '—'
  return number.toLocaleString('en-US', { maximumFractionDigits: digits })
}

function shortAddress(value?: string | null, left = 6, right = 4) {
  if (!value) return '—'
  return value.length <= left + right + 2 ? value : `${value.slice(0, left)}…${value.slice(-right)}`
}

function sameAddress(a?: string, b?: string) {
  return String(a || '').toLowerCase() === String(b || '').toLowerCase()
}

function statusLabel(status: number) {
  if (status === 0) return 'OPEN'
  if (status === 1) return 'LAUNCHED'
  if (status === 2) return 'CANCELLED'
  return `UNKNOWN ${status}`
}

function deadlineText(value: bigint) {
  if (value === 0n) return 'No automatic expiry'
  const date = new Date(Number(value) * 1000)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

function lockText(value: bigint) {
  if (value === 0n) return 'No lock'
  const seconds = Number(value)
  const days = seconds / 86400
  if (days >= 1) return `${days.toLocaleString('en-US', { maximumFractionDigits: 1 })} days`
  const minutes = seconds / 60
  return `${minutes.toLocaleString('en-US', { maximumFractionDigits: 0 })} minutes`
}

async function sendTx(provider: EthereumProvider, account: string, to: string, data: string, value = 0n) {
  const tx: { from: string; to: string; data: string; value?: string } = { from: account, to, data }
  if (value > 0n) tx.value = toHex(value)
  return requestFromActiveWallet(provider, 'eth_sendTransaction', [tx])
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

function StatCard({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/22 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</p>
      <div className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs font-bold text-white/45">{sub}</div> : null}
    </div>
  )
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[28px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(5,19,34,0.96),rgba(4,14,26,0.98))] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl ${className}`}>
      {children}
    </div>
  )
}

function ActionButton({ children, onClick, disabled, busy }: { children: ReactNode; onClick: () => Promise<void> | void; disabled?: boolean; busy?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={disabled || busy}
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-cyan-300 px-5 text-sm font-black text-black shadow-[0_18px_52px_rgba(46,216,255,0.24)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/40 disabled:shadow-none"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

export function InriLiquidityCampaignClient() {
  const [wallet, setWallet] = useState<WalletState>({ provider: null, account: null, chainId: null, ready: false })
  const [campaign, setCampaign] = useState<CampaignSnapshot>(emptyCampaign)
  const [user, setUser] = useState<UserSnapshot>(emptyUser)
  const [depositIusd, setDepositIusd] = useState('0.1')
  const [quoteInri, setQuoteInri] = useState<bigint>(0n)
  const [message, setMessage] = useState<{ kind: 'ok' | 'warn' | 'info' | 'bad'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')

  const connected = Boolean(wallet.account && wallet.provider)
  const networkReady = isInriChain(wallet.chainId)
  const seeder = useMemo(() => new Contract(SEEDER_ADDRESS, seederAbi, rpc), [])

  const progressPct = useMemo(() => {
    if (campaign.launchTargetIusd <= 0n) return 0
    return Math.min(100, Number((campaign.totalIusdDeposited * 10000n) / campaign.launchTargetIusd) / 100)
  }, [campaign.launchTargetIusd, campaign.totalIusdDeposited])

  const hardCapPct = useMemo(() => {
    if (campaign.hardCapIusd <= 0n) return 0
    return Math.min(100, Number((campaign.totalIusdDeposited * 10000n) / campaign.hardCapIusd) / 100)
  }, [campaign.hardCapIusd, campaign.totalIusdDeposited])

  const referencePriceText = useMemo(() => formatTokenAmount(campaign.referencePrice, IUSD_DECIMALS, 6), [campaign.referencePrice])
  const targetInri = useMemo(() => {
    if (campaign.referencePrice <= 0n || campaign.launchTargetIusd <= 0n) return 0n
    return (campaign.launchTargetIusd * 10n ** 18n + campaign.referencePrice - 1n) / campaign.referencePrice
  }, [campaign.launchTargetIusd, campaign.referencePrice])

  const syncWallet = useCallback(async () => {
    const snapshot = await readActiveWalletSnapshot()
    setWallet({ provider: snapshot.provider, account: snapshot.account, chainId: snapshot.chainId, ready: snapshot.providerReady })
    return snapshot
  }, [])

  const refreshCampaign = useCallback(async () => {
    const statusRaw = await seeder.status()
    const status = Number(statusRaw)
    const campaignEnd = (await seeder.campaignEnd()) as bigint
    const now = BigInt(Math.floor(Date.now() / 1000))
    const activeFallback = status === 0 && (campaignEnd === 0n || campaignEnd >= now)
    const active = await seeder.campaignActive().catch(() => activeFallback)

    const [
      owner,
      iUSD,
      router,
      rewardVault,
      referencePrice,
      launchTargetIusd,
      hardCapIusd,
      maxUserIusd,
      lpLockSeconds,
      launchMinBps,
      totalIusdDeposited,
      totalInriDeposited,
      contributorCount,
      rewardPool,
      rewardPoolAtLaunch,
      lpToken,
      lpUnlockTime,
    ] = (await Promise.all([
      seeder.owner(),
      seeder.iUSD(),
      seeder.router(),
      seeder.rewardVault(),
      seeder.referencePriceIusdPerInriUnits(),
      seeder.launchTargetIusd(),
      seeder.hardCapIusd(),
      seeder.maxUserIusd(),
      seeder.lpLockSeconds(),
      seeder.launchMinBps(),
      seeder.totalIusdDeposited(),
      seeder.totalInriDeposited(),
      seeder.contributorCount(),
      seeder.rewardPool(),
      seeder.rewardPoolAtLaunch(),
      seeder.lpToken(),
      seeder.lpUnlockTime(),
    ])) as [string, string, string, string, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, string, bigint]

    setCampaign({
      owner,
      iUSD,
      router,
      rewardVault,
      campaignActive: Boolean(active),
      status,
      referencePrice,
      launchTargetIusd,
      hardCapIusd,
      maxUserIusd,
      campaignEnd,
      lpLockSeconds,
      launchMinBps,
      totalIusdDeposited,
      totalInriDeposited,
      contributorCount,
      rewardPool,
      rewardPoolAtLaunch,
      lpToken,
      lpUnlockTime,
    })
  }, [seeder])

  const refreshUser = useCallback(async (account?: string | null) => {
    if (!account) {
      setUser(emptyUser)
      return
    }

    const iusd = new Contract(IUSD_ADDRESS, erc20Abi, rpc)
    const [iusdBalance, inriBalance, iusdAllowance, contribution, pending] = (await Promise.all([
      iusd.balanceOf(account),
      rpc.getBalance(account),
      iusd.allowance(account, SEEDER_ADDRESS),
      seeder.contributions(account),
      seeder.userPendingClaim(account).catch(() => [0n, 0n, 0n, 0n]),
    ])) as [bigint, bigint, bigint, [bigint, bigint, boolean], [bigint, bigint, bigint, bigint]]

    setUser({
      iusdBalance,
      inriBalance,
      iusdAllowance,
      contributionIusd: contribution[0],
      contributionInri: contribution[1],
      contributionClaimed: contribution[2],
      pendingLp: pending[0],
      pendingReward: pending[1],
      pendingUnusedIusd: pending[2],
      pendingUnusedInri: pending[3],
    })
  }, [seeder])

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true)
      const snapshot = await syncWallet()
      await Promise.all([refreshCampaign(), refreshUser(snapshot.account)])
    } catch (cause) {
      setMessage({ kind: 'warn', text: getErrorMessage(cause, 'Unable to refresh liquidity campaign data.') })
    } finally {
      setLoading(false)
    }
  }, [refreshCampaign, refreshUser, syncWallet])

  useEffect(() => {
    void refreshAll()
    const handler = () => void refreshAll()
    window.addEventListener('inri:wallet-state', handler)
    return () => window.removeEventListener('inri:wallet-state', handler)
  }, [refreshAll])

  useEffect(() => {
    let cancelled = false
    async function loadQuote() {
      try {
        const amount = safeParseUnits(depositIusd, IUSD_DECIMALS)
        if (amount <= 0n) {
          if (!cancelled) setQuoteInri(0n)
          return
        }
        const quote = (await seeder.quoteInriForIusd(amount)) as bigint
        if (!cancelled) setQuoteInri(quote)
      } catch {
        if (!cancelled) setQuoteInri(0n)
      }
    }
    void loadQuote()
    return () => {
      cancelled = true
    }
  }, [depositIusd, seeder])

  async function ensureWallet() {
    const snapshot = await readActiveWalletSnapshot()
    if (!snapshot.provider || !snapshot.account) throw new Error('Connect your wallet using the button at the top of the page.')
    if (!isInriChain(snapshot.chainId)) throw new Error('Switch your wallet to INRI CHAIN 3777 before continuing.')
    return { provider: snapshot.provider, account: snapshot.account }
  }

  async function handleDeposit() {
    try {
      setBusy(true)
      setMessage({ kind: 'info', text: 'Preparing liquidity campaign deposit...' })
      const { provider, account } = await ensureWallet()
      if (!campaign.campaignActive || campaign.status !== 0) throw new Error('The liquidity campaign is not open.')
      const iusdAmount = safeParseUnits(depositIusd, IUSD_DECIMALS)
      if (iusdAmount <= 0n) throw new Error('Enter a valid iUSD amount.')
      const requiredInri = (await seeder.quoteInriForIusd(iusdAmount)) as bigint
      if (requiredInri <= 0n) throw new Error('Unable to calculate required INRI.')
      if (iusdAmount > user.iusdBalance) throw new Error('Insufficient iUSD balance.')
      if (requiredInri > user.inriBalance) throw new Error('Insufficient INRI balance for the campaign deposit.')

      await ensureApproval(IUSD_ADDRESS, account, SEEDER_ADDRESS, iusdAmount, provider)
      const data = seederIface.encodeFunctionData('depositByIusd', [iusdAmount])
      await sendTx(provider, account, SEEDER_ADDRESS, data, requiredInri)
      setMessage({ kind: 'ok', text: 'Deposit sent. Refresh after confirmation to see your campaign position.' })
      await refreshAll()
    } catch (cause) {
      setMessage({ kind: 'bad', text: getErrorMessage(cause, 'Deposit failed.') })
    } finally {
      setBusy(false)
    }
  }

  async function handleWithdraw() {
    try {
      setBusy(true)
      setMessage({ kind: 'info', text: 'Preparing withdrawal...' })
      const { provider, account } = await ensureWallet()
      if (user.contributionIusd <= 0n && user.contributionInri <= 0n) throw new Error('No campaign contribution found for this wallet.')
      const data = seederIface.encodeFunctionData('withdrawBeforeLaunchOrAfterCancel')
      await sendTx(provider, account, SEEDER_ADDRESS, data)
      setMessage({ kind: 'ok', text: 'Withdraw transaction sent. Your iUSD and INRI return after confirmation.' })
      await refreshAll()
    } catch (cause) {
      setMessage({ kind: 'bad', text: getErrorMessage(cause, 'Withdraw failed.') })
    } finally {
      setBusy(false)
    }
  }

  async function handleClaim() {
    try {
      setBusy(true)
      setMessage({ kind: 'info', text: 'Preparing claim...' })
      const { provider, account } = await ensureWallet()
      const data = seederIface.encodeFunctionData('claimAfterLpUnlock')
      await sendTx(provider, account, SEEDER_ADDRESS, data)
      setMessage({ kind: 'ok', text: 'Claim transaction sent.' })
      await refreshAll()
    } catch (cause) {
      setMessage({ kind: 'bad', text: getErrorMessage(cause, 'Claim failed.') })
    } finally {
      setBusy(false)
    }
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1500)
  }

  const statusKind = campaign.status === 0 ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100' : campaign.status === 1 ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100' : 'border-amber-300/25 bg-amber-400/10 text-amber-100'

  return (
    <InriShell>
      <main className="min-h-screen bg-[#02040a] text-white">
        <section className="relative border-b border-cyan-300/12 bg-[radial-gradient(circle_at_16%_0%,rgba(19,164,255,0.26),transparent_22rem),radial-gradient(circle_at_88%_8%,rgba(103,212,255,0.12),transparent_24rem),linear-gradient(135deg,#071b2f_0%,#06111f_48%,#02050a_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="relative mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.20em] text-cyan-100">
                  <ShieldCheck className="h-3.5 w-3.5" /> Official liquidity seeding
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl">INRISwap Liquidity Campaign</h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-cyan-50/64 sm:text-base">
                  Seed iUSD / INRI liquidity safely before public swaps open. Funds stay outside the Pair until the target is reached.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] sm:min-w-[300px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/40">Reference</p>
                  <p className="mt-1 text-sm font-black text-white">{referencePriceText}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/40">Target</p>
                  <p className="mt-1 text-sm font-black text-white">{formatCompact(campaign.launchTargetIusd, IUSD_DECIMALS, 0)}</p>
                </div>
                <div className={`rounded-2xl border px-3 py-3 ${statusKind}`}>
                  <p className="text-[8px] font-black uppercase tracking-[0.12em] opacity-70">Status</p>
                  <p className="mt-1 text-sm font-black">{statusLabel(campaign.status)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-[linear-gradient(180deg,#061523_0%,#02040a_42%,#02040a_100%)] py-8">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Link href="/swap" className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-white/12 bg-white/[0.04] px-4 text-sm font-black text-white/80 transition hover:border-cyan-300/35 hover:text-white">
                  Back to Swap
                </Link>
                <Link href={`${EXPLORER_URL}/address/${SEEDER_ADDRESS}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-cyan-300/20 bg-cyan-300/[0.08] px-4 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/12">
                  Seeder contract <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <button type="button" onClick={() => void refreshAll()} className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-white/12 bg-white/[0.04] px-4 text-sm font-black text-white/80 transition hover:border-cyan-300/35 hover:text-white">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {message ? (
              <div className={`mb-5 rounded-[18px] border p-4 text-sm font-bold ${message.kind === 'ok' ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100' : message.kind === 'bad' ? 'border-red-300/25 bg-red-400/10 text-red-100' : message.kind === 'warn' ? 'border-amber-300/25 bg-amber-400/10 text-amber-100' : 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100'}`}>
                {message.text}
              </div>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
              <Panel className="rounded-[32px] border-cyan-300/24 bg-[#06111f]/92 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Campaign progress</p>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-white">Build safe iUSD / INRI liquidity</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
                      Public iUSD/INRI swaps stay paused while liquidity grows. Users can deposit here, withdraw before launch, and later claim LP + INRI rewards after the lock period.
                    </p>
                  </div>
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-2 text-xs font-black text-cyan-100">
                    {campaign.campaignActive ? 'Campaign open' : statusLabel(campaign.status)}
                  </div>
                </div>

                <div className="mt-6 rounded-[22px] border border-white/10 bg-black/24 p-4">
                  <div className="mb-3 flex items-center justify-between gap-4 text-xs font-black text-white/60">
                    <span>{formatCompact(campaign.totalIusdDeposited, IUSD_DECIMALS, 2)} iUSD deposited</span>
                    <span>{progressPct.toLocaleString('en-US', { maximumFractionDigits: 2 })}%</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full border border-cyan-300/14 bg-black/35">
                    <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-white/45">
                    <span>Launch target: {formatCompact(campaign.launchTargetIusd, IUSD_DECIMALS, 0)} iUSD</span>
                    {campaign.hardCapIusd > 0n ? <span>Hard cap: {formatCompact(campaign.hardCapIusd, IUSD_DECIMALS, 0)} iUSD · {hardCapPct.toLocaleString('en-US', { maximumFractionDigits: 2 })}% filled</span> : <span>No hard cap</span>}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <StatCard label="Reference price" value={<>{referencePriceText} <span className="text-sm text-white/45">iUSD</span></>} sub="per 1 INRI" />
                  <StatCard label="INRI required at target" value={formatCompact(targetInri, INRI_DECIMALS, 0)} sub="estimated by current reference" />
                  <StatCard label="Reward pool" value={formatCompact(campaign.rewardPool, INRI_DECIMALS, 4)} sub="INRI currently funded" />
                  <StatCard label="Contributors" value={campaign.contributorCount.toString()} sub="wallets with deposits" />
                  <StatCard label="Campaign end" value={<span className="text-lg">{deadlineText(campaign.campaignEnd)}</span>} sub="0 means no automatic expiry" />
                  <StatCard label="LP lock" value={<span className="text-lg">{lockText(campaign.lpLockSeconds)}</span>} sub="after launch" />
                </div>

                <div className="mt-5 rounded-[18px] border border-amber-300/22 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50/86">
                  <AlertTriangle className="mr-2 inline h-4 w-4" /> The official iUSD/INRI pool is in liquidity seeding mode. Deposits here stay outside the Pair until the launch target is reached, reducing drain risk from direct Remix/RPC interaction.
                </div>
              </Panel>

              <Panel className="rounded-[32px] border-cyan-300/24 bg-[#06111f]/92 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Deposit</p>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">Join liquidity seeding</h2>
                    <p className="mt-2 text-sm leading-6 text-white/55">Enter iUSD. The required INRI is calculated automatically.</p>
                  </div>
                  <Wallet className="h-7 w-7 text-cyan-300" />
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-[22px] border border-white/10 bg-[#091727] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">iUSD amount</label>
                      <span className="text-xs font-bold text-cyan-200/70">Balance {formatTokenAmount(user.iusdBalance, IUSD_DECIMALS, 6)}</span>
                    </div>
                    <input
                      value={depositIusd}
                      onChange={(event) => setDepositIusd(cleanDecimalInput(event.target.value))}
                      inputMode="decimal"
                      className="h-16 w-full rounded-[20px] border border-white/10 bg-[#06111d] px-4 text-3xl font-black tracking-[-0.04em] text-white outline-none transition placeholder:text-white/24 focus:border-cyan-300/50"
                    />
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => setDepositIusd('0.1')} className="text-xs font-black text-cyan-300 hover:text-white">0.1</button>
                      <button type="button" onClick={() => setDepositIusd('0.2')} className="text-xs font-black text-cyan-300 hover:text-white">0.2</button>
                      <button type="button" onClick={() => setDepositIusd(formatTokenAmount(user.iusdBalance, IUSD_DECIMALS, IUSD_DECIMALS))} className="text-xs font-black text-cyan-300 hover:text-white">MAX</button>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-[#091727] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">Required INRI</label>
                      <span className="text-xs font-bold text-cyan-200/70">Balance {formatTokenAmount(user.inriBalance, INRI_DECIMALS, 4)}</span>
                    </div>
                    <div className="flex h-16 items-center rounded-[20px] border border-white/10 bg-[#06111d] px-4 text-3xl font-black tracking-[-0.04em] text-white/92">
                      {quoteInri > 0n ? formatTokenAmount(quoteInri, INRI_DECIMALS, 6) : '0'}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Your iUSD deposit</div>
                      <div className="mt-2 text-xl font-black text-white">{formatTokenAmount(user.contributionIusd, IUSD_DECIMALS, 6)}</div>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Your INRI deposit</div>
                      <div className="mt-2 text-xl font-black text-white">{formatTokenAmount(user.contributionInri, INRI_DECIMALS, 6)}</div>
                    </div>
                  </div>

                  <ActionButton onClick={handleDeposit} busy={busy} disabled={!connected || !networkReady || !campaign.campaignActive || campaign.status !== 0}>
                    Deposit iUSD + INRI
                  </ActionButton>

                  <button
                    type="button"
                    onClick={() => void handleWithdraw()}
                    disabled={!connected || !networkReady || busy || (user.contributionIusd <= 0n && user.contributionInri <= 0n) || campaign.status === 1}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-white/12 bg-white/[0.045] px-5 text-sm font-black text-white/82 transition hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Unlock className="h-4 w-4" /> Withdraw before launch
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleClaim()}
                    disabled={!connected || !networkReady || busy || campaign.status !== 1}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-emerald-300/20 bg-emerald-400/10 px-5 text-sm font-black text-emerald-100 transition hover:bg-emerald-400/16 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Gift className="h-4 w-4" /> Claim after LP unlock
                  </button>
                </div>
              </Panel>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <Panel className="rounded-[28px] border-cyan-300/18 bg-[#06111f]/82">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Safety rules</p>
                <div className="mt-4 grid gap-3 text-sm leading-7 text-white/66">
                  <p><ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-300" />iUSD/INRI swaps are paused during seeding.</p>
                  <p><ShieldCheck className="mr-2 inline h-4 w-4 text-emerald-300" />Direct iUSD/INRI add liquidity on the Swap page is redirected here.</p>
                  <p><Lock className="mr-2 inline h-4 w-4 text-cyan-300" />LP remains locked after launch for the campaign lock period.</p>
                  <p><AlertTriangle className="mr-2 inline h-4 w-4 text-amber-300" />Other community pools can still be created and used normally.</p>
                </div>
              </Panel>

              <Panel className="rounded-[28px] border-cyan-300/18 bg-[#06111f]/82">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">Contracts</p>
                <div className="mt-4 grid gap-2 text-sm font-bold text-white/70">
                  {[
                    ['Seeder', SEEDER_ADDRESS],
                    ['iUSD', IUSD_ADDRESS],
                    ['Router', ROUTER_ADDRESS],
                    ['Reward vault', REWARD_VAULT_ADDRESS],
                  ].map(([label, address]) => (
                    <div key={label} className="grid gap-2 rounded-[16px] border border-white/10 bg-white/[0.035] p-3 sm:grid-cols-[100px_1fr_auto] sm:items-center">
                      <span className="text-cyan-300">{label}</span>
                      <span className="break-all text-white/70">{address}</span>
                      <button type="button" onClick={() => void copy(address, label)} className="inline-flex items-center gap-2 text-cyan-300 hover:text-white">
                        {copied === label ? 'Copied' : 'Copy'} <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
