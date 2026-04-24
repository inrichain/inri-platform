import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

export type InriAction = {
  label: string
  href: string
  external?: boolean
  variant?: 'primary' | 'secondary'
}

export type InriStat = {
  label: string
  value: string
  note?: string
}

export type InriSideItem = {
  title: string
  text: string
  icon?: ReactNode
}

export function InriUnifiedButton({ action }: { action: InriAction }) {
  const cls =
    action.variant === 'secondary'
      ? 'inri-v26-button inri-v26-button-secondary'
      : 'inri-v26-button inri-v26-button-primary'

  return (
    <Link href={action.href} className={cls} {...(action.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {action.label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

export function InriUnifiedHero({
  eyebrow,
  title,
  description,
  actions = [],
  stats = [],
  sideTitle = 'INRI route standard',
  sideText = 'Every section follows the same premium dark-blue INRI interface: strong title, visible actions, unified cards and responsive spacing.',
  sideItems = [],
}: {
  eyebrow: string
  title: string
  description: string
  actions?: InriAction[]
  stats?: InriStat[]
  sideTitle?: string
  sideText?: string
  sideItems?: InriSideItem[]
}) {
  return (
    <section className="inri-v26-hero">
      <div className="inri-v26-container">
        <div className="inri-v26-hero-grid">
          <div className="inri-v26-hero-main">
            <div className="inri-v26-eyebrow">{eyebrow}</div>
            <h1 className="inri-v26-title">{title}</h1>
            <p className="inri-v26-description">{description}</p>

            {actions.length ? (
              <div className="inri-v26-actions">
                {actions.map((action) => (
                  <InriUnifiedButton key={`${action.label}-${action.href}`} action={action} />
                ))}
              </div>
            ) : null}

            {stats.length ? (
              <div className="inri-v26-stat-grid">
                {stats.map((stat) => (
                  <div key={stat.label} className="inri-v26-stat">
                    <div className="inri-v26-stat-label">{stat.label}</div>
                    <div className="inri-v26-stat-value">{stat.value}</div>
                    {stat.note ? <div className="inri-v26-stat-note">{stat.note}</div> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="inri-v26-side-panel">
            <div className="inri-v26-side-orb" />
            <div className="inri-v26-side-kicker">Unified interface</div>
            <h2 className="inri-v26-side-title">{sideTitle}</h2>
            <p className="inri-v26-side-text">{sideText}</p>

            {sideItems.length ? (
              <div className="inri-v26-side-list">
                {sideItems.map((item) => (
                  <div key={item.title} className="inri-v26-side-item">
                    <div className="inri-v26-side-icon">{item.icon || <ArrowRight className="h-4 w-4" />}</div>
                    <div>
                      <div className="inri-v26-side-item-title">{item.title}</div>
                      <p className="inri-v26-side-item-text">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  )
}

export function InriUnifiedSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title?: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="inri-v26-section">
      <div className="inri-v26-container">
        {title || eyebrow || description ? (
          <div className="inri-v26-section-head">
            {eyebrow ? <div className="inri-v26-eyebrow">{eyebrow}</div> : null}
            {title ? <h2 className="inri-v26-section-title">{title}</h2> : null}
            {description ? <p className="inri-v26-section-description">{description}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  )
}

export function InriUnifiedCard({
  title,
  text,
  icon,
  href,
  external,
  cta = 'Open',
}: {
  title: string
  text: string
  icon?: ReactNode
  href?: string
  external?: boolean
  cta?: string
}) {
  const content = (
    <>
      <div className="inri-v26-card-icon">{icon || <ArrowRight className="h-5 w-5" />}</div>
      <h3 className="inri-v26-card-title">{title}</h3>
      <p className="inri-v26-card-text">{text}</p>
      {href ? (
        <span className="inri-v26-card-link">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </span>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link href={href} className="inri-v26-card inri-v26-card-clickable" {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {content}
      </Link>
    )
  }

  return <div className="inri-v26-card">{content}</div>
}

export function InriUnifiedClientFrame({ children }: { children: ReactNode }) {
  return (
    <section className="inri-v26-section inri-v26-section-tight">
      <div className="inri-v26-container">
        <div className="inri-v26-client-frame">{children}</div>
      </div>
    </section>
  )
}
