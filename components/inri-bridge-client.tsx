'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Direction = 'buy' | 'sell'
type BridgeStatus = 'idle' | 'checking' | 'waiting' | 'ready' | 'claimed' | 'error'
type Provider = { request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown> }

type TxPayload = { to: string; data: string; value?: string }
type Settlement = {
  status: BridgeStatus
  message: string
  id?: string
  tx?: TxPayload | null
}

const POLYGON_CHAIN_ID = '0x89'
const INRI_CHAIN_ID = '0xec1'
const BRIDGE_API = 'https://iusd-bridge.inri.life'
const POLYGON_USDT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const POLYGON_LOCKBOX = '0x7E2e6d4881e1470D541599397b4876b449296071'
const INRI_IUSD = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'
const FEE_BPS = 20n
const BPS_DENOMINATOR = 10000n

const SELECTOR = {
  approve: '0x095ea7b3',
  allowance: '0xdd62ed3e',
  balanceOf: '0x70a08231',
  decimals: '0x313ce567',
  deposit: '0xb6b55f25',
  burn: '0x42966c68',
}

function getEthereum(): Provider | null {
  if (typeof window === 'undefined') return null
  return ((window as unknown as { ethereum?: Provider }).ethereum) || null
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function normalizeChainId(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

function shortHash(value?: string, left = 8, right = 6) {
  if (!value) return '—'
  if (value.length <= left + right + 3) return value
  return `${value.slice(0, left)}...${value.slice(-right)}`
}

function isAddress(value?: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value || '')
}

function isBytes32(value?: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(value || '') && !/^0x0+$/.test(value || '')
}

function pad64(value: string) {
  return value.replace(/^0x/, '').padStart(64, '0')
}

function encAddress(address: string) {
  return pad64(address.toLowerCase())
}

function encUint(value: bigint) {
  return value.toString(16).padStart(64, '0')
}

function parseUnits(input: string, decimals = 6) {
  const clean = input.trim().replace(',', '.')
  if (!clean || clean === '.' || !/^\d*(\.\d*)?$/.test(clean)) return 0n
  const [wholeRaw, fractionRaw = ''] = clean.split('.')
  const whole = BigInt(wholeRaw || '0') * 10n ** BigInt(decimals)
  const fraction = BigInt((fractionRaw.slice(0, decimals).padEnd(decimals, '0')) || '0')
  return whole + fraction
}

function formatUnits(value: bigint, decimals = 6, maxFraction = 6) {
  const base = 10n ** BigInt(decimals)
  const whole = value / base
  const fraction = (value % base).toString().padStart(decimals, '0').slice(0, maxFraction).replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : whole.toString()
}

function makeApproveData(spender: string, amount: bigint) {
  return `${SELECTOR.approve}${encAddress(spender)}${encUint(amount)}`
}

function makeAllowanceData(owner: string, spender: string) {
  return `${SELECTOR.allowance}${encAddress(owner)}${encAddress(spender)}`
}

function makeBalanceData(owner: string) {
  return `${SELECTOR.balanceOf}${encAddress(owner)}`
}

function makeAmountCallData(selector: string, amount: bigint) {
  return `${selector}${encUint(amount)}`
}

async function ethCall(provider: Provider, to: string, data: string, from?: string) {
  const result = await provider.request({ method: 'eth_call', params: [{ to, data, ...(from ? { from } : {}) }, 'latest'] })
  return typeof result === 'string' ? result : '0x0'
}

async function sendTransaction(provider: Provider, from: string, to: string, data: string, value?: string) {
  const tx = { from, to, data, ...(value ? { value } : {}) }
  await provider.request({ method: 'eth_estimateGas', params: [tx] })
  const hash = await provider.request({ method: 'eth_sendTransaction', params: [tx] })
  if (typeof hash !== 'string') throw new Error('A carteira não retornou o hash da transação.')
  return hash
}

async function waitReceipt(provider: Provider, hash: string, onTick?: () => void) {
  for (let i = 0; i < 90; i += 1) {
    const receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [hash] })
    if (receipt && typeof receipt === 'object') return receipt as Record<string, unknown>
    onTick?.()
    await sleep(3000)
  }
  return null
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean).map((value) => value.toLowerCase()))]
}

