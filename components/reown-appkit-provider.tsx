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

// Compatibility networks are intentionally present only in the AppKit modal.
// They keep the Reown/WalletConnect wallet registry populated with the major
// EVM wallets while the dApp still switches the connected user back to INRI.
const ethereumAppKitNetwork = defineChain({
  id: 1,
  caipNetworkId: 'eip155:1',
  chainNamespace: 'eip155',
  name: 'Ethereum',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: { http: ['https://ethereum-rpc.publicnode.com'] },
    public: { http: ['https://ethereum-rpc.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
})

const polygonAppKitNetwork = defineChain({
  id: 137,
  caipNetworkId: 'eip155:137',
  chainNamespace: 'eip155',
  name: 'Polygon',
  nativeCurrency: { decimals: 18, name: 'POL', symbol: 'POL' },
  rpcUrls: {
    default: { http: ['https://polygon-rpc.com'] },
    public: { http: ['https://polygon-rpc.com'] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  },
})

const appKitNetworks = [inriAppKitNetwork, ethereumAppKitNetwork, polygonAppKitNetwork] as const

// Wallet IDs from Reown WalletGuide. These only prioritize the main wallets;
// they do NOT restrict the full “All Wallets” list.
const featuredWalletIds = [
  // MetaMask
  'c57ca95b47569778a828d19178114f2db125b25b778adf5cba72bd778e231769',
  // Rainbow
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
  // Trust Wallet
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
]


function installInriAppKitCss() {
  if (typeof document === 'undefined') return
  if (document.getElementById('inri-appkit-mobile-css')) return

  const style = document.createElement('style')
  style.id = 'inri-appkit-mobile-css'
  style.textContent = `
    w3m-modal {
      z-index: 2147483000 !important;
      --w3m-z-index: 2147483000;
    }

    @media (max-width: 640px) {
      w3m-modal {
        --w3m-border-radius-master: 10px;
      }
    }
  `
  document.head.appendChild(style)
}

let appKitStarted = false

export function ensureInriAppKit() {
  // Critical for GitHub/Next static builds: never initialize AppKit while Next is
  // prerendering pages on the server. The modal is browser-only.
  if (typeof window === 'undefined' || appKitStarted) return

  installInriAppKitCss()

  createAppKit({
    adapters: [new EthersAdapter()],
    networks: appKitNetworks as any,
    defaultNetwork: inriAppKitNetwork,
    defaultAccountTypes: { eip155: 'eoa' },
    projectId: INRI_REOWN_PROJECT_ID,
    metadata: {
      name: 'INRI Platform',
      description: 'Official INRI CHAIN platform',
      url: 'https://platform.inri.life',
      icons: ['https://platform.inri.life/inri-logo.png'],
    },
    customRpcUrls: {
      [INRI_CAIP_NETWORK_ID]: [{ url: INRI_RPC_URL }],
      'eip155:1': [{ url: 'https://ethereum-rpc.publicnode.com' }],
      'eip155:137': [{ url: 'https://polygon-rpc.com' }],
    },
    universalProviderConfigOverride: {
      defaultChain: INRI_CAIP_NETWORK_ID,
      chains: {
        eip155: [String(INRI_CHAIN_ID_DECIMAL), '1', '137'],
      },
      methods: {
        eip155: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
          'eth_signTypedData_v4',
          'wallet_switchEthereumChain',
          'wallet_addEthereumChain',
        ],
      },
      events: {
        eip155: ['chainChanged', 'accountsChanged', 'disconnect'],
      },
      rpcMap: {
        [INRI_CHAIN_ID_DECIMAL]: INRI_RPC_URL,
        1: 'https://ethereum-rpc.publicnode.com',
        137: 'https://polygon-rpc.com',
      },
    },
    chainImages: {
      [INRI_CHAIN_ID_DECIMAL]: 'https://platform.inri.life/inri-logo.png',
    },
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#13a4ff',
      '--w3m-border-radius-master': '12px',
    },
    featuredWalletIds,
    allWallets: 'SHOW',
    enableWallets: true,
    enableWalletGuide: true,
    enableNetworkSwitch: true,
    enableReconnect: true,
    enableMobileFullScreen: true,
    allowUnsupportedChain: true,
    enableCoinbase: true,
    coinbasePreference: 'eoaOnly',
    features: {
      analytics: true,
      email: false,
      socials: false,
      swaps: false,
      onramp: false,
      connectMethodsOrder: ['wallet'],
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
