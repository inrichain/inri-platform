'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  QrCode,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import {
  buildInriWalletConnectUrl,
  connectWalletConnect,
  disconnectWalletConnect,
  getWalletConnectProvider,
  getWalletConnectState,
  shouldResumeWalletConnect,
  subscribeWalletConnect,
  switchWalletConnectToInri,
} from '@/lib/walletconnect-inri'

const INRI_CHAIN_ID_HEX = '0xec1'
const INRI_WALLET_URL = 'https://wallet.inri.life'

type ProviderLike = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>
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

declare global {
  interface Window {
    ethereum?: ProviderLike
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
  if (provider.isRabby) return { key: 'rabby', label: 'Rabby Wallet' }
  if (provider.isCoinbaseWallet) return { key: 'coinbase', label: 'Coinbase Wallet' }
  if (provider.isTrust) return { key: 'trust', label: 'Trust Wallet' }
  if (provider.isOkxWallet) return { key: 'okx', label: 'OKX Wallet' }
  if (provider.isMetaMask) return { key: 'metamask', label: 'MetaMask' }
  return { key: `browser-${index}`, label: 'Browser Wallet' }
}

function uniqueWallets(entries: WalletEntry[]) {
  const map = new Map<string, WalletEntry>()
  entries.forEach((entry) => {
    if (!map.has(entry.key)) map.set(entry.key, entry)
  })
  return Array.from(map.values())
}

type ConnectorType = '' | 'injected' | 'walletconnect'

export function ConnectWalletButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)

  const [injectedAddress, setInjectedAddress] = useState('')
  const [injectedChainId, setInjectedChainId] = useState('')

  const [wcAddress, setWcAddress] = useState('')
  const [wcChainId, setWcChainId] = useState('')

  const [connector, setConnector] = useState<ConnectorType>('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [activeProviderKey, setActiveProviderKey] = useState('')

  const [pendingWcUri, setPendingWcUri] = useState('')
  const [pendingWcUrl, setPendingWcUrl] = useState('')

  const rootRef = useRef<HTMLDivElement | null>(null)

  const effectiveConnector: ConnectorType =
    connector || (wcAddress ? 'walletconnect' : injectedAddress ? 'injected' : '')

  const address = effectiveConnector === 'walletconnect' ? wcAddress : injectedAddress
  const chainId = effectiveConnector === 'walletconnect' ? wcChainId : injectedChainId
  const networkReady = normalizeChainId(chainId) === INRI_CHAIN_ID_HEX

  useEffect(() => {
    if (typeof window === 'undefined') return

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

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) setOpen(false)
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
      const next = Array.isArray(accounts) ? (accounts[0] as string | undefined) : undefined
      setInjectedAddress(next || '')
      if (!wcAddress && next) setConnector('injected')
    }

    const handleChainChanged = (nextChainId: unknown) => {
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
        // no-op
      }
    }

    collectInjectedWallets()
    void syncInjectedState()
    void bootWalletConnect()

    document.addEventListener('mousedown', closeOnOutsideClick)
    window.ethereum?.on?.('accountsChanged', handleAccountsChanged)
    window.ethereum?.on?.('chainChanged', handleChainChanged)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged)
      unsubscribeWalletConnect?.()
    }
  }, [connector, injectedAddress, wcAddress])

  const providerChoices = useMemo(() => {
    if (wallets.length > 0) return wallets
    if (typeof window !== 'undefined' && window.ethereum) {
      return [{ key: 'default', label: 'Browser Wallet', provider: window.ethereum }]
    }
    return [] as WalletEntry[]
  }, [wallets])

  const injectedProvider = useMemo(() => {
    if (providerChoices.length === 0) {
      return typeof window !== 'undefined' ? window.ethereum : undefined
    }
    return (
      providerChoices.find((item) => item.key === activeProviderKey)?.provider || providerChoices[0]?.provider
    )
  }, [activeProviderKey, providerChoices])

  async function connectInjected(entry?: WalletEntry) {
    try {
      setBusy(true)
      setError('')

      const target =
        entry?.provider || injectedProvider || (typeof window !== 'undefined' ? window.ethereum : undefined)

      if (!target) {
        setError('No compatible EVM wallet was detected in this browser.')
        return
      }

      const [accounts, nextChainId] = (await Promise.all([
        target.request({ method: 'eth_requestAccounts' }),
        target.request({ method: 'eth_chainId' }),
      ])) as [string[], string]

      const first = Array.isArray(accounts) ? accounts[0] : ''
      setInjectedAddress(first || '')
      setInjectedChainId(nextChainId || '')
      setConnector('injected')

      if (entry?.key) setActiveProviderKey(entry.key)
      setOpen(false)
    } catch (e: any) {
      setError(e?.message || 'Failed to connect wallet.')
    } finally {
      setBusy(false)
    }
  }

  async function connectInriWallet() {
    try {
      setBusy(true)
      setError('')
      setPendingWcUri('')
      setPendingWcUrl('')

      const state = await connectWalletConnect((uri, launchUrl) => {
        setPendingWcUri(uri)
        setPendingWcUrl(launchUrl)

        const popup = window.open(launchUrl, '_blank')
        if (!popup) {
          window.location.href = launchUrl
        }
      })

      if (state.connected) {
        setWcAddress(state.address)
        setWcChainId(state.chainId)
        setConnector('walletconnect')
        setOpen(false)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to start INRI Wallet connection.')
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
        injectedProvider || (typeof window !== 'undefined' ? window.ethereum : undefined)

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
      setPendingWcUri('')
      setPendingWcUrl('')
    }

    if (effectiveConnector === 'injected' || injectedAddress) {
      setInjectedAddress('')
      setInjectedChainId('')
    }

    setConnector('')
  }

  async function copyAddress() {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  async function copyPendingUri() {
    if (!pendingWcUri) return
    await navigator.clipboard.writeText(pendingWcUri)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  async function reopenInriWallet() {
    try {
      const provider = await getWalletConnectProvider()
      const uri = pendingWcUri || ''
      const launchUrl = uri ? buildInriWalletConnectUrl(uri) : pendingWcUrl

      if (launchUrl) {
        const popup = window.open(launchUrl, '_blank')
        if (!popup) {
          window.location.href = launchUrl
        }
        return
      }

      if (provider) {
        const state = await getWalletConnectState()
        if (state.connected) {
          setWcAddress(state.address)
          setWcChainId(state.chainId)
          setConnector('walletconnect')
          setOpen(false)
          return
        }
      }

      window.open(INRI_WALLET_URL, '_blank')
    } catch {
      window.open(INRI_WALLET_URL, '_blank')
    }
  }

  const baseButton = compact
    ? 'inline-flex h-11 w-full min-w-0 items-center justify-between gap-2.5 rounded-[1rem] border border-white/[0.16] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] px-3 text-[13px] font-black text-white shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-px hover:border-primary/55 hover:bg-primary/[0.12]'
    : 'inline-flex h-12 min-w-0 items-center gap-2.5 rounded-[1rem] border border-white/[0.16] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.018))] px-5 text-[14px] font-black text-white shadow-[0_16px_40px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-px hover:border-primary/55 hover:bg-primary/[0.12]'

  return (
    <div ref={rootRef} className={compact ? 'relative w-full' : 'relative'}>
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

      {open ? (
        <div
          className={`absolute z-50 mt-3 overflow-hidden rounded-[1.5rem] border border-white/[0.14] bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_30%),linear-gradient(180deg,#04101b,#01050a)] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(19,164,255,0.08)] backdrop-blur-xl ${
            compact ? 'left-0 right-0 w-auto' : 'right-0 w-[min(94vw,390px)]'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                Wallet access
              </p>
              <h3 className="mt-2 text-lg font-black text-white sm:text-xl">
                Connect INRI Wallet or any compatible EVM wallet.
              </h3>
            </div>
            <div
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${
                networkReady
                  ? 'border-primary/30 bg-primary/[0.12] text-primary'
                  : 'border-white/12 bg-white/[0.04] text-white/56'
              }`}
            >
              {networkReady ? 'INRI ready' : 'Custom network'}
            </div>
          </div>

          {!address ? (
            <>
              <p className="mt-3 text-sm leading-7 text-white/62">
                INRI Wallet uses WalletConnect for site connection. Browser wallets like MetaMask,
                Rabby, OKX, Coinbase Wallet and Trust Wallet still work directly in the browser.
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  onClick={connectInriWallet}
                  disabled={busy}
                  type="button"
                  className="inline-flex min-h-14 items-center justify-between gap-3 rounded-[1.1rem] border border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] px-4 py-3 text-left text-black shadow-[0_18px_44px_rgba(19,164,255,0.26)] transition hover:-translate-y-px hover:brightness-105 disabled:opacity-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">
                      {busy ? 'Opening INRI Wallet...' : 'Connect with INRI Wallet'}
                    </div>
                    <div className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-black/70">
                      WalletConnect official flow
                    </div>
                  </div>
                  <QrCode className="h-4 w-4 shrink-0" />
                </button>

                {pendingWcUrl ? (
                  <div className="rounded-[1.1rem] border border-white/[0.14] bg-white/[0.04] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">
                      Waiting for approval
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      The wallet should open in a new tab. Approve the connection there, then return
                      here.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={reopenInriWallet}
                        type="button"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] border border-white/[0.14] bg-white/[0.04] px-4 text-sm font-black text-white transition hover:border-primary/55 hover:bg-primary/[0.10]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open wallet again
                      </button>

                      <button
                        onClick={copyPendingUri}
                        type="button"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[1rem] border border-white/[0.14] bg-white/[0.04] px-4 text-sm font-black text-white transition hover:border-primary/55 hover:bg-primary/[0.10]"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? 'Copied' : 'Copy WC URI'}
                      </button>
                    </div>
                  </div>
                ) : null}

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
                          Injected browser wallet
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                    </button>
                  ))
                ) : (
                  <a
                    href={INRI_WALLET_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-14 items-center justify-between gap-3 rounded-[1.1rem] border border-white/[0.14] bg-white/[0.04] px-4 py-3 text-left transition hover:border-primary/50 hover:bg-primary/[0.10]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black text-white">
                        Open official INRI Wallet
                      </div>
                      <div className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-white/42">
                        No injected browser wallet detected
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                  </a>
                )}
              </div>
            </>
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
                      ? 'Ready to use staking, pool and the rest of the official INRI routes.'
                      : 'Switch or add INRI CHAIN so the site works in the correct network.'}
                  </p>
                </div>

                <div className="rounded-[1.1rem] border border-white/[0.12] bg-black/28 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">
                    Connection type
                  </p>
                  <div className="mt-2 text-base font-black text-white">
                    {effectiveConnector === 'walletconnect' ? 'INRI Wallet via WalletConnect' : 'Browser wallet'}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/56">
                    {effectiveConnector === 'walletconnect'
                      ? 'This session was approved by the official INRI Wallet.'
                      : 'This session uses an injected EVM wallet in the current browser.'}
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
                  Clear session
                </button>
              </div>
            </>
          )}

          {error ? <p className="mt-4 text-sm leading-6 text-rose-300">{error}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
