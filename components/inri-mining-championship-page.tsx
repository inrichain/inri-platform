import { Blocks, Cpu, Pickaxe, Trophy } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriMiningChampionshipClient } from '@/components/inri-mining-championship-client'
import { InriClientFrame, InriHero, InriSection } from '@/components/inri-unified'

const START_BLOCK = 1_000_000
const END_BLOCK = 1_500_000

export function InriMiningChampionshipPage() {
  return (
    <InriShell>
      <main>
        <InriHero
          eyebrow="OFFICIAL MINING CHAMPIONSHIP"
          title="INRI solo mining championship with ranking and reward visibility."
          description="The full championship client stays active below. This page now uses the same premium INRI visual standard as the rest of the website."
          actions={[
            { label: 'Open Wallet', href: 'https://wallet.inri.life', external: true },
            { label: 'Mining Hub', href: '/mining', variant: 'secondary' },
            { label: 'Explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
          ]}
          stats={[
            { label: 'Rewards', value: '150,000 INRI', note: 'Total campaign' },
            { label: 'Per Block', value: '0.20 INRI', note: 'Valid solo block' },
            { label: 'Range', value: `${START_BLOCK.toLocaleString()} → ${END_BLOCK.toLocaleString()}`, note: 'Competition blocks' },
          ]}
          sideTitle="Competition page with campaign energy."
          sideText="A campaign page must look official, bold and easy to understand while keeping ranking and wallet search functionality."
          sideItems={[
            { title: 'Solo mining only', text: 'The competition is focused on solo mined blocks.', icon: <Pickaxe className="h-4 w-4" /> },
            { title: 'CPU eligible', text: 'CPU miners can participate when blocks are valid.', icon: <Cpu className="h-4 w-4" /> },
            { title: 'Ranking rewards', text: 'Top miners compete for the final prize pool.', icon: <Trophy className="h-4 w-4" /> },
          ]}
        />

        <InriSection>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['100,000 INRI', 'Distributed as 0.20 INRI per valid solo mined block.', <Blocks className="h-5 w-5" />],
              ['50,000 INRI', 'Reserved for the top 10 miners in the final ranking.', <Trophy className="h-5 w-5" />],
              ['SOLO ONLY', 'The campaign is exclusive to solo mining participants.', <Pickaxe className="h-5 w-5" />],
            ].map(([title, text, icon]) => (
              <div key={String(title)} className="rounded-[28px] border border-cyan-300/12 bg-[radial-gradient(circle_at_top_left,rgba(25,168,255,0.10),transparent_28rem),linear-gradient(180deg,rgba(10,18,31,0.94),rgba(4,9,17,0.98))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">{icon}</div>
                <h3 className="mt-5 text-2xl font-black text-white">{String(title)}</h3>
                <p className="mt-3 text-sm leading-7 text-white/58">{String(text)}</p>
              </div>
            ))}
          </div>
        </InriSection>

        <InriClientFrame>
          <InriMiningChampionshipClient />
        </InriClientFrame>
      </main>
    </InriShell>
  )
}
