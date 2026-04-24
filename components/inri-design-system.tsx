import Link from 'next/link'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react'
import { InriLinkButton } from '@/components/inri-site-shell'

type HeroAction = {
  label: string
  href: string
  external?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

export type HeroStat = {
  label: string
  value: string
  text?: string
}

export type HeroFeature = {
  title: string
  text: string
  icon: LucideIcon
  href?: string
  external?: boolean
}

type InriPageHeroProps = {
  eyebrow: string
  title: ReactNode
  description: ReactNode
  actions?: HeroAction[]
  stats?: HeroStat[]
  features?: HeroFeature[]
  visualEyebrow?: string
  visualTitle?: string
  visualText?: string
  children?: ReactNode
}

export function InriKicker({ children }: { children: ReactNode }) {
  return <div className="inri-v2-kicker w-fit">{children}</div>
}

export function InriIconBox({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="inri-v2-icon shrink-0">
      <Icon className="h-5 w-5" />
    </div>
  )
}

export function InriSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  action?: HeroAction
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <InriKicker>{eyebrow}</InriKicker>
        <h2 className="mt-4 max-w-5xl text-3xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-5xl">
          {title}
        </h2>
      </div>
      <div className="max-w-2xl">
        {description ? <p className="text-sm leading-7 text-white/62 sm:text-base sm:leading-8">{description}</p> : null}
        {action ? (
          <div className="mt-5">
            <InriLinkButton href={action.href} external={action.external} variant={action.variant || 'primary'}>
              {action.label}
            </InriLinkButton>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function InriFeatureCard({ item }: { item: HeroFeature }) {
  const Icon = item.icon
  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <InriIconBox icon={Icon} />
        {item.href ? <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1" /> : null}
      </div>
      <h3 className="mt-6 text-xl font-black tracking-[-0.02em] text-white sm:text-2xl">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/62">{item.text}</p>
    </>
  )

  if (item.href) {
    return (
      <Link
        href={item.href}
        {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
        className="inri-v2-feature group block p-5 sm:p-6"
      >
        {body}
      </Link>
    )
  }

  return <div className="inri-v2-feature p-5 sm:p-6">{body}</div>
}

export function InriFeatureGrid({ items }: { items: HeroFeature[] }) {
  return (
    <div className="inri-v2-grid">
      {items.map((item) => (
        <InriFeatureCard key={item.title} item={item} />
      ))}
    </div>
  )
}

export function InriPanelFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="inri-section-band py-10 sm:py-12 lg:py-16">
      <div className="inri-page-container">
        {(eyebrow || title || description) ? (
          <InriSectionHeader eyebrow={eyebrow || 'INRI CHAIN'} title={title || ''} description={description} />
        ) : null}
        <div className="inri-v2-panel p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </section>
  )
}

export function InriPageHero({
  eyebrow,
  title,
  description,
  actions = [],
  stats = [],
  features = [],
  visualEyebrow = 'INRI Control Room',
  visualTitle = 'One visual standard across the whole ecosystem.',
  visualText = 'Every route uses the same premium card language, square-button system, stronger contrast and mobile-first spacing.',
  children,
}: InriPageHeroProps) {
  return (
    <section className="inri-hero-showcase">
      <div className="inri-page-container py-12 sm:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(340px,0.72fr)] lg:items-center xl:gap-12">
          <div>
            <InriKicker>{eyebrow}</InriKicker>
            <h1 className="mt-7 max-w-6xl text-[2.75rem] font-black leading-[0.86] tracking-[-0.075em] text-white sm:text-[4.8rem] lg:text-[5.8rem] xl:text-[6.8rem]">
              {title}
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-cyan-50/72 sm:text-lg sm:leading-9 lg:text-xl lg:leading-10">
              {description}
            </p>

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
                    {action.external ? <ExternalLink className="h-4 w-4" /> : null}
                  </InriLinkButton>
                ))}
              </div>
            ) : null}

            {stats.length > 0 ? (
              <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="inri-v2-stat">
                    <div className="text-[10px] font-black uppercase tracking-[0.20em] text-cyan-200/66">{stat.label}</div>
                    <div className="mt-2 text-xl font-black text-white sm:text-2xl">{stat.value}</div>
                    {stat.text ? <p className="mt-1 text-xs leading-5 text-white/48">{stat.text}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="inri-v2-panel p-4 sm:p-6">
            <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">{visualEyebrow}</p>
                <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.045em] text-white sm:text-4xl">
                  {visualTitle}
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/62">{visualText}</p>
              </div>
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-primary/30 bg-primary/10 text-primary sm:flex">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>

            {features.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {features.map((item) => {
                  const Icon = item.icon
                  const content = (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-primary/25 bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        {item.href ? <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" /> : null}
                      </div>
                      <h3 className="mt-4 text-base font-black text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/58">{item.text}</p>
                    </>
                  )

                  if (item.href) {
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="inri-v2-feature group block p-4"
                      >
                        {content}
                      </Link>
                    )
                  }

                  return (
                    <div key={item.title} className="inri-v2-feature p-4">
                      {content}
                    </div>
                  )
                })}
              </div>
            ) : null}

            {children ? <div className="mt-5">{children}</div> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
