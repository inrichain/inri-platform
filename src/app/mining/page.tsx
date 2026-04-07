import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Mining"
      description="The mining section brings together the official INRI mining paths so new users can choose Windows or Ubuntu and enter the network with less confusion."
      actions={[
        { label: 'Mining Windows', href: '/mining/windows' },
        { label: 'Mining Ubuntu', href: '/mining/ubuntu', variant: 'secondary' }
      ]}
      items={[
        { title: 'Windows path', text: 'A dedicated route for users who want the simplest way to start mining on Windows.' },
        { title: 'Ubuntu path', text: 'A Linux-focused route for Ubuntu users who want a cleaner setup path.' },
        { title: 'Network entry point', text: 'Mining remains one of the strongest trust signals for a Proof-of-Work ecosystem.' }
      ]}
      resources={[
        { title: 'Mining Windows', text: 'Open the official Windows mining page.', href: '/mining/windows' },
        { title: 'Mining Ubuntu', text: 'Open the official Ubuntu mining page.', href: '/mining/ubuntu' },
        { title: 'Pool', text: 'Join the pool route if needed.', href: '/pool' },
        { title: 'Explorer', text: 'Verify public chain activity.', href: 'https://explorer.inri.life', external: true }
      ]}
      note="Next step: add real miner downloads, config examples, pool guidance and troubleshooting."
    />
  )
}
