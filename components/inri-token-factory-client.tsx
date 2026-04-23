'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Copy, ExternalLink, LoaderCircle, ShieldCheck } from 'lucide-react'

const FACTORY_ADDRESS = '0x1D760E78D92aA5B46b484bc054Bbfae11198B751'
const INRI_CHAIN_ID_HEX = '0xec1'

const CREATE_TOKEN_SIGNATURES = [
  'createToken(string,string,uint8,uint256)',
  'createToken(string,string,uint256,uint8)',
] as const

const TOTAL_TOKENS_SIGNATURE = 'totalTokens()'
const ALL_TOKENS_SIGNATURE = 'allTokens(uint256)'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

function getEthereum(): EthereumProvider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { ethereum?: EthereumProvider }).ethereum
}

type FormState = {
  name: string
  symbol: string
  decimals: string
  supply: string
}

const initialForm: FormState = {
  name: '',
  symbol: '',
  decimals: '18',
  supply: '',
}

function strip0x(value: string) {
  return value.startsWith('0x') ? value.slice(2) : value
}

function encodeUint(value: bigint) {
  return value.toString(16).padStart(64, '0')
}

function asciiToHex(value: string) {
  return `0x${Array.from(value).map((char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join('')}`
}

function utf8ToHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function encodeString(value: string) {
  const dataHex = utf8ToHex(value)
  const byteLength = BigInt(dataHex.length / 2)
  const paddedHexLength = Math.ceil((dataHex.length || 2) / 64) * 64
  return `${encodeUint(byteLength)}${dataHex.padEnd(paddedHexLength, '0')}`
}

function encodeCreateTokenWithSelector(selector: string, name: string, symbol: string, decimals: number, supply: bigint, signature: string) {
  const encodedName = encodeString(name)
  const encodedSymbol = encodeString(symbol)
  const nameOffset = 32n * 4n
  const symbolOffset = nameOffset + BigInt(encodedName.length / 2)

  const thirdArg = signature === 'createToken(string,string,uint256,uint8)' ? encodeUint(supply) : encodeUint(BigInt(decimals))
  const fourthArg = signature === 'createToken(string,string,uint256,uint8)' ? encodeUint(BigInt(decimals)) : encodeUint(supply)

  return `0x${selector}${encodeUint(nameOffset)}${encodeUint(symbolOffset)}${thirdArg}${fourthArg}${encodedName}${encodedSymbol}`
}

function sanitizeSupply(input: string) {
  return input.replace(/[,_\s]/g, '')
}

function shortAddress(address?: string | null) {
  if (!address) return 'Not connected'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function parseHexToBigInt(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('0x')) return 0n
  return BigInt(value)
}

function isValidAddress(value?: string | null) {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value)
}

async function rpcCall(method: string, params: unknown[] = []) {
  const response = await fetch('https://rpc.inri.life', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })

  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`)

  const data = (await response.json()) as { result?: unknown; error?: { message?: string } }
  if (data.error) throw new Error(data.error.message || 'RPC error')
  return data.result
}

async function fetchSelector(signature: string) {
  const result = await rpcCall('web3_sha3', [asciiToHex(signature)])
  if (typeof result !== 'string' || result.length < 10) throw new Error(`Selector not found for ${signature}`)
  return result.slice(2, 10)
}

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,15,26,0.97),rgba(2,8,15,0.985))] shadow-[0_30px_90px_rgba(0,0,0,0.34)] ${className}`}>
      {children}
    </div>
  )
}

