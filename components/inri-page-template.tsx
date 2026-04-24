import type { ReactNode } from 'react'
import { Layers3 } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import {
  InriAction,
  InriUnifiedCard,
  InriUnifiedHero,
  InriUnifiedSection,
} from '@/components/inri-unified'

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
      <main className="inri-v26-main">
        <InriUnifiedHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={actions}
          stats={[
            { label: 'Network', value: 'INRI', note: 'Chain 3777' },
            { label: 'Interface', value: 'Unified', note: 'Same page standard' },
            { label: 'Runtime', value: 'EVM', note: 'Compatible route' },
          ]}
          sideTitle="Same visual system."
          sideText="This route uses the same INRI dark-blue standard as the home, mining, staking, pool and P2P pages."
          sideItems={[
            { title: 'Premium shell', text: 'Header, hero, cards and CTAs stay consistent.', icon: <Layers3 className="h-4 w-4" /> },
          ]}
        />

        {items.length ? (
          <InriUnifiedSection eyebrow="Page highlights" title="What this route covers.">
            <div className="inri-v26-card-grid">
              {items.map((item) => (
                <InriUnifiedCard key={item.title} title={item.title} text={item.text} />
              ))}
            </div>
          </InriUnifiedSection>
        ) : null}

        <InriUnifiedSection eyebrow="Resources" title="Useful INRI routes.">
          {children ? <div className="inri-v26-template-content">{children}</div> : null}
          {resources.length ? (
            <div className="inri-v26-card-grid">
              {resources.map((resource) => (
                <InriUnifiedCard
                  key={`${resource.title}-${resource.href}`}
                  title={resource.title}
                  text={resource.text}
                  href={resource.href}
                  external={resource.external}
                  cta="Open"
                />
              ))}
            </div>
          ) : null}
          {note ? <div className="inri-v26-note">{note}</div> : null}
        </InriUnifiedSection>
      </main>
    </InriShell>
  )
}
