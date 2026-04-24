'use client'

export const INRI_CHAIN_ID_DECIMAL = 3777
export const INRI_CHAIN_ID_HEX = '0xec1'
export const INRI_RPC_URL = 'https://rpc.inri.life'
export const INRI_EXPLORER_URL = 'https://explorer.inri.life'

export type InriWalletConnector = '' | 'injected' | 'walletconnect'

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

export type ActiveWalletBridge = {
  connector?: InriWalletConnector
  address?: string
  chainId?: string
  provider?: EthereumProvider
} | null

export type ActiveWalletSnapshot = {
  provider: EthereumProvider | null
  providerReady: boolean
  account: string | null
  chainId: string | null
  connector: InriWalletConnector
}

type InriWindow = Window & {
  ethereum?: EthereumProvider
  __INRI_ACTIVE_WALLET__?: ActiveWalletBridge
}

export function normalizeChainId(value?: string | null) {
  return String(value || '').toLowerCase()
}

export function isInriChain(value?: string | null) {
  return normalizeChainId(value) === INRI_CHAIN_ID_HEX
}

export function toHex(value: bigint | number) {
  const normalized = typeof value === 'bigint' ? value : BigInt(value)
  return `0x${normalized.toString(16)}`
}

export function getInjectedEthereum(): EthereumProvider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as InriWindow).ethereum
}

export function getActiveWalletBridge(): ActiveWalletBridge {
  if (typeof window === 'undefined') return null
  return (window as InriWindow).__INRI_ACTIVE_WALLET__ || null
}

export function getActiveWalletProvider(): EthereumProvider | undefined {
  return getActiveWalletBridge()?.provider || getInjectedEthereum()
}

export async function readActiveWalletSnapshot(): Promise<ActiveWalletSnapshot> {
  if (typeof window === 'undefined') {
    return { provider: null, providerReady: false, account: null, chainId: null, connector: '' }
  }

  const bridge = getActiveWalletBridge()
  if (bridge?.address && bridge?.provider) {
    return {
      provider: bridge.provider,
      providerReady: true,
      account: bridge.address,
      chainId: bridge.chainId || null,
      connector: bridge.connector || '',
    }
  }

  const eth = getInjectedEthereum()
  if (!eth) {
    return { provider: null, providerReady: false, account: null, chainId: null, connector: '' }
  }

  try {
    const [accounts, currentChainId] = (await Promise.all([
      eth.request({ method: 'eth_accounts' }),
      eth.request({ method: 'eth_chainId' }),
    ])) as [string[], string]

    return {
      provider: eth,
      providerReady: true,
      account: accounts?.[0] || null,
      chainId: currentChainId || null,
      connector: accounts?.[0] ? 'injected' : '',
    }
  } catch {
    return { provider: eth, providerReady: true, account: null, chainId: null, connector: 'injected' }
  }
}

export async function rpcCall(method: string, params: unknown[] = []) {
  const response = await fetch(INRI_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })

  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`)

  const data = (await response.json()) as { result?: unknown; error?: { message?: string } }
  if (data.error) throw new Error(data.error.message || 'RPC error')
  return data.result
}

export async function getLegacyGasPrice() {
  try {
    const raw = await rpcCall('eth_gasPrice')
    if (typeof raw === 'string') {
      const value = BigInt(raw)
      if (value > 0n) return value
    }
  } catch {
    // fallback below
  }

  return 1_000_000_000n
}

export function withGasBuffer(value: bigint, fallback: bigint) {
  const base = value > 0n ? value : fallback
  return (base * 125n) / 100n + 25_000n
}

export async function estimateGasWithFallback(
  tx: Record<string, unknown>,
  fallbackGasLimit: bigint,
) {
  try {
    const raw = await rpcCall('eth_estimateGas', [tx])
    if (typeof raw === 'string') {
      const gas = BigInt(raw)
      if (gas > 0n) return withGasBuffer(gas, fallbackGasLimit)
    }
  } catch {
    // Custom INRI nodes or contract reverts can reject estimation. Use fixed safe limit.
  }

  return withGasBuffer(0n, fallbackGasLimit)
}

export async function switchProviderToInri(provider: EthereumProvider) {
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
          nativeCurrency: { name: 'INRI', symbol: 'INRI', decimals: 18 },
          rpcUrls: [INRI_RPC_URL],
          blockExplorerUrls: [INRI_EXPLORER_URL],
        },
      ],
    })
  }

  try {
    const nextChainId = await provider.request({ method: 'eth_chainId' })
    return typeof nextChainId === 'string' ? nextChainId : INRI_CHAIN_ID_HEX
  } catch {
    return INRI_CHAIN_ID_HEX
  }
}
