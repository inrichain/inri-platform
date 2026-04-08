'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Copy, ExternalLink, LoaderCircle, ShieldCheck, Sparkles, Wallet2 } from 'lucide-react'

const FACTORY_ADDRESS = '0x1D760E78D92aA5B46b484bc054Bbfae11198B751'
const INRI_CHAIN_ID_HEX = '0xec1'
const CREATE_TOKEN_SELECTOR = '210f5dda'
const TOTAL_TOKENS_SELECTOR = '7e1c0c09'
const ALL_TOKENS_SELECTOR = '634282af'
const TOKEN_CREATED_TOPIC = '0x6aba688e0d9fb13e49808a9f69e09384142cd46853e4ecfcf79aa7e4d63c1832'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
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

function pad64(hex: string) {
  return strip0x(hex).padStart(64, '0')
}

function encodeUint(value: bigint) {
  return value.toString(16).padStart(64, '0')
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

function encodeCreateToken(name: string, symbol: string, decimals: number, supply: bigint) {
  const encodedName = encodeString(name)
  const encodedSymbol = encodeString(symbol)
  const nameOffset = 32n * 4n
  const symbolOffset = nameOffset + BigInt(encodedName.length / 2)

  return `0x${CREATE_TOKEN_SELECTOR}${encodeUint(nameOffset)}${encodeUint(symbolOffset)}${encodeUint(BigInt(decimals))}${encodeUint(supply)}${encodedName}${encodedSymbol}`
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

function parseCreatedTokenFromLogData(data?: string) {
  if (!data || !data.startsWith('0x')) return null
  const clean = strip0x(data)
  if (clean.length < 64) return null
  return `0x${clean.slice(24, 64)}`
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

  if (!response.ok) {
    throw new Error(`RPC HTTP ${response.status}`)
  }

  const data = (await response.json()) as { result?: unknown; error?: { message?: string } }
  if (data.error) {
    throw new Error(data.error.message || 'RPC error')
  }

  return data.result
}

function Surface({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="rounded-[1.9rem] border-[1.45px] border-white/12 bg-[linear-gradient(180deg,rgba(6,14,24,0.96),rgba(2,7,14,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.30)]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">{title}</p>
        {right}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  )
}

export function InriTokenFactoryClient() {
  const [providerReady, setProviderReady] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(initialForm)
  const [status, setStatus] = useState('Connect your wallet and switch to INRI CHAIN to create a token.')
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

  const networkReady = chainId?.toLowerCase() === INRI_CHAIN_ID_HEX

  const formSummary = useMemo(() => {
    return [
      { label: 'Name', value: form.name || 'Your token name' },
      { label: 'Symbol', value: form.symbol || 'Ticker' },
      { label: 'Decimals', value: form.decimals || '18' },
      { label: 'Supply', value: form.supply || '0' },
    ]
  }, [form])

  const refreshFactoryStats = useCallback(async () => {
    try {
      const totalRaw = await rpcCall('eth_call', [{ to: FACTORY_ADDRESS, data: `0x${TOTAL_TOKENS_SELECTOR}` }, 'latest'])
      const total = parseHexToBigInt(totalRaw)
      setFactoryCount(total.toString())

      if (total > 0n) {
        const latestRaw = await rpcCall('eth_call', [
          { to: FACTORY_ADDRESS, data: `0x${ALL_TOKENS_SELECTOR}${encodeUint(total - 1n)}` },
          'latest',
        ])

        if (typeof latestRaw === 'string' && latestRaw.startsWith('0x') && latestRaw.length >= 66) {
          setLatestToken(`0x${latestRaw.slice(-40)}`)
        }
      }
    } catch {
      setFactoryCount('-')
    }
  }, [])

  useEffect(() => {
    refreshFactoryStats().catch(() => undefined)
  }, [refreshFactoryStats])

  useEffect(() => {
    const eth = window.ethereum
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
        // ignore initial sync issues
      }
    }

    const handleAccountsChanged = (accounts: unknown) => {
      const next = Array.isArray(accounts) ? (accounts[0] as string | undefined) : undefined
      setAccount(next || null)
    }

    const handleChainChanged = (nextChainId: unknown) => {
      if (typeof nextChainId === 'string') {
        setChainId(nextChainId)
      }
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
    const eth = window.ethereum
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
      setStatus(selected ? 'Wallet connected. You can now prepare your token.' : 'Wallet connection canceled.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet connection failed.')
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToInri = async () => {
    const eth = window.ethereum
    if (!eth) {
      setError('No wallet detected to switch networks.')
      return
    }

    try {
      setIsSwitching(true)
      setError(null)
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: INRI_CHAIN_ID_HEX }],
      })
      setChainId(INRI_CHAIN_ID_HEX)
      setStatus('INRI CHAIN selected. You can create your token now.')
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
          setStatus('INRI CHAIN added to your wallet. Review the network and continue.')
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

  const estimateGas = async () => {
    const eth = window.ethereum
    if (!eth || !account || !networkReady) return

    try {
      const cleanSupply = sanitizeSupply(form.supply)
      if (!form.name || !form.symbol || !cleanSupply) return
      const decimals = Number(form.decimals)
      const data = encodeCreateToken(form.name.trim(), form.symbol.trim(), decimals, BigInt(cleanSupply))
      const gas = (await eth.request({
        method: 'eth_estimateGas',
        params: [{ from: account, to: FACTORY_ADDRESS, data }],
      })) as string
      const gasBig = BigInt(gas)
      setGasEstimate(gasBig.toString())
    } catch {
      setGasEstimate(null)
    }
  }

  useEffect(() => {
    estimateGas().catch(() => undefined)
  }, [form.name, form.symbol, form.decimals, form.supply, account, networkReady])

  const createToken = async () => {
    const eth = window.ethereum
    if (!eth) {
      setError('No wallet detected. Use INRI Wallet or another EVM wallet.')
      return
    }

    if (!account) {
      await connectWallet()
      return
    }

    if (!networkReady) {
      setError('Switch to INRI CHAIN first.')
      return
    }

    const name = form.name.trim()
    const symbol = form.symbol.trim()
    const cleanSupply = sanitizeSupply(form.supply)
    const decimals = Number(form.decimals)

    if (!name) {
      setError('Token name is required.')
      return
    }
    if (!symbol) {
      setError('Token symbol is required.')
      return
    }
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) {
      setError('Decimals must be an integer between 0 and 255.')
      return
    }
    if (!/^\d+$/.test(cleanSupply) || BigInt(cleanSupply) <= 0n) {
      setError('Supply must be a whole number greater than zero.')
      return
    }

    try {
      setError(null)
      setIsCreating(true)
      setTxHash(null)
      setCreatedToken(null)
      setStatus('Waiting for wallet confirmation...')

      const data = encodeCreateToken(name, symbol, decimals, BigInt(cleanSupply))
      let gasHex: string | undefined

      try {
        const estimated = (await eth.request({
          method: 'eth_estimateGas',
          params: [{ from: account, to: FACTORY_ADDRESS, data }],
        })) as string
        const boosted = (BigInt(estimated) * 120n) / 100n
        gasHex = `0x${boosted.toString(16)}`
        setGasEstimate(boosted.toString())
      } catch {
        gasHex = undefined
      }

      const hash = (await eth.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to: FACTORY_ADDRESS,
            data,
            ...(gasHex ? { gas: gasHex } : {}),
          },
        ],
      })) as string

      setTxHash(hash)
      setStatus('Transaction sent. Waiting for confirmation on INRI CHAIN...')

      let receipt: { status?: string; logs?: Array<{ address?: string; topics?: string[]; data?: string }> } | null = null
      for (let attempt = 0; attempt < 90; attempt += 1) {
        receipt = (await eth.request({ method: 'eth_getTransactionReceipt', params: [hash] })) as {
          status?: string
          logs?: Array<{ address?: string; topics?: string[]; data?: string }>
        } | null
        if (receipt) break
        await new Promise((resolve) => window.setTimeout(resolve, 4000))
      }

      if (!receipt) {
        setStatus('Transaction sent. Explorer may need a little more time to show the new token.')
        await refreshFactoryStats()
        return
      }

      if (receipt.status !== '0x1') {
        throw new Error('Transaction reverted. Check the explorer or wallet details.')
      }

      const tokenLog = receipt.logs?.find(
        (log) => log.address?.toLowerCase() === FACTORY_ADDRESS.toLowerCase() && log.topics?.[0]?.toLowerCase() === TOKEN_CREATED_TOPIC.toLowerCase(),
      )
      const created = parseCreatedTokenFromLogData(tokenLog?.data)

      if (created && isValidAddress(created)) {
        setCreatedToken(created)
        setStatus('Token created successfully. You can now open it on the explorer or add it to your wallet.')
      } else {
        setStatus('Token created. Open the explorer transaction to view the new contract address.')
      }

      await refreshFactoryStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token creation failed.')
    } finally {
      setIsCreating(false)
    }
  }

  const addTokenToWallet = async () => {
    const eth = window.ethereum
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
    <div className="space-y-6">
      <Surface
        title="Create token now"
        right={
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/22 bg-primary/[0.09] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            App live inside the site
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Wallet</p>
                <p className="mt-2 text-sm font-bold text-white">{shortAddress(account)}</p>
              </div>
              <Wallet2 className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] px-5 text-sm font-black text-black shadow-[0_14px_34px_rgba(19,164,255,0.28)] transition hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isConnecting ? 'Connecting...' : account ? 'Reconnect' : 'Connect wallet'}
              </button>
              <button
                type="button"
                onClick={switchToInri}
                disabled={isSwitching}
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/16 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSwitching ? 'Switching...' : networkReady ? 'INRI CHAIN ready' : 'Switch to INRI'}
              </button>
            </div>
            {!providerReady && (
              <p className="mt-4 text-sm leading-6 text-amber-300/90">
                No wallet detected in this browser. Open the site with INRI Wallet, MetaMask or another EVM wallet.
              </p>
            )}
          </div>

          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Factory contract</p>
                <p className="mt-2 font-mono text-sm font-bold text-white">{FACTORY_ADDRESS}</p>
              </div>
              <button
                type="button"
                onClick={copyFactory}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.04] text-white transition hover:border-primary/55 hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-white/10 bg-black/25 px-4 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">Total created</div>
                <div className="mt-1 text-lg font-black text-white">{factoryCount}</div>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-black/25 px-4 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">Estimated gas</div>
                <div className="mt-1 text-lg font-black text-white">{gasEstimate ? `${gasEstimate}` : '-'}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`https://explorer.inri.life/address/${FACTORY_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
              >
                Open on explorer
                <ExternalLink className="h-4 w-4" />
              </Link>
              {copied && <span className="self-center text-xs font-bold uppercase tracking-[0.16em] text-primary">Copied</span>}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/48">Token name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Example: INRI COMMUNITY TOKEN"
                  className="mt-2 h-12 w-full rounded-[1rem] border border-white/12 bg-black/35 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/28 focus:border-primary/55"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/48">Symbol</span>
                <input
                  value={form.symbol}
                  onChange={(event) => setForm((current) => ({ ...current, symbol: event.target.value.toUpperCase().slice(0, 12) }))}
                  placeholder="Example: ICT"
                  className="mt-2 h-12 w-full rounded-[1rem] border border-white/12 bg-black/35 px-4 text-sm font-semibold uppercase text-white outline-none transition placeholder:text-white/28 focus:border-primary/55"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/48">Decimals</span>
                <input
                  inputMode="numeric"
                  value={form.decimals}
                  onChange={(event) => setForm((current) => ({ ...current, decimals: event.target.value.replace(/[^0-9]/g, '').slice(0, 3) }))}
                  placeholder="18"
                  className="mt-2 h-12 w-full rounded-[1rem] border border-white/12 bg-black/35 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/28 focus:border-primary/55"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/48">Initial supply</span>
                <input
                  inputMode="numeric"
                  value={form.supply}
                  onChange={(event) => setForm((current) => ({ ...current, supply: event.target.value.replace(/[^0-9,_\s]/g, '') }))}
                  placeholder="1000000"
                  className="mt-2 h-12 w-full rounded-[1rem] border border-white/12 bg-black/35 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/28 focus:border-primary/55"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createToken}
                disabled={isCreating}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] px-6 text-sm font-black text-black shadow-[0_14px_34px_rgba(19,164,255,0.28)] transition hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear form
              </button>
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-black/25 px-4 py-3 text-sm leading-7 text-white/72">
              <strong className="text-white">Important:</strong> the factory mints the full supply once and sends it to the connected wallet. Enter a whole-number supply like <strong className="text-white">1000000</strong>. The contract itself multiplies this by <strong className="text-white">10**decimals</strong> internally.
            </div>
          </div>

          <div className="rounded-[1.55rem] border border-white/10 bg-black/25 p-5">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-black">Launch preview</h3>
            </div>
            <div className="mt-4 space-y-3">
              {formSummary.map((item) => (
                <div key={item.label} className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/45">{item.label}</div>
                  <div className="mt-1 text-sm font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>
            {latestToken && (
              <div className="mt-4 rounded-[1rem] border border-primary/20 bg-primary/[0.08] px-4 py-3">
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Latest token from factory</div>
                <div className="mt-1 font-mono text-sm font-bold text-white">{latestToken}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-[1.45rem] border border-white/10 bg-black/25 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-white/78">{status}</span>
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-rose-300">{error}</p>}
          {txHash && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/72">
              <span className="font-bold text-white">Tx:</span>
              <Link href={`https://explorer.inri.life/tx/${txHash}`} target="_blank" rel="noreferrer" className="font-mono text-primary underline-offset-4 hover:underline">
                {txHash}
              </Link>
            </div>
          )}
          {createdToken && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`https://explorer.inri.life/address/${createdToken}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
              >
                Open token on explorer
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={addTokenToWallet}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/[0.10] px-5 text-sm font-bold text-primary transition hover:bg-primary/[0.16]"
              >
                Add token to wallet
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </Surface>
    </div>
  )
}
