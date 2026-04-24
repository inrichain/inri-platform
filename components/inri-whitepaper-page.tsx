import { BookOpen, FileText, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

export function InriWhitepaperPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Whitepaper</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Read the structure and direction of INRI Chain.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">The whitepaper route is now part of the same site standard, presenting network structure, economics and ecosystem direction with a cleaner official frame.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="https://wallet.inri.life" external>Open Wallet</InriLinkButton>
                <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Explorer</InriLinkButton>
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><BookOpen className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Project structure</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Understand the network and ecosystem.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><FileText className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Token model</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Review allocations and program details.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><ShieldCheck className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Mainnet rules</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Follow the chain design and security assumptions.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </InriShell>
  )
}
