'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Copy, LogOut, Wallet } from 'lucide-react'

type ProviderLike = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>
  isMetaMask?: boolean
  isOkxWallet?: boolean
  providers?: ProviderLike[]
}

declare global {
  interface Window {
    ethereum?: ProviderLike
  }
}

function shortAddress(address?: string) {
  if (!address) return 'Connect'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const baseButton =
  'inline-flex items-center gap-2 rounded-full border-[1.2px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-4 py-3 text-sm font-bold text-white shadow-[0_16px_42px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:-translate-y-px hover:border-primary/45 hover:bg-primary/10'

export function ConnectWalletButton() {
  const [open, setOpen] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const providers = useMemo(() => {
    const eth = typeof window !== 'undefined' ? window.ethereum : undefined
    if (!eth) return []
    const list = eth.providers?.length ? eth.providers : [eth]
    const unique = new Map<string, ProviderLike>()
    list.forEach((p) => {
      if (p.isMetaMask) unique.set('metamask', p)
      else if (p.isOkxWallet) unique.set('okx', p)
      else unique.set(`browser-${unique.size}`, p)
    })
    return Array.from(unique.entries()).map(([key, provider]) => ({
      key,
      provider,
      label: key === 'metamask' ? 'MetaMask' : key === 'okx' ? 'OKX Wallet' : 'Browser Wallet',
    }))
  }, [open])

  async function connect(provider?: ProviderLike) {
    try {
      setBusy(true)
      setError('')
      const target = provider || window.ethereum
      if (!target) {
        setError('No compatible wallet found in this browser.')
        return
      }
      const accounts = await target.request({ method: 'eth_requestAccounts' })
      const first = Array.isArray(accounts) ? accounts[0] : ''
      if (first) {
        setAddress(first)
        setOpen(false)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to connect wallet.')
    } finally {
      setBusy(false)
    }
  }

  function disconnect() {
    setAddress('')
    setOpen(false)
  }

  async function copyAddress() {
    if (!address) return
    await navigator.clipboard.writeText(address)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className={baseButton}>
        <Wallet className="h-4 w-4 text-primary" />
        <span className="max-w-[7.5rem] truncate">{shortAddress(address)}</span>
        <ChevronDown className="h-4 w-4 text-white/70" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,360px)] rounded-[1.6rem] border-[1.2px] border-white/[0.18] bg-[linear-gradient(180deg,#04070d,#000000)] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.55),0_0_0_1px_rgba(19,164,255,0.06)] backdrop-blur-xl">
          {!address ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Connect wallet</p>
              <p className="mt-2 text-sm leading-6 text-white/62">
                MetaMask, OKX Wallet or another injected browser wallet.
              </p>
              <div className="mt-4 grid gap-3">
                {providers.length > 0 ? providers.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => connect(item.provider)}
                    disabled={busy}
                    className="rounded-2xl border-[1.15px] border-white/[0.16] bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-primary/45 hover:bg-primary/10 disabled:opacity-50"
                  >
                    {busy ? 'Connecting...' : item.label}
                  </button>
                )) : (
                  <button
                    onClick={() => connect()}
                    disabled={busy}
                    className="rounded-2xl border-[1.15px] border-white/[0.16] bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-primary/45 hover:bg-primary/10 disabled:opacity-50"
                  >
                    {busy ? 'Connecting...' : 'Connect browser wallet'}
                  </button>
                )}
              </div>
              {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Wallet connected</p>
              <div className="mt-4 rounded-2xl border-[1.15px] border-white/[0.16] bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Address</p>
                <p className="mt-2 break-all text-sm font-semibold text-white">{address}</p>
              </div>
              <div className="mt-4 grid gap-3">
                <button onClick={copyAddress} className="inline-flex items-center justify-center gap-2 rounded-2xl border-[1.15px] border-white/[0.16] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/45 hover:bg-primary/10">
                  <Copy className="h-4 w-4" /> Copy address
                </button>
                <button onClick={disconnect} className="inline-flex items-center justify-center gap-2 rounded-2xl border-[1.15px] border-white/[0.16] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/45 hover:bg-primary/10">
                  <LogOut className="h-4 w-4" /> Disconnect
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
