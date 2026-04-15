'use client'

import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { withBasePath } from '@/lib/site'

const INRI_CHAIN_ID = 3777
const INRI_CHAIN_ID_HEX = '0xec1'
const INRI_RPC_URL = 'https://rpc.inri.life'
const INRI_EXPLORER_URL = 'https://explorer.inri.life'
const INRI_WALLET_URL = 'https://wallet.inri.life'

const DEFAULT_PROJECT_ID = 'bfc7a39282888507c8c1dca6d8b2dbfe'
const STORAGE_KEY = 'inri_wc_connected_v1'

type WalletConnectProvider = {
  connect: () => Promise<unknown>
  enable?: () => Promise<unknown>
  disconnect: () => Promise<void>
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>
  on?: (event: string, handler: (...args: any[]) => void) => void
  removeListener?: (event: string, handler: (...args: any[]) => void) => void
  session?: unknown
}

export type WalletConnectState = {
  connected: boolean
  address: string
  chainId: string
}

let providerPromise: Promise<WalletConnectProvider> | null = null

function getProjectId() {
  return process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || DEFAULT_PROJECT_ID
}

function getMetadata() {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://platform.inri.life'
  return {
    name: 'INRI CHAIN',
    description: 'Official INRI CHAIN website',
    url: origin,
    icons: [`${origin}${withBasePath('/icon.png')}`],
  }
}

export function buildInriWalletConnectUrl(uri: string) {
  const returnUrl =
    typeof window !== 'undefined' ? window.location.href : 'https://platform.inri.life/'
  return `${INRI_WALLET_URL}/wc?uri=${encodeURIComponent(uri)}&returnUrl=${encodeURIComponent(
    returnUrl,
  )}`
}

export function shouldResumeWalletConnect() {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markWalletConnectConnected() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {}
}

function clearWalletConnectConnected() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export async function getWalletConnectProvider() {
  if (typeof window === 'undefined') {
    throw new Error('WalletConnect is only available in the browser.')
  }

  if (!providerPromise) {
    providerPromise = EthereumProvider.init({
      projectId: getProjectId(),
      metadata: getMetadata(),
      showQrModal: false,
      optionalChains: [INRI_CHAIN_ID],
      rpcMap: {
        [INRI_CHAIN_ID]: INRI_RPC_URL,
      },
    }) as Promise<WalletConnectProvider>
  }

  return providerPromise
}

export async function getWalletConnectState(): Promise<WalletConnectState> {
  try {
    const provider = await getWalletConnectProvider()
    const [accounts, chainId] = (await Promise.all([
      provider.request({ method: 'eth_accounts' }),
      provider.request({ method: 'eth_chainId' }),
    ])) as [string[], string]

    const address = Array.isArray(accounts) ? accounts[0] || '' : ''
    return {
      connected: Boolean(address),
      address,
      chainId: typeof chainId === 'string' ? chainId : '',
    }
  } catch {
    return {
      connected: false,
      address: '',
      chainId: '',
    }
  }
}

export async function connectWalletConnect(onDisplayUri?: (uri: string, launchUrl: string) => void) {
  const provider = await getWalletConnectProvider()

  const handleDisplayUri = (uri: string) => {
    const launchUrl = buildInriWalletConnectUrl(uri)
    onDisplayUri?.(uri, launchUrl)
  }

  provider.on?.('display_uri', handleDisplayUri)

  try {
    await provider.connect()
    const state = await getWalletConnectState()
    if (state.connected) markWalletConnectConnected()
    return state
  } finally {
    provider.removeListener?.('display_uri', handleDisplayUri)
  }
}

export async function disconnectWalletConnect() {
  try {
    const provider = await getWalletConnectProvider()
    await provider.disconnect()
  } finally {
    clearWalletConnectConnected()
  }
}

export async function switchWalletConnectToInri() {
  const provider = await getWalletConnectProvider()

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: INRI_CHAIN_ID_HEX }],
    })
  } catch {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: INRI_CHAIN_ID_HEX,
          chainName: 'INRI CHAIN',
          nativeCurrency: {
            name: 'INRI',
            symbol: 'INRI',
            decimals: 18,
          },
          rpcUrls: [INRI_RPC_URL],
          blockExplorerUrls: [INRI_EXPLORER_URL],
        },
      ],
    })
  }

  return provider.request({ method: 'eth_chainId' }) as Promise<string>
}

export async function subscribeWalletConnect(
  listener: (state: WalletConnectState) => void,
): Promise<() => void> {
  const provider = await getWalletConnectProvider()

  const emit = async () => {
    const state = await getWalletConnectState()
    if (state.connected) {
      markWalletConnectConnected()
    } else {
      clearWalletConnectConnected()
    }
    listener(state)
  }

  const handleConnect = () => {
    void emit()
  }

  const handleDisconnect = () => {
    clearWalletConnectConnected()
    listener({
      connected: false,
      address: '',
      chainId: '',
    })
  }

  const handleAccountsChanged = (accounts: string[]) => {
    const address = Array.isArray(accounts) ? accounts[0] || '' : ''
    if (address) {
      markWalletConnectConnected()
    } else {
      clearWalletConnectConnected()
    }
    void provider
      .request({ method: 'eth_chainId' })
      .then((chainId) => {
        listener({
          connected: Boolean(address),
          address,
          chainId: typeof chainId === 'string' ? chainId : '',
        })
      })
      .catch(() => {
        listener({
          connected: Boolean(address),
          address,
          chainId: '',
        })
      })
  }

  const handleChainChanged = (chainId: string) => {
    void provider
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        const address = Array.isArray(accounts) ? accounts[0] || '' : ''
        listener({
          connected: Boolean(address),
          address,
          chainId: typeof chainId === 'string' ? chainId : '',
        })
      })
      .catch(() => {
        listener({
          connected: false,
          address: '',
          chainId: typeof chainId === 'string' ? chainId : '',
        })
      })
  }

  provider.on?.('connect', handleConnect)
  provider.on?.('disconnect', handleDisconnect)
  provider.on?.('accountsChanged', handleAccountsChanged)
  provider.on?.('chainChanged', handleChainChanged)

  await emit()

  return () => {
    provider.removeListener?.('connect', handleConnect)
    provider.removeListener?.('disconnect', handleDisconnect)
    provider.removeListener?.('accountsChanged', handleAccountsChanged)
    provider.removeListener?.('chainChanged', handleChainChanged)
  }
}
