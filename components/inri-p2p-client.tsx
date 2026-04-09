'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    ethers?: unknown
  }
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const htmlUrl = `${basePath}/apps/inri-p2p.html`

function patchStyle(styleText: string): string {
  return [
    ':host{display:block}',
    styleText
      .replace(/html,body\s*\{[^}]*height:100%[^}]*\}/g, ':host{display:block;height:100%}')
      .replace(/body\s*\{[^}]*margin:0[^}]*background:#000[^}]*\}/g, ':host{display:block;margin:0;color:var(--text);background:#000;overflow:auto}')
      .replace(/a\{color:inherit;text-decoration:none\}/g, ':host a{color:inherit;text-decoration:none}')
      .replace(/\*\{box-sizing:border-box\}/g, ':host *, :host *::before, :host *::after{box-sizing:border-box}'),
  ].join('\n')
}

function patchBody(bodyHtml: string): string {
  return bodyHtml.replaceAll('https://www.inri.life/', `${basePath || ''}/`)
}

function patchScript(scriptText: string): string {
  return scriptText
    .replace('const DAPP_URL = "https://p2p.inri.life/";', `const DAPP_URL = window.location.href.split('#')[0];`)
    .replaceAll('document.getElementById(', '__root.getElementById(')
    .replaceAll('document.querySelectorAll(', '__root.querySelectorAll(')
    .replaceAll('document.querySelector(', '__root.querySelector(')
    .replaceAll('document.createElement(', '__root.ownerDocument.createElement(')
    .replaceAll('document.addEventListener(', '__root.ownerDocument.addEventListener(')
}

async function ensureEthers(): Promise<void> {
  if (typeof window === 'undefined' || window.ethers) return

  const existing = document.getElementById('inri-p2p-ethers-loader') as HTMLScriptElement | null
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load ethers runtime.')), { once: true })
    })
    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'inri-p2p-ethers-loader'
    script.src = 'https://cdn.jsdelivr.net/npm/ethers@6.8.1/dist/ethers.umd.min.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load ethers runtime.'))
    document.head.appendChild(script)
  })
}

export function InriP2PClient() {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    async function mountP2P() {
      try {
        setStatus('loading')
        setError('')

        const res = await fetch(`${htmlUrl}?t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`Could not load P2P runtime (${res.status}).`)
        }

        const html = await res.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        const styleText = Array.from(doc.querySelectorAll('style'))
          .map((node) => node.textContent ?? '')
          .join('\n\n')

        const body = doc.body.cloneNode(true) as HTMLBodyElement
        const inlineScripts = Array.from(body.querySelectorAll('script'))
          .map((node) => node.textContent ?? '')
          .join('\n\n')
        body.querySelectorAll('script').forEach((node) => node.remove())

        const host = hostRef.current
        if (!host || cancelled) return

        const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
        root.innerHTML = `\n          <style>${patchStyle(styleText)}</style>\n          ${patchBody(body.innerHTML)}\n        `

        await ensureEthers()
        if (cancelled) return

        const runtime = patchScript(inlineScripts)
        // eslint-disable-next-line no-new-func
        const run = new Function('__root', runtime)
        run(root)

        if (!cancelled) {
          setStatus('ready')
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setError(err instanceof Error ? err.message : 'Failed to load the P2P application.')
        }
      }
    }

    mountP2P()

    return () => {
      cancelled = true
      if (hostRef.current?.shadowRoot) {
        hostRef.current.shadowRoot.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="rounded-[2rem] border border-primary/18 bg-[linear-gradient(180deg,rgba(7,17,29,0.95),rgba(0,0,0,0.98))] p-2 shadow-[0_30px_100px_rgba(0,0,0,0.45),0_0_0_1px_rgba(19,164,255,0.05)] sm:p-3">
      {status === 'loading' ? (
        <div className="flex min-h-[900px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-black text-white/70">
          Loading P2P runtime...
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="rounded-[1.5rem] border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
          {error || 'The P2P application could not be loaded inside the new site.'}
        </div>
      ) : null}

      <div ref={hostRef} className={status === 'ready' ? 'block' : 'hidden'} />
    </div>
  )
}
