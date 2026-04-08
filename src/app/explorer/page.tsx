import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Explorer"
      description="Use the internal explorer page as the bridge between the main INRI website and the live chain explorer. From here users stay inside the same site first, then open the public explorer only when they need block, transaction or contract details."
      actions={[
        { label: 'Open live explorer', href: 'https://explorer.inri.life', external: true },
        { label: 'Read whitepaper', href: '/whitepaper', variant: 'secondary' }
      ]}
      items={[
        { title: 'Blocks and transactions', text: 'Guide users into the public explorer for block heights, tx hashes, addresses and verified contracts.' },
        { title: 'Same-site navigation first', text: 'This route keeps the experience inside the INRI website before sending users to the live external explorer.' },
        { title: 'Ready for future widgets', text: 'Later this page can host embedded blocks, search, contract quick links and explorer shortcuts.' }
      ]}
      resources={[
        { title: 'Whitepaper', text: 'Read the official project structure.', href: '/whitepaper' },
        { title: 'Pool', text: 'Go to the mining pool page.', href: '/pool' },
        { title: 'Mining', text: 'Open the mining routes.', href: '/mining' },
        { title: 'Open live explorer', text: 'Continue to the public explorer.', href: 'https://explorer.inri.life', external: true }
      ]}
      note="Next step for this page: add explorer search, featured contracts, latest blocks and quick verification links."
    />
  )
}
