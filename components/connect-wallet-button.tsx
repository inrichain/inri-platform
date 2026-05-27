'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  QrCode,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react'
import {
  connectWalletConnect,
  disconnectWalletConnect,
  getWalletConnectProvider,
  getWalletConnectState,
  shouldResumeWalletConnect,
  subscribeWalletConnect,
  switchWalletConnectToInri,
} from '@/lib/walletconnect-inri'

const INRI_CHAIN_ID_HEX = '0xec1'
const INJECTED_DISMISSED_KEY = 'inri_injected_disconnected_v1'

type ProviderLike = {
  request: (args: { method: string; params?: unknown[] | object; chainId?: string }) => Promise<any>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
  isMetaMask?: boolean
  isOkxWallet?: boolean
  isRabby?: boolean
  isCoinbaseWallet?: boolean
  isTrust?: boolean
  providers?: ProviderLike[]
}

type WalletEntry = {
  key: string
  label: string
  provider: ProviderLike
}

type ConnectorType = '' | 'injected' | 'walletconnect'

declare global {
  interface Window {
    ethereum?: ProviderLike
    __INRI_ACTIVE_WALLET__?: {
      connector: ConnectorType | ''
      address: string
      chainId: string
      provider?: ProviderLike
    } | null
  }
}

function shortAddress(address?: string | null, compact = false) {
  if (!address) return 'Connect wallet'
  return compact
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : `${address.slice(0, 6)}...${address.slice(-4)}`
}

function normalizeChainId(chainId?: string | null) {
  return chainId?.toLowerCase() || null
}

function chainLabel(chainId?: string | null) {
  if (!chainId) return 'Wallet not connected'
  if (normalizeChainId(chainId) === INRI_CHAIN_ID_HEX) return 'INRI CHAIN'
  const numeric = Number.parseInt(chainId, 16)
  return Number.isFinite(numeric) ? `Chain ${numeric}` : chainId
}

function walletLabelFromProvider(provider: ProviderLike, index: number) {
  if (provider.isRabby) return { key: 'rabby', label: 'Rabby wallet' }
  if (provider.isCoinbaseWallet) return { key: 'coinbase', label: 'Coinbase wallet' }
  if (provider.isTrust) return { key: 'trust', label: 'Trust wallet' }
  if (provider.isOkxWallet) return { key: 'okx', label: 'OKX wallet' }
  if (provider.isMetaMask) return { key: 'metamask', label: 'MetaMask / Browser wallet' }
  return { key: `browser-${index}`, label: 'Browser wallet' }
}

function uniqueWallets(entries: WalletEntry[]) {
  const map = new Map<string, WalletEntry>()
  entries.forEach((entry) => {
    if (!map.has(entry.key)) map.set(entry.key, entry)
  })
  return Array.from(map.values())
}

