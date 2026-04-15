#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const ROOT = process.cwd()
const OUTPUT_PATH = path.join(ROOT, 'public', 'live-audience.json')
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

const env = {
  propertyId: String(process.env.GA4_PROPERTY_ID || '').trim(),
  serviceAccountJson: String(process.env.GA4_SERVICE_ACCOUNT_JSON || '').trim(),
  maxCountries: Number(process.env.GA4_MAX_COUNTRIES || 25),
  debug: /^true$/i.test(String(process.env.GA4_DEBUG || '')),
}

const COUNTRY_COORDS = {
  AE: { lat: 24.4539, lng: 54.3773 }, AR: { lat: -34.6037, lng: -58.3816 }, AT: { lat: 48.2082, lng: 16.3738 },
  AU: { lat: -33.8688, lng: 151.2093 }, BD: { lat: 23.8103, lng: 90.4125 }, BE: { lat: 50.8503, lng: 4.3517 },
  BG: { lat: 42.6977, lng: 23.3219 }, BO: { lat: -16.4897, lng: -68.1193 }, BR: { lat: -15.7939, lng: -47.8828 },
  CA: { lat: 45.4215, lng: -75.6972 }, CH: { lat: 46.948, lng: 7.4474 }, CL: { lat: -33.4489, lng: -70.6693 },
  CN: { lat: 39.9042, lng: 116.4074 }, CO: { lat: 4.711, lng: -74.0721 }, CR: { lat: 9.9281, lng: -84.0907 },
  CZ: { lat: 50.0755, lng: 14.4378 }, DE: { lat: 52.52, lng: 13.405 }, DK: { lat: 55.6761, lng: 12.5683 },
  DO: { lat: 18.4861, lng: -69.9312 }, DZ: { lat: 36.7538, lng: 3.0588 }, EC: { lat: -0.1807, lng: -78.4678 },
  EE: { lat: 59.437, lng: 24.7536 }, EG: { lat: 30.0444, lng: 31.2357 }, ES: { lat: 40.4168, lng: -3.7038 },
  ET: { lat: 8.9806, lng: 38.7578 }, FI: { lat: 60.1699, lng: 24.9384 }, FR: { lat: 48.8566, lng: 2.3522 },
  GB: { lat: 51.5074, lng: -0.1278 }, GH: { lat: 5.6037, lng: -0.187 }, GR: { lat: 37.9838, lng: 23.7275 },
  GT: { lat: 14.6349, lng: -90.5069 }, HK: { lat: 22.3193, lng: 114.1694 }, HN: { lat: 14.0723, lng: -87.1921 },
  HR: { lat: 45.815, lng: 15.9819 }, HU: { lat: 47.4979, lng: 19.0402 }, ID: { lat: -6.2088, lng: 106.8456 },
  IE: { lat: 53.3498, lng: -6.2603 }, IL: { lat: 31.7683, lng: 35.2137 }, IN: { lat: 28.6139, lng: 77.209 },
  IQ: { lat: 33.3152, lng: 44.3661 }, IR: { lat: 35.6892, lng: 51.389 }, IT: { lat: 41.9028, lng: 12.4964 },
  JM: { lat: 18.0179, lng: -76.8099 }, JO: { lat: 31.9454, lng: 35.9284 }, JP: { lat: 35.6762, lng: 139.6503 },
  KE: { lat: -1.2921, lng: 36.8219 }, KH: { lat: 11.5564, lng: 104.9282 }, KR: { lat: 37.5665, lng: 126.978 },
  KW: { lat: 29.3759, lng: 47.9774 }, KZ: { lat: 51.1694, lng: 71.4491 }, LA: { lat: 17.9757, lng: 102.6331 },
  LK: { lat: 6.9271, lng: 79.8612 }, LT: { lat: 54.6872, lng: 25.2797 }, LU: { lat: 49.6116, lng: 6.1319 },
  LV: { lat: 56.9496, lng: 24.1052 }, MA: { lat: 34.0209, lng: -6.8416 }, MM: { lat: 16.8661, lng: 96.1951 },
  MO: { lat: 22.1987, lng: 113.5439 }, MX: { lat: 19.4326, lng: -99.1332 }, MY: { lat: 3.139, lng: 101.6869 },
  NG: { lat: 9.0765, lng: 7.3986 }, NI: { lat: 12.114, lng: -86.2362 }, NL: { lat: 52.3676, lng: 4.9041 },
  NO: { lat: 59.9139, lng: 10.7522 }, NP: { lat: 27.7172, lng: 85.324 }, NZ: { lat: -41.2865, lng: 174.7762 },
  OM: { lat: 23.588, lng: 58.3829 }, PA: { lat: 8.9824, lng: -79.5199 }, PE: { lat: -12.0464, lng: -77.0428 },
  PH: { lat: 14.5995, lng: 120.9842 }, PK: { lat: 33.6844, lng: 73.0479 }, PL: { lat: 52.2297, lng: 21.0122 },
  PT: { lat: 38.7223, lng: -9.1393 }, PY: { lat: -25.2637, lng: -57.5759 }, QA: { lat: 25.2854, lng: 51.531 },
  RO: { lat: 44.4268, lng: 26.1025 }, RS: { lat: 44.7866, lng: 20.4489 }, RU: { lat: 55.7558, lng: 37.6173 },
  SA: { lat: 24.7136, lng: 46.6753 }, SE: { lat: 59.3293, lng: 18.0686 }, SG: { lat: 1.3521, lng: 103.8198 },
  SI: { lat: 46.0569, lng: 14.5058 }, SK: { lat: 48.1486, lng: 17.1077 }, SV: { lat: 13.6929, lng: -89.2182 },
  TH: { lat: 13.7563, lng: 100.5018 }, TN: { lat: 36.8065, lng: 10.1815 }, TR: { lat: 39.9334, lng: 32.8597 },
  TW: { lat: 25.033, lng: 121.5654 }, TZ: { lat: -6.163, lng: 35.7516 }, UA: { lat: 50.4501, lng: 30.5234 },
  UG: { lat: 0.3476, lng: 32.5825 }, US: { lat: 38.9072, lng: -77.0369 }, UY: { lat: -34.9011, lng: -56.1645 },
  UZ: { lat: 41.2995, lng: 69.2401 }, VE: { lat: 10.4806, lng: -66.9036 }, VN: { lat: 21.0278, lng: 105.8342 },
  ZA: { lat: -25.7479, lng: 28.2293 }, ZW: { lat: -17.8252, lng: 31.0335 },
}

