import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Wallets"
      description="This page is designed to become the central hub for wallets that support the INRI network, making onboarding easier and more professional."
      actions={[
        { label: 'Open INRI Wallet', href: '/inri-wallet' },
        { label: 'Open live wallet', href: 'https://wallet.inri.life', external: true, variant: 'secondary' }
      ]}
      items={[
        { title: 'Compatibility hub', text: 'List every wallet that accepts the INRI network with cleaner explanations and setup instructions.' },
        { title: 'Onboarding first', text: 'Users should immediately understand which wallet to choose and how to connect to the ecosystem.' },
        { title: 'Ready for future expansion', text: 'You can later add device support, browser extension options, mobile options and setup FAQs.' }
      ]}
      resources={[
        { title: 'INRI Wallet', text: 'Official wallet access.', href: '/inri-wallet' },
        { title: 'Mining', text: 'Continue into mining after setup.', href: '/mining' },
        { title: 'Swap', text: 'Use wallets as the gateway to swaps.', href: '/swap' },
        { title: 'P2P', text: 'Move into the peer-to-peer section.', href: '/p2p' }
      ]}
      note="Next step: add supported wallets, install buttons, setup guides, chain parameters and troubleshooting."
    />
  )
}
