'use client'

import { useEffect, useRef, useState } from 'react'

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const globalWindow = window as Window & { ethers?: unknown }
    if (globalWindow.ethers) {
      resolve()
      return
    }

    const existing = document.querySelector(`script[data-inri-src="${src}"]`) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.inriSrc = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

function transformCss(css: string) {
  return `${css}
:host{display:block;min-height:100%;background:transparent;color:#fff}
.p2pHero,.top{position:static!important;top:auto!important}
.wrap{max-width:100%!important;padding:0!important}
.top .btn[href],.top a.btn{display:none!important}`
    .replace(/html,body\s*\{[^}]*\}/g, ':host{display:block;min-height:100%;background:transparent;color:#fff}')
    .replace(/body\s*\{[^}]*\}/g, ':host{display:block;background:transparent;color:#fff}')
}

function transformScript(script: string) {
  return script
    .replace(/document\.getElementById\(/g, 'root.getElementById(')
    .replace(/document\.querySelectorAll\(/g, 'root.querySelectorAll(')
    .replace(/document\.querySelector\(/g, 'root.querySelector(')
    .replace(/document\.addEventListener\(/g, 'root.addEventListener(')
    .replace(/href="https:\/\/www\.inri\.life\/"/g, 'href="/"')
    .replace(/Back to INRI\.life/g, 'Back to INRI')
    .replace('const DAPP_URL = "https://p2p.inri.life/";', 'const DAPP_URL = window.location.href;')
    .replace('const DAPP_HOSTPATH = DAPP_URL.replace(/^https?:\\/\\//, "");', 'const DAPP_HOSTPATH = window.location.host + window.location.pathname;')
}

export function InriP2PClient() {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('Loading INRI P2P application…')

  useEffect(() => {
    let canceled = false
    let shadowRoot: ShadowRoot | null = null

    const boot = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/ethers@6.8.1/dist/ethers.umd.min.js')

        const [bodyHtmlRaw, css, rawScript] = await Promise.all([
          fetch('/apps/inri-p2p-body.html').then((res) => res.text()),
          fetch('/apps/inri-p2p-style.css').then((res) => res.text()),
          fetch('/apps/inri-p2p-script.js').then((res) => res.text()),
        ])

        if (canceled || !hostRef.current) return

        shadowRoot = hostRef.current.shadowRoot || hostRef.current.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = ''

        const styleEl = document.createElement('style')
        styleEl.textContent = transformCss(css)
        shadowRoot.appendChild(styleEl)

        const mount = document.createElement('div')
        mount.innerHTML = bodyHtmlRaw
          .replace('href="https://www.inri.life/"', 'href="/"')
          .replace('Back to INRI.life', 'Back to INRI')
        shadowRoot.appendChild(mount)

        const runner = new Function('root', 'host', transformScript(rawScript))
        runner(shadowRoot, hostRef.current)

        if (!canceled) setStatus('ready')
      } catch (error) {
        if (canceled) return
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Failed to load INRI P2P application.')
      }
    }

    boot()

    return () => {
      canceled = true
      if (shadowRoot) shadowRoot.innerHTML = ''
    }
  }, [])

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(4,10,18,0.98),rgba(0,0,0,1))] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:p-5">
      {status !== 'ready' && (
        <div className="mb-4 rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/72">
          {message}
        </div>
      )}
      <div ref={hostRef} />
    </div>
  )
}
