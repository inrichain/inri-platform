import type { Metadata } from 'next'
import { InriMiningChampionshipPage } from '@/components/inri-mining-championship-page'

export const metadata: Metadata = {
  title: 'Mining Championship',
  description:
    'Official INRI CHAIN independent mining championship page with block window, live-style ranking, address search and reward overview.',
}

export default function MiningChampionshipRoute() {
  return <InriMiningChampionshipPage />
}
