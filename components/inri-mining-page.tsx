import { ArrowRight, Blocks, Cpu, Download, Pickaxe, ShieldCheck, Trophy } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const cards = [
  {
    title: 'Pool mining',
    text: 'Open the pool route with the same premium layout and a clearer path for active miners.',
    href: '/pool',
    label: 'Open pool',
    icon: <Blocks className="h-5 w-5" />,
  },
  {
    title: 'Windows miner',
    text: 'Access the Windows guide with a lighter and better organized step-by-step experience.',
    href: '/mining-windows',
    label: 'Open Windows guide',
    icon: <Download className="h-5 w-5" />,
  },
  {
    title: 'Ubuntu miner',
    text: 'Keep the Ubuntu install flow official, clear and easier to follow on desktop and mobile.',
    href: '/mining-ubuntu',
    label: 'Open Ubuntu guide',
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    title: 'Championship',
    text: 'Connect solo mining with the official competition route inside the same design language.',
    href: '/mining-championship/',
    label: 'Open championship',
    icon: <Trophy className="h-5 w-5" />,
  },
] as const

export function InriMiningPage() {
  return (
    <InriShell>
      <main className="inri-bright-main">
        <section className="inri-bright-hero">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.05fr)_380px] xl:items-stretch">
              <div className="inri-bright-card flex flex-col justify-center">
                <div className="inri-bright-chip w-fit">INRI MINING HUB</div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-900 sm:text-5xl xl:text-[4.4rem]">
                  Mining pages that finally match the quality of the home page.
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  The mining area should feel official, attractive and organized — not like a separate dark website. This route now works as the clean gateway to pool mining, solo mining, guides and championship pages.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="/pool">Open pool</InriLinkButton>
                  <InriLinkButton href="/mining-windows" variant="secondary">Windows mining</InriLinkButton>
                  <InriLinkButton href="/mining-ubuntu" variant="secondary">Ubuntu mining</InriLinkButton>
                </div>
              </div>
              <aside className="inri-bright-card">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-sky-200 bg-sky-50 text-sky-600">
                  <Pickaxe className="h-6 w-6" />
                </div>
                <p className="inri-bright-kicker mt-5">Mining focus</p>
                <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900">One visual language for every miner journey.</h2>
                <div className="mt-5 grid gap-3">
                  {[
                    ['Better first impression', 'The mining hub now feels more premium and easier to navigate.'],
                    ['Unified routes', 'Guides, pool, solo mining and championship feel connected.'],
                    ['Responsive layout', 'Cards and actions keep the same rhythm on mobile and desktop.'],
                  ].map(([label, text]) => (
                    <div key={label} className="inri-bright-subcard">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">{label}</div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="inri-bright-section">
          <div className="inri-page-container">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <div key={card.title} className="inri-bright-card">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-sky-200 bg-sky-50 text-sky-600">
                    {card.icon}
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-slate-900">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
                  <div className="mt-6">
                    <InriLinkButton href={card.href} variant="secondary">{card.label}</InriLinkButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="inri-bright-section pt-0">
          <div className="inri-page-container">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_380px]">
              <div className="inri-bright-card">
                <p className="inri-bright-kicker">Essential routes</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-900">What users should find instantly.</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: 'Get started fast',
                      text: 'Give users a direct path to mining setup without visual confusion.',
                    },
                    {
                      title: 'Stay official',
                      text: 'Routes should feel like one INRI platform, not different sites stitched together.',
                    },
                    {
                      title: 'Highlight actions',
                      text: 'Pool, Windows, Ubuntu and Championship should always be visible and obvious.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="inri-bright-subcard">
                      <div className="text-lg font-black text-slate-900">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="inri-bright-card">
                <div className="rounded-[1.25rem] border border-sky-200 bg-sky-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-[0.16em] text-sky-700">Visual standard</div>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        Premium white cards, cleaner buttons and consistent spacing help the mining section feel stronger and more trustworthy.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <InriLinkButton href="/mining-championship/">Open championship</InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Explorer</InriLinkButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
