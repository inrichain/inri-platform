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
const PLANNED_REWARD_AT_75K = 125_000n * INRI_UNIT
const PLANNED_REWARD_AT_HARDCAP = 150_000n * INRI_UNIT

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
    <main className="relative min-h-screen overflow-hidden bg-[#02040a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,174,255,0.34),transparent_28rem),radial-gradient(circle_at_82%_8%,rgba(122,232,255,0.18),transparent_34rem),linear-gradient(135deg,#071a32_0%,#02040a_44%,#000_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <section className="relative border-b border-cyan-300/15">
        <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-8 lg:py-14">
          <div className="grid gap-7 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                <ShieldCheck className="h-3.5 w-3.5" /> Official liquidity campaign
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.07em] text-white sm:text-6xl">
                INRISwap Liquidity Campaign
              </h1>
              <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-cyan-50/72">
                Deposit iUSD + INRI safely into the protected Seeder. Funds stay outside the live Pair until the target is reached.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[20px] border border-cyan-300/18 bg-white/[0.055] px-3 py-4 backdrop-blur-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-200/70">Reference</p>
                <p className="mt-1 text-lg font-black">{referencePrice}</p>
              </div>
              <div className="rounded-[20px] border border-cyan-300/18 bg-white/[0.055] px-3 py-4 backdrop-blur-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-200/70">Target</p>
                <p className="mt-1 text-lg font-black">{formatNumber(campaign.launchTargetIusd, IUSD_DECIMALS, 0)} iUSD</p>
              </div>
              <div className="rounded-[20px] border border-cyan-300/25 bg-cyan-300/[0.10] px-3 py-4 text-cyan-100 backdrop-blur-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] opacity-75">Status</p>
                <p className="mt-1 text-lg font-black">{statusLabel(campaign.status)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-8 sm:py-10">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link href="/swap" className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-white/12 bg-white/[0.045] px-4 text-sm font-black text-white/80 transition hover:border-cyan-300/35 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Swap</Link>
              <Link href={`${EXPLORER_URL}/address/${SEEDER_ADDRESS}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-cyan-300/24 bg-cyan-300/[0.08] px-4 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/12">Seeder contract <ExternalLink className="h-4 w-4" /></Link>
            </div>
            <button type="button" onClick={() => void refreshAll()} className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-white/12 bg-white/[0.045] px-4 text-sm font-black text-white/80 transition hover:border-cyan-300/35 hover:text-white">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {message ? <div className="mb-5"><MessageBox kind={message.kind}>{message.text}</MessageBox></div> : null}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
            <div className="grid gap-5">
              <div className="rounded-[30px] border border-cyan-300/20 bg-white/[0.060] p-5 shadow-[0_40px_130px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Campaign progress</p>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">Protected iUSD / INRI liquidity</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-white/62">The official iUSD/INRI swap stays paused until enough liquidity is formed. Other community tokens and pools continue normally.</p>
                  </div>
                  <div className="rounded-[18px] border border-cyan-300/25 bg-cyan-300/[0.09] px-5 py-3 text-center text-cyan-100">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-75">Funded rewards</p>
                    <p className="mt-1 text-2xl font-black">{formatNumber(campaign.rewardPool, INRI_DECIMALS, 0)} INRI</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[22px] border border-white/12 bg-black/24 p-4">
                  <div className="mb-3 flex items-center justify-between gap-4 text-xs font-black text-white/64">
                    <span>{formatNumber(campaign.totalIusdDeposited, IUSD_DECIMALS, 2)} iUSD deposited</span>
                    <span>{progressPct.toLocaleString('en-US', { maximumFractionDigits: 2 })}% of target</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full border border-cyan-300/16 bg-black/35">
                    <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-white/48">
                    <span>Launch target: {formatNumber(campaign.launchTargetIusd, IUSD_DECIMALS, 0)} iUSD</span>
                    <span>Hard cap: {formatNumber(campaign.hardCapIusd, IUSD_DECIMALS, 0)} iUSD</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="iUSD total" value={<>{formatNumber(campaign.totalIusdDeposited, IUSD_DECIMALS, 2)} <span className="text-sm text-white/45">iUSD</span></>} sub="protected in Seeder" />
                  <Stat label="INRI total" value={<>{formatNumber(campaign.totalInriDeposited, INRI_DECIMALS, 2)} <span className="text-sm text-white/45">INRI</span></>} sub="native INRI" />
                  <Stat label="Contributors" value={campaign.contributorCount.toString()} sub="wallets with deposits" />
                  <Stat label="LP lock" value={<span className="text-lg">{lockText(campaign.lpLockSeconds)}</span>} sub="after launch" />
                </div>
              </div>

              <div className="rounded-[30px] border border-cyan-300/20 bg-white/[0.055] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Simple reward plan</p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">Rewards grow only if liquidity grows</h3>
                <p className="mt-2 text-sm leading-7 text-white/58">Only funded INRI is guaranteed on-chain. Extra bonuses are deposited later only if the campaign reaches the milestone before launch.</p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-300/[0.075] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/75">At 50,000 iUSD</p>
                    <p className="mt-2 text-3xl font-black">{formatTokenAmount(fundedRewardPerIusdAtTarget, INRI_DECIMALS, 4)}</p>
                    <p className="mt-1 text-sm font-bold text-white/55">INRI reward / 1 iUSD</p>
                  </div>
                  <div className="rounded-[22px] border border-white/12 bg-black/24 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">At 75,000 iUSD</p>
                    <p className="mt-2 text-3xl font-black">{formatTokenAmount(plannedRewardPerIusdAt75k, INRI_DECIMALS, 4)}</p>
                    <p className="mt-1 text-sm font-bold text-white/55">planned with +25k INRI</p>
                  </div>
                  <div className="rounded-[22px] border border-white/12 bg-black/24 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">At 100,000 iUSD</p>
                    <p className="mt-2 text-3xl font-black">{formatTokenAmount(plannedRewardPerIusdAtHardCap, INRI_DECIMALS, 4)}</p>
                    <p className="mt-1 text-sm font-bold text-white/55">planned max 150k INRI</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-cyan-300/20 bg-white/[0.055] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">What you can withdraw</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <Stat label="Before launch" value="iUSD + INRI" sub="your deposit can be withdrawn" />
                  <Stat label="After launch + lock" value="LP + rewards" sub="claim opens after LP unlock" />
                  <Stat label="Campaign end" value={<span className="text-lg">{endText(campaign.campaignEnd)}</span>} sub="0 means no automatic expiry" />
                </div>
                <div className="mt-5"><MessageBox kind="warn"><AlertTriangle className="mr-2 inline h-4 w-4" /> Do not add iUSD/INRI directly to the Pair during seeding. Use this campaign so iUSD stays outside the live Pair until the target is reached.</MessageBox></div>
              </div>
            </div>

            <div className="rounded-[30px] border border-cyan-300/20 bg-white/[0.065] p-5 shadow-[0_40px_130px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6 lg:sticky lg:top-24">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Deposit</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">Join seeding</h2>
                  <p className="mt-2 text-sm leading-6 text-white/58">Enter iUSD. The page calculates required INRI and estimated rewards.</p>
                </div>
                <Wallet className="h-7 w-7 text-cyan-300" />
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[22px] border border-white/12 bg-black/24 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">iUSD amount</p>
                    <p className="text-xs font-black text-cyan-100">Balance {formatNumber(user.iusdBalance, IUSD_DECIMALS, 6)}</p>
                  </div>
                  <input value={depositIusd} onChange={(event) => setDepositIusd(cleanDecimalInput(event.target.value))} className="mt-3 h-16 w-full rounded-[18px] border border-white/10 bg-[#06111d] px-4 text-3xl font-black text-white outline-none focus:border-cyan-300/45" />
                </div>

                <div className="rounded-[22px] border border-white/12 bg-black/24 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Required INRI</p>
                    <p className="text-xs font-black text-cyan-100">Balance {formatNumber(user.inriBalance, INRI_DECIMALS, 6)}</p>
                  </div>
                  <div className="mt-3 rounded-[18px] border border-white/10 bg-[#06111d] px-4 py-4 text-3xl font-black text-white">{formatTokenAmount(quoteInri, INRI_DECIMALS, 6)}</div>
                </div>
              </div>

              <div className="mt-4 rounded-[22px] border border-cyan-300/18 bg-cyan-300/[0.07] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/75">Your estimate</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="rounded-[15px] border border-cyan-300/14 bg-black/22 p-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">50k target</p>
                    <p className="mt-1 text-lg font-black">{formatNumber(depositRewardAtTarget, INRI_DECIMALS, 6)} INRI</p>
                  </div>
                  <div className="rounded-[15px] border border-white/10 bg-black/22 p-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">75k plan</p>
                    <p className="mt-1 text-lg font-black">{formatNumber(depositRewardAt75kPlan, INRI_DECIMALS, 6)} INRI</p>
                  </div>
                  <div className="rounded-[15px] border border-white/10 bg-black/22 p-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">100k plan</p>
                    <p className="mt-1 text-lg font-black">{formatNumber(depositRewardAtHardCapPlan, INRI_DECIMALS, 6)} INRI</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[22px] border border-white/12 bg-black/24 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Your current position</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[15px] border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">Withdrawable iUSD</p>
                    <p className="mt-1 text-lg font-black">{formatNumber(user.contributionIusd, IUSD_DECIMALS, 6)}</p>
                  </div>
                  <div className="rounded-[15px] border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">Withdrawable INRI</p>
                    <p className="mt-1 text-lg font-black">{formatNumber(user.contributionInri, INRI_DECIMALS, 6)}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-white/45">Before launch, you can withdraw exactly your deposited iUSD + INRI. Rewards are claimable only after launch + LP lock.</p>
              </div>

              <div className="mt-4 rounded-[22px] border border-white/12 bg-black/24 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Future claim after launch</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[15px] border border-white/10 bg-white/[0.035] p-3"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">LP tokens</p><p className="mt-1 text-lg font-black">{formatNumber(user.pendingLp, INRI_DECIMALS, 6)}</p></div>
                  <div className="rounded-[15px] border border-white/10 bg-white/[0.035] p-3"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/35">INRI rewards</p><p className="mt-1 text-lg font-black">{formatNumber(user.pendingReward, INRI_DECIMALS, 6)}</p></div>
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-white/45">Unlock: {unlockDateText(campaign.lpUnlockTime)}</p>
              </div>

              {!connected ? <div className="mt-4"><MessageBox kind="info">Connect your wallet using the top button before depositing.</MessageBox></div> : null}
              {connected && !networkReady ? <div className="mt-4"><MessageBox kind="warn">Switch your wallet to INRI CHAIN 3777.</MessageBox></div> : null}

              <div className="mt-5 grid gap-3">
                <button type="button" onClick={() => void handleDeposit()} disabled={!connected || !networkReady || busy || campaign.status !== 0} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-cyan-300 px-5 text-sm font-black text-black shadow-[0_18px_52px_rgba(46,216,255,0.24)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/40 disabled:shadow-none">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />} Deposit iUSD + INRI
                </button>
                <button type="button" onClick={() => void handleWithdraw()} disabled={!connected || !networkReady || busy || campaign.status === 1 || !userHasContribution} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-white/12 bg-white/[0.045] px-5 text-sm font-black text-white/82 transition hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"><Unlock className="h-4 w-4" /> Withdraw before launch</button>
                <button type="button" onClick={() => void handleClaim()} disabled={!connected || !networkReady || busy || campaign.status !== 1} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-emerald-300/20 bg-emerald-400/10 px-5 text-sm font-black text-emerald-100 transition hover:bg-emerald-400/16 disabled:cursor-not-allowed disabled:opacity-45"><Gift className="h-4 w-4" /> Claim after LP unlock</button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[30px] border border-cyan-300/20 bg-white/[0.055] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Safety rules</p>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-white/66">
                <p><CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-300" /> iUSD/INRI swaps are paused during seeding.</p>
                <p><CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-300" /> Deposits stay outside the Pair until the liquidity target is reached.</p>
                <p><Gift className="mr-2 inline h-4 w-4 text-cyan-300" /> Rewards are proportional to each user&apos;s iUSD contribution at launch.</p>
                <p><Lock className="mr-2 inline h-4 w-4 text-cyan-300" /> If the campaign is cancelled before launch, users withdraw deposits and rewards return to the community vault.</p>
              </div>
            </div>

            <div className="rounded-[30px] border border-cyan-300/20 bg-white/[0.055] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Contracts</p>
              <div className="mt-4 grid gap-2 text-sm font-bold text-white/70">
                {[
                  ['Seeder', SEEDER_ADDRESS],
                  ['iUSD', IUSD_ADDRESS],
                  ['Router', ROUTER_ADDRESS],
                  ['Reward vault', REWARD_VAULT_ADDRESS],
                ].map(([label, address]) => (
                  <div key={label} className="grid gap-2 rounded-[16px] border border-white/10 bg-black/24 p-3 sm:grid-cols-[110px_1fr_auto] sm:items-center">
                    <span className="text-cyan-300">{label}</span>
                    <span className="break-all text-white/70">{address}</span>
                    <button type="button" onClick={() => void copy(address, label)} className="inline-flex items-center gap-2 text-cyan-300 hover:text-white">{copied === label ? 'Copied' : 'Copy'} <Copy className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
