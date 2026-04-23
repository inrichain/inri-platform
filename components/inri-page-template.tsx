import Link from 'next/link'
import * as React from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
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
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_26%),linear-gradient(180deg,#02060b_0%,#000000_42%,#020812_100%)]">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-10 sm:py-12 lg:py-16">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_370px] xl:items-end">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inri-chip text-primary">{eyebrow}</span>
                  <span className="inri-chip">Official route</span>
                  <span className="inri-chip">INRI mainnet</span>
                </div>
                <h1 className="mt-5 max-w-5xl text-balance text-[2rem] font-black leading-[1.02] text-white sm:text-[2.8rem] lg:text-[3.85rem]">
                  {title}
                </h1>
                <p className="mt-5 max-w-3xl text-[15px] leading-7 text-white/68 sm:text-lg sm:leading-8">{description}</p>

                {actions.length > 0 ? (
                  <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
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

              <div className="inri-section-surface rounded-[1.8rem] p-5 sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">INRI standard</p>
                <h2 className="mt-3 text-2xl font-black text-white sm:text-[2rem]">One cleaner visual pattern for every route.</h2>
                <p className="mt-4 text-sm leading-7 text-white/66">
                  The main sections follow the same structure so the site feels like one official network interface, not separate pages with different styles.
                </p>
                <div className="mt-5 grid gap-3">
                  {[
                    'Clear hero, actions and content hierarchy',
                    'Consistent blocks across desktop and mobile',
                    'Header wallet access kept at the top level',
                  ].map((item) => (
                    <div key={item} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/76">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {items.length > 0 ? (
          <section className="py-10 sm:py-12">
            <div className="inri-page-container">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <div key={item.title} className="inri-soft-card rounded-[1.5rem] p-5 backdrop-blur-sm sm:p-6">
                    <h3 className="text-xl font-black text-white sm:text-2xl">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="pb-14 sm:pb-16">
          <div className="inri-page-container">
            <div className="inri-section-surface rounded-[1.8rem] p-5 sm:p-8 lg:p-10">
              {children ? children : null}

              {resources.length > 0 ? (
                <>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                        className="group inri-soft-card rounded-[1.4rem] p-5 transition hover:border-primary/35 hover:bg-primary/[0.06]"
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