function getInjectedDismissed() {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(INJECTED_DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

function setInjectedDismissed(value: boolean) {
  if (typeof window === 'undefined') return
  try {
    if (value) {
      localStorage.setItem(INJECTED_DISMISSED_KEY, '1')
    } else {
      localStorage.removeItem(INJECTED_DISMISSED_KEY)
    }
  } catch {}
}

export function ConnectWalletButton({ compact = false }: { compact?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  const [injectedAddress, setInjectedAddress] = useState('')
  const [injectedChainId, setInjectedChainId] = useState('')
  const [injectedDismissed, setInjectedDismissedState] = useState(false)

  const [wcAddress, setWcAddress] = useState('')
  const [wcChainId, setWcChainId] = useState('')

  const [connector, setConnector] = useState<ConnectorType>('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [activeProviderKey, setActiveProviderKey] = useState('')

  const rootRef = useRef<HTMLDivElement | null>(null)

  const effectiveConnector: ConnectorType =
    connector || (wcAddress ? 'walletconnect' : injectedAddress ? 'injected' : '')

  const address = effectiveConnector === 'walletconnect' ? wcAddress : injectedAddress
  const chainId = effectiveConnector === 'walletconnect' ? wcChainId : injectedChainId
  const networkReady = normalizeChainId(chainId) === INRI_CHAIN_ID_HEX

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open || typeof document === 'undefined') return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [open])

  useEffect(() => {
    if (typeof window === 'undefined') return

    setInjectedDismissedState(getInjectedDismissed())

    const collectInjectedWallets = () => {
      const eth = window.ethereum
      if (!eth) {
        setWallets([])
        return
      }
      const providers = eth.providers?.length ? eth.providers : [eth]
      const next = providers.map((provider, index) => {
        const meta = walletLabelFromProvider(provider, index)
        return { key: meta.key, label: meta.label, provider }
      })
      setWallets(uniqueWallets(next))
    }

    const syncInjectedState = async () => {
      const eth = window.ethereum
      if (!eth) return

      try {
        const [accounts, nextChainId] = (await Promise.all([
          eth.request({ method: 'eth_accounts' }),
          eth.request({ method: 'eth_chainId' }),
        ])) as [string[], string]

        const nextAddress = accounts?.[0] || ''

        if (getInjectedDismissed()) {
          setInjectedAddress('')
          setInjectedChainId('')
          return
        }

        setInjectedAddress(nextAddress)
        setInjectedChainId(nextChainId || '')

        if (!wcAddress && nextAddress && !connector) {
          setConnector('injected')
        }
      } catch {
        // no-op
      }
    }

    const handleAccountsChanged = (accounts: unknown) => {
      if (getInjectedDismissed()) {
        setInjectedAddress('')
        setInjectedChainId('')
        return
      }

      const next = Array.isArray(accounts) ? (accounts[0] as string | undefined) : undefined
      setInjectedAddress(next || '')
      if (!wcAddress && next) setConnector('injected')
    }

    const handleChainChanged = (nextChainId: unknown) => {
      if (getInjectedDismissed()) return
      if (typeof nextChainId === 'string') setInjectedChainId(nextChainId)
    }

    let unsubscribeWalletConnect: (() => void) | null = null

    const bootWalletConnect = async () => {
      try {
        unsubscribeWalletConnect = await subscribeWalletConnect((state) => {
          setWcAddress(state.address || '')
          setWcChainId(state.chainId || '')

          if (state.connected) {
            setConnector('walletconnect')
            setError('')
          } else if (connector === 'walletconnect') {
            setConnector(injectedAddress ? 'injected' : '')
          }
        })

        if (shouldResumeWalletConnect()) {
          const state = await getWalletConnectState()
          if (state.connected) {
            setWcAddress(state.address)
            setWcChainId(state.chainId)
            setConnector('walletconnect')
          }
        }
      } catch {
        // WalletConnect can fail to initialize when the relay blocks the domain.
        // Keep the rest of the site and browser wallet connection working.
      }
    }

    collectInjectedWallets()
    void syncInjectedState()
    void bootWalletConnect()

    window.ethereum?.on?.('accountsChanged', handleAccountsChanged)
    window.ethereum?.on?.('chainChanged', handleChainChanged)

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged)
      unsubscribeWalletConnect?.()
    }
  }, [connector, injectedAddress, wcAddress])

  const providerChoices = useMemo(() => {
    if (wallets.length > 0) return wallets
    if (typeof window !== 'undefined' && window.ethereum) {
      return [{ key: 'default', label: 'Browser wallet', provider: window.ethereum }]
    }
    return [] as WalletEntry[]
  }, [wallets])

  const injectedProvider = useMemo(() => {
    if (providerChoices.length === 0) {
      return typeof window !== 'undefined' ? window.ethereum : undefined
    }
    return (
      providerChoices.find((item) => item.key === activeProviderKey)?.provider ||
      providerChoices[0]?.provider
    )
  }, [activeProviderKey, providerChoices])

  useEffect(() => {
    let cancelled = false

    const syncActiveWalletBridge = async () => {
      if (typeof window === 'undefined') return

      let provider: ProviderLike | undefined

      if (effectiveConnector === 'walletconnect' && wcAddress) {
        try {
          provider = (await getWalletConnectProvider()) as ProviderLike | undefined
        } catch {
          provider = undefined
        }
      } else if (effectiveConnector === 'injected' && injectedAddress) {
        provider = injectedProvider
      }

      if (cancelled) return

      window.__INRI_ACTIVE_WALLET__ = {
        connector: effectiveConnector,
        address: address || '',
        chainId: chainId || '',
        provider,
      }

      window.dispatchEvent(
        new CustomEvent('inri:wallet-state', {
          detail: {
            connector: effectiveConnector,
            address: address || '',
            chainId: chainId || '',
            hasProvider: Boolean(provider),
          },
        }),
      )
    }

    void syncActiveWalletBridge()

    return () => {
      cancelled = true
    }
  }, [effectiveConnector, address, chainId, wcAddress, injectedAddress, injectedProvider])

  function publishActiveWalletBridge(next: { connector: ConnectorType; address: string; chainId: string; provider?: ProviderLike }) {
    if (typeof window === 'undefined') return

    window.__INRI_ACTIVE_WALLET__ = next
    window.dispatchEvent(
      new CustomEvent('inri:wallet-state', {
        detail: {
          connector: next.connector,
          address: next.address,
          chainId: next.chainId,
          hasProvider: Boolean(next.provider),
        },
      }),
    )
  }

  async function connectInjected(entry?: WalletEntry) {
    try {
      setBusy(true)
      setError('')

      const target =
        entry?.provider ||
        injectedProvider ||
        (typeof window !== 'undefined' ? window.ethereum : undefined)

      if (!target) {
        setError('No compatible EVM wallet was detected in this browser.')
        return
      }

      const [accounts, nextChainId] = (await Promise.all([
        target.request({ method: 'eth_requestAccounts' }),
        target.request({ method: 'eth_chainId' }),
      ])) as [string[], string]

      const first = Array.isArray(accounts) ? accounts[0] : ''

      setInjectedDismissed(false)
      setInjectedDismissedState(false)

      setInjectedAddress(first || '')
      setInjectedChainId(nextChainId || '')
      setConnector('injected')
      publishActiveWalletBridge({
        connector: 'injected',
        address: first || '',
        chainId: nextChainId || '',
        provider: target,
      })

      if (entry?.key) setActiveProviderKey(entry.key)
      setOpen(false)
    } catch (e: any) {
      setError(e?.message || 'Failed to connect wallet.')
    } finally {
      setBusy(false)
    }
  }

  async function connectViaWalletConnect() {
    try {
      setBusy(true)
      setError('')

      const state = await connectWalletConnect()

      if (state.connected) {
        const wcProvider = (await getWalletConnectProvider()) as ProviderLike
        const nextChainId = state.chainId || INRI_CHAIN_ID_HEX

        setWcAddress(state.address)
        setWcChainId(nextChainId)
        setConnector('walletconnect')
        publishActiveWalletBridge({
          connector: 'walletconnect',
          address: state.address,
          chainId: nextChainId,
          provider: wcProvider,
        })
        setOpen(false)
      } else {
        setError('WalletConnect opened, but no wallet approved the connection yet.')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to connect with WalletConnect.')
    } finally {
      setBusy(false)
    }
  }

  async function switchToInriChain() {
    try {
      setBusy(true)
      setError('')

      if (effectiveConnector === 'walletconnect') {
        const nextChainId = await switchWalletConnectToInri()
        setWcChainId(nextChainId || INRI_CHAIN_ID_HEX)
        return
      }

      const target =
        injectedProvider ||
        (typeof window !== 'undefined' ? window.ethereum : undefined)

      if (!target) {
        setError('No compatible wallet was detected.')
        return
      }

      try {
        await target.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: INRI_CHAIN_ID_HEX }],
        })
      } catch {
        await target.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: INRI_CHAIN_ID_HEX,
              chainName: 'INRI CHAIN',
              nativeCurrency: { name: 'INRI', symbol: 'INRI', decimals: 18 },
              rpcUrls: ['https://rpc.inri.life'],
              blockExplorerUrls: ['https://explorer.inri.life'],
            },
          ],
        })
      }

      const nextChainId = (await target.request({ method: 'eth_chainId' })) as string
      setInjectedChainId(nextChainId || INRI_CHAIN_ID_HEX)
    } catch (e: any) {
      setError(e?.message || 'Unable to add INRI CHAIN to this wallet.')
    } finally {
      setBusy(false)
    }
  }

  async function disconnect() {
    setError('')
    setOpen(false)

    if (effectiveConnector === 'walletconnect' || wcAddress) {
      try {
        await disconnectWalletConnect()
      } catch {
        // no-op
      }
      setWcAddress('')
      setWcChainId('')
    }

    if (effectiveConnector === 'injected' || injectedAddress || !injectedDismissed) {
      setInjectedDismissed(true)
      setInjectedDismissedState(true)
      setInjectedAddress('')
      setInjectedChainId('')
    }

    setConnector('')
    if (typeof window !== 'undefined') {
      window.__INRI_ACTIVE_WALLET__ = null
      window.dispatchEvent(new CustomEvent('inri:wallet-state', { detail: { connector: '', address: '', chainId: '', hasProvider: false } }))
    }
  }

  async function copyAddress() {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const baseButton = compact
    ? 'inline-flex h-11 w-full min-w-0 items-center justify-between gap-2.5 rounded-[12px] border border-primary/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(18,168,255,0.055))] px-3 text-[13px] font-black text-white shadow-[0_16px_34px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.10)] transition-all hover:-translate-y-px hover:border-primary/60 hover:bg-primary/[0.18] md:w-[230px]'
    : 'inline-flex h-12 min-w-0 items-center gap-2.5 rounded-[12px] border border-primary/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(18,168,255,0.055))] px-5 text-[14px] font-black text-white shadow-[0_16px_40px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.10)] transition-all hover:-translate-y-px hover:border-primary/60 hover:bg-primary/[0.18]'

  const modal = open ? (
    <div className="fixed inset-0 z-[120] flex items-start justify-center px-3 pt-[calc(env(safe-area-inset-top)+92px)] pb-6 sm:px-5 lg:items-center lg:pt-6">
      <button
        type="button"
        aria-label="Close wallet modal"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/72 backdrop-blur-[2px]"
      />

      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[1.6rem] border border-white/[0.14] bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.18),transparent_34%),linear-gradient(180deg,#04101b,#01050a)] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.62),0_0_0_1px_rgba(19,164,255,0.10)] backdrop-blur-xl sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">
              Wallet access
            </p>
            <h3 className="mt-2 text-xl font-black text-white">
              Connect wallet
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Use WalletConnect QR on mobile, or connect directly with a browser wallet on desktop.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.13] bg-white/[0.04] text-white/70 transition hover:border-primary/50 hover:bg-primary/[0.10] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={`mt-4 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${
            networkReady
              ? 'border-primary/30 bg-primary/[0.12] text-primary'
              : 'border-white/12 bg-white/[0.04] text-white/56'
          }`}
        >
          {networkReady ? 'INRI ready' : 'Custom network · Chain 3777'}
        </div>

        {!address ? (
          <div className="mt-5 grid gap-3">
            <button
              onClick={connectViaWalletConnect}
              disabled={busy}
              type="button"
              className="inline-flex min-h-14 items-center justify-between gap-3 rounded-[1.1rem] border border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] px-4 py-3 text-left text-black shadow-[0_18px_44px_rgba(19,164,255,0.26)] transition hover:-translate-y-px hover:brightness-105 disabled:opacity-50"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black">
                  {busy ? 'Opening WalletConnect...' : 'WalletConnect'}
                </div>
                <div className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-black/70">
                  QR code / mobile wallet
                </div>
              </div>
              <QrCode className="h-4 w-4 shrink-0" />
            </button>

            {providerChoices.length > 0 ? (
              providerChoices.map((item) => (
                <button
                  key={item.key}
                  onClick={() => connectInjected(item)}
                  disabled={busy}
                  type="button"
                  className="inline-flex min-h-14 items-center justify-between gap-3 rounded-[1.1rem] border border-white/[0.14] bg-white/[0.04] px-4 py-3 text-left transition hover:border-primary/50 hover:bg-primary/[0.10] disabled:opacity-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-white">
                      {busy ? 'Connecting...' : item.label}
                    </div>
                    <div className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-white/42">
                      Direct desktop connection
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                </button>
              ))
            ) : (
              <div className="rounded-[1.1rem] border border-white/[0.14] bg-white/[0.04] p-4">
                <p className="text-sm font-black text-white">No browser wallet detected</p>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  Use WalletConnect above to scan the QR code with a mobile wallet, or open this site inside your wallet browser.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-[1.2rem] border border-white/[0.14] bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">
                    Connected address
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-white">{address}</p>
                </div>
                <button
                  onClick={copyAddress}
                  type="button"
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[0.95rem] border border-white/12 bg-black/30 px-3 text-sm font-bold text-white transition hover:border-primary/50 hover:bg-primary/[0.10]"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.1rem] border border-white/[0.12] bg-black/28 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">
                  Current network
                </p>
                <div className="mt-2 flex items-center gap-2 text-base font-black text-white">
                  {networkReady ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-white/56" />
                  )}
                  <span className="truncate">{chainLabel(chainId)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  {networkReady
                    ? 'Ready to use the official INRI routes.'
                    : 'Switch or add INRI CHAIN so the site works in the correct network.'}
                </p>
              </div>

              <div className="rounded-[1.1rem] border border-white/[0.12] bg-black/28 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">
                  Connection type
                </p>
                <div className="mt-2 text-base font-black text-white">
                  {effectiveConnector === 'walletconnect'
                    ? 'WalletConnect'
                    : 'Browser wallet'}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  {effectiveConnector === 'walletconnect'
                    ? 'This session was approved through WalletConnect.'
                    : 'This connection uses the wallet installed in this browser.'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={switchToInriChain}
                disabled={busy}
                type="button"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] px-4 text-sm font-black text-black shadow-[0_18px_44px_rgba(19,164,255,0.26)] transition hover:-translate-y-px hover:brightness-105 disabled:opacity-50"
              >
                {busy ? 'Updating...' : networkReady ? 'INRI CHAIN ready' : 'Add / switch INRI'}
              </button>

              <button
                onClick={disconnect}
                type="button"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-white/[0.14] bg-white/[0.04] px-4 text-sm font-black text-white transition hover:-translate-y-px hover:border-primary/55 hover:bg-primary/[0.10]"
              >
                <LogOut className="h-4 w-4" />
                {effectiveConnector === 'walletconnect' ? 'Disconnect wallet' : 'Forget this site'}
              </button>
            </div>
          </>
        )}

        {error ? (
          <div className="mt-4 rounded-[1rem] border border-rose-300/20 bg-rose-400/[0.08] p-3 text-sm leading-6 text-rose-200">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  ) : null

  return (
    <div ref={rootRef} className={compact ? 'relative w-full min-w-0 md:w-[230px]' : 'relative'}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`${baseButton} notranslate`}
        translate="no"
        type="button"
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/[0.14] shadow-[0_0_0_1px_rgba(19,164,255,0.10)]">
          <Wallet className="h-4 w-4 text-primary" />
        </span>

        <div className="min-w-0 flex-1 text-left">
          <div
            className={`${compact ? 'text-[13px]' : 'text-[14px]'} w-full truncate leading-none`}
            translate="no"
          >
            {shortAddress(address, compact)}
          </div>
          <div
            className={`${compact ? 'text-[10px]' : 'text-[11px]'} mt-1 w-full truncate font-bold uppercase tracking-[0.14em] text-white/44`}
          >
            {effectiveConnector === 'walletconnect'
              ? `WalletConnect • ${chainLabel(chainId)}`
              : chainLabel(chainId)}
          </div>
        </div>

        <ChevronDown className="h-4 w-4 shrink-0 text-white/60" />
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </div>
  )
}
