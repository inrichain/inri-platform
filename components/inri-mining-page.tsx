import Link from 'next/link'
import { ArrowRight, MonitorCog, TerminalSquare } from 'lucide-react'
import { InriShell, InriLinkButton } from '@/components/inri-site-shell'

const miningRoutes = [
  {
    title: 'Mining Windows',
    text: 'Follow the same Windows sequence users already know: clean folders, create the mining account, place the correct files, init, add chaindata and start mining.',
    href: '/mining-windows',
    icon: MonitorCog,
  },
  {
    title: 'Mining Ubuntu',
    text: 'Open the simpler Ubuntu mining route, kept light and direct in the same visual standard as the rest of the site.',
    href: '/mining-ubuntu',
    icon: TerminalSquare,
  },
]

export function InriMiningPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-black text-white">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(17,143,240,0.2),transparent_38%),linear-gradient(180deg,#07111d_0%,#04070d_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-4xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-primary/90">Mining</p>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Open the mining route that already works for your users.</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                This hub keeps the same mining logic your community already follows, while the pages themselves match the premium look of the new INRI site.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InriLinkButton href="/mining-windows">Mining Windows</InriLinkButton>
                <InriLinkButton href="/mining-ubuntu" variant="secondary">Mining Ubuntu</InriLinkButton>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-2">
              {miningRoutes.map((route) => {
                const Icon = route.icon
                return (
                  <Link
                    key={route.title}
                    href={route.href}
                    className="group rounded-[1.8rem] border border-white/10 bg-[#081322] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition hover:border-primary/45 hover:bg-[#0b1830] sm:p-8"
                  >
                    <div className="inline-flex rounded-2xl border border-primary/25 bg-primary/10 p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-5 text-3xl font-black text-white">{route.title}</h2>
                    <p className="mt-4 text-base leading-8 text-white/70">{route.text}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                      Open page
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
