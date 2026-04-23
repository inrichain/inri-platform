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
      <main className="inri-page-shell">
        <section className="inri-hero-showcase">
          <div className="inri-page-container py-10 sm:py-14 lg:py-16">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(330px,0.42fr)] xl:items-stretch">
              <div className="inri-glass-hero min-h-[420px] p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inri-tag">{eyebrow}</span>
                  <span className="inri-tag">Official route</span>
                  <span className="inri-tag">INRI mainnet</span>
                </div>
                <h1 className="mt-8 max-w-5xl text-balance text-[2.8rem] font-black leading-[0.9] tracking-[-0.06em] text-white sm:text-[4.2rem] lg:text-[5.8rem]">
                  {title}
                </h1>
                <p className="mt-7 max-w-3xl text-lg leading-9 text-white/68">{description}</p>

                {actions.length > 0 ? (
                  <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
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

              <div className="inri-dashboard-card p-6">
                <div className="inri-icon-box">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="mt-6 text-[11px] font-black uppercase tracking-[0.24em] text-primary">Route standard</p>
                <h2 className="mt-3 text-3xl font-black leading-tight text-white">One network design language.</h2>
                <p className="mt-4 text-sm leading-7 text-white/62">
                  This page follows the same INRI design system: stronger panels, sharper buttons, clear hierarchy and fewer weak placeholder blocks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {items.length > 0 ? (
          <section className="py-10 sm:py-12">
            <div className="inri-page-container">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <div key={item.title} className="inri-dashboard-card p-6">
                    <h3 className="text-2xl font-black text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/64">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="pb-16 pt-4 sm:pb-20">
          <div className="inri-page-container">
            <div className="inri-dashboard-card p-5 sm:p-8 lg:p-10">
              {children ? <div className="mb-8">{children}</div> : null}

              {resources.length > 0 ? (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Resources</p>
                      <h2 className="mt-3 text-4xl font-black tracking-[-0.035em] text-white">Useful routes for this section</h2>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {resources.map((resource) => (
                      <Link
                        key={`${resource.title}-${resource.href}`}
                        href={resource.href}
                        {...(resource.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group inri-product-card"
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
                </>
              ) : null}

              {note ? (
                <div className="mt-8 border-l-2 border-primary bg-primary/10 p-5 text-sm leading-7 text-white/80">
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
