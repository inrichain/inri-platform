import { Download, MonitorSmartphone, Pickaxe, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

export function InriMiningWindowsPage() {
  return (
    <InriShell>
      <main className="inri-bright-main">
        <section className="inri-bright-hero">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.06fr)_390px] xl:items-stretch">
              <div className="inri-bright-card flex flex-col justify-center">
                <div className="inri-bright-chip w-fit">WINDOWS MINING</div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-900 sm:text-5xl xl:text-[4.4rem]">
                  Windows mining guide in the same premium visual system as the rest of INRI.
                </h1>
                <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
                  Guide pages should be easy to follow and visually consistent. This route now presents the Windows mining flow with cleaner cards, stronger hierarchy and the same bright premium style as the rest of the website.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="/mining">Open mining hub</InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">Open pool</InriLinkButton>
                </div>
              </div>
              <aside className="inri-bright-card">
                <div className="grid gap-3">
                  {[
                    { title: 'Step-by-step setup', text: 'Show the mining flow with simpler visual blocks.', icon: <MonitorSmartphone className="h-5 w-5" /> },
                    { title: 'Faster action', text: 'Downloads and pool links are clearer and more visible.', icon: <Download className="h-5 w-5" /> },
                    { title: 'Official look', text: 'Even instructional pages now feel like part of the same platform.', icon: <ShieldCheck className="h-5 w-5" /> },
                  ].map((item) => (
                    <div key={item.title} className="inri-bright-subcard">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">{item.icon}</div>
                        <div className="text-base font-black text-slate-900">{item.title}</div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="inri-bright-section">
          <div className="inri-page-container">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['1. Install miner', 'Download your preferred miner and prepare the wallet address.'],
                ['2. Configure wallet + pool', 'Use your INRI address and set the pool/solo destination.'],
                ['3. Start mining', 'Run the miner and monitor activity through the pool or explorer.'],
              ].map(([title, text]) => (
                <div key={title} className="inri-bright-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600"><Pickaxe className="h-5 w-5" /></div>
                  <h3 className="mt-4 text-xl font-black text-slate-900">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
