import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Token Factory"
      description="Token Factory now lives inside the same INRI website flow, giving builders a clear internal route for token creation, launch guidance and future project onboarding."
      actions={[
        { label: 'Open INRI Wallet', href: '/inri-wallet' },
        { label: 'Open swap page', href: '/swap', variant: 'secondary' }
      ]}
      items={[
        { title: 'Launch tokens on INRI', text: 'This page is the right home for token creation flows, standards, fees, deployment guidance and branding later.' },
        { title: 'Project onboarding layer', text: 'A network feels more complete when builders can clearly see where token creation and launch tooling will live.' },
        { title: 'Prepared for future tools', text: 'Later this section can host token forms, presets, creation guides, cost details and links to explorer verification.' }
      ]}
      resources={[
        { title: 'Swap', text: 'See where created tokens could later be swapped.', href: '/swap' },
        { title: 'Wallets', text: 'Open the wallet compatibility page.', href: '/wallets' },
        { title: 'INRI Wallet', text: 'Use the official wallet section.', href: '/inri-wallet' },
        { title: 'Explorer', text: 'Verify tokens and activity externally.', href: '/explorer' }
      ]}
      note="Next step for this page: add token creation flow cards, standards, cost notes, examples, deployment steps and launch guidance."
    />
  )
}
