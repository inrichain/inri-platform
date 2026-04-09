import { ArrowRight, Laptop2, Pickaxe, TerminalSquare } from 'lucide-react'
import Link from 'next/link'
import { InriShell, InriLinkButton } from '@/components/inri-site-shell'

export function InriMiningUbuntuPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-black text-white">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(17,143,240,0.22),transparent_36%),linear-gradient(180deg,#07111e_0%,#04070d_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-4xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-primary/90">Mining Ubuntu</p>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Ubuntu CPU Miner</h1>
              <p className="mt-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.22em] text-primary">
                Fork at block 6000000
              </p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                This Ubuntu route stays intentionally simple, following the direct style of the current official network page.
                Use it as the Linux entry point and move to Pool or Explorer when you need more live network visibility.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InriLinkButton href="/pool">Open Pool</InriLinkButton>
                <InriLinkButton href="/explorer" variant="secondary">
                  Explorer
                </InriLinkButton>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1.1fr,0.9fr] lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[#091425] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.2)] sm:p-8">
              <div className="flex items-center gap-3 text-primary">
                <TerminalSquare className="h-5 w-5" />
                <p className="text-sm font-extrabold uppercase tracking-[0.22em]">Ubuntu route</p>
              </div>
              <h2 className="mt-4 text-3xl font-black text-white">Keep the Linux guide direct, clean and useful.</h2>
              <div className="mt-6 space-y-4">
                {[
                  'The Ubuntu page on the current network site is intentionally lighter than the Windows guide, so this version keeps the same spirit.',
                  'Use the Ubuntu route when you want a Linux-first mining entry point without the heavier Windows onboarding flow.',
                  'The rest of the live network context stays available through Pool, Explorer, Wallets and the main site navigation.',
                ].map((item) => (
                  <div key={item} className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/74">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.18)] sm:p-8">
              <div className="grid gap-4">
                {[
                  {
                    title: 'Ubuntu CPU Miner',
                    text: 'Linux-focused mining entry point for the INRI network.',
                    icon: Laptop2,
                  },
                  {
                    title: 'Fork reminder',
                    text: 'Keep the node updated for the fork at block 6000000.',
                    icon: Pickaxe,
                  },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-[#091425] p-5">
                      <div className="inline-flex rounded-2xl border border-primary/25 bg-primary/10 p-3 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/68">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[#091425] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary/90">Useful routes</p>
                  <h2 className="mt-3 text-3xl font-black text-white">Use the Ubuntu page as a clean starting point, then move into the rest of the network.</h2>
                  <p className="mt-4 text-base leading-8 text-white/72">
                    This guide stays lighter on purpose. When you need deeper visibility, open the pool dashboard, explorer or the
                    Windows page for the full step-by-step mining onboarding flow.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <InriLinkButton href="/pool">Pool</InriLinkButton>
                  <InriLinkButton href="/wallets" variant="secondary">
                    Wallets
                  </InriLinkButton>
                </div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  { title: 'Pool', text: 'See live miners, blocks, payments and address lookup.' , href: '/pool' },
                  { title: 'Explorer', text: 'Check public chain activity and verify network data.', href: '/explorer' },
                  { title: 'Windows guide', text: 'Open the full Windows onboarding route if needed.', href: '/mining-windows' },
                ].map((item) => (
                  <Link key={item.title} href={item.href} className="group rounded-[1.25rem] border border-white/10 bg-black/30 p-5 transition hover:border-primary/45 hover:bg-black/40">
                    <h3 className="text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">{item.text}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                      Open
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
