import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, Layers3 } from 'lucide-react'

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

const container = 'mx-auto w-full max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10'
const card =
  'rounded-[28px] border border-cyan-300/12 bg-[radial-gradient(circle_at_top_left,rgba(25,168,255,0.10),transparent_28rem),linear-gradient(180deg,rgba(10,18,31,0.94),rgba(4,9,17,0.98))] shadow-[0_30px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.05)]'

export function InriButton({ action }: { action: InriAction }) {
  const base =
    'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[16px] px-5 text-sm font-black tracking-[-0.01em] transition hover:-translate-y-px hover:brightness-105'
  const style =
    action.variant === 'secondary'
      ? 'border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] text-white shadow-[0_16px_36px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-cyan-300/30 hover:bg-cyan-400/10'
      : 'border border-cyan-200/70 bg-[linear-gradient(180deg,#7ddcff_0%,#27baff_48%,#0c92e8_100%)] text-[#031019] shadow-[0_18px_44px_rgba(25,168,255,0.25),inset_0_1px_0_rgba(255,255,255,0.45)]'

  return (
    <Link href={action.href} className={`${base} ${style}`} {...(action.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {action.label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

export function InriHero({
  eyebrow,
  title,
  description,
  actions = [],
  stats = [],
  sideTitle = 'Unified INRI standard',
  sideText = 'One premium visual language across the official INRI platform.',
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
    <section className="relative overflow-hidden border-b border-cyan-300/10 bg-[radial-gradient(circle_at_12%_0%,rgba(25,168,255,0.22),transparent_34rem),radial-gradient(circle_at_88%_0%,rgba(125,220,255,0.10),transparent_30rem),linear-gradient(180deg,#03060b_0%,#06101d_56%,#02050a_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(125,220,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,220,255,0.045)_1px,transparent_1px)] bg-[size:58px_58px] opacity-60 [mask-image:linear-gradient(180deg,black,transparent_92%)]" />
      <div className={`${container} relative py-14 lg:py-20`}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.13fr)_430px] xl:items-stretch">
          <div className={`${card} p-5 sm:p-7 lg:p-9`}>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.20em] text-cyan-200">
              {eyebrow}
            </div>
            <h1 className="mt-7 max-w-6xl text-[3.1rem] font-black leading-[0.86] tracking-[-0.085em] text-white sm:text-[4.5rem] lg:text-[5.7rem] xl:text-[6.7rem]">
              {title}
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              {description}
            </p>

            {actions.length ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {actions.map((action) => (
                  <InriButton key={`${action.label}-${action.href}`} action={action} />
                ))}
              </div>
            ) : null}

            {stats.length ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="border-l-2 border-cyan-300/70 bg-white/[0.035] px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/80">{stat.label}</div>
                    <div className="mt-2 text-2xl font-black text-white">{stat.value}</div>
                    {stat.note ? <div className="mt-1 text-sm text-white/46">{stat.note}</div> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className={`${card} p-5 sm:p-7 lg:p-8`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-300/25 bg-cyan-400/10 text-cyan-200 shadow-[0_0_48px_rgba(25,168,255,0.14)]">
              <Layers3 className="h-7 w-7" />
            </div>
            <div className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/82">Unified interface</div>
            <h2 className="mt-3 text-3xl font-black leading-[1.02] tracking-[-0.055em] text-white">
              {sideTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/62">{sideText}</p>

            {sideItems.length ? (
              <div className="mt-6 grid gap-3">
                {sideItems.map((item) => (
                  <div key={item.title} className="grid grid-cols-[42px_1fr] gap-3 rounded-[18px] border border-cyan-300/10 bg-white/[0.035] p-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                      {item.icon || <ArrowRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">{item.title}</div>
                      <p className="mt-1 text-sm leading-6 text-white/55">{item.text}</p>
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

export function InriSection({
  eyebrow,
  title,
  description,
  children,
  tight = false,
}: {
  eyebrow?: string
  title?: string
  description?: string
  children: ReactNode
  tight?: boolean
}) {
  return (
    <section className={`${tight ? 'py-0 pb-12 lg:pb-16' : 'py-12 lg:py-16'} bg-[linear-gradient(180deg,#06101d_0%,#02050a_100%)]`}>
      <div className={container}>
        {(eyebrow || title || description) && (
          <div className="mb-7 grid gap-4 lg:grid-cols-[0.8fr_1fr] lg:items-end">
            <div>
              {eyebrow ? (
                <div className="inline-flex w-fit items-center rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.20em] text-cyan-200">
                  {eyebrow}
                </div>
              ) : null}
              {title ? (
                <h2 className="mt-4 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.065em] text-white sm:text-5xl lg:text-[4.1rem]">
                  {title}
                </h2>
              ) : null}
            </div>
            {description ? <p className="max-w-3xl text-sm leading-7 text-white/62 sm:text-base">{description}</p> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export function InriCard({
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
      <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
        {icon || <ArrowRight className="h-5 w-5" />}
      </div>
      <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/58">{text}</p>
      {href ? (
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-cyan-200">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </span>
      ) : null}
    </>
  )

  const cls = `${card} block p-5 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_34px_88px_rgba(0,0,0,0.38),0_0_48px_rgba(25,168,255,0.08)]`

  if (href) {
    return (
      <Link href={href} className={cls} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {content}
      </Link>
    )
  }

  return <div className={cls}>{content}</div>
}

export function InriCardGrid({ children, cols = 3 }: { children: ReactNode; cols?: 3 | 4 }) {
  return <div className={`grid gap-4 md:grid-cols-2 ${cols === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>{children}</div>
}

export function InriClientFrame({ children }: { children: ReactNode }) {
  return (
    <InriSection tight>
      <div className={`${card} p-3 sm:p-5 lg:p-6`}>
        {children}
      </div>
    </InriSection>
  )
}

export const inriContainerClass = container
export const inriCardClass = card
