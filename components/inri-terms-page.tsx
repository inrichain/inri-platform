import { FileText, Scale, ShieldCheck } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'

export function InriTermsPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Terms & Conditions</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Terms for using the INRI web surface.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">A consistent legal page route for the INRI ecosystem, using the same strong page layout as the main network sections.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">

              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Scale className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Terms route</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Present terms in a clear official section.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><FileText className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Legal structure</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Keep information organized and readable.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><ShieldCheck className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Professional surface</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Make the site feel complete and trustworthy.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </InriShell>
  )
}
