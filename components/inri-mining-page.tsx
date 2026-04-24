import { MonitorSmartphone, Server, Trophy } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

export function InriMiningPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Mining</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Mine INRI from one clear route.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">Choose Windows, Ubuntu, pool mining or the active championship inside the same visual language as the Home.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="/mining-windows">Windows Setup</InriLinkButton>
                <InriLinkButton href="/mining-ubuntu" variant="secondary">Ubuntu Setup</InriLinkButton>
                <InriLinkButton href="/mining-championship/" variant="secondary">Championship</InriLinkButton>
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><MonitorSmartphone className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Windows setup</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Mining instructions for Windows users.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Server className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Ubuntu setup</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Server and VPS route for Ubuntu.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Trophy className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Championship</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Open the active solo mining campaign.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </InriShell>
  )
}
