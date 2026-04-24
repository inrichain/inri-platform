import { Blocks, Cpu, Pickaxe, Trophy } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriMiningChampionshipClient } from '@/components/inri-mining-championship-client'

const START_BLOCK = 1_000_000
const END_BLOCK = 1_500_000

const highlightCards = [
  {
    title: '150,000 INRI total rewards',
    text: '100,000 INRI through 0.20 INRI per valid solo block and 50,000 INRI reserved for the top 10 miners.',
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    title: 'Block range fixed',
    text: `The competition starts at block ${START_BLOCK.toLocaleString('en-US')} and closes at block ${END_BLOCK.toLocaleString('en-US')}.`,
    icon: <Blocks className="h-5 w-5" />,
  },
  {
    title: 'Solo + CPU eligible',
    text: 'The rule is simple: solo mining only. CPU miners are valid participants when the produced block is legitimate.',
    icon: <Cpu className="h-5 w-5" />,
  },
] as const

export function InriMiningChampionshipPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-12 lg:py-14">
            <div className="mx-auto max-w-[1460px] space-y-7">
              <div className="grid gap-7 xl:grid-cols-[minmax(0,1.06fr)_410px] xl:items-stretch">
                <div className="rounded-[2.15rem] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.15),transparent_28%),linear-gradient(180deg,rgba(5,16,27,0.98),rgba(1,5,10,0.99))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] sm:p-7 lg:p-8">
                  <div className="inline-flex items-center rounded-full border border-primary/24 bg-primary/[0.10] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                    Official competition page
                  </div>
                  <h1 className="mt-5 max-w-[900px] text-4xl font-black leading-[0.95] text-white sm:text-5xl xl:text-[4.3rem]">
                    INRI Independent Mining Championship is now live from block 1,000,000 to 1,500,000.
                  </h1>
                  <p className="mt-5 max-w-[840px] text-base leading-8 text-white/66 sm:text-lg">
                    A dedicated official page where miners can follow the current top 5, search their wallet address, estimate rewards and verify every address through the official explorer.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                      Open INRI Wallet
                    </InriLinkButton>
                    <InriLinkButton href="https://explorer.inri.life" external variant="secondary" noTranslate>
                      Official explorer
                    </InriLinkButton>
                    <InriLinkButton href="/mining" variant="secondary">
                      Mining hub
                    </InriLinkButton>
                  </div>

                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    {highlightCards.map((item) => (
                      <div key={item.title} className="inri-subcard rounded-[1.45rem] p-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
                          {item.icon}
                        </div>
                        <div className="mt-4 text-lg font-black text-white">{item.title}</div>
                        <p className="mt-2 text-sm leading-7 text-white/58">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="inri-section-surface rounded-[2rem] p-6 sm:p-7">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Official announcement</p>
                  <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-[2rem]">
                    Championship rules in one clean official panel.
                  </h2>
                  <div className="mt-5 grid gap-3">
                    {[
                      ['Base block reward', '0.20 INRI per valid solo block'],
                      ['Ranking pool', '50,000 INRI for top 10 miners'],
                      ['Mining mode', 'Solo mining only'],
                      ['Eligibility', 'A valid INRI wallet address is required'],
                    ].map(([label, value]) => (
                      <div key={label} className="inri-subcard rounded-[1.25rem] p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/44">{label}</div>
                        <div className="mt-2 text-base font-black text-white">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.3rem] border border-primary/16 bg-primary/[0.08] p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
                        <Pickaxe className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-[0.18em] text-primary">Competition spirit</div>
                        <p className="mt-2 text-sm leading-7 text-white/66">
                          This is not a spectator page. It is built for real miners, ecosystem builders and participants ready to put their address on-chain and compete.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <InriMiningChampionshipClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
