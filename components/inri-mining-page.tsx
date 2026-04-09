import Link from 'next/link'
import { ArrowRight, Laptop2, MonitorCog, Pickaxe, TerminalSquare } from 'lucide-react'
import { InriShell, InriLinkButton } from '@/components/inri-site-shell'

const miningRoutes = [
  {
    title: 'Mining Windows',
    text: 'The full Windows CPU mining route with the same structure users already know: clean folders, create mining account, place the correct files, add chaindata and start mining.',
    href: '/mining-windows',
    icon: MonitorCog,
  },
  {
    title: 'Mining Ubuntu',
    text: 'A cleaner Ubuntu mining entry point kept intentionally simple, matching the direct style of the current network guide.',
    href: '/mining-ubuntu',
    icon: TerminalSquare,
  },
]

export function InriMiningPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-black text-white">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(17,143,240,0.22),transparent_36%),linear-gradient(180deg,#07111e_0%,#04070d_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-4xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-primary/90">Mining</p>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Choose the mining route that already fits how your community learns the network.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                This hub stays simple on purpose. Open the Windows or Ubuntu page and follow the network guide in a cleaner,
                more premium layout without changing the logic that miners already understand.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InriLinkButton href="/mining-windows">Mining Windows</InriLinkButton>
                <InriLinkButton href="/mining-ubuntu" variant="secondary">
                  Mining Ubuntu
                </InriLinkButton>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1.2fr,0.8fr] lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8">
              <div className="flex items-center gap-3 text-primary">
                <Pickaxe className="h-5 w-5" />
                <p className="text-sm font-extrabold uppercase tracking-[0.22em]">Official mining routes</p>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {miningRoutes.map((route) => {
                  const Icon = route.icon
                  return (
                    <Link
                      key={route.title}
                      href={route.href}
                      className="group rounded-[1.6rem] border border-white/10 bg-[#091425] p-6 transition hover:border-primary/45 hover:bg-[#0d1930]"
                    >
                      <div className="inline-flex rounded-2xl border border-primary/25 bg-primary/10 p-3 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="mt-5 text-2xl font-black text-white">{route.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-white/68">{route.text}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                        Open guide
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#091425] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-8">
              <div className="flex items-center gap-3 text-primary">
                <Laptop2 className="h-5 w-5" />
                <p className="text-sm font-extrabold uppercase tracking-[0.22em]">What stays the same</p>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  'Windows keeps the same familiar step order users already follow on the network.',
                  'Ubuntu stays more direct and lighter, matching the current official page style.',
                  'Pool, wallet and explorer links remain available from the main site navigation.',
                ].map((item) => (
                  <div key={item} className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/74">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
