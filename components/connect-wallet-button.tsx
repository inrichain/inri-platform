'use client'

import dynamic from 'next/dynamic'
import { ChevronDown, Wallet } from 'lucide-react'

function ConnectWalletFallback({ compact = false }: { compact?: boolean }) {
  const baseButton = compact
    ? 'group inline-flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-[12px] border border-primary/35 bg-[#07131f] px-3 text-[13px] font-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-all hover:border-primary/60 hover:bg-[#082033]'
    : 'group inline-flex h-12 min-w-[220px] items-center justify-between gap-2.5 rounded-[12px] border border-primary/35 bg-[#07131f] px-4 text-[14px] font-black text-white shadow-[0_16px_38px_rgba(0,0,0,0.24)] transition-all hover:border-primary/60 hover:bg-[#082033]'

  return (
    <button className={`${baseButton} notranslate opacity-90`} type="button" disabled aria-label="Connect wallet loading">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-primary/30 bg-primary/[0.12]">
        <Wallet className="h-4 w-4 text-primary" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className={`${compact ? 'text-[13px]' : 'text-[14px]'} block truncate leading-none`}>Connect wallet</span>
        <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} mt-1 block truncate font-bold uppercase tracking-[0.14em] text-white/45`}>
          Wallet not connected
        </span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-white/55" />
    </button>
  )
}

const ConnectWalletButtonClient = dynamic<{ compact?: boolean }>(
  () => import('./connect-wallet-button-appkit-client').then((mod) => mod.ConnectWalletButtonClient),
  {
    ssr: false,
    loading: () => <ConnectWalletFallback compact />,
  },
)

export function ConnectWalletButton({ compact = false }: { compact?: boolean }) {
  return <ConnectWalletButtonClient compact={compact} />
}
