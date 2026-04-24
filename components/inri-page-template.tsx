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
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="relative border-b border-cyan-300/15 bg-[radial-gradient(circle_at_18%_14%,rgba(0,174,255,0.45),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(122,232,255,0.22),transparent_34rem),linear-gradient(135deg,#071a32_0%,#02040a_42%,#000_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />

          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[420px] flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                {eyebrow}
              </div>

              <h1 className="mt-8 max-w-5xl text-[3rem] font-black leading-[0.86] tracking-[-0.075em] text-white sm:text-[4.8rem] xl:text-[6.5rem]">
                {title}
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-9 text-cyan-50/72">
                {description}
              </p>

              {actions.length > 0 ? (
                <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
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

            <div className="rounded-[24px] border border-cyan-300/20 bg-white/[0.055] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
                <Layers3 className="h-6 w-6" />
              </div>
              <p className="mt-6 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">INRI V2 Interface</p>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-0.04em] text-white">Same standard. Every page.</h2>
              <p className="mt-4 text-sm leading-7 text-white/62">
                This route follows the same visual direction as the new Home: stronger hero, better contrast and clearer action areas.
              </p>
            </div>
          </div>
        </section>

        {items.length > 0 ? (
          <section className="border-t border-white/10 bg-[#02040a] py-12">
            <div className="mx-auto max-w-[1560px] px-4 sm:px-8 xl:px-12">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <div key={item.title} className="rounded-[22px] border border-cyan-300/18 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
                    <h3 className="text-2xl font-black text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-t border-white/10 bg-[linear-gradient(180deg,#02040a,#04101e)] py-12">
          <div className="mx-auto max-w-[1560px] px-4 sm:px-8 xl:px-12">
            <div className="rounded-[24px] border border-cyan-300/18 bg-white/[0.045] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-8">
              {children ? <div className="mb-8">{children}</div> : null}

              {resources.length > 0 ? (
                <>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Resources</p>
                  <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">Useful routes</h2>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {resources.map((resource) => (
                      <Link
                        key={`${resource.title}-${resource.href}`}
                        href={resource.href}
                        {...(resource.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group rounded-[22px] border border-cyan-300/16 bg-black/20 p-6 transition hover:-translate-y-1 hover:border-cyan-300/42 hover:bg-cyan-300/[0.07]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-xl font-black text-white">{resource.title}</h3>
                          <ArrowRight className="h-4 w-4 text-cyan-300 transition group-hover:translate-x-1" />
                        </div>
                        <p className="mt-4 text-sm leading-7 text-white/64">{resource.text}</p>
                        <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-cyan-300">
                          Open
                          {resource.external ? <ExternalLink className="h-4 w-4" /> : null}
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              {note ? (
                <div className="mt-8 border-l-2 border-cyan-300 bg-cyan-300/10 p-5 text-sm leading-7 text-white/80">
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
