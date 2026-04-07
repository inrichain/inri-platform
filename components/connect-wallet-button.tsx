'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Copy, LogOut, Wallet } from 'lucide-react'

type ProviderLike = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>
  isMetaMask?: boolean
  isOkxWallet?: boolean
}

declare global {
  interface Window {
    ethereum?: ProviderLike & { providers?: ProviderLike[] }
  }
}

function shortAddress(address: string) {
  if (!address) return 'Connect wallet'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

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
    } catch (error: any) {
      setError(error?.message || 'Failed to connect wallet.')
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
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-3 text-sm font-semibold leading-tight text-white transition hover:border-primary/45 hover:bg-primary/10"
      >
        <Wallet className="h-4 w-4 text-primary" />
        <span className="max-w-[8.8rem] truncate">{shortAddress(address)}</span>
        <ChevronDown className="h-4 w-4 text-white/60" />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,360px)] overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#02060c]/98 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.58)] backdrop-blur-xl">
          {!address ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.20em] text-primary">Connect wallet</p>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Connect MetaMask, OKX Wallet or another browser wallet.
              </p>
              <div className="mt-4 grid gap-3">
                {providers.length > 0 ? (
                  providers.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => connect(item.provider)}
                      disabled={busy}
                      className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-primary/45 hover:bg-primary/10 disabled:opacity-50"
                    >
                      {busy ? 'Connecting...' : item.label}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => connect()}
                    disabled={busy}
                    className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-primary/45 hover:bg-primary/10 disabled:opacity-50"
                  >
                    {busy ? 'Connecting...' : 'Connect browser wallet'}
                  </button>
                )}
              </div>
              {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.20em] text-primary">Wallet connected</p>
              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Address</p>
                <p className="mt-2 break-all text-sm font-semibold text-white">{address}</p>
              </div>
              <div className="mt-4 grid gap-3">
                <button
                  onClick={copyAddress}
                  className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/45 hover:bg-primary/10"
                >
                  <Copy className="h-4 w-4" /> Copy address
                </button>
                <button
                  onClick={disconnect}
                  className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/45 hover:bg-primary/10"
                >
                  <LogOut className="h-4 w-4" /> Disconnect
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
