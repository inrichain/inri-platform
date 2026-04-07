import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Privacy Policy"
      description="This page is ready to receive the official INRI privacy policy in the same premium visual system used across the site."
      actions={[
        { label: 'Contact', href: 'mailto:contact@inri.life' },
        { label: 'Whitepaper', href: '/whitepaper', variant: 'secondary' }
      ]}
      items={[
        { title: 'Data handling', text: 'Add the final policy language for analytics, contact forms, wallet connections and any other data flow used by the site.' },
        { title: 'Third-party services', text: 'Document any explorer, analytics, wallet, hosting or community services referenced by the platform.' },
        { title: 'User rights', text: 'Describe the rights users have over their information and how they can reach the team.' }
      ]}
      note="Replace this placeholder content with the final legal text when the INRI privacy policy is ready."
    />
  )
}
