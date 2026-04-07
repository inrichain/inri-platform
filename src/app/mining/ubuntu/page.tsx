import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Mining Ubuntu"
      description="This page is ready to become the official Ubuntu mining guide for INRI CHAIN with a cleaner Linux-focused setup path."
      actions={[
        { label: 'Back to Mining', href: '/mining' },
        { label: 'Open Pool', href: '/pool', variant: 'secondary' }
      ]}
      items={[
        { title: 'Ubuntu route', text: 'A dedicated page for Linux users who want to join the INRI mining ecosystem.' },
        { title: 'Professional structure', text: 'This area can later hold commands, config examples, pool references and troubleshooting.' },
        { title: 'Network access', text: 'Mining remains a core access path for a community-driven Proof-of-Work chain.' }
      ]}
      resources={[
        { title: 'Mining', text: 'Return to the mining overview.', href: '/mining' },
        { title: 'Mining Windows', text: 'See the Windows route.', href: '/mining/windows' },
        { title: 'Pool', text: 'Open the pool section.', href: '/pool' },
        { title: 'Explorer', text: 'Verify chain activity externally.', href: 'https://explorer.inri.life', external: true }
      ]}
      note="Next step: add Linux commands, configs, pool guidance and troubleshooting."
    />
  )
}
