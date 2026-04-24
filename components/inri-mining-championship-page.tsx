import { Crown, Pickaxe, Trophy, Wallet } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const rewards = [
  ['Solo mining', '0.20 INRI per valid solo mined block'],
  ['Top ranking pool', '50,000 INRI reserved for final ranking'],
  ['Start block', '1,000,000'],
  ['Mode', 'Solo mining only'],
] as const

export function InriMiningChampionshipPage() {
  return (
    <InriShell>
      <main className="inri-bright-main">
        <section className="inri-bright-hero">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.06fr)_390px] xl:items-stretch">
              <div className="inri-bright-card flex flex-col justify-center">
                <div className="inri-bright-chip w-fit">MINING CHAMPIONSHIP</div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-900 sm:text-5xl xl:text-[4.4rem]">
                  Championship page with more impact and the same premium standard as the whole INRI site.
                </h1>
                <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">
                  Promotional pages should feel bold and official. This route now uses the same bright design language as the rest of the platform while keeping the competition information strong and easier to scan.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="/mining">Open mining hub</InriLinkButton>
                  <InriLinkButton href="https://wallet.inri.life" external variant="secondary">INRI Wallet</InriLinkButton>
                </div>
              </div>
              <aside className="inri-bright-card">
                <div className="grid gap-3">
                  {[
                    { title: 'Total campaign', text: '150,000 INRI distributed across solo block rewards and final ranking prizes.', icon: <Trophy className="h-5 w-5" /> },
                    { title: 'Solo focus', text: 'The championship is for solo miners only.', icon: <Pickaxe className="h-5 w-5" /> },
                    { title: 'Official visibility', text: 'A stronger visual page helps the campaign feel more serious and attractive.', icon: <Crown className="h-5 w-5" /> },
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {rewards.map(([title, text]) => (
                <div key={title} className="inri-bright-card">
                  <h3 className="text-xl font-black text-slate-900">{title}</h3>
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
