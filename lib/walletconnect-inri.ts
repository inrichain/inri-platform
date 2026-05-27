'use client'

import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { withBasePath } from '@/lib/site'

const INRI_CHAIN_ID = 3777
const INRI_CHAIN_ID_HEX = '0xec1'
const INRI_RPC_URL = 'https://rpc.inri.life'

const DEFAULT_PROJECT_ID = 'bfc7a39282888507c8c1dca6d8b2dbfe'
const STORAGE_KEY = 'inri_wc_connected_v3'

type WalletConnectConnectOptions = {
  chains?: number[]
  optionalChains?: number[]
  rpcMap?: Record<number, string>
  pairingTopic?: string
}

type WalletConnectProvider = {
  connect: (options?: WalletConnectConnectOptions) => Promise<unknown>
  enable?: () => Promise<string[]>
  disconnect: () => Promise<void>
  request: (args: { method: string; params?: unknown[] | object; chainId?: string }, chainId?: string) => Promise<any>
  on?: (event: string, handler: (...args: any[]) => void) => void
  removeListener?: (event: string, handler: (...args: any[]) => void) => void
  setDefaultChain?: (chainId: number | string) => Promise<void> | void
  chainId?: number | string
  accounts?: string[]
  session?: any
  connected?: boolean
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
    description: 'Official INRI CHAIN platform',
    url: origin,
    icons: [`${origin}${withBasePath('/icon.png')}`],
  }
}

function walletConnectOptions(): WalletConnectConnectOptions {
  return {
    chains: [INRI_CHAIN_ID],
    optionalChains: [INRI_CHAIN_ID],
    rpcMap: {
      [INRI_CHAIN_ID]: INRI_RPC_URL,
    },
  }
}

async function forceInriDefaultChain(provider: WalletConnectProvider) {
  try {
    await provider.setDefaultChain?.(INRI_CHAIN_ID)
  } catch {
    // Some WalletConnect provider builds do not expose this helper.
  }

  try {
    if (!provider.chainId) provider.chainId = INRI_CHAIN_ID
  } catch {
    // chainId may be read-only.
  }
}

function visitBrowserStorage(callback: (storage: Storage) => void) {
  if (typeof window === 'undefined') return
  try {
    callback(window.localStorage)
  } catch {}
  try {
    callback(window.sessionStorage)
  } catch {}
}

function clearWalletConnectSdkStorage() {
  visitBrowserStorage((storage) => {
    const keys: string[] = []
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index)
      if (!key) continue
      const lower = key.toLowerCase()
      if (
        lower.includes('walletconnect') ||
        lower.startsWith('wc@') ||
        lower.startsWith('wc:') ||
        lower.includes('@walletconnect') ||
        lower.includes('reown') ||
        lower.includes('appkit') ||
        lower === 'walletconnect_deeplink_choice' ||
        lower.startsWith('inri_wc_connected')
      ) {
        keys.push(key)
      }
    }
    keys.forEach((key) => {
      try {
        storage.removeItem(key)
      } catch {}
    })
  })
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
    localStorage.removeItem('inri_wc_connected_v1')
    localStorage.removeItem('inri_wc_connected_v2')
  } catch {}
}

function normalizeHexChainId(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return ''

  if (typeof value === 'number') {
    return `0x${value.toString(16)}`
  }

  const raw = String(value).trim().toLowerCase()
  if (!raw) return ''
  if (raw.startsWith('0x')) return raw
  if (raw.startsWith('eip155:')) {
    const ref = Number.parseInt(raw.split(':')[1] || '', 10)
    return Number.isFinite(ref) ? `0x${ref.toString(16)}` : ''
  }

  const numeric = Number.parseInt(raw, 10)
  return Number.isFinite(numeric) ? `0x${numeric.toString(16)}` : ''
}

function parseAccount(input?: string | null): { address: string; chainId: string } {
  const raw = String(input || '').trim()
  if (!raw) return { address: '', chainId: '' }

  if (raw.startsWith('eip155:')) {
    const [, reference, address] = raw.split(':')
    return {
      address: address || '',
      chainId: normalizeHexChainId(reference),
    }
  }

  return { address: raw, chainId: INRI_CHAIN_ID_HEX }
}

