'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Globe2, LocateFixed, RadioTower, Sparkles } from 'lucide-react'

type AudiencePoint = {
  country: string
  code?: string
  activeUsers: number
  lat?: number
  lng?: number
}

type AudiencePayload = {
  updatedAt?: string
  countries?: AudiencePoint[]
}

type Props = {
  audience: AudiencePayload | null
  totalLivePulse: number
  totalPeers: number
  poolMiners: number
  updatedAt: string
}

declare global {
  interface Window {
    L?: any
  }
}

const LEAFLET_CSS_ID = 'inri-leaflet-css'
const LEAFLET_JS_ID = 'inri-leaflet-js'
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO'

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US')
}

function loadLeafletAssets() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement('link')
      link.id = LEAFLET_CSS_ID
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS_URL
      document.head.appendChild(link)
    }

    if (window.L) {
      resolve()
      return
    }

    const existing = document.getElementById(LEAFLET_JS_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Leaflet')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = LEAFLET_JS_ID
    script.src = LEAFLET_JS_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Leaflet'))
    document.body.appendChild(script)
  })
}

export function LiveAudienceLeafletMap({ audience, totalLivePulse, totalPeers, poolMiners, updatedAt }: Props) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState('')

  const points = useMemo(
    () => (Array.isArray(audience?.countries) ? audience!.countries.filter((item) => Number(item.activeUsers || 0) > 0 && Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng))) : []),
    [audience]
  )

  const topCountries = useMemo(
    () => [...points].sort((a, b) => Number(b.activeUsers || 0) - Number(a.activeUsers || 0)).slice(0, 5),
    [points]
  )

  useEffect(() => {
    let active = true

    async function init() {
      try {
        await loadLeafletAssets()
        if (!active || !mapNodeRef.current || !window.L) return

        const L = window.L
        if (!mapRef.current) {
          const map = L.map(mapNodeRef.current, {
            center: [18, 10],
            zoom: 2,
            minZoom: 2,
            maxZoom: 6,
            zoomControl: false,
            attributionControl: false,
            worldCopyJump: true,
          })

          L.tileLayer(TILE_URL, {
            attribution: TILE_ATTRIBUTION,
            subdomains: 'abcd',
            maxZoom: 19,
          }).addTo(map)

          L.control
            .zoom({ position: 'bottomright' })
            .addTo(map)

          mapRef.current = map
          markersRef.current = L.layerGroup().addTo(map)
        }

        setMapReady(true)
        setMapError('')
      } catch (error) {
        if (!active) return
        setMapError(error instanceof Error ? error.message : 'Failed to load live map')
      }
    }

    init()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !mapRef.current || !markersRef.current || !window.L) return

    const L = window.L
    const layer = markersRef.current
    const map = mapRef.current
    layer.clearLayers()

    if (points.length === 0) {
      map.setView([18, 10], 2)
      return
    }

    const maxUsers = Math.max(...points.map((item) => Number(item.activeUsers || 0)), 1)
    const bounds = L.latLngBounds([])

    points.forEach((point) => {
      const lat = Number(point.lat)
      const lng = Number(point.lng)
      const users = Number(point.activeUsers || 0)
      const radius = 8 + (users / maxUsers) * 16

      const pulse = L.circle([lat, lng], {
        radius: 180000 + users * 18000,
        color: '#14b8ff',
        opacity: 0.22,
        fillColor: '#14b8ff',
        fillOpacity: 0.08,
        weight: 1,
      })

      const marker = L.circleMarker([lat, lng], {
        radius,
        color: '#abf1ff',
        weight: 2,
        fillColor: '#14b8ff',
        fillOpacity: 0.82,
      })

      marker.bindPopup(`
        <div class="inri-map-popup">
          <div class="inri-map-popup__eyebrow">LIVE AUDIENCE</div>
          <div class="inri-map-popup__title">${point.country}</div>
          <div class="inri-map-popup__value">${formatNumber(users)} active visitors</div>
        </div>
      `)

      pulse.addTo(layer)
      marker.addTo(layer)
      bounds.extend([lat, lng])
    })

    if (points.length === 1) {
      map.setView([Number(points[0].lat), Number(points[0].lng)], 3)
    } else {
      map.fitBounds(bounds.pad(0.35), { animate: false, maxZoom: 4 })
    }
  }, [mapReady, points])

  return (
    <div className="rounded-[1.85rem] border-[1.45px] border-white/[0.18] bg-[radial-gradient(circle_at_top,rgba(19,164,255,0.16),transparent_34%),linear-gradient(180deg,rgba(3,8,14,0.98),rgba(0,0,0,0.99))] p-4 sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative overflow-hidden rounded-[1.55rem] border-[1.35px] border-white/[0.14] bg-black/45 p-3 sm:p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(19,164,255,0.18),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(19,164,255,0.10),transparent_20%),linear-gradient(rgba(19,164,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(19,164,255,0.04)_1px,transparent_1px)] bg-[size:auto,auto,28px_28px,28px_28px] opacity-90" />
          <div className="relative flex items-center justify-between gap-3 px-2 pb-3 sm:px-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Live audience map</p>
              <p className="mt-2 max-w-xl text-sm leading-7 text-white/62">
                Premium live view powered by Google Analytics and refreshed automatically by GitHub Actions.
              </p>
            </div>
            <div className="hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:inline-flex">
              Refresh ~ 5 min
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-[#050b12]">
            <div ref={mapNodeRef} className="inri-live-map h-[360px] w-full sm:h-[430px] xl:h-[500px]" />

            {!mapReady && !mapError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(1,5,10,0.72)] backdrop-blur-sm">
                <div className="rounded-[1.35rem] border border-white/[0.12] bg-black/55 px-5 py-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Loading map</p>
                  <p className="mt-2 text-sm text-white/62">Preparing the live world audience view...</p>
                </div>
              </div>
            ) : null}

            {mapError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(1,5,10,0.78)] backdrop-blur-sm">
                <div className="max-w-md rounded-[1.35rem] border border-white/[0.12] bg-black/55 px-5 py-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Map unavailable</p>
                  <p className="mt-2 text-sm text-white/62">{mapError}</p>
                </div>
              </div>
            ) : null}

            {mapReady && points.length === 0 && !mapError ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
                <div className="max-w-md rounded-[1.35rem] border border-white/[0.12] bg-black/55 px-5 py-4 text-center backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Waiting for live visitors</p>
                  <p className="mt-2 text-sm leading-7 text-white/62">
                    Connect the GA4 Realtime feed and this map will light up with country markers automatically.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-[1.35rem] border-[1.35px] border-white/[0.14] bg-black/46 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-2xl border border-primary/24 bg-primary/10 p-3 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Live pulse</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-white">{formatNumber(totalLivePulse)}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/58">Combined pulse from peers and active miners.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.35rem] border-[1.35px] border-white/[0.14] bg-black/46 px-4 py-4">
              <div className="flex items-center gap-3">
                <RadioTower className="h-4 w-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Network peers</p>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">{formatNumber(totalPeers)}</p>
              <p className="mt-2 text-sm text-white/58">rpc-chain + rpc + bootnodes</p>
            </div>

            <div className="rounded-[1.35rem] border-[1.35px] border-white/[0.14] bg-black/46 px-4 py-4">
              <div className="flex items-center gap-3">
                <LocateFixed className="h-4 w-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Pool miners</p>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">{formatNumber(poolMiners)}</p>
              <p className="mt-2 text-sm text-white/58">PPLNS + SOLO connected</p>
            </div>
          </div>

          <div className="rounded-[1.35rem] border-[1.35px] border-white/[0.14] bg-black/46 px-4 py-4">
            <div className="flex items-center gap-3">
              <Globe2 className="h-4 w-4 text-primary" />
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Audience refresh</p>
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-white">{audience?.updatedAt || updatedAt}</p>
            <p className="mt-2 text-sm text-white/58">Last country snapshot published to the site.</p>
          </div>

          <div className="rounded-[1.35rem] border-[1.35px] border-white/[0.14] bg-black/46 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Top countries</p>
            <div className="mt-4 grid gap-3">
              {topCountries.length > 0 ? (
                topCountries.map((item, index) => (
                  <div key={`${item.country}-${item.code || index}`} className="flex items-center justify-between gap-3 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.02] px-3 py-3">
                    <div>
                      <p className="text-sm font-bold text-white">{item.country}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/42">{item.code || 'LIVE'} activity</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums text-white">{formatNumber(Number(item.activeUsers || 0))}</p>
                      <p className="mt-1 text-xs text-primary">active users</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.02] px-3 py-3 text-sm text-white/58">
                  No country data yet. As soon as GA4 Realtime returns visitors, the countries will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
