import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Staking"
      description="This page is ready to become the main staking presentation for the INRI ecosystem, with cleaner hierarchy and more user trust."
      actions={[
        { label: 'Open live staking', href: 'https://www.inri.life/staking', external: true },
        { label: 'Open INRI Wallet', href: 'https://wallet.inri.life', variant: 'secondary', external: true }
      ]}
      items={[
        { title: 'Dedicated staking hub', text: 'Present plans, rewards, rules and wallet flow in one clean and focused page.' },
        { title: 'Premium ecosystem feel', text: 'Staking deserves a full product page if the network wants to look complete and serious.' },
        { title: 'Prepared for details', text: 'This area can later include APY cards, plan breakdowns, lock periods and FAQ sections.' }
      ]}
      resources={[
        { title: 'Live staking page', text: 'Open the current staking page.', href: 'https://www.inri.life/staking', external: true },
        { title: 'INRI Wallet', text: 'Use the wallet before staking.', href: 'https://wallet.inri.life', external: true },
        { title: 'Pool', text: 'Compare another participation route.', href: '/pool' },
        { title: 'Whitepaper', text: 'Read the broader network direction.', href: '/whitepaper' }
      ]}
      note="Next step: add staking plans, reward cards, smart contract references, wallet steps and FAQs."
    />
  )
}
