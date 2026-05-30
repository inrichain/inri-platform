import type { BrowserProvider } from 'ethers'

export const INRI_CHAIN_ID_DECIMAL = 3777
export const INRI_CHAIN_ID_HEX = '0xec1'

type EthereumProvider = {
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

function getEthereum(): EthereumProvider | undefined {
  if (typeof window === 'undefined') return undefined

  const maybeWindow = window as unknown as {
    ethereum?: EthereumProvider
  }

  return maybeWindow.ethereum
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error

  if (error && typeof error === 'object') {
    const maybeError = error as {
      message?: string
      shortMessage?: string
      reason?: string
      code?: number | string
      info?: {
        error?: {
          message?: string
        }
      }
    }

    if (maybeError.shortMessage) return maybeError.shortMessage
    if (maybeError.reason) return maybeError.reason
    if (maybeError.info?.error?.message) return maybeError.info.error.message
    if (maybeError.message) return maybeError.message
  }

  return 'Transaction failed. Please try again.'
}

export async function isInriChain(provider: BrowserProvider): Promise<boolean> {
  try {
    const network = await provider.getNetwork()
    return Number(network.chainId) === INRI_CHAIN_ID_DECIMAL
  } catch {
    return false
  }
}

export async function switchToInriChain(): Promise<void> {
  const ethereum = getEthereum()

  if (!ethereum?.request) {
    throw new Error('Wallet not found.')
  }

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: INRI_CHAIN_ID_HEX }],
    })
  } catch (error) {
    const err = error as { code?: number }

    if (err?.code === 4902) {
      await ethereum.request({
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
            rpcUrls: ['https://rpc.inri.life'],
            blockExplorerUrls: ['https://explorer.inri.life'],
          },
        ],
      })
      return
    }

    throw error
  }
}
