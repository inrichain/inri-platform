import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      eyebrow="INRI Wallet"
      title="Official wallet access in the same premium language as the rest of the platform."
      description="Use this route as the official bridge between the main INRI website and the live INRI Wallet. Users stay inside the same design system first, then open the wallet only when they are ready to connect, send, stake or interact with the ecosystem."
      actions={[
        { label: 'Open live wallet', href: 'https://wallet.inri.life', external: true },
        { label: 'See supported wallets', href: '/wallets', variant: 'secondary' },
      ]}
      items={[
        { title: 'Official ecosystem entry', text: 'This is the clean bridge to wallet.inri.life for users who want the native INRI experience.' },
        { title: 'Same-site onboarding first', text: 'Keep users inside the INRI platform language before they jump into wallet actions and transactions.' },
        { title: 'Connected with the rest of the routes', text: 'Wallet, explorer, staking, token factory and P2P now read like one platform instead of separate pages.' },
      ]}
      resources={[
        { title: 'Wallets', text: 'Review all supported wallet options and network setup values.', href: '/wallets' },
        { title: 'Staking', text: 'Go from wallet setup to staking routes without leaving the site flow.', href: '/staking' },
        { title: 'Token Factory', text: 'Use the wallet to launch tokens inside the INRI ecosystem.', href: '/token-factory' },
        { title: 'Open live wallet', text: 'Continue to the official wallet.', href: 'https://wallet.inri.life', external: true },
      ]}
      note="This route is part of the full-site sync pass so the official wallet entry now feels like the rest of the INRI platform instead of a disconnected screen."
    />
  )
}
