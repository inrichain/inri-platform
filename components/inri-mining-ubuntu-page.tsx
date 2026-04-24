import { Server, Terminal, Cpu } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

export function InriMiningUbuntuPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Ubuntu Mining</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Set up INRI mining on Ubuntu.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">A stronger server/VPS mining route for Ubuntu users, aligned with the same INRI control-room interface.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="/mining">Mining Hub</InriLinkButton>
                <InriLinkButton href="/pool" variant="secondary">Pool</InriLinkButton>
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Server className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Server route</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Prepare VPS and Ubuntu mining systems.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Terminal className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Command flow</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Keep setup instructions organized and readable.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Cpu className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">PoW mining</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Point miners into active INRI participation.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </InriShell>
  )
}
