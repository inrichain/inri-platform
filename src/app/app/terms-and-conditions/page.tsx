import { InriPageTemplate } from '@/components/inri-page-template'

export default function Page() {
  return (
    <InriPageTemplate
      title="Terms and Conditions"
      description="This page is ready to receive the official INRI terms and conditions in the same visual language as the rest of the site."
      actions={[
        { label: 'Contact', href: 'mailto:contact@inri.life' },
        { label: 'Privacy Policy', href: '/privacy-policy', variant: 'secondary' }
      ]}
      items={[
        { title: 'Use of platform', text: 'Describe how users can access and interact with the website, wallet routes and ecosystem pages.' },
        { title: 'Limitations and liability', text: 'Add the final legal wording for service limitations, risk disclosures and user responsibilities.' },
        { title: 'Policy references', text: 'Link the terms to privacy, community channels and other relevant support or legal pages.' }
      ]}
      note="Replace this placeholder content with the final legal terms when the INRI terms are ready."
    />
  )
}
