import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

export function InriMiningUbuntuPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(19,164,255,0.09),transparent_28%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 xl:py-20">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                Ubuntu CPU Miner
              </div>
              <p className="mt-5 text-[11px] font-black uppercase tracking-[0.24em] text-primary/92">Fork at block 6000000</p>
              <h1 className="mt-3 text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.1rem]">Ubuntu CPU Miner</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                This page keeps the Ubuntu route simple and direct, just like the current public page, while matching the premium visual system of the new site.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <InriLinkButton href="/pool">Open Pool</InriLinkButton>
                <InriLinkButton href="/mining-windows" variant="secondary">Mining Windows</InriLinkButton>
                <InriLinkButton href="/explorer" variant="secondary">Explorer</InriLinkButton>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="rounded-[1.9rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
              <p className="text-sm leading-8 text-white/72">
                The Ubuntu route remains intentionally lighter here. Use the pool page and the explorer to confirm the network state, and keep the fork reminder in mind before starting or updating any miner setup.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { title: 'Pool', text: 'Compare PPLNS and SOLO.', href: '/pool' },
                { title: 'Windows route', text: 'See the full Windows CPU mining guide.', href: '/mining-windows' },
                { title: 'Explorer', text: 'Verify blocks and chain activity.', href: '/explorer' },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-primary/40 hover:bg-primary/[0.08]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-white">{item.title}</span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
