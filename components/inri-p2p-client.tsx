'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    ethers?: unknown
  }
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const htmlUrl = `${basePath}/apps/inri-p2p.html`

function replaceEverywhere(input: string, search: string, replacement: string): string {
  return input.split(search).join(replacement)
}

function patchStyle(styleText: string): string {
  const base = styleText
    .replace(/html,body\s*\{[^}]*height:100%[^}]*\}/g, 'html,body{height:100%}')
    .replace(/body\s*\{[^}]*margin:0[^}]*background:#000[^}]*overflow:auto[^}]*\}/g, 'body{margin:0;color:var(--text);background:transparent;overflow:auto}')

  const overrides = `
:host{display:block}
:host *, :host *::before, :host *::after{box-sizing:border-box}
:host a{color:inherit;text-decoration:none}
:host .wrap{max-width:none;margin:0;padding:0;gap:14px}
:host .p2pHero{display:none!important}
:host .top{
  position:static;
  top:auto;
  z-index:auto;
  display:flex;
  justify-content:flex-end;
  align-items:center;
  gap:10px;
  padding:0;
  margin:0;
  border:none;
  background:transparent;
  backdrop-filter:none;
}
:host .top > .brand{display:none!important}
:host .top a.btn.btn-ghost{display:none!important}
:host .top .row{
  width:100%;
  justify-content:flex-end;
  gap:10px;
  flex-wrap:wrap;
}
:host .tabs,
:host .card,
:host .offer,
:host .modal,
:host .hint,
:host .pill,
:host .kv,
:host input,
:host select{
  box-shadow:none!important;
}
:host .tabs{
  border:1.35px solid rgba(255,255,255,.10);
  border-radius:24px;
  background:linear-gradient(180deg,rgba(8,16,28,.92),rgba(3,8,14,.92));
  padding:14px 16px;
  backdrop-filter:blur(14px);
}
:host .tab{
  min-height:42px;
  padding:10px 16px;
  border-radius:999px;
  border:1.25px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.04);
  font-size:13px;
  letter-spacing:.02em;
}
:host .tab.active{background:linear-gradient(90deg,#13a4ff,#0a84ff); color:#08111d}
:host .panelWrap{grid-template-columns:minmax(320px,420px) minmax(0,1fr);gap:16px}
@media(max-width:1100px){:host .panelWrap{grid-template-columns:1fr}}
:host .card{
  border:1.35px solid rgba(255,255,255,.10);
  border-radius:28px;
  background:radial-gradient(circle at top left,rgba(19,164,255,.07),transparent 28%),linear-gradient(180deg,rgba(8,15,26,.96),rgba(2,6,12,.96));
  padding:20px;
  backdrop-filter:blur(16px);
}
:host .card h2{font-size:18px;margin:0 0 12px 0;color:#fff}
:host .hint{
  border:1.25px solid rgba(19,164,255,.22);
  background:linear-gradient(180deg,rgba(19,164,255,.10),rgba(19,164,255,.04));
  padding:14px 16px;
  border-radius:18px;
  font-size:12.5px;
  line-height:1.55;
}
:host label{font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.62)}
:host input,
:host select{
  min-height:50px;
  padding:12px 14px;
  border-radius:16px;
  border:1.3px solid rgba(255,255,255,.12);
  background:rgba(0,0,0,.28);
  color:#fff;
  outline:none;
  font-size:14px;
}
:host input:focus,
:host select:focus{border-color:rgba(19,164,255,.55); box-shadow:0 0 0 1px rgba(19,164,255,.18)}
:host .pill,
:host .chip{
  min-height:40px;
  padding:8px 12px;
  border-radius:999px;
  border:1.25px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.04);
  color:rgba(255,255,255,.82);
  font-size:12px;
  font-weight:700;
}
:host .btn{
  min-height:44px;
  padding:10px 15px;
  border-radius:999px;
  border:1.25px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.05);
  color:#fff;
  font-size:13px;
  font-weight:800;
}
:host .btn-pri{background:linear-gradient(90deg,#13a4ff,#0a84ff); color:#08111d; border-color:rgba(255,255,255,.08)}
:host .btn-ok{background:rgba(34,197,94,.14); border-color:rgba(34,197,94,.26)}
:host .btn-bad{background:rgba(239,68,68,.12); border-color:rgba(239,68,68,.26)}
:host .btn-warn{background:rgba(245,158,11,.12); border-color:rgba(245,158,11,.26)}
:host .toolbar{gap:14px;align-items:flex-end}
:host .search{gap:10px}
:host .search input{width:320px}
@media(max-width:640px){:host .search input{width:100%}}
:host .offers{grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px;max-height:none;overflow:visible;padding-right:0}
:host .offer{
  border:1.25px solid rgba(255,255,255,.10);
  background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.015));
  border-radius:22px;
  padding:16px;
}
:host .tag{min-height:34px;padding:6px 11px;border-radius:999px}
:host .kvs{gap:10px;margin-top:10px}
:host .kv{border-radius:16px;padding:10px;border:1.25px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03)}
:host .kv .k{font-size:11px;letter-spacing:.08em;text-transform:uppercase}
:host .kv .v{font-size:13px}
:host .actions{gap:10px;margin-top:12px}
:host .marketFooter{margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08)}
:host .walletBox{gap:14px}
:host .modal{
  width:min(1120px,100%);
  border-radius:30px;
  border:1.35px solid rgba(255,255,255,.12);
  background:linear-gradient(180deg,rgba(10,18,30,.96),rgba(3,8,14,.96));
  padding:18px;
}
:host .modalGrid{gap:14px}
:host .modal .card{padding:16px;border-radius:22px}
:host .toast{border-radius:16px;padding:12px 14px;background:rgba(8,15,26,.96)}
:host .muted{font-size:12px;color:rgba(255,255,255,.72)}
:host .muted2{font-size:12px;color:rgba(255,255,255,.54)}
`

  return `${base}\n${overrides}`
}

