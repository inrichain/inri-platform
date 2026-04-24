import type { ReactNode } from 'react'
import { InriShell } from '@/components/inri-site-shell'
import { InriAction, InriCard, InriCardGrid, InriHero, InriSection } from '@/components/inri-unified'

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
            { label: 'Network', value: 'INRI', note: 'Chain 3777' },
            { label: 'Interface', value: 'Unified', note: 'Same page standard' },
            { label: 'Runtime', value: 'EVM', note: 'Compatible route' },
          ]}
          sideTitle="Same visual system."
          sideText="This route uses the same INRI dark-blue standard as the home, mining, staking, pool and P2P pages."
        />

        {items.length ? (
          <InriSection eyebrow="Page highlights" title="What this route covers.">
            <InriCardGrid>
              {items.map((item) => (
                <InriCard key={item.title} title={item.title} text={item.text} />
              ))}
            </InriCardGrid>
          </InriSection>
        ) : null}

        <InriSection eyebrow="Resources" title="Useful INRI routes.">
          {children ? (
            <div className="mb-6 rounded-[28px] border border-cyan-300/12 bg-[radial-gradient(circle_at_top_left,rgba(25,168,255,0.10),transparent_28rem),linear-gradient(180deg,rgba(10,18,31,0.94),rgba(4,9,17,0.98))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.05)]">
              {children}
            </div>
          ) : null}
          {resources.length ? (
            <InriCardGrid>
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
      </main>
    </InriShell>
  )
}
