#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const CACHE_PATH = path.join(ROOT, '.github', 'data', 'mining-championship-cache.json')
const FEED_PATH = path.join(ROOT, 'public', 'mining-championship.json')

const nowIso = () => new Date().toISOString()
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const env = {
  rpcUrl: process.env.CHAMPIONSHIP_RPC_URL || 'https://rpc.inri.life',
  poolsApiUrl: process.env.CHAMPIONSHIP_POOLS_API_URL || 'https://poolapi.inri.life/api/pools',
  poolId: process.env.CHAMPIONSHIP_POOL_ID || 'inri-solo',
  poolPayoutAddress: (process.env.CHAMPIONSHIP_POOL_PAYOUT_ADDRESS || '').toLowerCase(),
  startBlock: Number(process.env.CHAMPIONSHIP_START_BLOCK || 1000000),
  endBlock: Number(process.env.CHAMPIONSHIP_END_BLOCK || 1500000),
  baseRewardPerBlock: Number(process.env.CHAMPIONSHIP_BASE_REWARD_PER_BLOCK || 0.2),
  maxBlocksPerRun: Number(process.env.CHAMPIONSHIP_MAX_BLOCKS_PER_RUN || 2000),
  poolPagesPerRun: Number(process.env.CHAMPIONSHIP_POOL_PAGES_PER_RUN || 25),
  poolPageSize: Number(process.env.CHAMPIONSHIP_POOL_PAGE_SIZE || 100),
  requestDelayMs: Number(process.env.CHAMPIONSHIP_REQUEST_DELAY_MS || 0),
  debug: /^true$/i.test(process.env.CHAMPIONSHIP_DEBUG || ''),
}

function log(...args) {
  console.log('[championship]', ...args)
}

function normalizeAddress(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return /^0x[a-fA-F0-9]{40}$/.test(trimmed) ? trimmed.toLowerCase() : ''
}

function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    if (!value) return 0
    if (value.startsWith('0x')) return parseInt(value, 16)
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : 0
  }
  return 0
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function rpc(method, params) {
  const response = await fetch(env.rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })

  if (!response.ok) {
    throw new Error(`RPC ${method} failed with HTTP ${response.status}`)
  }

  const json = await response.json()
  if (json.error) {
    throw new Error(`RPC ${method} error: ${json.error.message || 'unknown error'}`)
  }

  return json.result
}

async function getCurrentBlock() {
  return toNumber(await rpc('eth_blockNumber', []))
}

async function getBlock(blockNumber) {
  const hex = `0x${blockNumber.toString(16)}`
  return rpc('eth_getBlockByNumber', [hex, false])
}

function extractPoolBlocks(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.blocks)) return payload.blocks
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.result)) return payload.result
  if (Array.isArray(payload?.response)) return payload.response
  return []
}

function extractPoolBlockHeight(item) {
  return toNumber(item?.blockHeight ?? item?.height ?? item?.blockheight ?? item?.block ?? item?.number)
}

function extractPoolMiner(item) {
  const candidates = [
    item?.miner,
    item?.address,
    item?.wallet,
    item?.rewardAddress,
    item?.user,
    item?.worker,
    item?.minerAddress,
    item?.account,
  ]

  for (const candidate of candidates) {
    const normalized = normalizeAddress(candidate)
    if (normalized) return normalized
  }

  if (typeof item?.worker === 'string') {
    const match = item.worker.match(/0x[a-fA-F0-9]{40}/)
    if (match) return normalizeAddress(match[0])
  }

  return ''
}

function poolBlockLooksValid(item) {
  const status = String(item?.status ?? '').toLowerCase()
  if (status.includes('orphan')) return false
  if (status.includes('pending')) return false
  if (status.includes('immature')) return false
  return true
}

async function fetchPoolAttributions(startBlock, endBlock) {
  const map = new Map()
  const base = env.poolsApiUrl.replace(/\/$/, '')
  if (!base || !env.poolId) return map

  for (let page = 0; page < env.poolPagesPerRun; page += 1) {
    const url = `${base}/${encodeURIComponent(env.poolId)}/blocks?page=${page}&pageSize=${env.poolPageSize}`
    let response

    try {
      response = await fetch(url, { headers: { accept: 'application/json' } })
    } catch (error) {
      log(`Pool fetch failed on page ${page}: ${error instanceof Error ? error.message : String(error)}`)
      break
    }

    if (!response.ok) {
      if (page === 0) {
        log(`Pool blocks endpoint not available (${response.status}). Continuing with chain-only data.`)
      }
      break
    }

    const payload = await response.json()
    const blocks = extractPoolBlocks(payload)
    if (!blocks.length) break

    let foundOlderThanRange = false

    for (const item of blocks) {
      const height = extractPoolBlockHeight(item)
      if (!height) continue
      if (height < startBlock) {
        foundOlderThanRange = true
        continue
      }
      if (height > endBlock) continue
      if (!poolBlockLooksValid(item)) continue

      const miner = extractPoolMiner(item)
      if (!miner) continue
      map.set(height, miner)
    }

    if (env.debug) {
      log(`Pool page ${page}: ${blocks.length} rows, matched ${map.size} solo attributions so far`)
    }

    if (blocks.length < env.poolPageSize || foundOlderThanRange) break
    if (env.requestDelayMs > 0) await sleep(env.requestDelayMs)
  }

  return map
}

