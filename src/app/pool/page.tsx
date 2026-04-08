import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Pool"
      description="The pool page gives miners and participants a cleaner, more trustworthy way to understand pool activity and join the INRI network."
      actions={[
        { label: 'Open pool', href: 'https://pool.inri.life', external: true },
        { label: 'Mining', href: '/mining', variant: 'secondary' }
      ]}
      items={[
        { title: 'Participation route', text: 'This page is the right home for pool entry points, stats, payouts, fees and miner onboarding.' },
        { title: 'Network trust signal', text: 'A dedicated pool page makes INRI feel more like a real ecosystem and less like a scattered link list.' },
        { title: 'Ready for live metrics', text: 'You can later add real-time pool data, miners, blocks, payouts and dashboard cards here.' }
      ]}
      resources={[
        { title: 'Live pool', text: 'Open pool.inri.life.', href: 'https://pool.inri.life', external: true },
        { title: 'Mining Windows', text: 'Start with the Windows mining page.', href: '/mining/windows' },
        { title: 'Mining Ubuntu', text: 'Start with the Ubuntu mining page.', href: '/mining/ubuntu' },
        { title: 'Explorer', text: 'Verify pool-related activity externally.', href: '/explorer' }
      ]}
      note="Next step: add pool stats, worker data, payout explanations, fee info and real-time widgets."
    />
  )
}