function log(...args) {
  console.log('[live-audience]', ...args)
}

async function readExisting() {
  try {
    return JSON.parse(await fs.readFile(OUTPUT_PATH, 'utf8'))
  } catch {
    return { updatedAt: '', countries: [] }
  }
}

async function writeJson(payload) {
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function signJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const unsigned = `${encodedHeader}.${encodedPayload}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const signature = signer.sign(serviceAccount.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${unsigned}.${signature}`
}

async function getAccessToken(serviceAccount) {
  const assertion = signJwt(serviceAccount)
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  if (!response.ok) {
    throw new Error(`Google token request failed with HTTP ${response.status}`)
  }

  const payload = await response.json()
  if (!payload.access_token) throw new Error('Google token response did not contain access_token')
  return payload.access_token
}

async function fetchRealtimeCountries(accessToken) {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${env.propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      dimensions: [{ name: 'country' }, { name: 'countryId' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: env.maxCountries,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GA4 realtime request failed with HTTP ${response.status}: ${text}`)
  }

  const payload = await response.json()
  return Array.isArray(payload.rows) ? payload.rows : []
}

function normalizeRows(rows) {
  return rows
    .map((row) => {
      const country = row.dimensionValues?.[0]?.value || 'Unknown'
      const code = String(row.dimensionValues?.[1]?.value || '').toUpperCase()
      const activeUsers = Number(row.metricValues?.[0]?.value || 0)
      const coords = COUNTRY_COORDS[code]
      if (!code || !coords || !Number.isFinite(activeUsers) || activeUsers <= 0) return null
      return {
        country,
        code,
        activeUsers,
        lat: coords.lat,
        lng: coords.lng,
      }
    })
    .filter(Boolean)
}

async function main() {
  const existing = await readExisting()

  if (!env.propertyId || !env.serviceAccountJson) {
    log('GA4_PROPERTY_ID or GA4_SERVICE_ACCOUNT_JSON not configured. Keeping current live-audience.json.')
    await writeJson(existing)
    return
  }

  try {
    const serviceAccount = JSON.parse(env.serviceAccountJson)
    const accessToken = await getAccessToken(serviceAccount)
    const rows = await fetchRealtimeCountries(accessToken)
    const countries = normalizeRows(rows)

    const output = {
      updatedAt: new Date().toISOString(),
      source: 'ga4-realtime',
      countries,
    }

    await writeJson(output)
    log(`Updated live-audience.json with ${countries.length} country rows.`)
    if (env.debug) {
      log(JSON.stringify(output, null, 2))
    }
  } catch (error) {
    log(error instanceof Error ? error.message : String(error))
    await writeJson(existing)
  }
}

await main()
