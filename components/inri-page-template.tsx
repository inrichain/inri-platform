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
  description = 'This page is being adapted to the new official INRI website style.',
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
          <div className="inri-page-container py-14 lg:py-18">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.06fr)_430px] xl:items-end">
              <div>
                <div className="flex flex-wrap gap-3">
                  <span className="inri-kicker">{eyebrow}</span>
                  <span className="inri-chip">Official route</span>
                  <span className="inri-chip">INRI platform</span>
                </div>
                <h1 className="mt-6 max-w-5xl text-balance text-4xl font-black leading-[0.98] text-white sm:text-5xl lg:text-[4.2rem]">
                  {title}
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">{description}</p>

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

              <div className="inri-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">Page summary</p>
                    <h2 className="mt-3 text-3xl font-black leading-tight text-white">Keep every route in one visual system.</h2>
                  </div>
                  <span className="rounded-full border border-primary/24 bg-primary/[0.08] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                    Premium UI
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/66">
                  This route follows the same black-and-blue product language used on the homepage: stronger hierarchy,
                  better spacing and clearer actions.
                </p>
                <div className="mt-5 grid gap-3">
                  {[
                    'Matching hero rhythm and section spacing',
                    'Shared premium buttons, cards and chips',
                    'Cleaner mobile and desktop proportion',
                  ].map((item) => (
                    <div key={item} className="inri-subpanel flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white/80">
                      <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {items.length > 0 ? (
          <section className="py-12">
            <div className="inri-page-container">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <div key={item.title} className="inri-panel-soft p-6 backdrop-blur-sm">
                    <h3 className="text-2xl font-black text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="pb-20">
          <div className="inri-page-container">
            <div className="inri-panel p-6 sm:p-8 lg:p-10">
              {children ? children : null}

              {resources.length > 0 ? (
                <>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.22em] text-primary/80">Resources</p>
                      <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Useful routes for this section</h2>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {resources.map((resource) => (
                      <Link
                        key={`${resource.title}-${resource.href}`}
                        href={resource.href}
                        {...(resource.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group inri-panel-soft p-6 transition hover:border-primary/35 hover:bg-primary/[0.06]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-xl font-black text-white">{resource.title}</h3>
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
                <div className="mt-8 rounded-[1.5rem] border border-primary/20 bg-primary/10 p-6 text-sm leading-7 text-white/80">
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
