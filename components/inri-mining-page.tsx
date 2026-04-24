import { MonitorSmartphone, Pickaxe, Server, Trophy } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

export function InriMiningPage() {
  return (
    <InriShell>
      <main className="inri-site-v2">
        <section className="inri-v2-hero">
          <div className="inri-page-container py-10 sm:py-14 lg:py-16">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.52fr)] xl:items-stretch">
              <div className="inri-v2-panel flex min-h-[460px] flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inri-v2-kicker">Mining</span>
                  <span className="inri-v2-kicker">INRI mainnet</span>
                  <span className="inri-v2-kicker">Chain 3777</span>
                </div>
                <h1 className="inri-v2-heading mt-8 max-w-5xl text-[2.8rem] sm:text-[4.2rem] lg:text-[5.8rem]">
                  Start mining INRI from one professional route.
                </h1>
                <p className="inri-v2-text mt-7 max-w-3xl text-lg">
                  Choose Windows, Ubuntu, pool mining or the active championship without jumping between different-looking pages.
                </p>
                <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                  <InriLinkButton href="/mining-windows">Windows Setup</InriLinkButton>
                  <InriLinkButton href="/mining-ubuntu" variant="secondary">Ubuntu Setup</InriLinkButton>
                  <InriLinkButton href="/mining-championship/" variant="secondary">Championship</InriLinkButton>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><MonitorSmartphone className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Windows route</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Open the Windows mining setup.</p>
                </div>
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><Server className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Ubuntu route</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Use server and VPS mining instructions.</p>
                </div>
                <div className="inri-v2-feature p-5">
                  <div className="inri-v2-icon"><Trophy className="h-5 w-5" /></div>
                  <h3 className="mt-5 text-2xl font-black text-white">Championship</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">Follow the active solo mining competition.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </InriShell>
  )
}
