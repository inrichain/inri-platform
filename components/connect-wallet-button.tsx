'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, ChevronDown, Copy, ExternalLink, LogOut, RefreshCw, ShieldCheck, Wallet } from 'lucide-react'

type ProviderLike = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>
  isMetaMask?: boolean
  isOkxWallet?: boolean
  providers?: ProviderLike[]
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}


type ProviderEntry = {
  key: string
  provider: ProviderLike
  label: string
}

declare global {
  interface Window {
    ethereum?: ProviderLike
  }
}

const INRI_CHAIN_ID_HEX = '0xec1'
const INRI_CHAIN = {
  chainId: INRI_CHAIN_ID_HEX,
  chainName: 'INRI CHAIN',
  nativeCurrency: { name: 'INRI', symbol: 'INRI', decimals: 18 },
  rpcUrls: ['https://rpc.inri.life'],
  blockExplorerUrls: ['https://explorer.inri.life'],
}

const STORAGE_PROVIDER_KEY = 'inri-site-wallet-provider'
const STORAGE_ADDRESS_KEY = 'inri-site-wallet-address'

function shortAddress(address?: string) {
  if (!address) return 'Connect'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function describeError(error: unknown) {
  if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message
  }
  return 'Wallet action failed.'
}

export function ConnectWalletButton({ compact = false }: { compact?: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [chainId, setChainId] = useState<string>('')
  const [providerKey, setProviderKey] = useState<string>('')
  const [busy, setBusy] = useState<string>('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const providers = useMemo<ProviderEntry[]>(() => {
    const eth = typeof window !== 'undefined' ? window.ethereum : undefined
    if (!eth) return []
    const list = eth.providers?.length ? eth.providers : [eth]
    const unique = new Map<string, ProviderLike>()
    list.forEach((provider) => {
      if (provider.isMetaMask) unique.set('metamask', provider)
      else if (provider.isOkxWallet) unique.set('okx', provider)
      else unique.set(`browser-${unique.size}`, provider)
    })
    return Array.from(unique.entries()).map(([key, provider]) => ({
      key,
      provider,
      label: key === 'metamask' ? 'MetaMask' : key === 'okx' ? 'OKX Wallet' : 'Browser Wallet',
    }))
  }, [])

  const activeProvider = useMemo(() => {
    if (!providers.length) return typeof window !== 'undefined' ? window.ethereum : undefined
    return providers.find((item) => item.key === providerKey)?.provider || providers[0]?.provider
  }, [providerKey, providers])

  const networkReady = chainId.toLowerCase() === INRI_CHAIN_ID_HEX

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onEscape)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedProvider = window.localStorage.getItem(STORAGE_PROVIDER_KEY) || ''
    const storedAddress = window.localStorage.getItem(STORAGE_ADDRESS_KEY) || ''
    if (storedProvider) setProviderKey(storedProvider)
    if (storedAddress) setAddress(storedAddress)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (providerKey) window.localStorage.setItem(STORAGE_PROVIDER_KEY, providerKey)
    else window.localStorage.removeItem(STORAGE_PROVIDER_KEY)
  }, [providerKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (address) window.localStorage.setItem(STORAGE_ADDRESS_KEY, address)
    else window.localStorage.removeItem(STORAGE_ADDRESS_KEY)
  }, [address])

  useEffect(() => {
    const provider = activeProvider
    if (!provider?.on) return

    const handleAccountsChanged = (accounts: unknown) => {
      const next = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : ''
      setAddress(next)
      if (!next) setError('Wallet disconnected in the provider.')
    }

    const handleChainChanged = (nextChainId: unknown) => {
      if (typeof nextChainId === 'string') setChainId(nextChainId)
    }

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)
    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged)
      provider.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [activeProvider])

  useEffect(() => {
    const sync = async () => {
      try {
        if (!activeProvider) return
        const [accounts, currentChainId] = await Promise.all([
          activeProvider.request({ method: 'eth_accounts' }),
          activeProvider.request({ method: 'eth_chainId' }),
        ])
        const first = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : ''
        setAddress(first)
        setChainId(typeof currentChainId === 'string' ? currentChainId : '')
      } catch {
        // ignore initial sync failures
      }
    }
    void sync()
  }, [activeProvider])

  async function connect(provider?: ProviderLike, nextProviderKey = '') {
    try {
      setBusy('connect')
      setError('')
      const target = provider || window.ethereum
      if (!target) {
        setError('No compatible wallet found in this browser.')
        return
      }
      const [accounts, currentChainId] = await Promise.all([
        target.request({ method: 'eth_requestAccounts' }),
        target.request({ method: 'eth_chainId' }),
      ])
      const first = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : ''
      if (first) {
        setAddress(first)
        setChainId(typeof currentChainId === 'string' ? currentChainId : '')
        if (nextProviderKey) setProviderKey(nextProviderKey)
        setOpen(false)
      }
    } catch (cause) {
      setError(describeError(cause))
    } finally {
      setBusy('')
    }
  }

  async function switchNetwork() {
    try {
      setBusy('network')
      setError('')
      const target = activeProvider || window.ethereum
      if (!target) {
        setError('No browser wallet available.')
        return
      }
      try {
        await target.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: INRI_CHAIN_ID_HEX }] })
      } catch (cause) {
        const errorCode = typeof cause === 'object' && cause && 'code' in cause ? (cause as { code?: number }).code : undefined
        if (errorCode === 4902) {
          await target.request({ method: 'wallet_addEthereumChain', params: [INRI_CHAIN] })
        } else {
          throw cause
        }
      }
      const currentChainId = await target.request({ method: 'eth_chainId' })
      setChainId(typeof currentChainId === 'string' ? currentChainId : '')
    } catch (cause) {
      setError(describeError(cause))
    } finally {
      setBusy('')
    }
  }

  function disconnect() {
    setAddress('')
    setChainId('')
    setError('')
    setProviderKey('')
    setOpen(false)
  }

  async function copyAddress() {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  const baseButton = compact
    ? 'inline-flex h-11 items-center gap-2.5 rounded-full border border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-4 text-[14px] font-bold text-white shadow-[0_12px_26px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-px hover:border-primary/55 hover:bg-primary/[0.10]'
    : 'inline-flex h-12 items-center gap-2.5 rounded-full border border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-4 text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-px hover:border-primary/55 hover:bg-primary/[0.08]'

  return (
    <div ref={rootRef} className="relative">
      <button onClick={() => setOpen((value: boolean) => !value)} className={`${baseButton} notranslate`} translate="no">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/28 bg-primary/[0.12] shadow-[0_0_0_1px_rgba(19,164,255,0.08)]">
          <Wallet className="h-4 w-4 text-primary" />
        </span>
        <span className="max-w-[8rem] truncate text-[14px]" translate="no">{shortAddress(address)}</span>
        {address ? <span className={`h-2.5 w-2.5 rounded-full ${networkReady ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]' : 'bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.12)]'}`} /> : null}
        <ChevronDown className="h-4 w-4 text-white/66" />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(94vw,390px)] rounded-[1.6rem] border border-white/[0.14] bg-[linear-gradient(180deg,#040912,#000000)] p-4 shadow-[0_24px_72px_rgba(0,0,0,0.48),0_0_0_1px_rgba(19,164,255,0.06)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary">Wallet center</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Connect, confirm the INRI network and keep your address ready across the site.
              </p>
            </div>
            <a
              href="https://wallet.inri.life"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 text-xs font-black uppercase tracking-[0.14em] text-white/82 transition hover:border-primary/45 hover:bg-primary/[0.10]"
            >
              INRI Wallet
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-[1.2rem] border border-white/[0.12] bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Connection</p>
                  <p className="mt-2 text-base font-black text-white">{address ? 'Wallet connected' : 'No wallet connected'}</p>
                </div>
                <span className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] ${address ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-white/12 bg-white/[0.03] text-white/56'}`}>
                  {address ? 'Online' : 'Idle'}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-white/10 bg-black/30 p-3">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Address</div>
                  <div className="mt-2 break-all text-sm font-semibold text-white">{address || 'Connect a browser wallet to continue.'}</div>
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-black/30 p-3">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Network</div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                    {networkReady ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <ShieldCheck className="h-4 w-4 text-primary" />}
                    {chainId ? (networkReady ? 'INRI CHAIN ready' : `Wrong network (${chainId})`) : 'Waiting for wallet'}
                  </div>
                </div>
              </div>
            </div>

            {!address ? (
              <div className="grid gap-3">
                {providers.length > 0 ? providers.map((item: ProviderEntry) => (
                  <button
                    key={item.key}
                    onClick={() => connect(item.provider, item.key)}
                    disabled={busy === 'connect'}
                    className="rounded-[1.1rem] border-[1.45px] border-white/[0.14] bg-white/[0.03] px-4 py-3 text-left transition hover:border-primary/45 hover:bg-primary/[0.10] disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-white">{item.label}</div>
                        <div className="mt-1 text-xs leading-5 text-white/52">Injected browser wallet connection</div>
                      </div>
                      <span className="rounded-full border border-white/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/54">
                        {busy === 'connect' ? 'Connecting' : 'Open'}
                      </span>
                    </div>
                  </button>
                )) : (
                  <button
                    onClick={() => connect()}
                    disabled={busy === 'connect'}
                    className="rounded-[1.1rem] border-[1.45px] border-white/[0.14] bg-white/[0.03] px-4 py-3 text-left transition hover:border-primary/45 hover:bg-primary/[0.10] disabled:opacity-50"
                  >
                    <div className="text-sm font-black text-white">Connect browser wallet</div>
                    <div className="mt-1 text-xs leading-5 text-white/52">MetaMask, OKX Wallet or another injected wallet.</div>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={copyAddress} className="inri-action-secondary px-4">
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy address'}
                </button>
                <button onClick={switchNetwork} disabled={busy === 'network'} className="inri-action-primary px-4">
                  {busy === 'network' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {networkReady ? 'INRI ready' : 'Switch to INRI'}
                </button>
                <a href="https://explorer.inri.life" target="_blank" rel="noreferrer" className="inri-action-tertiary px-4 text-center">
                  <ExternalLink className="h-4 w-4" />
                  Open explorer
                </a>
                <button onClick={disconnect} className="inri-action-tertiary px-4">
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {error ? <p className="mt-3 text-sm leading-6 text-rose-300">{error}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
