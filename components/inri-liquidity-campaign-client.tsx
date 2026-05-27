'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, CheckCircle2, Copy, ExternalLink, Gift, Loader2, Lock, RefreshCw, ShieldCheck, Target, Unlock, Wallet, Coins, Clock3 } from 'lucide-react'
import { Contract, Interface, JsonRpcProvider, MaxUint256, formatUnits, parseUnits } from 'ethers'
import { getErrorMessage, isInriChain, readActiveWalletSnapshot, requestFromActiveWallet, toHex, type EthereumProvider } from '@/lib/inri-active-wallet'

const RPC_URL = 'https://rpc.inri.life'
const EXPLORER_URL = 'https://explorer.inri.life'
const IUSD_ADDRESS = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'
const ROUTER_ADDRESS = '0xcd5E469b9f6E3BA80F03B1De7B202EbE5DEB8DcD'
const REWARD_VAULT_ADDRESS = '0xCC82Ffd96B647F60CdE65249F21e602b900Ff174'
const SEEDER_ADDRESS = '0x34583A7080d47Af38d76Bae78c51Ecd0C64442cF'
const IUSD_DECIMALS = 6
const INRI_DECIMALS = 18

// Controlled reward plan for the first liquidity round.
// These are UI/planning numbers: only amounts already funded in rewardPool are guaranteed on-chain.
const INRI_UNIT = 10n ** 18n
const MILESTONE_75_IUSD = 75_000_000_000n
const PLANNED_REWARD_AT_75K = 175_000n * INRI_UNIT
const PLANNED_REWARD_AT_HARDCAP = 250_000n * INRI_UNIT

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
}

type CampaignState = {
  campaignActive: boolean
  status: number
  owner: string
  iUSD: string
  router: string
  rewardVault: string
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

type UserState = {
  iusdBalance: bigint
  inriBalance: bigint
  allowance: bigint
  contributionIusd: bigint
  contributionInri: bigint
  contributionClaimed: boolean
  pendingLp: bigint
  pendingReward: bigint
  pendingUnusedIusd: bigint
  pendingUnusedInri: bigint
}

const emptyCampaign: CampaignState = {
  campaignActive: true,
  status: 0,
  owner: '',
  iUSD: IUSD_ADDRESS,
  router: ROUTER_ADDRESS,
  rewardVault: REWARD_VAULT_ADDRESS,
  referencePrice: 18000n,
  launchTargetIusd: 50_000_000_000n,
  hardCapIusd: 100_000_000_000n,
  maxUserIusd: 0n,
  campaignEnd: 0n,
  lpLockSeconds: 2_592_000n,
  launchMinBps: 9800n,
  totalIusdDeposited: 0n,
  totalInriDeposited: 0n,
  contributorCount: 0n,
  rewardPool: 0n,
  rewardPoolAtLaunch: 0n,
  lpToken: '0x0000000000000000000000000000000000000000',
  lpUnlockTime: 0n,
}

const emptyUser: UserState = {
  iusdBalance: 0n,
  inriBalance: 0n,
  allowance: 0n,
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
  try {
    return parseUnits(clean, decimals)
  } catch {
    return 0n
  }
}

function formatTokenAmount(value: bigint, decimals: number, digits = 6) {
  const text = formatUnits(value, decimals)
  const [whole, fraction = ''] = text.split('.')
  const trimmed = fraction.slice(0, digits).replace(/0+$/, '')
  return trimmed ? `${whole}.${trimmed}` : whole
}

function formatNumber(value: bigint, decimals: number, digits = 2) {
  const n = Number(formatUnits(value, decimals))
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: digits })
}

function formatRewardEstimate(value: bigint) {
  const n = Number(formatUnits(value, INRI_DECIMALS))
  if (!Number.isFinite(n)) return '—'
  const digits = n >= 1000 ? 2 : n >= 10 ? 4 : 6
  return n.toLocaleString('en-US', { maximumFractionDigits: digits })
}

function shortAddress(value?: string | null, left = 6, right = 4) {
  if (!value) return '—'
  return value.length <= left + right + 2 ? value : `${value.slice(0, left)}…${value.slice(-right)}`
}

function statusLabel(status: number) {
  if (status === 0) return 'OPEN'
  if (status === 1) return 'LAUNCHED'
  if (status === 2) return 'CANCELLED'
  return `STATUS ${status}`
}

