import type { ReactNode } from 'react'
import { Layers3 } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriAction, InriCard, InriCardGrid, InriHero, InriSection } from '@/components/inri-premium-model'

type Bullet = { title: string; text: string }
type Resource = { title: string; text: string; href: string; external?: boolean }

type InriPageTemplateProps = {
  eyebrow?: string
  title?: string
  description?: string
  actions?: InriAction[]
  items?: Bullet[]
  resources?: Resource[]
  note?: string
  children?: ReactNode
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
      <main>
        <InriHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={actions}
          stats={[
            { label: 'Network', value: 'INRI' },
            { label: 'Chain', value: '3777' },
            { label: 'Runtime', value: 'EVM' },
            { label: 'Design', value: 'Unified' },
          ]}
          sideTitle="Same approved INRI model."
          sideText="This route uses the same dark-blue premium containers, buttons and section rhythm as the full site."
          sideItems={[
            { title: 'Approved model', text: 'Based on the Home direction you approved.', icon: <Layers3 className="h-4 w-4" /> },
          ]}
        />

        {items.length ? (
          <InriSection eyebrow="Page highlights" title="What this route covers.">
            <InriCardGrid cols={3}>
              {items.map((item) => (
                <InriCard key={item.title} title={item.title} text={item.text} />
              ))}
            </InriCardGrid>
          </InriSection>
        ) : null}

        {(children || resources.length || note) ? (
          <InriSection eyebrow="Resources" title="Useful INRI routes.">
            {children ? (
              <div className="mb-6 rounded-[34px] border border-cyan-300/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30rem),linear-gradient(180deg,rgba(10,18,31,0.94),rgba(4,9,17,0.98))] p-6 shadow-[0_36px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.055)]">
                {children}
              </div>
            ) : null}
            {resources.length ? (
              <InriCardGrid cols={3}>
                {resources.map((resource) => (
                  <InriCard key={`${resource.title}-${resource.href}`} title={resource.title} text={resource.text} href={resource.href} external={resource.external} cta="Open" />
                ))}
              </InriCardGrid>
            ) : null}
            {note ? (
              <div className="mt-6 rounded-[24px] border border-cyan-300/12 bg-cyan-400/10 p-5 text-sm leading-7 text-white/72">
                {note}
              </div>
            ) : null}
          </InriSection>
        ) : null}
      </main>
    </InriShell>
  )
}
