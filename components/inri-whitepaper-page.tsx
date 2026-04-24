import { Blocks, Coins, FileText, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const sections = [
  {
    title: 'Network foundation',
    text: 'INRI CHAIN is an EVM-compatible blockchain with chain ID 3777, built to support wallet access, mining, token launches, staking and ecosystem tools from a single platform.',
  },
  {
    title: 'Ecosystem routes',
    text: 'The website connects the official wallet, explorer, mining hub, pool, staking, token factory and P2P market in a consistent user experience.',
  },
  {
    title: 'Token and participation',
    text: 'The whitepaper page should explain the ecosystem in a clear, readable and trustworthy way, without looking disconnected from the rest of the website.',
  },
] as const

export function InriWhitepaperPage() {
  return (
    <InriShell>
      <main className="inri-bright-main">
        <section className="inri-bright-hero">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.08fr)_390px] xl:items-stretch">
              <div className="inri-bright-card flex flex-col justify-center">
                <div className="inri-bright-chip w-fit">WHITEPAPER</div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-900 sm:text-5xl xl:text-[4.4rem]">
                  Whitepaper page with stronger readability and the same premium identity as the entire INRI platform.
                </h1>
                <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
                  Documentation pages should feel just as polished as the home page. This version presents the whitepaper inside the same bright design language so the website looks complete and professional from end to end.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="https://wallet.inri.life" external>INRI Wallet</InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Explorer</InriLinkButton>
                  <InriLinkButton href="/staking" variant="secondary">Staking</InriLinkButton>
                </div>
              </div>
              <aside className="inri-bright-card">
                <div className="grid gap-3">
                  {[
                    { title: 'Cleaner reading flow', text: 'Long-form content should be more readable and more trustworthy.', icon: <FileText className="h-5 w-5" /> },
                    { title: 'Better structure', text: 'Summary cards and sections make the page easier to scan.', icon: <Blocks className="h-5 w-5" /> },
                    { title: 'Unified standard', text: 'The whitepaper now belongs to the same visual family as every other route.', icon: <ShieldCheck className="h-5 w-5" /> },
                  ].map((item) => (
                    <div key={item.title} className="inri-bright-subcard">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">{item.icon}</div>
                        <div className="text-base font-black text-slate-900">{item.title}</div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="inri-bright-section">
          <div className="inri-page-container">
            <div className="grid gap-4 md:grid-cols-3">
              {sections.map((section) => (
                <div key={section.title} className="inri-bright-card">
                  <h2 className="text-2xl font-black text-slate-900">{section.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{section.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="inri-bright-section pt-0">
          <div className="inri-page-container">
            <div className="inri-bright-card">
              <p className="inri-bright-kicker">Core document summary</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-900">INRI CHAIN overview</h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_360px]">
                <div className="space-y-5 text-[15px] leading-8 text-slate-600">
                  <p>
                    INRI CHAIN combines blockchain infrastructure, an official wallet route, mining access, pool support, staking, token creation and P2P tools inside one ecosystem.
                  </p>
                  <p>
                    A strong whitepaper page is not just about text. It must also visually reinforce project trust. The new bright premium direction helps the whitepaper feel more serious and more connected to the rest of the official platform.
                  </p>
                  <p>
                    The page is now designed to read clearly on desktop and mobile with better spacing, softer surfaces and more visible action links.
                  </p>
                </div>
                <div className="inri-bright-subcard">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-slate-500">Quick facts</div>
                  <div className="mt-4 grid gap-3">
                    {[
                      ['Chain ID', '3777'],
                      ['Compatibility', 'EVM'],
                      ['Core routes', 'Wallet · Mining · Staking · P2P'],
                    ].map(([label, value]) => (
                      <div key={label} className="inri-bright-soft">
                        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</div>
                        <div className="mt-2 text-sm font-black text-slate-900">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