function StatusPill({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-full border px-4 py-2.5 ${accent ? 'border-primary/26 bg-primary/[0.10]' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">{label}</div>
      <div className={`mt-1 text-sm font-black ${accent ? 'text-primary' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  helper,
  inputMode,
  uppercase = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  helper: string
  inputMode?: 'text' | 'numeric'
  uppercase?: boolean
}) {
  return (
    <label className="block">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">{label}</div>
      <input
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`mt-2 h-14 w-full rounded-[1.15rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-primary/55 focus:bg-primary/[0.04] ${uppercase ? 'uppercase' : ''}`}
      />
      <div className="mt-2 text-sm leading-6 text-white/44">{helper}</div>
    </label>
  )
}

type FactoryStats = {
  total: bigint
  latest: string | null
}

type ResolvedCreateCall = {
  signature: (typeof CREATE_TOKEN_SIGNATURES)[number]
  selector: string
  data: string
  gas: bigint
}

export function InriTokenFactoryClient() {
  const [providerReady, setProviderReady] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(initialForm)
  const [status, setStatus] = useState('Connect the wallet, switch to INRI CHAIN and review the launch details.')
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [factoryCount, setFactoryCount] = useState<string>('-')
  const [latestToken, setLatestToken] = useState<string | null>(null)
  const [gasEstimate, setGasEstimate] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectors, setSelectors] = useState<Record<string, string>>({})
  const [resolvedSignature, setResolvedSignature] = useState<string | null>(null)

  const networkReady = chainId?.toLowerCase() === INRI_CHAIN_ID_HEX

  const previewItems = useMemo(
    () => [
      { label: 'Token name', value: form.name || 'Your token name' },
      { label: 'Symbol', value: form.symbol || 'Ticker' },
      { label: 'Decimals', value: form.decimals || '18' },
      { label: 'Initial supply', value: form.supply || '0' },
    ],
    [form],
  )

  useEffect(() => {
    let cancelled = false

    const loadSelectors = async () => {
      try {
        const signatures = [...CREATE_TOKEN_SIGNATURES, TOTAL_TOKENS_SIGNATURE, ALL_TOKENS_SIGNATURE]
        const entries = await Promise.all(signatures.map(async (signature) => [signature, await fetchSelector(signature)] as const))
        if (!cancelled) setSelectors(Object.fromEntries(entries))
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Unable to load token factory selectors.')
        }
      }
    }

    loadSelectors().catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const refreshFactoryStats = useCallback(async (): Promise<FactoryStats> => {
    const totalSelector = selectors[TOTAL_TOKENS_SIGNATURE]
    const allTokensSelector = selectors[ALL_TOKENS_SIGNATURE]

    if (!totalSelector || !allTokensSelector) {
      setFactoryCount('-')
      setLatestToken(null)
      return { total: 0n, latest: null }
    }

    try {
      const totalRaw = await rpcCall('eth_call', [{ to: FACTORY_ADDRESS, data: `0x${totalSelector}` }, 'latest'])
      const total = parseHexToBigInt(totalRaw)
      setFactoryCount(total.toString())

      let latest: string | null = null
      if (total > 0n) {
        const latestRaw = await rpcCall('eth_call', [{ to: FACTORY_ADDRESS, data: `0x${allTokensSelector}${encodeUint(total - 1n)}` }, 'latest'])
        if (typeof latestRaw === 'string' && latestRaw.startsWith('0x') && latestRaw.length >= 66) {
          latest = `0x${latestRaw.slice(-40)}`
          setLatestToken(latest)
        } else {
          setLatestToken(null)
        }
      } else {
        setLatestToken(null)
      }

      return { total, latest }
    } catch {
      setFactoryCount('-')
      setLatestToken(null)
      return { total: 0n, latest: null }
    }
  }, [selectors])

  useEffect(() => {
    if (!selectors[TOTAL_TOKENS_SIGNATURE] || !selectors[ALL_TOKENS_SIGNATURE]) return
    refreshFactoryStats().catch(() => undefined)
  }, [refreshFactoryStats, selectors])

  useEffect(() => {
    const eth = getEthereum()
    setProviderReady(Boolean(eth))
    if (!eth) return

    const syncState = async () => {
      try {
        const [accounts, currentChainId] = (await Promise.all([
          eth.request({ method: 'eth_accounts' }),
          eth.request({ method: 'eth_chainId' }),
        ])) as [string[], string]
        setAccount(accounts[0] || null)
        setChainId(currentChainId || null)
      } catch {
        // noop
      }
    }

    const handleAccountsChanged = (accounts: unknown) => {
      const next = Array.isArray(accounts) ? (accounts[0] as string | undefined) : undefined
      setAccount(next || null)
    }

    const handleChainChanged = (nextChainId: unknown) => {
      if (typeof nextChainId === 'string') setChainId(nextChainId)
    }

    syncState().catch(() => undefined)
    eth.on?.('accountsChanged', handleAccountsChanged)
    eth.on?.('chainChanged', handleChainChanged)

    return () => {
      eth.removeListener?.('accountsChanged', handleAccountsChanged)
      eth.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [])

  const connectWallet = async () => {
    const eth = getEthereum()
    if (!eth) {
      setError('No wallet detected. Open this page with INRI Wallet, MetaMask or another EVM wallet.')
      return
    }

    try {
      setIsConnecting(true)
      setError(null)
      const [selected] = (await eth.request({ method: 'eth_requestAccounts' })) as string[]
      const currentChainId = (await eth.request({ method: 'eth_chainId' })) as string
      setAccount(selected || null)
      setChainId(currentChainId)
      setStatus(selected ? 'Wallet connected. Review the token details and continue.' : 'Wallet connection canceled.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet connection failed.')
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToInri = async () => {
    const eth = getEthereum()
    if (!eth) {
      setError('No wallet detected to switch networks.')
      return
    }

    try {
      setIsSwitching(true)
      setError(null)
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: INRI_CHAIN_ID_HEX }] })
      setChainId(INRI_CHAIN_ID_HEX)
      setStatus('INRI CHAIN selected. The app is ready to send the launch transaction.')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('4902') || message.toLowerCase().includes('unrecognized chain')) {
        try {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: INRI_CHAIN_ID_HEX,
                chainName: 'INRI CHAIN',
                nativeCurrency: { name: 'INRI', symbol: 'INRI', decimals: 18 },
                rpcUrls: ['https://rpc.inri.life'],
                blockExplorerUrls: ['https://explorer.inri.life'],
              },
            ],
          })
          setChainId(INRI_CHAIN_ID_HEX)
          setStatus('INRI CHAIN added to the wallet. Review the network and continue.')
        } catch (addErr) {
          setError(addErr instanceof Error ? addErr.message : 'Could not add INRI CHAIN to the wallet.')
        }
      } else {
        setError(message || 'Could not switch network.')
      }
    } finally {
      setIsSwitching(false)
    }
  }

  const resolveCreateCall = useCallback(async (): Promise<ResolvedCreateCall> => {
    const eth = getEthereum()
    if (!eth || !account || !networkReady) throw new Error('Connect the wallet on INRI CHAIN first.')

    const cleanSupply = sanitizeSupply(form.supply)
    const decimals = Number(form.decimals)
    const name = form.name.trim()
    const symbol = form.symbol.trim()

    if (!name) throw new Error('Token name is required.')
    if (!symbol) throw new Error('Token symbol is required.')
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) throw new Error('Decimals must be an integer between 0 and 255.')
    if (!/^\d+$/.test(cleanSupply) || BigInt(cleanSupply) <= 0n) throw new Error('Supply must be a whole number greater than zero.')

    const supply = BigInt(cleanSupply)
    const failures: string[] = []

    for (const signature of CREATE_TOKEN_SIGNATURES) {
      const selector = selectors[signature]
      if (!selector) continue
      const data = encodeCreateTokenWithSelector(selector, name, symbol, decimals, supply, signature)

      try {
        const gasHex = (await eth.request({
          method: 'eth_estimateGas',
          params: [{ from: account, to: FACTORY_ADDRESS, data }],
        })) as string

        const gas = BigInt(gasHex)
        setResolvedSignature(signature)
        return { signature, selector, data, gas }
      } catch (cause) {
        failures.push(`${signature}: ${cause instanceof Error ? cause.message : String(cause)}`)
      }
    }

    throw new Error('The token factory call could not be prepared with the live contract settings.')
  }, [account, form.decimals, form.name, form.supply, form.symbol, networkReady, selectors])

  const estimateGas = useCallback(async () => {
    if (!account || !networkReady) {
      setGasEstimate(null)
      return
    }

    try {
      const resolved = await resolveCreateCall()
      setGasEstimate(resolved.gas.toString())
    } catch {
      setGasEstimate(null)
    }
  }, [account, networkReady, resolveCreateCall])

  useEffect(() => {
    estimateGas().catch(() => undefined)
  }, [estimateGas])

  const createToken = async () => {
    const eth = getEthereum()
    if (!eth) {
      setError('No wallet detected. Use INRI Wallet or another EVM wallet.')
      return
    }
    if (!account) {
      setError('Connect your wallet from the top header first.')
      return
    }
    if (!networkReady) {
      setError('Select INRI CHAIN from the top header first.')
      return
    }

    try {
      setError(null)
      setIsCreating(true)
      setTxHash(null)
      setCreatedToken(null)
      setStatus('Waiting for wallet confirmation...')

      const before = await refreshFactoryStats()
      const resolved = await resolveCreateCall()
      const boostedGas = (resolved.gas * 125n) / 100n
      setGasEstimate(boostedGas.toString())
      setResolvedSignature(resolved.signature)

      const hash = (await eth.request({
        method: 'eth_sendTransaction',
        params: [{ from: account, to: FACTORY_ADDRESS, data: resolved.data, gas: `0x${boostedGas.toString(16)}` }],
      })) as string

      setTxHash(hash)
      setStatus('Transaction sent. Waiting for confirmation on INRI CHAIN...')

      let receipt: { status?: string } | null = null
      for (let attempt = 0; attempt < 90; attempt += 1) {
        receipt = (await eth.request({ method: 'eth_getTransactionReceipt', params: [hash] })) as { status?: string } | null
        if (receipt) break
        await new Promise((resolve) => window.setTimeout(resolve, 4000))
      }

      if (!receipt) {
        setStatus('Transaction sent. Explorer may need a little more time to show the new token.')
        await refreshFactoryStats()
        return
      }

      if (receipt.status !== '0x1') {
        throw new Error('Transaction reverted. Confirm the token fields and try again.')
      }

      const after = await refreshFactoryStats()
      const inferredToken = after.total > before.total && isValidAddress(after.latest) ? after.latest : null

      if (inferredToken) {
        setCreatedToken(inferredToken)
        setStatus('Token created successfully. Open it on the explorer or add it to the wallet.')
      } else {
        setStatus('Token created. Open the explorer transaction to confirm the new token address.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token creation failed. Please review the fields and try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const addTokenToWallet = async () => {
    const eth = getEthereum()
    if (!eth || !createdToken) return
    try {
      await eth.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: createdToken,
            symbol: form.symbol.trim().slice(0, 11),
            decimals: Number(form.decimals),
          },
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the token to the wallet.')
    }
  }

  const copyFactory = async () => {
    try {
      await navigator.clipboard.writeText(FACTORY_ADDRESS)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Surface className="overflow-hidden p-4 sm:p-6 lg:p-7">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex flex-wrap gap-3">
            <StatusPill label="Wallet" value={shortAddress(account)} accent={Boolean(account)} />
            <StatusPill label="Network" value={networkReady ? 'INRI CHAIN' : 'Switch needed'} accent={networkReady} />
            <StatusPill label="Created" value={factoryCount} />
            <StatusPill label="Latest token" value={latestToken ? `${latestToken.slice(0, 6)}...${latestToken.slice(-4)}` : '-'} />
          </div>

          {!providerReady ? (
            <div className="mt-4 rounded-[1.2rem] border border-amber-400/18 bg-amber-500/[0.08] px-4 py-4 text-sm leading-7 text-amber-100/88">
              No wallet detected in this browser. Open this page with INRI Wallet, MetaMask or another EVM wallet.
            </div>
          ) : null}

          <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Launch form</div>
                <h2 className="mt-2 text-2xl font-black text-white">Launch panel</h2>
              </div>
              <div className="rounded-full border border-primary/16 bg-primary/[0.08] px-4 py-2.5 text-sm font-semibold text-white/78">
                {account
                  ? networkReady
                    ? 'Wallet connected in header • INRI CHAIN ready'
                    : 'Wallet connected in header • switch to INRI CHAIN in the top menu'
                  : 'Connect wallet in the top header'}
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <InputField
                label="Token name"
                value={form.name}
                onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                placeholder="Example: INRI COMMUNITY TOKEN"
                helper="Visible name users will see in wallets and explorers."
              />
              <InputField
                label="Symbol"
                value={form.symbol}
                onChange={(value) => setForm((current) => ({ ...current, symbol: value.toUpperCase().slice(0, 12) }))}
                placeholder="Example: ICT"
                helper="Short ticker, usually 3 to 8 characters."
                uppercase
              />
              <InputField
                label="Decimals"
                value={form.decimals}
                onChange={(value) => setForm((current) => ({ ...current, decimals: value.replace(/[^0-9]/g, '').slice(0, 3) }))}
                placeholder="18"
                helper="Most ERC-20 tokens use 18 decimals."
                inputMode="numeric"
              />
              <InputField
                label="Initial supply"
                value={form.supply}
                onChange={(value) => setForm((current) => ({ ...current, supply: value.replace(/[^0-9,_\s]/g, '') }))}
                placeholder="1000000"
                helper="Enter a whole number. The contract multiplies it by 10**decimals internally only if the live factory was designed that way."
                inputMode="numeric"
              />
            </div>

            <div className="mt-5 rounded-[1.3rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(19,164,255,0.10),rgba(19,164,255,0.04))] p-4 text-sm leading-7 text-white/78">
              Review the token details carefully before launch. The initial supply is sent to the connected wallet when creation succeeds.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createToken}
                disabled={isCreating}
                className="inri-button-primary min-w-[190px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Creating token...
                  </>
                ) : (
                  'Create token on INRI'
                )}
              </button>
              <button
                type="button"
                onClick={() => setForm(initialForm)}
                disabled={isCreating}
                className="inri-button-secondary min-w-[150px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear form
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-black">Launch summary</h3>
            </div>
            <div className="mt-5 grid gap-3">
              {previewItems.map((item) => (
                <div key={item.label} className="rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/46">{item.label}</div>
                  <div className="mt-2 text-base font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-primary/16 bg-[linear-gradient(180deg,rgba(19,164,255,0.09),rgba(255,255,255,0.02))] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-semibold text-white/82">{status}</div>
                <div className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-white/42">Factory contract</div>
                <div className="mt-2 break-all font-mono text-xs text-white/70">{FACTORY_ADDRESS}</div>
              </div>
            </div>
            {error ? <p className="mt-4 text-sm font-semibold leading-7 text-rose-300">{error}</p> : null}
            {gasEstimate ? <p className="mt-3 text-sm text-white/56">Estimated gas: {gasEstimate}</p> : null}
            {txHash ? (
              <div className="mt-4 text-sm text-white/72">
                <div className="font-bold text-white">Transaction</div>
                <Link href={`https://explorer.inri.life/tx/${txHash}`} target="_blank" rel="noreferrer" className="mt-2 inline-block break-all font-mono text-primary underline-offset-4 hover:underline">
                  {txHash}
                </Link>
              </div>
            ) : null}
            {createdToken ? (
              <div className="mt-5 grid gap-3">
                <Link href={`https://explorer.inri.life/address/${createdToken}`} target="_blank" rel="noreferrer" className="inri-button-secondary text-sm">
                  Open token on explorer
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button type="button" onClick={addTokenToWallet} className="inri-button-primary text-sm">
                  Add token to wallet
                </button>
              </div>
            ) : null}
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={copyFactory} className="inri-button-secondary flex-1 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy contract'}
              </button>
              <Link href={`https://explorer.inri.life/address/${FACTORY_ADDRESS}`} target="_blank" rel="noreferrer" className="inri-button-secondary flex-1 text-sm">
                Explorer
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Surface>
  )
}
