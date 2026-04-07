import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="INRI Wallet"
      description="The official wallet section is the main ecosystem entry point for users who want to access INRI tools, prepare addresses and move deeper into the network."
      actions={[
        { label: 'Open live wallet', href: 'https://wallet.inri.life', external: true },
        { label: 'Wallets page', href: '/wallets', variant: 'secondary' }
      ]}
      items={[
        { title: 'Official wallet route', text: 'Give users one clear path into the ecosystem through the official INRI Wallet experience.' },
        { title: 'Ready for onboarding', text: 'This page can hold wallet downloads, setup instructions, seed phrase guidance and support notes.' },
        { title: 'Ecosystem gateway', text: 'From here users can continue into mining, staking, swap, token factory, pool and P2P sections.' }
      ]}
      resources={[
        { title: 'Live wallet', text: 'Open wallet.inri.life.', href: 'https://wallet.inri.life', external: true },
        { title: 'Wallets', text: 'See other wallet options that support the network.', href: '/wallets' },
        { title: 'Swap', text: 'Continue into the swap section.', href: '/swap' },
        { title: 'Explorer', text: 'Inspect activity externally.', href: 'https://explorer.inri.life', external: true }
      ]}
      note="Next step: add wallet download cards, setup flow, screenshots, security notes and ecosystem shortcuts."
    />
  )
}
