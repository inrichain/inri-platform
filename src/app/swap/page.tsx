import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Swap"
      description="The swap page gives INRI a real place for future token swaps, liquidity flows and exchange activity inside the official website structure."
      actions={[
        { label: 'Open INRI Wallet', href: 'https://wallet.inri.life', external: true },
        { label: 'Open explorer', href: '/explorer', variant: 'secondary' }
      ]}
      items={[
        { title: 'Future swap hub', text: 'This page is ready to become the official place for swap access, pair discovery, routing and liquidity information.' },
        { title: 'Professional growth layer', text: 'A dedicated swap page makes the network feel more mature than a site limited to only mining and explorer links.' },
        { title: 'Ready for integrations', text: 'Later you can add swap widgets, pair cards, token routes, liquidity explanations and safety notes here.' }
      ]}
      resources={[
        { title: 'Token Factory', text: 'Launch tokens that could later appear in the swap flow.', href: '/token-factory' },
        { title: 'P2P', text: 'Open the P2P section.', href: '/p2p' },
        { title: 'INRI Wallet', text: 'Use the wallet as the main ecosystem entry.', href: 'https://wallet.inri.life', external: true },
        { title: 'Whitepaper', text: 'Read the project direction and structure.', href: '/whitepaper' }
      ]}
      note="Next step for this page: add pair cards, liquidity blocks, swap widget space, safety notes and supported-token sections."
    />
  )
}
