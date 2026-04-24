import Link from 'next/link'
import * as React from 'react'
import { ArrowRight, ExternalLink, Layers3 } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

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
  description = 'Official INRI route in the same bright visual system used across the platform.',
  actions = [],
  items = [],
  resources = [],
  note,
  children,
}: InriPageTemplateProps) {
  return (
    <InriShell>
      <main className="inri-bright-main">
        <section className="inri-bright-hero">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.05fr)_380px] xl:items-stretch">
              <div className="inri-bright-card flex flex-col justify-center">
                <div className="inri-bright-chip w-fit">{eyebrow}</div>
                <h1 className="inri-bright-title mt-6 max-w-5xl text-4xl font-black leading-[0.96] tracking-[-0.05em] sm:text-5xl xl:text-[4.4rem]">
                  {title}
                </h1>
                <p className="inri-bright-text mt-6 max-w-3xl text-base leading-8 sm:text-lg">
                  {description}
                </p>

                {actions.length > 0 ? (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {actions.map((action) => (
                      <InriLinkButton
                        key={`${action.label}-${action.href}`}
                        href={action.href}
                        external={action.external}
                        variant={action.variant || 'primary'}
                      >
                        {action.label}
                      </InriLinkButton>
                    ))}
                  </div>
                ) : null}
              </div>

              <aside className="inri-bright-card">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-sky-200 bg-sky-50 text-sky-600">
                  <Layers3 className="h-6 w-6" />
                </div>
                <p className="inri-bright-kicker mt-5">Unified page standard</p>
                <h2 className="mt-3 text-3xl font-black text-slate-900">Same layout logic. Every route.</h2>
                <p className="inri-bright-text mt-4 text-sm leading-7">
                  This page inherits the same spacing, white surfaces, premium buttons and responsive rhythm used across the new INRI visual system.
                </p>
                <div className="mt-6 grid gap-3">
                  {[
                    ['Brighter surfaces', 'White and blue layered cards instead of heavy black panels.'],
                    ['Stronger hierarchy', 'Clear headings, action areas and supporting blocks.'],
                    ['Responsive structure', 'Mobile and desktop now follow the same visual standard.'],
                  ].map(([label, value]) => (
                    <div key={label} className="inri-bright-subcard">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">{label}</div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{value}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {items.length > 0 ? (
          <section className="inri-bright-section">
            <div className="inri-page-container">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <div key={item.title} className="inri-bright-card">
                    <h3 className="text-2xl font-black text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="inri-bright-section pt-0">
          <div className="inri-page-container">
            <div className="inri-bright-card">
              {children ? <div className="mb-8">{children}</div> : null}

              {resources.length > 0 ? (
                <>
                  <p className="inri-bright-kicker">Resources</p>
                  <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-900">Useful routes</h2>
                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {resources.map((resource) => (
                      <Link
                        key={`${resource.title}-${resource.href}`}
                        href={resource.href}
                        {...(resource.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group rounded-[1.4rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_22px_46px_rgba(14,165,233,0.10)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-xl font-black text-slate-900">{resource.title}</h3>
                          <ArrowRight className="h-4 w-4 text-sky-600 transition group-hover:translate-x-1" />
                        </div>
                        <p className="mt-4 text-sm leading-7 text-slate-600">{resource.text}</p>
                        <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-sky-700">
                          Open
                          {resource.external ? <ExternalLink className="h-4 w-4" /> : null}
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              {note ? (
                <div className="mt-8 rounded-[1.25rem] border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-7 text-slate-700">
                  {note}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
