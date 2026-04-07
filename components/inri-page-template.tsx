import Link from 'next/link'
import * as React from 'react'
import { ExternalLink } from 'lucide-react'
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
      <main className="min-h-screen">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(0,163,255,0.18),_transparent_38%),linear-gradient(180deg,#081223_0%,#07111e_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary/85">{eyebrow}</p>
            <h1 className="mt-5 max-w-5xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">{description}</p>

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
        </section>

        {items.length > 0 ? (
          <section className="py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.16)] sm:p-8 lg:p-10">
              {children ? children : null}

              {resources.length > 0 ? (
                <>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/80">Resources</p>
                      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Useful routes for this section</h2>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {resources.map((resource) => (
                      <Link
                        key={`${resource.title}-${resource.href}`}
                        href={resource.href}
                        {...(resource.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group rounded-[1.5rem] border border-white/10 bg-[#091425] p-6 transition hover:border-primary/35 hover:bg-[#0b1a30]"
                      >
                        <h3 className="text-xl font-bold text-white">{resource.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-white/65">{resource.text}</p>
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
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
