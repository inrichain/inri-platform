import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Whitepaper"
      description="This page gives the INRI whitepaper a cleaner place inside the main website so the project can present itself with a stronger, more serious structure."
      actions={[
        { label: 'Open live whitepaper', href: 'https://www.inri.life/whitepaper', external: true },
        { label: 'Open explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' }
      ]}
      items={[
        { title: 'Official project overview', text: 'Use this page for tokenomics, vision, architecture and long-term direction.' },
        { title: 'Trust-building layer', text: 'A clear whitepaper page strengthens the perception of the network for users and partners.' },
        { title: 'Ready for structured content', text: 'You can later add sections, navigation blocks, linked chapters and downloadable versions.' }
      ]}
      resources={[
        { title: 'Live whitepaper', text: 'Open the current whitepaper.', href: 'https://www.inri.life/whitepaper', external: true },
        { title: 'Wallets', text: 'Return to ecosystem onboarding.', href: '/wallets' },
        { title: 'Token Factory', text: 'See builder-focused product direction.', href: '/token-factory' },
        { title: 'Explorer', text: 'Verify public chain activity.', href: 'https://explorer.inri.life', external: true }
      ]}
      note="Next step: move the full whitepaper into this structure with chapter sections and stronger navigation."
    />
  )
}
