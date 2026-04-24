import Link from 'next/link'
import * as React from 'react'
import { ArrowRight, ExternalLink, Layers3 } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriFeatureGrid, InriPageHero, InriPanelFrame } from '@/components/inri-design-system'

type Action = {
  label: string
  href: string
  external?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

type Bullet = {
  title: string
  text: string
}

type Resource = {
  title: string
  text: string
  href: string
  external?: boolean
}

type InriPageTemplateProps = {
  eyebrow?: string
  title?: string
  description?: string
  actions?: Action[]
  items?: Bullet[]
  resources?: Resource[]
  note?: string
  children?: React.ReactNode
}

export function InriPageTemplate({
  eyebrow = 'INRI CHAIN',
  title = 'INRI Page',
  description = 'Official INRI route in the same visual system used across the platform.',
  actions = [],
  items = [],
  resources = [],
  note,
  children,
}: InriPageTemplateProps) {
  return (
    <InriShell>
      <main className="inri-site-v2 overflow-hidden">
        <InriPageHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={actions}
          stats={[
            { label: 'Network', value: 'INRI', text: 'Mainnet' },
            { label: 'Chain ID', value: '3777', text: 'EVM' },
            { label: 'Design', value: 'Unified', text: 'Same standard' },
            { label: 'Mobile', value: 'Ready', text: 'Responsive' },
          ]}
          features={items.slice(0, 4).map((item) => ({ ...item, icon: Layers3 }))}
          visualEyebrow="INRI V2 Interface"
          visualTitle="Same standard. Every page."
          visualText="This route follows the same visual direction as the Home: stronger hero, squared premium buttons, better contrast and clearer action areas."
        />

        {items.length > 4 ? (
          <section className="inri-section-band border-t border-white/10 py-12 sm:py-16">
            <div className="inri-page-container">
              <InriFeatureGrid items={items.slice(4).map((item) => ({ ...item, icon: Layers3 }))} />
            </div>
          </section>
        ) : null}

        {(children || resources.length > 0 || note) ? (
          <InriPanelFrame
            eyebrow="Resources"
            title="Useful routes and next actions."
            description="Secondary links and page-specific content now use the same INRI premium card language."
          >
            {children ? <div className="mb-8">{children}</div> : null}

            {resources.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {resources.map((resource) => (
                  <Link
                    key={`${resource.title}-${resource.href}`}
                    href={resource.href}
                    {...(resource.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="inri-v2-feature group p-5 sm:p-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black text-white">{resource.title}</h3>
                      <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/64">{resource.text}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary">
                      Open
                      {resource.external ? <ExternalLink className="h-4 w-4" /> : null}
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}

            {note ? (
              <div className="mt-8 border-l-2 border-primary bg-primary/10 p-5 text-sm leading-7 text-white/80">
                {note}
              </div>
            ) : null}
          </InriPanelFrame>
        ) : null}
      </main>
    </InriShell>
  )
}
