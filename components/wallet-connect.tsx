"use client"

import { useMemo, useState } from 'react'
import { Wallet, ShieldCheck, ChevronRight, X, Copy, CheckCircle2 } from 'lucide-react'

declare global {
  interface Window {
    ethereum?: any
    okxwallet?: any
  }
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WalletConnectButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const browserProvider = useMemo(() => {
    if (typeof window === 'undefined') return null
    return window.ethereum || window.okxwallet?.ethereum || null
  }, [open])

  async function connect(providerType: 'browser' | 'metamask' | 'okx') {
    try {
      setError(null)
      const anyWindow = window as any
      let provider = browserProvider

      if (providerType === 'metamask' && anyWindow.ethereum?.providers?.length) {
        provider = anyWindow.ethereum.providers.find((p: any) => p.isMetaMask) || provider
      }
      if (providerType === 'okx' && anyWindow.okxwallet?.ethereum) {
        provider = anyWindow.okxwallet.ethereum
      }

      if (!provider) {
        setError('No compatible browser wallet was detected on this device.')
        return
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const cid = await provider.request({ method: 'eth_chainId' })
      setAccount(accounts?.[0] || null)
      setChainId(cid || null)
      setOpen(false)
    } catch (err: any) {
      setError(err?.message || 'Wallet connection failed.')
    }
  }

  async function copyAddress() {
    if (!account) return
    await navigator.clipboard.writeText(account)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (account) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white ${className}`}>
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className="font-bold">{shortAddress(account)}</span>
        <button type="button" onClick={copyAddress} className="rounded-full p-1 text-white/60 hover:text-white">
          {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </button>
        {chainId ? <span className="hidden sm:inline text-white/50">{chainId}</span> : null}
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-bold text-white hover:bg-primary/20 ${className}`}
      >
        <Wallet className="h-4 w-4" />
        Connect wallet
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#081322] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/80">INRI CHAIN</p>
                <h3 className="mt-2 text-xl font-bold text-white">Connect Wallet</h3>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-white/60 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                ['MetaMask', 'Best for browser access', 'metamask'],
                ['OKX Wallet', 'Recommended if OKX is installed', 'okx'],
                ['Browser Wallet', 'Use the default injected wallet provider', 'browser'],
              ].map(([title, subtitle, key]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => connect(key as 'browser' | 'metamask' | 'okx')}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-primary/40 hover:bg-white/[0.07]"
                >
                  <div>
                    <p className="font-bold text-white">{title}</p>
                    <p className="mt-1 text-sm text-white/60">{subtitle}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-primary" />
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/10 p-4 text-sm leading-7 text-white/75">
              This connection uses the wallet already installed in the browser. WalletConnect QR is not included in this version yet.
            </div>

            {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