function patchScript(scriptText: string): string {
  return replaceEverywhere(
    replaceEverywhere(
      replaceEverywhere(
        replaceEverywhere(
          replaceEverywhere(
            replaceEverywhere(
              scriptText,
              'const DAPP_URL = "https://p2p.inri.life/";',
              'const DAPP_URL = window.location.href.split("#")[0];',
            ),
            'document.getElementById(',
            '__root.getElementById(',
          ),
          'document.querySelectorAll(',
          '__root.querySelectorAll(',
        ),
        'document.querySelector(',
        '__root.querySelector(',
      ),
      'document.createElement(',
      '__root.ownerDocument.createElement(',
    ),
    'document.addEventListener(',
    '__root.ownerDocument.addEventListener(',
  )
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

        body.querySelector('.p2pHero')?.remove()
        body.querySelector('.top .brand')?.remove()
        const backBtn = body.querySelector('.top a.btn.btn-ghost')
        backBtn?.remove()

        const wrap = body.querySelector('.wrap') as HTMLElement | null
        if (wrap) {
          wrap.classList.add('integrated-wrap')
        }

        const host = hostRef.current
        if (!host || cancelled) return

        const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
        root.innerHTML = `\n          <style>${patchStyle(styleText)}</style>\n          ${body.innerHTML}\n        `

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
    <div className="rounded-[2rem] border border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.08),transparent_26%),linear-gradient(180deg,#07111d_0%,#02060b_100%)] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-5 xl:p-6">
      {status === 'loading' ? (
        <div className="flex min-h-[840px] items-center justify-center rounded-[1.6rem] border border-white/10 bg-black/60 text-sm font-semibold text-white/72">
          Loading P2P market...
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="rounded-[1.6rem] border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
          {error || 'The P2P application could not be loaded inside the new site.'}
        </div>
      ) : null}

      <div ref={hostRef} className={status === 'ready' ? 'block' : 'hidden'} />
    </div>
  )
}
