import { Medal, Pickaxe, Trophy } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

export function InriMiningChampionshipPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="inri-v20-hero">
          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inri-v20-kicker">Mining Championship</div>
              <h1 className="inri-v20-heading mt-8 max-w-5xl">Follow the active INRI solo mining campaign.</h1>
              <p className="inri-v20-text mt-8 max-w-3xl">The championship route now matches the same premium INRI interface, with clearer campaign framing and direct mining routes.</p>
              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <InriLinkButton href="/mining">Start Mining</InriLinkButton>
                <InriLinkButton href="/pool" variant="secondary">Pool</InriLinkButton>
              </div>
            </div>

            <div className="grid content-center gap-4">
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Trophy className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">150,000 INRI</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Total reward campaign for solo miners.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Pickaxe className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">0.20 INRI</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Reward per valid solo-mined block.</p>
              </div>
              <div className="inri-v20-card">
                <div className="inri-v20-icon"><Medal className="h-5 w-5" /></div>
                <h3 className="mt-6 text-2xl font-black text-white">Ranking</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">Follow top miners and campaign standings.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </InriShell>
  )
}
