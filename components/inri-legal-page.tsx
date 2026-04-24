import { FileText, Scale, ShieldCheck } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'

export function InriLegalPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Legal</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Legal information for INRI Chain.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">A unified legal route using the same visual identity as the rest of the site.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">

              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Scale className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Legal route</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Keep official information accessible.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><FileText className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Documentation</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Present text with a consistent interface.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><ShieldCheck className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Trust</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Support a more professional public presence.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </InriShell>
  )
}