function inferStateFromSession(session: any): WalletConnectState {
  const namespaces = session?.namespaces || session?.session?.namespaces || {}
  const accounts = Array.isArray(namespaces?.eip155?.accounts) ? namespaces.eip155.accounts : []
  const preferred =
    accounts.find((item: unknown) => typeof item === 'string' && item.startsWith(`eip155:${INRI_CHAIN_ID}:`)) ||
    accounts.find((item: unknown) => typeof item === 'string')

  const parsed = parseAccount(preferred)

  return {
    connected: Boolean(parsed.address),
    address: parsed.address,
    chainId: parsed.chainId || INRI_CHAIN_ID_HEX,
  }
}

async function readWalletConnectState(provider: WalletConnectProvider): Promise<WalletConnectState> {
  await forceInriDefaultChain(provider)

  const localAccount = Array.isArray(provider.accounts) ? provider.accounts[0] : ''
  const parsedLocal = parseAccount(localAccount)
  const inferred = inferStateFromSession(provider.session)
  const chainId = normalizeHexChainId(provider.chainId) || parsedLocal.chainId || inferred.chainId || INRI_CHAIN_ID_HEX
  const address = parsedLocal.address || inferred.address

  return {
    connected: Boolean(address),
    address,
    chainId,
  }
}

async function waitForWalletConnectState(
  provider: WalletConnectProvider,
  attempts = 12,
  delayMs = 350,
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
      showQrModal: true,
      chains: [INRI_CHAIN_ID],
      optionalChains: [INRI_CHAIN_ID],
      optionalMethods: [
        'eth_accounts',
        'eth_requestAccounts',
        'eth_chainId',
        'eth_call',
        'eth_estimateGas',
        'eth_getBalance',
        'eth_getTransactionReceipt',
        'eth_sendTransaction',
        'personal_sign',
        'eth_sign',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain',
        'wallet_watchAsset',
      ],
      optionalEvents: ['accountsChanged', 'chainChanged', 'disconnect'],
      rpcMap: {
        [INRI_CHAIN_ID]: INRI_RPC_URL,
      },
      disableProviderPing: true,
      qrModalOptions: {
        themeMode: 'dark',
        explorerRecommendedWalletIds: 'NONE',
      },
    } as any) as Promise<WalletConnectProvider>
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

function walletConnectFriendlyError(cause: unknown) {
  const raw = String((cause as { message?: unknown })?.message || cause || 'Failed to connect with WalletConnect.')

  if (raw.includes('Failed to publish') || raw.includes('custom payload') || raw.includes('No matching key')) {
    return new Error('WalletConnect could not open a clean QR session. First confirm the Reown domain allowlist has exactly https://platform.inri.life, then refresh the page and try again.')
  }

  return new Error(raw)
}

async function disconnectQuietly(provider: WalletConnectProvider) {
  try {
    await provider.disconnect()
  } catch {}
}

async function freshWalletConnectProvider() {
  clearWalletConnectConnected()
  clearWalletConnectSdkStorage()
  providerPromise = null
  const provider = await getWalletConnectProvider()
  await forceInriDefaultChain(provider)
  return provider
}

export async function connectWalletConnect() {
  let provider = await freshWalletConnectProvider()

  try {
    await provider.connect(walletConnectOptions())
  } catch (firstCause) {
    await disconnectQuietly(provider)
    provider = await freshWalletConnectProvider()

    try {
      await provider.connect(walletConnectOptions())
    } catch (secondCause) {
      throw walletConnectFriendlyError(secondCause || firstCause)
    }
  }

  await forceInriDefaultChain(provider)
  const state = await waitForWalletConnectState(provider)
  if (state.connected) markWalletConnectConnected()
  return state
}

export async function disconnectWalletConnect() {
  try {
    const provider = await getWalletConnectProvider()
    await provider.disconnect()
  } finally {
    clearWalletConnectConnected()
    clearWalletConnectSdkStorage()
    providerPromise = null
  }
}

export async function switchWalletConnectToInri() {
  const provider = await getWalletConnectProvider()
  await forceInriDefaultChain(provider)
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