function ensureParticipant(store, address) {
  const key = normalizeAddress(address)
  if (!key) return null
  if (!store[key]) {
    store[key] = {
      address,
      blocks: 0,
      lastBlock: 0,
      chainSoloBlocks: 0,
      poolSoloBlocks: 0,
    }
  }
  return store[key]
}

async function main() {
  const fallbackFeed = await readJson(FEED_PATH, {
    mode: 'preview',
    updatedAt: nowIso(),
    currentBlock: env.startBlock,
    startBlock: env.startBlock,
    endBlock: env.endBlock,
    baseRewardPerBlock: env.baseRewardPerBlock,
    participants: [],
  })

  const fallbackCache = await readJson(CACHE_PATH, {
    version: 1,
    lastScannedBlock: env.startBlock - 1,
    participants: {},
  })

  try {
    const chainCurrentBlock = await getCurrentBlock()
    const effectiveEnd = Math.min(env.endBlock, chainCurrentBlock)
    const cache = {
      version: 1,
      lastScannedBlock: toNumber(fallbackCache?.lastScannedBlock) || env.startBlock - 1,
      participants: fallbackCache?.participants && typeof fallbackCache.participants === 'object' ? fallbackCache.participants : {},
    }

    const fromBlock = Math.max(env.startBlock, cache.lastScannedBlock + 1)
    const toBlock = Math.min(effectiveEnd, fromBlock + env.maxBlocksPerRun - 1)
    const poolMap = await fetchPoolAttributions(env.startBlock, effectiveEnd)

    if (fromBlock <= toBlock) {
      log(`Scanning blocks ${fromBlock} → ${toBlock} (chain head ${chainCurrentBlock})`)

      for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber += 1) {
        const block = await getBlock(blockNumber)
        const blockMiner = normalizeAddress(block?.miner || block?.author)
        const soloPoolMiner = poolMap.get(blockNumber)

        let finalMiner = ''
        let source = 'chain'

        if (soloPoolMiner) {
          finalMiner = soloPoolMiner
          source = 'pool-solo'
        } else if (blockMiner) {
          if (env.poolPayoutAddress && blockMiner === env.poolPayoutAddress) {
            if (env.debug) {
              log(`Block ${blockNumber} mined by pool payout address without solo attribution; skipping this block so the pool wallet never enters the ranking`)
            }
            continue
          }
          finalMiner = blockMiner
        }

        if (!finalMiner) continue

        const participant = ensureParticipant(cache.participants, finalMiner)
        if (!participant) continue
        participant.address = finalMiner
        participant.blocks += 1
        participant.lastBlock = Math.max(toNumber(participant.lastBlock), blockNumber)
        if (source === 'pool-solo') {
          participant.poolSoloBlocks = toNumber(participant.poolSoloBlocks) + 1
        } else {
          participant.chainSoloBlocks = toNumber(participant.chainSoloBlocks) + 1
        }

        if (env.requestDelayMs > 0) await sleep(env.requestDelayMs)
      }

      cache.lastScannedBlock = toBlock
    } else {
      log('No new championship blocks to scan in this run.')
      cache.lastScannedBlock = Math.max(cache.lastScannedBlock, Math.min(chainCurrentBlock, env.endBlock))
    }

    const participants = Object.values(cache.participants)
      .map((item) => ({
        address: item.address,
        blocks: toNumber(item.blocks),
        lastBlock: toNumber(item.lastBlock),
        chainSoloBlocks: toNumber(item.chainSoloBlocks),
        poolSoloBlocks: toNumber(item.poolSoloBlocks),
      }))
      .filter((item) => item.blocks > 0)
      .sort((a, b) => b.blocks - a.blocks || b.lastBlock - a.lastBlock || a.address.localeCompare(b.address))

    const feed = {
      mode: 'live',
      updatedAt: nowIso(),
      currentBlock: chainCurrentBlock,
      startBlock: env.startBlock,
      endBlock: env.endBlock,
      baseRewardPerBlock: env.baseRewardPerBlock,
      lastScannedBlock: cache.lastScannedBlock,
      backfillComplete: cache.lastScannedBlock >= effectiveEnd,
      participants,
    }

    await writeJson(CACHE_PATH, cache)
    await writeJson(FEED_PATH, feed)

    log(`Feed updated with ${participants.length} tracked miners. Last scanned block: ${cache.lastScannedBlock}`)
  } catch (error) {
    log(`Feed generation failed: ${error instanceof Error ? error.message : String(error)}`)
    log('Keeping existing championship JSON and cache so the site still deploys.')
    await writeJson(FEED_PATH, fallbackFeed)
    await writeJson(CACHE_PATH, fallbackCache)
  }
}

await main()
