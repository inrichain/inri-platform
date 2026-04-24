import { Cpu, Terminal, ShieldCheck, Pickaxe } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

export function InriMiningUbuntuPage() {
  return (
    <InriShell>
      <main className="inri-bright-main">
        <section className="inri-bright-hero">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.06fr)_390px] xl:items-stretch">
              <div className="inri-bright-card flex flex-col justify-center">
                <div className="inri-bright-chip w-fit">UBUNTU MINING</div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-900 sm:text-5xl xl:text-[4.4rem]">
                  Ubuntu mining guide with a brighter layout and more consistent page structure.
                </h1>
                <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
                  Technical routes also need better presentation. This Ubuntu guide now follows the same spacing, cards and button standards used across the updated INRI website.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="/mining">Open mining hub</InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">Open pool</InriLinkButton>
                </div>
              </div>
              <aside className="inri-bright-card">
                <div className="grid gap-3">
                  {[
                    { title: 'Terminal friendly', text: 'Commands and steps can now be wrapped in cleaner instruction cards.', icon: <Terminal className="h-5 w-5" /> },
                    { title: 'Cleaner visual flow', text: 'The guide is easier to scan on desktop and mobile.', icon: <Cpu className="h-5 w-5" /> },
                    { title: 'Site consistency', text: 'The technical page no longer feels disconnected from the main platform.', icon: <ShieldCheck className="h-5 w-5" /> },
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
              {[
                ['1. Prepare environment', 'Install dependencies, choose your miner and create the INRI wallet address.'],
                ['2. Configure execution', 'Set the pool or solo parameters and save the launch script.'],
                ['3. Run and monitor', 'Launch the miner and verify activity through the pool or explorer.'],
              ].map(([title, text]) => (
                <div key={title} className="inri-bright-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600"><Pickaxe className="h-5 w-5" /></div>
                  <h3 className="mt-4 text-xl font-black text-slate-900">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