function endText(value: bigint) {
  if (value === 0n) return 'No automatic expiry'
  const date = new Date(Number(value) * 1000)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

function lockText(value: bigint) {
  if (value === 0n) return 'No LP lock'
  const days = Number(value) / 86400
  return days >= 1 ? `${days.toLocaleString('en-US', { maximumFractionDigits: 1 })} days` : `${Math.round(Number(value) / 60)} minutes`
}

function unlockDateText(value: bigint) {
  if (value === 0n) return 'Not launched yet'
  const date = new Date(Number(value) * 1000)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

function rewardPerIusd(rewardPool: bigint, totalIusd: bigint) {
  if (rewardPool <= 0n || totalIusd <= 0n) return 0n
  return (rewardPool * 10n ** BigInt(IUSD_DECIMALS)) / totalIusd
}

function proportionalReward(rewardPool: bigint, userIusd: bigint, totalIusd: bigint) {
  if (rewardPool <= 0n || userIusd <= 0n || totalIusd <= 0n) return 0n
  return (rewardPool * userIusd) / totalIusd
}

async function sendTx(provider: EthereumProvider, account: string, to: string, data: string, value = 0n) {
  const tx: { from: string; to: string; data: string; value?: string } = { from: account, to, data }
  if (value > 0n) tx.value = toHex(value)
  return requestFromActiveWallet(provider, 'eth_sendTransaction', [tx])
}

async function approveIfNeeded(account: string, amount: bigint, provider: EthereumProvider) {
  const iusd = new Contract(IUSD_ADDRESS, erc20Abi, rpc)
  const allowance = (await iusd.allowance(account, SEEDER_ADDRESS)) as bigint
  if (allowance >= amount) return
  const data = erc20Iface.encodeFunctionData('approve', [SEEDER_ADDRESS, MaxUint256])
  await sendTx(provider, account, IUSD_ADDRESS, data)
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[28px] border border-cyan-300/16 bg-[#06111f]/92 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}>{children}</div>
}

function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/24 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">{label}</p>
      <div className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">{value}</div>
      {sub ? <p className="mt-1 text-xs font-bold text-white/45">{sub}</p> : null}
    </div>
  )
}

function MessageBox({ kind, children }: { kind: 'ok' | 'warn' | 'bad' | 'info'; children: ReactNode }) {
  const cls = kind === 'ok'
    ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100'
    : kind === 'bad'
      ? 'border-red-300/25 bg-red-400/10 text-red-100'
      : kind === 'warn'
        ? 'border-amber-300/25 bg-amber-400/10 text-amber-100'
        : 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100'
  return <div className={`rounded-[18px] border p-4 text-sm font-bold leading-7 ${cls}`}>{children}</div>
}

export function InriLiquidityCampaignClient() {
  const [wallet, setWallet] = useState<WalletState>({ provider: null, account: null, chainId: null })
  const [campaign, setCampaign] = useState<CampaignState>(emptyCampaign)
  const [user, setUser] = useState<UserState>(emptyUser)
  const [depositIusd, setDepositIusd] = useState('0.1')
  const [quoteInri, setQuoteInri] = useState(0n)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')
  const [message, setMessage] = useState<{ kind: 'ok' | 'warn' | 'bad' | 'info'; text: string } | null>(null)

  const seeder = useMemo(() => new Contract(SEEDER_ADDRESS, seederAbi, rpc), [])
  const connected = Boolean(wallet.provider && wallet.account)
  const networkReady = isInriChain(wallet.chainId)

  const progressPct = campaign.launchTargetIusd > 0n
    ? Math.min(100, Number((campaign.totalIusdDeposited * 10000n) / campaign.launchTargetIusd) / 100)
    : 0
  const hardCapPct = campaign.hardCapIusd > 0n
    ? Math.min(100, Number((campaign.totalIusdDeposited * 10000n) / campaign.hardCapIusd) / 100)
    : 0
  const referencePrice = formatTokenAmount(campaign.referencePrice, IUSD_DECIMALS, 6)
  const targetInri = campaign.referencePrice > 0n ? (campaign.launchTargetIusd * 10n ** 18n + campaign.referencePrice - 1n) / campaign.referencePrice : 0n
  const hardCapInri = campaign.referencePrice > 0n && campaign.hardCapIusd > 0n ? (campaign.hardCapIusd * 10n ** 18n + campaign.referencePrice - 1n) / campaign.referencePrice : 0n
  const depositIusdAmount = safeParseUnits(depositIusd, IUSD_DECIMALS)
  const fundedRewardPerIusdAtTarget = rewardPerIusd(campaign.rewardPool, campaign.launchTargetIusd)
  const plannedRewardPerIusdAt75k = rewardPerIusd(PLANNED_REWARD_AT_75K, MILESTONE_75_IUSD)
  const plannedRewardPerIusdAtHardCap = rewardPerIusd(PLANNED_REWARD_AT_HARDCAP, campaign.hardCapIusd)
  const depositRewardAtTarget = proportionalReward(campaign.rewardPool, depositIusdAmount, campaign.launchTargetIusd)
  const depositRewardAt75kPlan = proportionalReward(PLANNED_REWARD_AT_75K, depositIusdAmount, MILESTONE_75_IUSD)
  const depositRewardAtHardCapPlan = proportionalReward(PLANNED_REWARD_AT_HARDCAP, depositIusdAmount, campaign.hardCapIusd)
  const userRewardAtTarget = proportionalReward(campaign.rewardPool, user.contributionIusd, campaign.launchTargetIusd)
  const userRewardAt75kPlan = proportionalReward(PLANNED_REWARD_AT_75K, user.contributionIusd, MILESTONE_75_IUSD)
  const userRewardAtHardCapPlan = proportionalReward(PLANNED_REWARD_AT_HARDCAP, user.contributionIusd, campaign.hardCapIusd)
  const userHasContribution = user.contributionIusd > 0n || user.contributionInri > 0n
  const claimReady = campaign.status === 1 && campaign.lpUnlockTime > 0n && BigInt(Math.floor(Date.now() / 1000)) >= campaign.lpUnlockTime
  const readWallet = useCallback(async () => {
    const snap = await readActiveWalletSnapshot()
    setWallet({ provider: snap.provider, account: snap.account, chainId: snap.chainId })
    return snap
  }, [])

  const refreshCampaign = useCallback(async () => {
    try {
      const statusRaw = await seeder.status()
      const status = Number(statusRaw)
      const campaignEnd = (await seeder.campaignEnd()) as bigint
      const now = BigInt(Math.floor(Date.now() / 1000))
      const fallbackActive = status === 0 && (campaignEnd === 0n || campaignEnd >= now)
      const active = await seeder.campaignActive().catch(() => fallbackActive)
      const [owner, iUSD, router, rewardVault, referencePrice, launchTargetIusd, hardCapIusd, maxUserIusd, lpLockSeconds, launchMinBps, totalIusdDeposited, totalInriDeposited, contributorCount, rewardPool, rewardPoolAtLaunch, lpToken, lpUnlockTime] = await Promise.all([
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
      ]) as [string, string, string, string, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, string, bigint]
      setCampaign({ owner, iUSD, router, rewardVault, campaignActive: Boolean(active), status, referencePrice, launchTargetIusd, hardCapIusd, maxUserIusd, campaignEnd, lpLockSeconds, launchMinBps, totalIusdDeposited, totalInriDeposited, contributorCount, rewardPool, rewardPoolAtLaunch, lpToken, lpUnlockTime })
    } catch (cause) {
      setMessage({ kind: 'warn', text: getErrorMessage(cause, 'Could not read campaign contract yet. Static campaign information is still shown.') })
    }
  }, [seeder])

  const refreshUser = useCallback(async (account?: string | null) => {
    if (!account) {
      setUser(emptyUser)
      return
    }
    try {
      const iusd = new Contract(IUSD_ADDRESS, erc20Abi, rpc)
      const [iusdBalance, inriBalance, allowance, contribution, pending] = await Promise.all([
        iusd.balanceOf(account),
        rpc.getBalance(account),
        iusd.allowance(account, SEEDER_ADDRESS),
        seeder.contributions(account),
        seeder.userPendingClaim(account).catch(() => [0n, 0n, 0n, 0n]),
      ]) as [bigint, bigint, bigint, [bigint, bigint, boolean], [bigint, bigint, bigint, bigint]]
      setUser({ iusdBalance, inriBalance, allowance, contributionIusd: contribution[0], contributionInri: contribution[1], contributionClaimed: contribution[2], pendingLp: pending[0], pendingReward: pending[1], pendingUnusedIusd: pending[2], pendingUnusedInri: pending[3] })
    } catch (cause) {
      setMessage({ kind: 'warn', text: getErrorMessage(cause, 'Could not read your wallet campaign data yet.') })
    }
  }, [seeder])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    try {
      const snap = await readWallet()
      await Promise.all([refreshCampaign(), refreshUser(snap.account)])
    } finally {
      setLoading(false)
    }
  }, [readWallet, refreshCampaign, refreshUser])

  useEffect(() => {
    void refreshAll()
    const handler = () => void refreshAll()
    window.addEventListener('inri:wallet-state', handler)
    return () => window.removeEventListener('inri:wallet-state', handler)
  }, [refreshAll])

  useEffect(() => {
    let cancelled = false
    async function updateQuote() {
      const iusdAmount = safeParseUnits(depositIusd, IUSD_DECIMALS)
      if (iusdAmount <= 0n) {
        setQuoteInri(0n)
        return
      }
      try {
        const q = (await seeder.quoteInriForIusd(iusdAmount)) as bigint
        if (!cancelled) setQuoteInri(q)
      } catch {
        const fallback = (iusdAmount * 10n ** 18n + emptyCampaign.referencePrice - 1n) / emptyCampaign.referencePrice
        if (!cancelled) setQuoteInri(fallback)
      }
    }
    void updateQuote()
    return () => { cancelled = true }
  }, [depositIusd, seeder])

  async function requireWallet() {
    const snap = await readActiveWalletSnapshot()
    if (!snap.provider || !snap.account) throw new Error('Connect your wallet in the top button first.')
    if (!isInriChain(snap.chainId)) throw new Error('Switch your wallet to INRI CHAIN 3777.')
    return { provider: snap.provider, account: snap.account }
  }

  async function handleDeposit() {
    try {
      setBusy(true)
      setMessage({ kind: 'info', text: 'Preparing deposit. Your wallet may ask for iUSD approval first.' })
      const { provider, account } = await requireWallet()
      const iusdAmount = safeParseUnits(depositIusd, IUSD_DECIMALS)
      if (iusdAmount <= 0n) throw new Error('Enter a valid iUSD amount.')
      const requiredInri = (await seeder.quoteInriForIusd(iusdAmount)) as bigint
      if (iusdAmount > user.iusdBalance) throw new Error('Insufficient iUSD balance.')
      if (requiredInri > user.inriBalance) throw new Error('Insufficient INRI balance.')
      await approveIfNeeded(account, iusdAmount, provider)
      const data = seederIface.encodeFunctionData('depositByIusd', [iusdAmount])
      await sendTx(provider, account, SEEDER_ADDRESS, data, requiredInri)
      setMessage({ kind: 'ok', text: 'Deposit transaction sent. Refresh after confirmation to see your position.' })
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
      setMessage({ kind: 'info', text: 'Preparing withdraw before launch.' })
      const { provider, account } = await requireWallet()
      const data = seederIface.encodeFunctionData('withdrawBeforeLaunchOrAfterCancel')
      await sendTx(provider, account, SEEDER_ADDRESS, data)
      setMessage({ kind: 'ok', text: 'Withdraw transaction sent.' })
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
      setMessage({ kind: 'info', text: 'Preparing claim.' })
      const { provider, account } = await requireWallet()
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
    window.setTimeout(() => setCopied(''), 1400)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#04101d] text-white">
        <section className="relative min-h-screen border-b border-cyan-300/15 bg-[radial-gradient(circle_at_16%_0%,rgba(19,164,255,0.26),transparent_22rem),radial-gradient(circle_at_88%_8%,rgba(103,212,255,0.12),transparent_24rem),linear-gradient(135deg,#071b2f_0%,#06111f_48%,#04101d_100%)] pb-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative mx-auto max-w-[1120px] px-4 py-6 sm:px-5 lg:py-8">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.20em] text-cyan-100">
                  <ShieldCheck className="h-3.5 w-3.5" /> Official liquidity campaign
                </div>
                <h1 className="mt-3 text-[34px] font-black tracking-[-0.06em] text-white sm:text-[44px] lg:text-[48px]">INRISwap Liquidity Campaign</h1>
                <p className="mt-3 max-w-[620px] text-sm font-semibold leading-7 text-cyan-50/68">
                  Deposit iUSD + INRI into the protected Seeder. Funds stay outside the live Pair until the target is reached, then LP is created and locked.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/42">Reference</p>
                  <p className="mt-1 text-sm font-black text-white">{referencePrice}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/42">Target</p>
                  <p className="mt-1 text-sm font-black text-white">{formatNumber(campaign.launchTargetIusd, IUSD_DECIMALS, 0)} iUSD</p>
                </div>
                <div className="rounded-2xl border border-cyan-300/22 bg-cyan-300/[0.08] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-100/70">Status</p>
                  <p className="mt-1 text-sm font-black text-white">{statusLabel(campaign.status)}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Link href="/swap" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-black text-white/78 transition hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Swap</Link>
                <a href={`${EXPLORER_URL}/address/${SEEDER_ADDRESS}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-4 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/14">Seeder contract <ExternalLink className="h-4 w-4" /></a>
              </div>
              <button type="button" onClick={() => void refreshAll()} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-black text-white/78 transition hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
              </button>
            </div>

            {message ? <div className="mt-4"><MessageBox kind={message.kind}>{message.text}</MessageBox></div> : null}
            {copied ? <div className="mt-4"><MessageBox kind="ok">{copied} copied.</MessageBox></div> : null}

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
              <div className="grid min-w-0 gap-4">
                <Card className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Campaign overview</p>
                      <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] text-white">Protected iUSD / INRI liquidity</h2>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white/60">iUSD/INRI swaps stay paused until the campaign reaches the target. Other token pools continue normally.</p>
                    </div>
                    <div className="shrink-0 rounded-2xl border border-cyan-300/22 bg-cyan-300/[0.08] px-4 py-3 text-center">
                      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-cyan-100/70">Funded rewards</p>
                      <p className="mt-1 text-xl font-black text-white">{formatNumber(campaign.rewardPool, INRI_DECIMALS, 0)} INRI</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/24 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-white/65">
                      <span>{formatNumber(campaign.totalIusdDeposited, IUSD_DECIMALS, 2)} iUSD deposited</span>
                      <span>{progressPct.toLocaleString('en-US', { maximumFractionDigits: 2 })}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border border-cyan-300/16 bg-black/35">
                      <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-white/45">
                      <span>Target: {formatNumber(campaign.launchTargetIusd, IUSD_DECIMALS, 0)} iUSD</span>
                      <span>Hard cap: {formatNumber(campaign.hardCapIusd, IUSD_DECIMALS, 0)} iUSD · {hardCapPct.toLocaleString('en-US', { maximumFractionDigits: 2 })}% filled</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="iUSD total" value={<>{formatNumber(campaign.totalIusdDeposited, IUSD_DECIMALS, 2)} <span className="text-sm text-white/45">iUSD</span></>} sub="inside Seeder" />
                    <Stat label="INRI total" value={<>{formatNumber(campaign.totalInriDeposited, INRI_DECIMALS, 2)} <span className="text-sm text-white/45">INRI</span></>} sub="native INRI" />
                    <Stat label="Contributors" value={campaign.contributorCount.toString()} sub="wallets" />
                    <Stat label="LP lock" value={<span className="text-lg">{lockText(campaign.lpLockSeconds)}</span>} sub="after launch" />
                  </div>
                </Card>

                <Card className="p-4 sm:p-5">
                  <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Reward plan</p>
                      <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-white">More liquidity, stronger bonus</h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white/58">Only funded INRI is guaranteed on-chain. Extra bonuses are added later with fundRewards() when milestones are reached.</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-2xl border border-cyan-300/22 bg-cyan-300/[0.08] p-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-cyan-100/70">50k target</p>
                        <p className="mt-1 text-2xl font-black text-white">{formatTokenAmount(fundedRewardPerIusdAtTarget, INRI_DECIMALS, 4)}</p>
                        <p className="text-[11px] font-bold text-white/48">INRI / 1 iUSD</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/24 p-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/42">75k plan</p>
                        <p className="mt-1 text-2xl font-black text-white">{formatTokenAmount(plannedRewardPerIusdAt75k, INRI_DECIMALS, 4)}</p>
                        <p className="text-[11px] font-bold text-white/48">175k total planned</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/24 p-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/42">100k max</p>
                        <p className="mt-1 text-2xl font-black text-white">{formatTokenAmount(plannedRewardPerIusdAtHardCap, INRI_DECIMALS, 4)}</p>
                        <p className="text-[11px] font-bold text-white/48">250k max planned</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {userHasContribution ? (
                  <Card className="p-4 sm:p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Your live position</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <Stat label="You deposited" value={<>{formatNumber(user.contributionIusd, IUSD_DECIMALS, 6)} <span className="text-sm text-white/45">iUSD</span></>} sub={`${formatNumber(user.contributionInri, INRI_DECIMALS, 6)} INRI`} />
                      <Stat label="Can withdraw now" value="iUSD + INRI" sub="before launch" />
                      <Stat label="50k estimate" value={<>{formatRewardEstimate(userRewardAtTarget)} <span className="text-sm text-white/45">INRI</span></>} sub="if launched at target" />
                      <Stat label="100k max plan" value={<>{formatRewardEstimate(userRewardAtHardCapPlan)} <span className="text-sm text-white/45">INRI</span></>} sub="if max bonus funded" />
                    </div>
                  </Card>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="p-4 sm:p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Safety rules</p>
                    <div className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-white/62">
                      <p><CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-300" /> iUSD/INRI swaps are paused during seeding.</p>
                      <p><CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-300" /> Deposits stay outside the Pair until the target is reached.</p>
                      <p><Gift className="mr-2 inline h-4 w-4 text-cyan-300" /> Rewards are proportional to each user&apos;s iUSD contribution at launch.</p>
                      <p><Lock className="mr-2 inline h-4 w-4 text-cyan-300" /> If cancelled before launch, users withdraw deposits and rewards return to the community vault.</p>
                    </div>
                  </Card>

                  <Card className="p-4 sm:p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Contracts</p>
                    <div className="mt-3 grid gap-2 text-xs font-bold text-white/70">
                      {[
                        ['Seeder', SEEDER_ADDRESS],
                        ['iUSD', IUSD_ADDRESS],
                        ['Router', ROUTER_ADDRESS],
                        ['Reward vault', REWARD_VAULT_ADDRESS],
                      ].map(([label, address]) => (
                        <div key={label} className="grid gap-1 rounded-2xl border border-white/10 bg-black/22 p-3">
                          <div className="flex items-center justify-between gap-2"><span className="font-black text-cyan-300">{label}</span><button type="button" onClick={() => void copy(address, label)} className="inline-flex items-center gap-1 text-cyan-300 hover:text-white">{copied === label ? 'Copied' : 'Copy'} <Copy className="h-3.5 w-3.5" /></button></div>
                          <span className="break-all text-white/58">{address}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              <aside className="min-w-0 lg:sticky lg:top-24">
                <Card className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Deposit</p>
                      <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-white">Join seeding</h2>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white/58">Enter iUSD. Required INRI and rewards are calculated instantly.</p>
                    </div>
                    <Wallet className="h-7 w-7 text-cyan-300" />
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="rounded-[22px] border border-white/10 bg-black/24 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">iUSD amount</p>
                        <p className="text-xs font-black text-cyan-100">Balance {formatNumber(user.iusdBalance, IUSD_DECIMALS, 6)}</p>
                      </div>
                      <input value={depositIusd} onChange={(event) => setDepositIusd(cleanDecimalInput(event.target.value))} className="mt-3 h-14 w-full min-w-0 rounded-[18px] border border-white/10 bg-[#06111d] px-4 text-3xl font-black tracking-[-0.04em] text-white outline-none focus:border-cyan-300/45" />
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-black/24 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Required INRI</p>
                        <p className="text-xs font-black text-cyan-100">Balance {formatNumber(user.inriBalance, INRI_DECIMALS, 6)}</p>
                      </div>
                      <div className="mt-3 min-w-0 break-words rounded-[18px] border border-white/10 bg-[#06111d] px-4 py-3 text-2xl font-black leading-tight text-white tabular-nums">{formatTokenAmount(quoteInri, INRI_DECIMALS, 6)}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[22px] border border-cyan-300/18 bg-cyan-300/[0.07] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/75">Reward estimate</p>
                        <p className="mt-1 text-xs font-bold leading-5 text-white/52">For the typed deposit: {formatNumber(depositIusdAmount, IUSD_DECIMALS, 6)} iUSD.</p>
                      </div>
                      <Gift className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                      <div className="min-w-0 rounded-[16px] border border-cyan-300/14 bg-black/22 p-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">50k target</p>
                        <p className="mt-1 break-words text-base font-black leading-tight tabular-nums">{formatRewardEstimate(depositRewardAtTarget)} INRI</p>
                        <p className="mt-1 text-[10px] font-bold text-white/38">rate {formatTokenAmount(fundedRewardPerIusdAtTarget, INRI_DECIMALS, 4)} / iUSD</p>
                      </div>
                      <div className="min-w-0 rounded-[16px] border border-white/10 bg-black/22 p-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">75k plan</p>
                        <p className="mt-1 break-words text-base font-black leading-tight tabular-nums">{formatRewardEstimate(depositRewardAt75kPlan)} INRI</p>
                        <p className="mt-1 text-[10px] font-bold text-white/38">bonus plan</p>
                      </div>
                      <div className="min-w-0 rounded-[16px] border border-white/10 bg-black/22 p-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">100k max</p>
                        <p className="mt-1 break-words text-base font-black leading-tight tabular-nums">{formatRewardEstimate(depositRewardAtHardCapPlan)} INRI</p>
                        <p className="mt-1 text-[10px] font-bold text-white/38">max plan</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[22px] border border-white/10 bg-black/24 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Your current position</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">Deposited</p><p className="mt-1 text-sm font-black text-white">{formatNumber(user.contributionIusd, IUSD_DECIMALS, 6)} iUSD</p><p className="text-xs font-bold text-white/42">{formatNumber(user.contributionInri, INRI_DECIMALS, 6)} INRI</p></div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">Can withdraw</p><p className="mt-1 text-sm font-black text-white">Before launch</p><p className="text-xs font-bold text-white/42">your iUSD + INRI</p></div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[22px] border border-white/10 bg-black/24 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Future claim after launch</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">LP tokens</p><p className="mt-1 break-words text-sm font-black tabular-nums">{formatNumber(user.pendingLp, INRI_DECIMALS, 6)}</p></div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">Confirmed rewards</p><p className="mt-1 break-words text-sm font-black tabular-nums">{formatNumber(user.pendingReward, INRI_DECIMALS, 6)}</p></div>
                    </div>
                    <p className="mt-2 text-xs font-bold leading-5 text-white/45">Unlock: {unlockDateText(campaign.lpUnlockTime)}. Confirmed values appear after launch.</p>
                  </div>

                  {!connected ? <div className="mt-4"><MessageBox kind="info">Connect your wallet using the top button before depositing.</MessageBox></div> : null}
                  {connected && !networkReady ? <div className="mt-4"><MessageBox kind="warn">Switch your wallet to INRI CHAIN 3777.</MessageBox></div> : null}

                  <div className="mt-4 grid gap-2">
                    <button type="button" onClick={() => void handleDeposit()} disabled={!connected || !networkReady || busy || campaign.status !== 0} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-cyan-300 px-5 text-sm font-black text-black shadow-[0_18px_52px_rgba(46,216,255,0.24)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/40 disabled:shadow-none">
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />} Deposit iUSD + INRI
                    </button>
                    <button type="button" onClick={() => void handleWithdraw()} disabled={!connected || !networkReady || busy || campaign.status === 1 || !userHasContribution} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-white/12 bg-white/[0.045] px-5 text-sm font-black text-white/82 transition hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"><Unlock className="h-4 w-4" /> Withdraw before launch</button>
                    <button type="button" onClick={() => void handleClaim()} disabled={!connected || !networkReady || busy || !claimReady} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-emerald-300/20 bg-emerald-400/10 px-5 text-sm font-black text-emerald-100 transition hover:bg-emerald-400/16 disabled:cursor-not-allowed disabled:opacity-45"><Gift className="h-4 w-4" /> Claim after LP unlock</button>
                  </div>
                </Card>
              </aside>
            </div>
          </div>
        </section>
    </main>
  )
}
