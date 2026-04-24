import { Cpu, Download, MonitorSmartphone } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

export function InriMiningWindowsPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Windows Mining</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Set up INRI mining on Windows.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">A cleaner Windows mining route with the same visual standard as the rest of the site. Use this page to guide users into the official mining flow.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="/mining">Mining Hub</InriLinkButton>
                <InriLinkButton href="/mining-championship/" variant="secondary">Championship</InriLinkButton>
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><MonitorSmartphone className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Windows route</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Desktop miner setup for Windows users.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Download className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Installer path</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Keep download and setup steps clear.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Cpu className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Solo mining</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Prepare users for solo mining and championship routes.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </InriShell>
  )
}
