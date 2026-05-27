'use client'

import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { withBasePath } from '@/lib/site'

const INRI_CHAIN_ID = 3777
const INRI_CHAIN_ID_HEX = '0xec1'
const INRI_WALLETCONNECT_CHAIN_ID = `eip155:${INRI_CHAIN_ID}`
const INRI_RPC_URL = 'https://rpc.inri.life'
const INRI_EXPLORER_URL = 'https://explorer.inri.life'
const INRI_WALLET_URL = 'https://wallet.inri.life'

const DEFAULT_PROJECT_ID = 'bfc7a39282888507c8c1dca6d8b2dbfe'
const STORAGE_KEY = 'inri_wc_connected_v1'

type WalletConnectProvider = {
  connect: () => Promise<unknown>
  disconnect: () => Promise<void>
  request: (args: { method: string; params?: unknown[] | object; chainId?: string }, chainId?: string) => Promise<any>
  on?: (event: string, handler: (...args: any[]) => void) => void
  removeListener?: (event: string, handler: (...args: any[]) => void) => void
  setDefaultChain?: (chainId: number | string) => Promise<void> | void
  chainId?: number | string
  session?: any
  client?: any
  signer?: any
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
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://platform.inri.life'

  return {
    name: 'INRI CHAIN',
    description: 'Official INRI CHAIN website',
    url: origin,
    icons: [`${origin}${withBasePath('/icon.png')}`],
  }
}

async function forceInriDefaultChain(provider: WalletConnectProvider) {
  try {
    await provider.setDefaultChain?.(INRI_CHAIN_ID)
  } catch {
    try {
      await provider.setDefaultChain?.(INRI_WALLETCONNECT_CHAIN_ID)
    } catch {
      // Some WalletConnect provider builds do not expose this helper.
    }
  }

  try {
    if (!provider.chainId) provider.chainId = INRI_CHAIN_ID
  } catch {
    // chainId may be read-only.
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

function decimalChainToHex(ref?: string) {
  const value = Number.parseInt(ref || '', 10)
  if (!Number.isFinite(value)) return ''
  return `0x${value.toString(16)}`
}

function inferStateFromSession(session: any): WalletConnectState {
  const namespaces = session?.namespaces || session?.session?.namespaces || {}
  const accounts = Array.isArray(namespaces?.eip155?.accounts) ? namespaces.eip155.accounts : []
  const first = accounts[0]

  if (!first || typeof first !== 'string') {
    return { connected: false, address: '', chainId: '' }
  }

  const parts = first.split(':')
  if (parts.length < 3) {
    return { connected: false, address: '', chainId: '' }
  }

  const [, reference, address] = parts

  return {
    connected: Boolean(address),
    address: address || '',
    chainId: decimalChainToHex(reference),
  }
}

async function readWalletConnectState(provider: WalletConnectProvider): Promise<WalletConnectState> {
  await forceInriDefaultChain(provider)

  let address = ''
  let chainId = ''

  try {
    const accounts = (await provider.request({ method: 'eth_accounts' }, INRI_WALLETCONNECT_CHAIN_ID)) as string[]
    address = Array.isArray(accounts) ? accounts[0] || '' : ''
  } catch {
    // no-op
  }

  try {
    const nextChainId = (await provider.request({ method: 'eth_chainId' }, INRI_WALLETCONNECT_CHAIN_ID)) as string
    chainId = typeof nextChainId === 'string' ? nextChainId : ''
  } catch {
    // no-op
  }

  const inferred = inferStateFromSession(provider.session)

  return {
    connected: Boolean(address || inferred.address),
    address: address || inferred.address,
    chainId: chainId || inferred.chainId || INRI_CHAIN_ID_HEX,
  }
}

async function waitForWalletConnectState(
  provider: WalletConnectProvider,
  attempts = 8,
  delayMs = 300,
): Promise<WalletConnectState> {
  for (let i = 0; i < attempts; i += 1) {
    const state = await readWalletConnectState(provider)
    if (state.connected) return state
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return readWalletConnectState(provider)
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
      chains: [INRI_CHAIN_ID],
      optionalChains: [INRI_CHAIN_ID],
      methods: [
        'eth_accounts',
        'eth_requestAccounts',
        'eth_chainId',
        'eth_sendTransaction',
        'personal_sign',
        'eth_sign',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain',
      ],
      optionalMethods: [
        'wallet_watchAsset',
      ],
      events: ['accountsChanged', 'chainChanged'],
      optionalEvents: ['accountsChanged', 'chainChanged'],
      rpcMap: {
        [INRI_CHAIN_ID]: INRI_RPC_URL,
      },
    }) as Promise<WalletConnectProvider>
  }

  const provider = await providerPromise
  await forceInriDefaultChain(provider)
  return provider
}

export async function getWalletConnectState(): Promise<WalletConnectState> {
  try {
    const provider = await getWalletConnectProvider()
    return await readWalletConnectState(provider)
  } catch {
    return {
      connected: false,
      address: '',
      chainId: '',
    }
  }
}

export async function connectWalletConnect(
  onDisplayUri?: (uri: string, launchUrl: string) => void,
) {
  const provider = await getWalletConnectProvider()
  await forceInriDefaultChain(provider)

  const handleDisplayUri = (uri: string) => {
    const launchUrl = buildInriWalletConnectUrl(uri)
    onDisplayUri?.(uri, launchUrl)
  }

  provider.on?.('display_uri', handleDisplayUri)

  try {
    await provider.connect()
    await forceInriDefaultChain(provider)
    const state = await waitForWalletConnectState(provider)
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
  await forceInriDefaultChain(provider)

  // The INRI Wallet session is created for eip155:3777 already. Returning the
  // chain here is safer than asking WalletConnect to switch and accidentally
  // triggering a browser wallet fallback.
  return INRI_CHAIN_ID_HEX
}

export async function subscribeWalletConnect(
  listener: (state: WalletConnectState) => void,
): Promise<() => void> {
  const provider = await getWalletConnectProvider()

  const emit = async () => {
    const state = await readWalletConnectState(provider)
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

  const handleAccountsChanged = () => {
    void emit()
  }

  const handleChainChanged = () => {
    void emit()
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
