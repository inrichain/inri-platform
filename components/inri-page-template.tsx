import Link from 'next/link'
import * as React from 'react'
import { ArrowRight, ExternalLink, Layers3 } from 'lucide-react'
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
      <main className="inri-site-v2">
        <section className="inri-v2-hero">
          <div className="inri-page-container py-10 sm:py-14 lg:py-16">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-stretch">
              <div className="inri-v2-panel flex min-h-[430px] flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap gap-2.5">
                  <span className="inri-v2-kicker">{eyebrow}</span>
                  <span className="inri-v2-kicker">Official route</span>
                  <span className="inri-v2-kicker">Chain 3777</span>
                </div>
                <h1 className="inri-v2-heading mt-8 max-w-5xl text-[2.8rem] sm:text-[4.2rem] lg:text-[5.7rem]">
                  {title}
                </h1>
                <p className="inri-v2-text mt-7 max-w-3xl text-lg">{description}</p>

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

              <div className="inri-v2-panel p-6">
                <div className="inri-v2-icon">
                  <Layers3 className="h-5 w-5" />
                </div>
                <p className="mt-6 text-[11px] font-black uppercase tracking-[0.24em] text-primary">INRI interface</p>
                <h2 className="mt-3 text-3xl font-black leading-tight text-white">Same system. Every page.</h2>
                <p className="mt-4 text-sm leading-7 text-white/62">
                  Every internal route now follows the same structure: strong hero, visible cards, clear actions and the same INRI blue/black visual language.
                </p>
              </div>
            </div>
          </div>
        </section>

        {items.length > 0 ? (
          <section className="py-10 sm:py-12">
            <div className="inri-page-container">
              <div className="inri-v2-grid">
                {items.map((item) => (
                  <div key={item.title} className="inri-v2-card p-6">
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
            <div className="inri-v2-panel p-5 sm:p-8 lg:p-10">
              {children ? <div className="mb-8">{children}</div> : null}

              {resources.length > 0 ? (
                <>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Resources</p>
                    <h2 className="mt-3 text-4xl font-black tracking-[-0.035em] text-white">Useful routes</h2>
                  </div>

                  <div className="mt-8 inri-v2-grid">
                    {resources.map((resource) => (
                      <Link
                        key={`${resource.title}-${resource.href}`}
                        href={resource.href}
                        {...(resource.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group inri-v2-feature block p-6"
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