function extractBridgeIds(receipt: Record<string, unknown> | null, preferredContract: string, txHash: string) {
  const preferred: string[] = []
  const fallback: string[] = []
  const logs = Array.isArray(receipt?.logs) ? receipt.logs : []

  for (const rawLog of logs) {
    if (!rawLog || typeof rawLog !== 'object') continue
    const log = rawLog as { address?: string; topics?: unknown[]; data?: string }
    const target = String(log.address || '').toLowerCase() === preferredContract.toLowerCase() ? preferred : fallback
    const topics = Array.isArray(log.topics) ? log.topics.slice(1) : []

    for (const topic of topics) {
      if (typeof topic === 'string' && isBytes32(topic)) target.push(topic)
    }

    const data = typeof log.data === 'string' ? log.data.replace(/^0x/, '') : ''
    for (let i = 0; i + 64 <= data.length; i += 64) {
      const chunk = `0x${data.slice(i, i + 64)}`
      if (isBytes32(chunk)) target.push(chunk)
    }
  }

  return unique([...preferred, ...fallback, txHash])
}

function findTxPayload(value: unknown): TxPayload | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const candidates = [record, record.tx, record.transaction, record.request, record.claimTx, record.releaseTx, record.call, record.payload, record.result]

  for (const item of candidates) {
    if (!item || typeof item !== 'object') continue
    const candidate = item as Record<string, unknown>
    const to = candidate.to || candidate.target || candidate.contract || candidate.contractAddress
    const data = candidate.data || candidate.calldata || candidate.input
    const txValue = candidate.value

    if (typeof to === 'string' && typeof data === 'string' && isAddress(to) && data.startsWith('0x')) {
      return { to, data, value: typeof txValue === 'string' ? txValue : undefined }
    }
  }

  for (const item of Object.values(record)) {
    const found = findTxPayload(item)
    if (found) return found
  }

  return null
}

function looksReady(value: unknown) {
  if (!value || typeof value !== 'object') return false
  if (findTxPayload(value)) return true
  const record = value as Record<string, unknown>
  const status = String(record.status || record.state || record.phase || '').toLowerCase()
  if (['ready', 'claimable', 'claim_ready', 'release_ready', 'ok'].includes(status)) return true
  if (record.ready === true || record.claimable === true || record.releaseReady === true) return true
  if (Array.isArray(record.signatures) && record.signatures.length >= 2) return true
  return false
}

async function switchOrAddChain(provider: Provider, chainId: string) {
  const polygon = normalizeChainId(chainId) === POLYGON_CHAIN_ID
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] })
  } catch {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        polygon
          ? {
              chainId: POLYGON_CHAIN_ID,
              chainName: 'Polygon PoS',
              nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
              rpcUrls: ['https://polygon-rpc.com'],
              blockExplorerUrls: ['https://polygonscan.com'],
            }
          : {
              chainId: INRI_CHAIN_ID,
              chainName: 'INRI CHAIN',
              nativeCurrency: { name: 'INRI', symbol: 'INRI', decimals: 18 },
              rpcUrls: ['https://rpc.inri.life'],
              blockExplorerUrls: ['https://explorer.inri.life'],
            },
      ],
    })
  }
}

function transactionUrl(chainId: string, hash: string) {
  return normalizeChainId(chainId) === POLYGON_CHAIN_ID ? `https://polygonscan.com/tx/${hash}` : `https://explorer.inri.life/tx/${hash}`
}

