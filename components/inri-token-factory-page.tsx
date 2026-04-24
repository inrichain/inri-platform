import { Factory, Layers3, Sparkles, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="inri-bright-main">
        <section className="inri-bright-hero">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.04fr)_390px] xl:items-stretch">
              <div className="inri-bright-card flex flex-col justify-center">
                <div className="inri-bright-chip w-fit">TOKEN FACTORY</div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-900 sm:text-5xl xl:text-[4.4rem]">
                  Token creation route with more impact, more clarity and the same premium standard as the whole site.
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  The token factory should look like a high-value product page, not an isolated tool. This version gives it a brighter shell, stronger hierarchy and better consistency across the INRI platform.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="https://wallet.inri.life" external>Open INRI Wallet</InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Explorer</InriLinkButton>
                  <InriLinkButton href="/whitepaper" variant="secondary">Whitepaper</InriLinkButton>
                </div>
              </div>
              <aside className="inri-bright-card">
                <div className="grid gap-3">
                  {[
                    { title: 'Product-like presentation', text: 'The factory should feel polished and official.', icon: <Factory className="h-5 w-5" /> },
                    { title: 'Same design language', text: 'Cards, buttons and spacing now match the rest of the website.', icon: <Layers3 className="h-5 w-5" /> },
                    { title: 'More highlight', text: 'A brighter layout makes the tool easier to notice and trust.', icon: <Sparkles className="h-5 w-5" /> },
                  ].map((item) => (
                    <div key={item.title} className="inri-bright-subcard">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
                          {item.icon}
                        </div>
                        <div className="text-base font-black text-slate-900">{item.title}</div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[1.25rem] border border-sky-200 bg-sky-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-[0.16em] text-sky-700">Visual rule</div>
                      <p className="mt-2 text-sm leading-7 text-slate-700">The token creator should feel fully integrated with the official INRI website experience.</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="inri-bright-section pt-0">
          <div className="inri-page-container">
            <div className="inri-bright-card p-3 sm:p-5 lg:p-6">
              <div className="inri-bright-embed rounded-[1.5rem] p-3 sm:p-4 lg:p-6">
                <InriTokenFactoryClient />
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
