'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Copy, ExternalLink, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react'

const FACTORY_ADDRESS = '0x1D760E78D92aA5B46b484bc054Bbfae11198B751'
const INRI_CHAIN_ID_HEX = '0xec1'
const CREATE_TOKEN_SELECTOR = 'b2cb1e5c'
const TOTAL_TOKENS_SELECTOR = '2f745c59'
const ALL_TOKENS_SELECTOR = 'fe2d1a7d'
const TOKEN_CREATED_TOPIC = '0x8f78f3f0d1fc8f1bd0d8c71dafb7f46d9ca5f0b2d9d4547892fb4e8d1ba6de0f'

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

  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`)

  const data = (await response.json()) as { result?: unknown; error?: { message?: string } }
  if (data.error) throw new Error(data.error.message || 'RPC error')
  return data.result
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
    <div className={`rounded-full border px-4 py-3 ${accent ? 'border-primary/26 bg-primary/[0.10]' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{label}</div>
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
        className={`mt-2 h-14 w-full rounded-[1.1rem] border border-white/12 bg-black/30 px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-primary/55 ${uppercase ? 'uppercase' : ''}`}
      />
      <div className="mt-2 text-sm leading-6 text-white/44">{helper}</div>
    </label>
  )
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

  const refreshFactoryStats = useCallback(async () => {
    try {
      const totalRaw = await rpcCall('eth_call', [{ to: FACTORY_ADDRESS, data: `0x${TOTAL_TOKENS_SELECTOR}` }, 'latest'])
      const total = parseHexToBigInt(totalRaw)
      setFactoryCount(total.toString())

      if (total > 0n) {
        const latestRaw = await rpcCall('eth_call', [{ to: FACTORY_ADDRESS, data: `0x${ALL_TOKENS_SELECTOR}${encodeUint(total - 1n)}` }, 'latest'])
        if (typeof latestRaw === 'string' && latestRaw.startsWith('0x') && latestRaw.length >= 66) {
          setLatestToken(`0x${latestRaw.slice(-40)}`)
        }
      }
    } catch {
      setFactoryCount('-')
      setLatestToken(null)
    }
  }, [])

  useEffect(() => {
    refreshFactoryStats().catch(() => undefined)
  }, [refreshFactoryStats])

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

  const estimateGas = async () => {
    const eth = getEthereum()
    if (!eth || !account || !networkReady) return
    try {
      const cleanSupply = sanitizeSupply(form.supply)
      if (!form.name || !form.symbol || !cleanSupply) return
      const decimals = Number(form.decimals)
      const data = encodeCreateToken(form.name.trim(), form.symbol.trim(), decimals, BigInt(cleanSupply))
      const gas = (await eth.request({ method: 'eth_estimateGas', params: [{ from: account, to: FACTORY_ADDRESS, data }] })) as string
      setGasEstimate(BigInt(gas).toString())
    } catch {
      setGasEstimate(null)
    }
  }

  useEffect(() => {
    estimateGas().catch(() => undefined)
  }, [form.name, form.symbol, form.decimals, form.supply, account, networkReady])

  const createToken = async () => {
    const eth = getEthereum()
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

    if (!name) return setError('Token name is required.')
    if (!symbol) return setError('Token symbol is required.')
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) return setError('Decimals must be an integer between 0 and 255.')
    if (!/^\d+$/.test(cleanSupply) || BigInt(cleanSupply) <= 0n) return setError('Supply must be a whole number greater than zero.')

    try {
      setError(null)
      setIsCreating(true)
      setTxHash(null)
      setCreatedToken(null)
      setStatus('Waiting for wallet confirmation...')

      const data = encodeCreateToken(name, symbol, decimals, BigInt(cleanSupply))
      let gasHex: string | undefined
      try {
        const estimated = (await eth.request({ method: 'eth_estimateGas', params: [{ from: account, to: FACTORY_ADDRESS, data }] })) as string
        const boosted = (BigInt(estimated) * 125n) / 100n
        gasHex = `0x${boosted.toString(16)}`
        setGasEstimate(boosted.toString())
      } catch {
        gasHex = undefined
      }

      const hash = (await eth.request({
        method: 'eth_sendTransaction',
        params: [{ from: account, to: FACTORY_ADDRESS, data, ...(gasHex ? { gas: gasHex } : {}) }],
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
        throw new Error('Transaction reverted. The form values look valid, so check the wallet gas details and confirm the live factory matches the intended contract version.')
      }

      const tokenLog = receipt.logs?.find(
        (log) => log.address?.toLowerCase() === FACTORY_ADDRESS.toLowerCase() && log.topics?.[0]?.toLowerCase() === TOKEN_CREATED_TOPIC.toLowerCase(),
      )
      const created = parseCreatedTokenFromLogData(tokenLog?.data)

      if (created && isValidAddress(created)) {
        setCreatedToken(created)
        setStatus('Token created successfully. Open it on the explorer or add it to the wallet.')
      } else {
        setStatus('Token created. Open the explorer transaction to see the new contract address.')
      }

      await refreshFactoryStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token creation failed.')
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
    <Surface className="p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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

          <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Launch form</div>
                <h2 className="mt-2 text-2xl font-black text-white">Create the token from one clean panel</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] px-6 text-sm font-black text-black shadow-[0_14px_34px_rgba(19,164,255,0.28)] transition hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isConnecting ? 'Connecting...' : account ? 'Reconnect wallet' : 'Connect wallet'}
                </button>
                <button
                  type="button"
                  onClick={switchToInri}
                  disabled={isSwitching}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSwitching ? 'Switching...' : networkReady ? 'INRI CHAIN ready' : 'Switch network'}
                </button>
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
                helper="Enter a whole number. The contract multiplies it by 10**decimals."
                inputMode="numeric"
              />
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-primary/16 bg-primary/[0.08] p-4 text-sm leading-7 text-white/72">
              <strong className="text-white">Important:</strong> the factory mints the full supply once and sends it to the connected wallet.
              Use a whole-number supply such as <strong className="text-white">1000000</strong>. The contract applies <strong className="text-white">10**decimals</strong> internally.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
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
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-black">Launch preview</h3>
            </div>
            <div className="mt-5 space-y-3">
              {previewItems.map((item) => (
                <div key={item.label} className="rounded-[1.1rem] border border-white/10 bg-black/26 px-4 py-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/46">{item.label}</div>
                  <div className="mt-2 text-base font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Factory contract</div>
            <div className="mt-3 break-all font-mono text-sm font-bold text-white">{FACTORY_ADDRESS}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyFactory}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy'}
              </button>
              <Link
                href={`https://explorer.inri.life/address/${FACTORY_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 text-sm font-bold text-white transition hover:border-primary/55 hover:bg-primary/10"
              >
                Explorer
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 text-sm leading-7 text-white/56">
              Function: <span className="font-semibold text-white">createToken(name, symbol, decimals, supply)</span>
            </div>
            {gasEstimate ? <div className="mt-2 text-sm leading-7 text-white/56">Estimated gas: <span className="font-semibold text-white">{gasEstimate}</span></div> : null}
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-white/78">{status}</span>
            </div>
            {error ? <p className="mt-3 text-sm font-semibold leading-7 text-rose-300">{error}</p> : null}
            {txHash ? (
              <div className="mt-4 text-sm text-white/72">
                <div className="font-bold text-white">Transaction</div>
                <Link href={`https://explorer.inri.life/tx/${txHash}`} target="_blank" rel="noreferrer" className="mt-2 inline-block break-all font-mono text-primary underline-offset-4 hover:underline">
                  {txHash}
                </Link>
              </div>
            ) : null}
            {createdToken ? (
              <div className="mt-5 flex flex-wrap gap-3">
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
                </button>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.6rem] border border-amber-400/14 bg-amber-500/[0.05] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-300" />
              <div>
                <div className="text-sm font-black text-white">If the transaction reverts</div>
                <div className="mt-2 text-sm leading-7 text-white/66">
                  The values in your screenshot are valid for the Solidity code you shared. When a launch still reverts, the most likely causes are insufficient gas in the wallet transaction or the live factory bytecode not matching the expected contract version.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Surface>
  )
}
