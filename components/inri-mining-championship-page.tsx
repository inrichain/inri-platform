import { Blocks, Cpu, Pickaxe, Trophy } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriMiningChampionshipClient } from '@/components/inri-mining-championship-client'
import { InriUnifiedClientFrame, InriUnifiedHero, InriUnifiedSection } from '@/components/inri-unified'

const START_BLOCK = 1_000_000
const END_BLOCK = 1_500_000

export function InriMiningChampionshipPage() {
  return (
    <InriShell>
      <main className="inri-v26-main">
        <InriUnifiedHero
          eyebrow="OFFICIAL MINING CHAMPIONSHIP"
          title="INRI solo mining championship with ranking, search and reward visibility."
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
          sideTitle="Competition page with real campaign energy."
          sideText="A campaign page must look official, bold and easy to understand while keeping ranking and wallet search functionality."
          sideItems={[
            { title: 'Solo mining only', text: 'The competition is focused on solo mined blocks.', icon: <Pickaxe className="h-4 w-4" /> },
            { title: 'CPU eligible', text: 'CPU miners can participate when blocks are valid.', icon: <Cpu className="h-4 w-4" /> },
            { title: 'Ranking rewards', text: 'Top miners compete for the final prize pool.', icon: <Trophy className="h-4 w-4" /> },
          ]}
        />

        <InriUnifiedSection>
          <div className="inri-v26-card-grid inri-v26-card-grid-3">
            {[
              ['100,000 INRI', 'Distributed as 0.20 INRI per valid solo mined block.', <Blocks className="h-5 w-5" />],
              ['50,000 INRI', 'Reserved for the top 10 miners in the final ranking.', <Trophy className="h-5 w-5" />],
              ['SOLO ONLY', 'The campaign is exclusive to solo mining participants.', <Pickaxe className="h-5 w-5" />],
            ].map(([title, text, icon]) => (
              <div key={String(title)} className="inri-v26-card">
                <div className="inri-v26-card-icon">{icon}</div>
                <h3 className="inri-v26-card-title">{String(title)}</h3>
                <p className="inri-v26-card-text">{String(text)}</p>
              </div>
            ))}
          </div>
        </InriUnifiedSection>

        <InriUnifiedClientFrame>
          <InriMiningChampionshipClient />
        </InriUnifiedClientFrame>
      </main>
    </InriShell>
  )
}
