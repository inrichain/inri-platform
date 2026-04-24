import { Activity, Coins, Pickaxe, ShieldCheck } from 'lucide-react'
import { InriShell, InriLinkButton } from '@/components/inri-site-shell'
import { InriPoolClient } from '@/components/inri-pool-client'

export function InriPoolPage() {
  return (
    <InriShell>
      <main className="inri-bright-main">
        <section className="inri-bright-hero">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.04fr)_390px] xl:items-stretch">
              <div className="inri-bright-card flex flex-col justify-center">
                <div className="inri-bright-chip w-fit">INRI POOL</div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-900 sm:text-5xl xl:text-[4.4rem]">
                  Pool page with the same bright premium identity as the rest of the platform.
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  The pool should look official, easy to trust and visually aligned with the home page. This page now presents the pool area in a cleaner and more highlighted way instead of another heavy dark block.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="/mining">Open mining hub</InriLinkButton>
                  <InriLinkButton href="https://wallet.inri.life" external variant="secondary">INRI Wallet</InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Explorer</InriLinkButton>
                </div>
              </div>

              <aside className="inri-bright-card">
                <div className="grid gap-3">
                  {[
                    { title: 'Cleaner dashboard frame', text: 'The pool client now sits inside a white premium shell.', icon: <Activity className="h-5 w-5" /> },
                    { title: 'Better user trust', text: 'Bright surfaces and better spacing help the pool feel more serious and polished.', icon: <ShieldCheck className="h-5 w-5" /> },
                    { title: 'Direct mining flow', text: 'Users can move between mining, wallet and pool routes without visual friction.', icon: <Pickaxe className="h-5 w-5" /> },
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
              </aside>
            </div>
          </div>
        </section>

        <section className="inri-bright-section pt-0">
          <div className="inri-page-container">
            <div className="inri-bright-card p-3 sm:p-5 lg:p-6">
              <div className="inri-bright-embed rounded-[1.5rem] p-3 sm:p-4 lg:p-6">
                <InriPoolClient />
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
