import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="P2P"
      description="The P2P page gives INRI another product-level destination for direct community interaction, future trading flows and user-to-user activity."
      actions={[
        { label: 'Open INRI Wallet', href: '/inri-wallet' },
        { label: 'Swap', href: '/swap', variant: 'secondary' }
      ]}
      items={[
        { title: 'Peer-to-peer layer', text: 'This page can later host direct marketplace or user-to-user exchange flows inside the INRI ecosystem.' },
        { title: 'Bigger ecosystem signal', text: 'P2P helps make the website feel like a fuller network platform rather than only a mining site.' },
        { title: 'Ready for future products', text: 'You can later add listings, offers, filters, wallet requirements and safety information.' }
      ]}
      resources={[
        { title: 'INRI Wallet', text: 'Use the wallet as the main entry point.', href: '/inri-wallet' },
        { title: 'Swap', text: 'Open the swap section.', href: '/swap' },
        { title: 'Token Factory', text: 'See where new assets could start.', href: '/token-factory' },
        { title: 'Whitepaper', text: 'Read the broader network direction.', href: '/whitepaper' }
      ]}
      note="Next step: add P2P use cases, safety notes, onboarding guidance and product cards."
    />
  )
}
