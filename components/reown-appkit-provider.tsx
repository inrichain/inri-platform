'use client'

import { useEffect, type ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { defineChain } from '@reown/appkit/networks'
import {
  INRI_CHAIN_ID_DECIMAL,
  INRI_EXPLORER_URL,
  INRI_RPC_URL,
} from '@/lib/inri-active-wallet'

export const INRI_REOWN_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  'bfc7a39282888507c8c1dca6d8b2dbfe'

export const INRI_CAIP_NETWORK_ID = `eip155:${INRI_CHAIN_ID_DECIMAL}`

export const inriAppKitNetwork = defineChain({
  id: INRI_CHAIN_ID_DECIMAL,
  caipNetworkId: INRI_CAIP_NETWORK_ID,
  chainNamespace: 'eip155',
  name: 'INRI CHAIN',
  nativeCurrency: {
    decimals: 18,
    name: 'INRI',
    symbol: 'INRI',
  },
  rpcUrls: {
    default: { http: [INRI_RPC_URL] },
    public: { http: [INRI_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'INRI Explorer', url: INRI_EXPLORER_URL },
  },
})

let appKitStarted = false

export function ensureInriAppKit() {
  // Critical for GitHub/Next static builds: never initialize AppKit while Next is
  // prerendering pages on the server. The modal is browser-only.
  if (typeof window === 'undefined' || appKitStarted) return

  createAppKit({
    adapters: [new EthersAdapter()],
    networks: [inriAppKitNetwork],
    defaultNetwork: inriAppKitNetwork,
    projectId: INRI_REOWN_PROJECT_ID,
    metadata: {
      name: 'INRI Platform',
      description: 'Official INRI CHAIN platform',
      url: 'https://platform.inri.life',
      icons: ['https://platform.inri.life/inri-logo.png'],
    },
    customRpcUrls: {
      [INRI_CAIP_NETWORK_ID]: [{ url: INRI_RPC_URL }],
    },
    chainImages: {
      [INRI_CHAIN_ID_DECIMAL]: 'https://platform.inri.life/inri-logo.png',
    },
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#13a4ff',
      '--w3m-border-radius-master': '12px',
    },
    allWallets: 'SHOW',
    enableMobileFullScreen: true,
    enableWallets: true,
    features: {
      analytics: true,
      email: false,
      socials: false,
      swaps: false,
      onramp: false,
    },
  } as any)

  appKitStarted = true
}

export function ReownAppKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    ensureInriAppKit()
  }, [])

  return <>{children}</>
}