export function InriBridgeClient() {
  const [provider, setProvider] = useState<Provider | null>(null)
  const [address, setAddress] = useState('')
  const [chainId, setChainId] = useState('')
  const [direction, setDirection] = useState<Direction>('buy')
  const [amount, setAmount] = useState('1')
  const [decimals, setDecimals] = useState(6)
  const [balance, setBalance] = useState<bigint | null>(null)
  const [allowance, setAllowance] = useState<bigint | null>(null)
  const [sourceTx, setSourceTx] = useState('')
  const [ids, setIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('Conecte a carteira, escolha Buy ou Sell e faça tudo em uma tela só.')
  const [error, setError] = useState('')
  const [settlement, setSettlement] = useState<Settlement>({ status: 'idle', message: 'Nenhuma operação iniciada ainda.' })

  const sourceChain = direction === 'buy' ? POLYGON_CHAIN_ID : INRI_CHAIN_ID
  const targetChain = direction === 'buy' ? INRI_CHAIN_ID : POLYGON_CHAIN_ID
  const amountRaw = useMemo(() => parseUnits(amount, decimals), [amount, decimals])
  const receiveRaw = useMemo(() => (amountRaw * (BPS_DENOMINATOR - FEE_BPS)) / BPS_DENOMINATOR, [amountRaw])
  const receive = useMemo(() => formatUnits(receiveRaw, decimals, 6), [receiveRaw, decimals])
  const hasAllowance = direction === 'sell' || (allowance !== null && allowance >= amountRaw && amountRaw > 0n)
  const hasBalance = balance === null || amountRaw <= balance

  const route = direction === 'buy'
    ? {
        title: 'Buy iUSD',
        from: 'Polygon',
        to: 'INRI Chain',
        fromToken: 'USDT',
        toToken: 'iUSD',
        sourceContract: POLYGON_LOCKBOX,
        token: POLYGON_USDT,
        actionLabel: 'Deposit USDT',
        claimLabel: 'Claim iUSD',
        api: `${BRIDGE_API}/api/claim`,
        actionData: makeAmountCallData(SELECTOR.deposit, amountRaw),
      }
    : {
        title: 'Sell iUSD',
        from: 'INRI Chain',
        to: 'Polygon',
        fromToken: 'iUSD',
        toToken: 'USDT',
        sourceContract: INRI_IUSD,
        token: INRI_IUSD,
        actionLabel: 'Burn iUSD',
        claimLabel: 'Claim USDT',
        api: `${BRIDGE_API}/api/release`,
        actionData: makeAmountCallData(SELECTOR.burn, amountRaw),
      }

  useEffect(() => {
    const eth = getEthereum()
    setProvider(eth)
    if (!eth) return

    eth.request({ method: 'eth_accounts' }).then((accounts) => {
      if (Array.isArray(accounts) && typeof accounts[0] === 'string') setAddress(accounts[0])
    }).catch(() => undefined)

    eth.request({ method: 'eth_chainId' }).then((id) => setChainId(normalizeChainId(id))).catch(() => undefined)

    const ethereum = (window as unknown as { ethereum?: Provider & { on?: Function; removeListener?: Function } }).ethereum
    const onAccounts = (accounts: string[]) => setAddress(accounts?.[0] || '')
    const onChain = (id: string) => setChainId(normalizeChainId(id))
    ethereum?.on?.('accountsChanged', onAccounts)
    ethereum?.on?.('chainChanged', onChain)

    return () => {
      ethereum?.removeListener?.('accountsChanged', onAccounts)
      ethereum?.removeListener?.('chainChanged', onChain)
    }
  }, [])

  useEffect(() => {
    setAllowance(null)
    setBalance(null)
    setSourceTx('')
    setIds([])
    setSettlement({ status: 'idle', message: 'Nenhuma operação iniciada ainda.' })
    setError('')
  }, [direction])

  useEffect(() => {
    void refreshTokenState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, address, chainId, direction, amount])

  async function connect() {
    const eth = provider || getEthereum()
    if (!eth) {
      setError('MetaMask ou carteira EVM não encontrada neste navegador.')
      return
    }

    setProvider(eth)
    setBusy(true)
    setError('')
    try {
      const accounts = await eth.request({ method: 'eth_requestAccounts' })
      const id = await eth.request({ method: 'eth_chainId' })
      if (Array.isArray(accounts) && typeof accounts[0] === 'string') setAddress(accounts[0])
      setChainId(normalizeChainId(id))
      setStatus('Carteira conectada. Agora siga o botão principal do bridge.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conexão rejeitada pela carteira.')
    } finally {
      setBusy(false)
    }
  }

  async function refreshTokenState() {
    if (!provider || !address) return
    try {
      const [rawBalance, rawDecimals] = await Promise.all([
        ethCall(provider, route.token, makeBalanceData(address), address),
        ethCall(provider, route.token, SELECTOR.decimals, address),
      ])
      const nextDecimals = Number.parseInt(rawDecimals || '0x6', 16)
      const safeDecimals = Number.isFinite(nextDecimals) && nextDecimals > 0 && nextDecimals <= 36 ? nextDecimals : 6
      setDecimals(safeDecimals)
      setBalance(BigInt(rawBalance || '0x0'))

      if (direction === 'buy') {
        const rawAllowance = await ethCall(provider, POLYGON_USDT, makeAllowanceData(address, POLYGON_LOCKBOX), address)
        setAllowance(BigInt(rawAllowance || '0x0'))
      }
    } catch {
      // Do not block the UI if balance reads fail while the user is on the wrong network.
    }
  }

  async function runMainAction() {
    if (!provider || !address) {
      await connect()
      return
    }
    if (amountRaw <= 0n) {
      setError('Digite um valor válido.')
      return
    }
    if (chainId !== sourceChain) {
      setBusy(true)
      setError('')
      try {
        await switchOrAddChain(provider, sourceChain)
        setChainId(sourceChain)
        setStatus(`Rede alterada para ${route.from}.`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível trocar a rede.')
      } finally {
        setBusy(false)
      }
      return
    }
    if (!hasBalance) {
      setError(`Saldo insuficiente de ${route.fromToken}.`)
      return
    }

    setBusy(true)
    setError('')
    try {
      if (direction === 'buy' && !hasAllowance) {
        setStatus('Aprovando USDT para o lockbox Polygon...')
        const approveHash = await sendTransaction(provider, address, POLYGON_USDT, makeApproveData(POLYGON_LOCKBOX, amountRaw))
        setStatus(`Approve enviado: ${shortHash(approveHash, 10, 8)}. Aguardando confirmação...`)
        await waitReceipt(provider, approveHash)
        await refreshTokenState()
        setStatus('Approve confirmado. Clique novamente para fazer o depósito.')
        return
      }

      setStatus(`${route.actionLabel} sendo enviado pela carteira...`)
      const txHash = await sendTransaction(provider, address, route.sourceContract, route.actionData)
      setSourceTx(txHash)
      setStatus(`${route.actionLabel} enviado: ${shortHash(txHash, 10, 8)}. Aguardando confirmação...`)
      const receipt = await waitReceipt(provider, txHash, () => setStatus('Aguardando confirmação do bloco...'))
      const foundIds = extractBridgeIds(receipt, route.sourceContract, txHash)
      setIds(foundIds)
      setSettlement({ status: 'checking', message: 'Transação confirmada. Conferindo assinaturas do watcher automaticamente...', id: foundIds[0] })
      await checkSettlement(foundIds)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A transação do bridge falhou.')
    } finally {
      setBusy(false)
    }
  }

  async function checkSettlement(nextIds = ids) {
    const list = unique(nextIds)
    if (!list.length) return

    setSettlement((old) => ({ ...old, status: 'checking', message: 'Consultando watcher do bridge...' }))
    for (const id of list) {
      try {
        const response = await fetch(`${route.api}/${encodeURIComponent(id)}`, { cache: 'no-store' })
        if (!response.ok) continue
        const data = await response.json() as unknown
        const tx = findTxPayload(data)
        const ready = looksReady(data)
        setSettlement({
          id,
          tx,
          status: ready ? 'ready' : 'waiting',
          message: ready ? 'Assinaturas prontas. Claim disponível.' : 'Operação encontrada, aguardando assinaturas.',
        })
        return
      } catch (err) {
        setSettlement({ id, status: 'error', message: err instanceof Error ? err.message : 'Não foi possível consultar a API do bridge.' })
        return
      }
    }

    setSettlement({ id: list[0], status: 'waiting', message: 'Watcher ainda não publicou esta operação. Aguarde alguns segundos e consulte novamente.' })
  }

  async function claim() {
    if (!provider || !address) {
      await connect()
      return
    }

    const id = settlement.id || ids[0]
    if (!id) return

    if (chainId !== targetChain) {
      setBusy(true)
      setError('')
      try {
        await switchOrAddChain(provider, targetChain)
        setChainId(targetChain)
        setStatus(`Rede alterada para ${route.to}. Clique em claim novamente.`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível trocar para a rede de destino.')
      } finally {
        setBusy(false)
      }
      return
    }

    if (!settlement.tx) {
      const legacyPath = direction === 'buy' ? 'claim.html' : 'sell.html'
      window.open(`${BRIDGE_API}/${legacyPath}${direction === 'buy' ? `?id=${encodeURIComponent(id)}` : ''}`, '_blank', 'noopener,noreferrer')
      setStatus('A API não expôs calldata direto nesta tela. Abri a página antiga apenas como recuperação.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const hash = await sendTransaction(provider, address, settlement.tx.to, settlement.tx.data, settlement.tx.value)
      setStatus(`${route.claimLabel} enviado: ${shortHash(hash, 10, 8)}.`)
      await waitReceipt(provider, hash)
      setSettlement((old) => ({ ...old, status: 'claimed', message: 'Bridge concluído com sucesso.' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim falhou.')
    } finally {
      setBusy(false)
    }
  }

  async function addIusdToken() {
    const eth = provider || getEthereum()
    if (!eth) {
      await connect()
      return
    }
    try {
      await eth.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: INRI_IUSD,
            symbol: 'iUSD',
            decimals: 6,
            image: 'https://platform.inri.life/inri-logo.png',
          },
        },
      })
    } catch {
      // User rejected or wallet does not support watchAsset.
    }
  }

  const actionText = !address
    ? 'Connect Wallet'
    : chainId !== sourceChain
      ? `Switch to ${route.from}`
      : direction === 'buy' && !hasAllowance
        ? 'Approve USDT'
        : route.actionLabel

  const processSteps = [
    { title: 'Wallet', text: address ? shortHash(address) : 'Conectar carteira', done: Boolean(address) },
    { title: 'Rede origem', text: chainId === sourceChain ? route.from : `Trocar para ${route.from}`, done: chainId === sourceChain },
    { title: direction === 'buy' ? 'Approve / Deposit' : 'Burn', text: sourceTx ? shortHash(sourceTx, 10, 8) : 'Aguardando envio', done: Boolean(sourceTx) },
    { title: 'Watcher', text: settlement.message, done: settlement.status === 'ready' || settlement.status === 'claimed' },
  ]

  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
      <section className="relative border-b border-cyan-300/15 bg-[radial-gradient(circle_at_18%_12%,rgba(0,174,255,0.45),transparent_28rem),radial-gradient(circle_at_84%_18%,rgba(122,232,255,0.22),transparent_34rem),linear-gradient(135deg,#071a32_0%,#02040a_45%,#000_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:py-16 xl:px-12">
          <div className="flex flex-col justify-center">
            <div className="w-fit rounded-[12px] border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">Official iUSD Bridge</div>
            <h1 className="mt-8 max-w-5xl text-[3.1rem] font-black leading-[0.86] tracking-[-0.075em] text-white sm:text-[4.8rem] xl:text-[6.3rem]">Buy and sell iUSD in one clean screen.</h1>
            <p className="mt-8 max-w-3xl text-lg leading-9 text-cyan-50/72">
              Polygon USDT to INRI iUSD, and iUSD back to Polygon USDT. The page keeps approve, deposit/burn, watcher check and claim in a single professional flow.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[['0.2%', 'Bridge fee'], ['2 signatures', 'Threshold'], ['3777', 'INRI chain']].map(([value, label]) => (
                <div key={label} className="border-l-2 border-cyan-300/70 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/70">{label}</p>
                  <p className="mt-2 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-cyan-300/20 bg-white/[0.06] p-3 shadow-[0_44px_140px_rgba(0,0,0,0.50)] backdrop-blur-2xl sm:p-5">
            <div className="rounded-[25px] border border-white/12 bg-[#030910]/95 p-4 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Bridge</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">iUSD Transfer</h2>
                </div>
                <button type="button" onClick={connect} disabled={busy} className="rounded-[16px] bg-cyan-300 px-5 py-3 text-sm font-black text-black transition hover:bg-cyan-200 disabled:opacity-60">
                  {address ? shortHash(address) : 'Connect Wallet'}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 rounded-[18px] border border-white/10 bg-black/30 p-1.5">
                <button type="button" onClick={() => setDirection('buy')} className={`rounded-[14px] px-4 py-3 text-sm font-black transition ${direction === 'buy' ? 'bg-cyan-300 text-black' : 'text-white/58 hover:bg-white/[0.055] hover:text-white'}`}>Buy iUSD</button>
                <button type="button" onClick={() => setDirection('sell')} className={`rounded-[14px] px-4 py-3 text-sm font-black transition ${direction === 'sell' ? 'bg-cyan-300 text-black' : 'text-white/58 hover:bg-white/[0.055] hover:text-white'}`}>Sell iUSD</button>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[22px] border border-white/12 bg-black/24 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">From</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-3xl font-black text-white">{route.fromToken}</p>
                      <p className="mt-1 text-sm font-bold text-cyan-200/70">{route.from}</p>
                    </div>
                    <span className="rounded-[12px] border border-cyan-300/25 bg-cyan-300/[0.10] px-3 py-2 text-xs font-black text-cyan-100">Source</span>
                  </div>
                </div>
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-cyan-300 text-2xl font-black text-black shadow-[0_16px_38px_rgba(19,164,255,0.30)]">↓</div>
                <div className="rounded-[22px] border border-white/12 bg-black/24 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">To</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-3xl font-black text-white">{route.toToken}</p>
                      <p className="mt-1 text-sm font-bold text-cyan-200/70">{route.to}</p>
                    </div>
                    <span className="rounded-[12px] border border-white/12 bg-white/[0.05] px-3 py-2 text-xs font-black text-white/70">Destination</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/12 bg-black/24 p-5">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">Amount</label>
                  <button type="button" onClick={() => balance !== null && setAmount(formatUnits(balance, decimals, 6))} className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200/80 hover:text-white">Max</button>
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" className="min-w-0 flex-1 bg-transparent text-4xl font-black tracking-[-0.05em] text-white outline-none placeholder:text-white/20" placeholder="0.00" />
                  <span className="mb-1 rounded-[12px] border border-cyan-300/25 bg-cyan-300/[0.10] px-3 py-2 text-sm font-black text-cyan-100">{route.fromToken}</span>
                </div>
                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-white/42">You receive</p>
                    <p className="mt-1 font-black text-white">≈ {receive} {route.toToken}</p>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-white/42">Fee</p>
                    <p className="mt-1 font-black text-white">0.2%</p>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-white/42">Balance</p>
                    <p className="mt-1 font-black text-white">{balance === null ? '—' : `${formatUnits(balance, decimals, 4)} ${route.fromToken}`}</p>
                  </div>
                </div>
              </div>

              {error ? <div className="mt-4 rounded-[18px] border border-red-300/25 bg-red-300/[0.08] p-4 text-sm leading-6 text-red-100">{error}</div> : null}

              <div className="mt-5 grid gap-3">
                <button type="button" onClick={runMainAction} disabled={busy || amountRaw <= 0n || !hasBalance} className="min-h-14 rounded-[18px] bg-cyan-300 px-5 py-4 text-base font-black text-black shadow-[0_18px_48px_rgba(19,164,255,0.30)] transition hover:bg-cyan-200 disabled:opacity-50">
                  {busy ? 'Processing...' : actionText}
                </button>

                {(settlement.status === 'ready' || settlement.status === 'claimed') ? (
                  <button type="button" onClick={claim} disabled={busy || settlement.status === 'claimed'} className="min-h-13 rounded-[18px] border border-emerald-300/30 bg-emerald-300/[0.12] px-5 py-4 text-base font-black text-emerald-50 transition hover:bg-emerald-300/[0.16] disabled:opacity-50">
                    {settlement.status === 'claimed' ? 'Completed' : chainId === targetChain ? route.claimLabel : `Switch to ${route.to} to claim`}
                  </button>
                ) : null}

                {ids.length ? (
                  <button type="button" onClick={() => void checkSettlement()} className="min-h-12 rounded-[18px] border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-black text-white/72 transition hover:text-white">
                    Check watcher again
                  </button>
                ) : null}
              </div>

              <div className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/58">
                <p className="font-bold text-white/78">Status</p>
                <p className="mt-1">{status}</p>
                <p className="mt-1">{settlement.message}</p>
                {settlement.id ? <p className="mt-1 break-all text-cyan-200/70">Bridge ID: {settlement.id}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#02040a] py-12">
        <div className="mx-auto grid max-w-[1560px] gap-5 px-4 sm:px-8 lg:grid-cols-[1fr_0.8fr] xl:px-12">
          <div className="rounded-[26px] border border-cyan-300/18 bg-white/[0.045] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.36)] sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Live process</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Bridge timeline</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {processSteps.map((step) => (
                <div key={step.title} className="rounded-[18px] border border-white/12 bg-black/24 p-4">
                  <p className="font-black text-white">{step.done ? '✓ ' : ''}{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{step.text}</p>
                </div>
              ))}
            </div>
            {sourceTx ? (
              <Link href={transactionUrl(sourceChain, sourceTx)} target="_blank" rel="noreferrer" className="mt-5 block rounded-[18px] border border-white/10 bg-black/24 p-4 text-sm font-black text-cyan-100 transition hover:border-cyan-300/30">
                Source TX: {shortHash(sourceTx, 10, 8)}
              </Link>
            ) : null}
          </div>

          <div className="rounded-[26px] border border-cyan-300/18 bg-white/[0.045] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.36)] sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Safety</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Bridge engine unchanged</h2>
            <p className="mt-4 text-sm leading-7 text-white/58">
              This page only improves the official platform UX. Contracts, watchers, signatures, claims, releases and PM2 processes stay untouched.
            </p>
            <div className="mt-6 grid gap-3">
              <button type="button" onClick={addIusdToken} className="rounded-[14px] border border-cyan-300/25 bg-cyan-300/[0.09] px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/[0.13]">Add iUSD Token</button>
              <Link href={`${BRIDGE_API}/${direction === 'buy' ? 'buy.html' : 'sell.html'}`} target="_blank" rel="noreferrer" className="rounded-[14px] border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/72 transition hover:text-white">Emergency old page only</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
