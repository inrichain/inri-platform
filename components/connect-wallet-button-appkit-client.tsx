'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, ChevronDown, Loader2, Wallet } from 'lucide-react'
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from '@reown/appkit/react'
import { ensureInriAppKit, inriAppKitNetwork } from '@/components/reown-appkit-provider'
import {
  INRI_CHAIN_ID_DECIMAL,
  INRI_CHAIN_ID_HEX,
  type EthereumProvider,
  type InriWalletConnector,
} from '@/lib/inri-active-wallet'

// This component is loaded with ssr:false by connect-wallet-button.tsx.
// AppKit must be created before any useAppKit* hook runs.
ensureInriAppKit()

declare global {
  interface Window {
    __INRI_ACTIVE_WALLET__?: {
      connector: InriWalletConnector
      address: string
      chainId: string
      provider?: EthereumProvider
    } | null
  }
}

type ProviderMaybe = EthereumProvider & {
  session?: unknown
  client?: unknown
  signer?: { client?: unknown }
  setDefaultChain?: unknown
}

function shortAddress(address?: string | null, compact = false) {
  if (!address) return 'Connect wallet'
  return compact
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : `${address.slice(0, 6)}...${address.slice(-4)}`
}

function toHexChainId(value?: string | number | bigint | null) {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'bigint') return `0x${value.toString(16)}`
  if (typeof value === 'number' && Number.isFinite(value)) return `0x${value.toString(16)}`

  const raw = String(value).trim().toLowerCase()
  if (!raw) return ''
  if (raw.startsWith('0x')) return raw
  if (raw.startsWith('eip155:')) {
    const parsed = Number(raw.replace('eip155:', ''))
    return Number.isFinite(parsed) ? `0x${parsed.toString(16)}` : ''
  }

  const parsed = Number(raw)
  return Number.isFinite(parsed) ? `0x${parsed.toString(16)}` : raw
}

function chainLabel(chainId?: string | null) {
  if (!chainId) return 'Wallet not connected'
  if (chainId.toLowerCase() === INRI_CHAIN_ID_HEX) return 'INRI CHAIN'
  const numeric = chainId.startsWith('0x') ? Number.parseInt(chainId, 16) : Number(chainId)
  return Number.isFinite(numeric) ? `Chain ${numeric}` : chainId
}

function detectConnector(provider?: EthereumProvider): InriWalletConnector {
  const candidate = provider as ProviderMaybe | undefined
  if (candidate?.session || candidate?.client || candidate?.signer?.client || candidate?.setDefaultChain) {
    return 'walletconnect'
  }
  return provider ? 'injected' : ''
}

function publishActiveWallet({
  address,
  chainId,
  provider,
}: {
  address?: string
  chainId?: string
  provider?: EthereumProvider
}) {
  if (typeof window === 'undefined') return

  if (!address) {
    window.__INRI_ACTIVE_WALLET__ = null
    window.dispatchEvent(
      new CustomEvent('inri:wallet-state', {
        detail: { connector: '', address: '', chainId: '', hasProvider: false },
      }),
    )
    return
  }

  const connector = detectConnector(provider) || 'injected'
  const next = {
    connector,
    address,
    chainId: chainId || INRI_CHAIN_ID_HEX,
    provider,
  }

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

export function ConnectWalletButtonClient({ compact = false }: { compact?: boolean }) {
  ensureInriAppKit()

  const { open } = useAppKit()
  const { address, isConnected, status } = useAppKitAccount()
  const { chainId, switchNetwork } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<EthereumProvider>('eip155')

  const [busy, setBusy] = useState(false)
  const switchAttemptRef = useRef('')

  const chainIdHex = useMemo(() => toHexChainId(chainId as string | number | undefined), [chainId])
  const networkReady = chainIdHex.toLowerCase() === INRI_CHAIN_ID_HEX
  const connecting = busy || status === 'connecting' || status === 'reconnecting'

  useEffect(() => {
    publishActiveWallet({
      address: isConnected ? address : undefined,
      chainId: isConnected ? chainIdHex || INRI_CHAIN_ID_HEX : '',
      provider: isConnected ? walletProvider : undefined,
    })
  }, [address, chainIdHex, isConnected, walletProvider])

  useEffect(() => {
    if (!isConnected || !address || !chainIdHex || networkReady) return

    const key = `${address}:${chainIdHex}`
    if (switchAttemptRef.current === key) return
    switchAttemptRef.current = key

    void Promise.resolve(switchNetwork(inriAppKitNetwork as any)).catch(() => {
      // The user can still change the network inside the AppKit account modal.
    })
  }, [address, chainIdHex, isConnected, networkReady, switchNetwork])

  async function handleOpenWalletModal() {
    try {
      ensureInriAppKit()
      setBusy(true)
      await open(
        isConnected
          ? ({ view: 'Account' } as any)
          : ({ view: 'Connect' } as any),
      )
    } finally {
      window.setTimeout(() => setBusy(false), 350)
    }
  }

  const title = isConnected && address ? shortAddress(address, compact) : 'Connect wallet'
  const subtitle = isConnected
    ? networkReady
      ? 'INRI CHAIN READY'
      : `SWITCH TO INRI ${INRI_CHAIN_ID_DECIMAL}`
    : 'WALLET NOT CONNECTED'

  const baseButton = compact
    ? 'group inline-flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-[12px] border border-primary/35 bg-[#07131f] px-3 text-[13px] font-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-px hover:border-primary/60 hover:bg-[#082033] disabled:cursor-wait disabled:opacity-70'
    : 'group inline-flex h-12 min-w-[220px] items-center justify-between gap-2.5 rounded-[12px] border border-primary/35 bg-[#07131f] px-4 text-[14px] font-black text-white shadow-[0_16px_38px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-px hover:border-primary/60 hover:bg-[#082033] disabled:cursor-wait disabled:opacity-70'

  return (
    <button
      onClick={handleOpenWalletModal}
      className={`${baseButton} notranslate`}
      translate="no"
      type="button"
      disabled={connecting}
      aria-label="Connect wallet"
    >
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-primary/30 bg-primary/[0.12]">
        {connecting ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : networkReady && isConnected ? (
          <CheckCircle2 className="h-4 w-4 text-primary" />
        ) : (
          <Wallet className="h-4 w-4 text-primary" />
        )}
      </span>

      <span className="min-w-0 flex-1 text-left">
        <span className={`${compact ? 'text-[13px]' : 'text-[14px]'} block truncate leading-none`}>
          {title}
        </span>
        <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} mt-1 block truncate font-bold uppercase tracking-[0.14em] text-white/45`}>
          {subtitle || chainLabel(chainIdHex)}
        </span>
      </span>

      <ChevronDown className="h-4 w-4 shrink-0 text-white/55 transition group-hover:text-primary" />
    </button>
  )
}
