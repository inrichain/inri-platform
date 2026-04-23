import Link from 'next/link'
import * as React from 'react'
import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react'
import { InriShell, InriLinkButton } from '@/components/inri-site-shell'

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
      <main className="inri-premium-main">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-10 sm:py-12 lg:py-16">
            <div className="inri-premium-hero-card p-5 sm:p-7 lg:p-10">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.44fr)] xl:items-end">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2.5">
                    <span className="inri-chip text-primary">{eyebrow}</span>
                    <span className="inri-chip">Official route</span>
                    <span className="inri-chip">INRI mainnet</span>
                  </div>
                  <h1 className="mt-6 max-w-5xl text-balance text-[2.4rem] font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-[3.4rem] lg:text-[5rem]">
                    {title}
                  </h1>
                  <p className="mt-6 max-w-3xl text-[15px] leading-8 text-white/68 sm:text-lg sm:leading-9">{description}</p>

                  {actions.length > 0 ? (
                    <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
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

                <div className="inri-premium-card p-5 sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.24em] text-primary">Route standard</p>
                  <h2 className="mt-3 text-2xl font-black leading-tight text-white">Cleaner pages, stronger actions.</h2>
                  <p className="mt-4 text-sm leading-7 text-white/64">
                    Each internal page now uses the same premium INRI structure: big intro, fewer distractions, clearer cards and consistent action buttons.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {items.length > 0 ? (
          <section className="py-8 sm:py-10">
            <div className="inri-page-container">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <div key={item.title} className="inri-premium-card p-5 sm:p-6">
                    <h3 className="text-xl font-black text-white sm:text-2xl">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="pb-16 pt-4 sm:pb-20">
          <div className="inri-page-container">
            <div className="inri-premium-card p-5 sm:p-8 lg:p-10">
              {children ? <div className="mb-8">{children}</div> : null}

              {resources.length > 0 ? (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.22em] text-primary/80">Resources</p>
                      <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Useful routes for this section</h2>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {resources.map((resource) => (
                      <Link
                        key={`${resource.title}-${resource.href}`}
                        href={resource.href}
                        {...(resource.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group inri-premium-tile block p-5 transition hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/[0.07]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-black text-white sm:text-xl">{resource.title}</h3>
                          <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/65">{resource.text}</p>
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                          Open
                          {resource.external ? <ExternalLink className="h-4 w-4" /> : null}
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              {note ? (
                <div className="mt-8 rounded-[1.35rem] border border-primary/20 bg-primary/10 p-5 text-sm leading-7 text-white/80 sm:p-6">
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
