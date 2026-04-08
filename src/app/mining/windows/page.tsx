import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Mining Windows"
      description="This page is ready to become the official Windows mining guide for INRI CHAIN with cleaner onboarding and stronger visual trust."
      actions={[
        { label: 'Back to Mining', href: '/mining' },
        { label: 'Open Pool', href: '/pool', variant: 'secondary' }
      ]}
      items={[
        { title: 'Windows-first onboarding', text: 'A focused guide for users who want the easiest route into INRI mining.' },
        { title: 'Cleaner setup flow', text: 'This page can later hold miner downloads, batch files, config examples and pool options.' },
        { title: 'Stronger first impression', text: 'A polished mining page helps the network feel more mature and easier to join.' }
      ]}
      resources={[
        { title: 'Mining', text: 'Return to the mining overview.', href: '/mining' },
        { title: 'Pool', text: 'Open the pool section.', href: '/pool' },
        { title: 'Wallets', text: 'Prepare wallet support before mining.', href: '/wallets' },
        { title: 'Explorer', text: 'Verify network activity externally.', href: '/explorer' }
      ]}
      note="Next step: add the real Windows miner download, config examples and payout guidance."
    />
  )
}
