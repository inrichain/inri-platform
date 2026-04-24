import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, Blocks, Cpu, Factory, Globe2, Pickaxe, ShieldCheck, Trophy, Wallet, Zap } from 'lucide-react'

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

export const inriContainer = 'mx-auto w-full max-w-[1500px] px-4 sm:px-6 xl:px-8'

export const inriGlassCard =
  'rounded-[34px] border border-cyan-300/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30rem),linear-gradient(180deg,rgba(10,18,31,0.94),rgba(4,9,17,0.98))] shadow-[0_36px_90px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.055)]'

export const inriSmallGlassCard =
  'rounded-[28px] border border-cyan-300/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_17rem),linear-gradient(180deg,rgba(10,18,31,0.94),rgba(4,9,17,0.98))] shadow-[0_30px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.05)]'

export function InriButton({ action, children }: { action?: InriAction; children?: ReactNode }) {
  const variant = action?.variant || 'primary'
  const styles =
    variant === 'primary'
      ? 'border-cyan-200/70 bg-[linear-gradient(180deg,#8be7ff_0%,#2bbcff_48%,#0a8fe0_100%)] text-[#021019] shadow-[0_18px_44px_rgba(14,165,233,0.28),inset_0_1px_0_rgba(255,255,255,0.45)]'
      : 'border-white/12 bg-white/[0.045] text-white shadow-[0_16px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-cyan-300/30 hover:bg-cyan-400/10'

  const content = (
    <>
      {children || action?.label}
      <ArrowRight className="h-4 w-4" />
    </>
  )

  const cls = `inline-flex h-[52px] items-center justify-center gap-2 rounded-[16px] border px-5 text-sm font-black transition hover:-translate-y-px hover:brightness-105 ${styles}`

  if (action) {
    return (
      <Link href={action.href} className={cls} {...(action.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {content}
      </Link>
    )
  }

  return <button className={cls}>{content}</button>
}

export function InriEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex w-fit rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
      {children}
    </div>
  )
}

export function InriHero({
  eyebrow,
  title,
  description,
  actions = [],
  stats = [],
  sideTitle = 'Built to look like a real chain, not a test page.',
  sideText = 'Every page follows the same structure: strong hero, glass cards, clean actions and INRI blue highlights.',
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
  const defaultItems: InriSideItem[] = [
    { title: 'Explorer + RPC', text: 'Clear route to chain information and verification.', icon: <Blocks className="h-4 w-4" /> },
    { title: 'Mining Ready', text: 'Windows, Ubuntu, pool and championship paths.', icon: <Cpu className="h-4 w-4" /> },
    { title: 'Campaign Grade', text: 'Made for growth posts and official announcements.', icon: <Trophy className="h-4 w-4" /> },
  ]

  const items = sideItems.length ? sideItems : defaultItems

  return (
    <section className="relative overflow-hidden bg-[#02050a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_-10%,rgba(14,165,233,0.24),transparent_34rem),radial-gradient(circle_at_88%_-8%,rgba(125,220,255,0.10),transparent_30rem),linear-gradient(180deg,#03060b_0%,#06101d_48%,#02050a_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(125,220,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,220,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px] opacity-45 [mask-image:linear-gradient(180deg,black,transparent_82%)]" />
      <div className={`${inriContainer} relative grid gap-5 py-12 lg:grid-cols-[minmax(0,1.18fr)_430px] lg:py-20`}>
        <div className={`${inriGlassCard} p-7 lg:p-10`}>
          <InriEyebrow>{eyebrow}</InriEyebrow>
          <h1 className="mt-8 max-w-6xl text-[3.2rem] font-black leading-[0.84] tracking-[-0.09em] text-white sm:text-[4.5rem] md:text-[5.6rem] xl:text-[7.2rem]">
            {title}
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-white/66 sm:text-lg sm:leading-9">
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
            <div className="mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="border-l-2 border-cyan-300/70 bg-white/[0.035] px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/80">{stat.label}</div>
                  <div className="mt-2 text-2xl font-black text-white">{stat.value}</div>
                  {stat.note ? <div className="mt-1 text-sm text-white/45">{stat.note}</div> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <aside className={`${inriGlassCard} p-7`}>
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-300/25 bg-cyan-400/10 text-cyan-200 shadow-[0_0_48px_rgba(25,168,255,0.14)]">
            <Globe2 className="h-7 w-7" />
          </div>
          <div className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/82">Network Control Room</div>
          <h2 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.055em] text-white">
            {sideTitle}
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/62">{sideText}</p>
          <div className="mt-7 grid gap-3">
            {items.map((item) => (
              <div key={item.title} className="grid grid-cols-[42px_1fr] gap-3 rounded-[18px] border border-cyan-300/10 bg-white/[0.035] p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                  {item.icon || <Zap className="h-4 w-4" />}
                </div>
                <div>
                  <div className="text-sm font-black text-white">{item.title}</div>
                  <p className="mt-1 text-sm leading-6 text-white/55">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

export function InriSection({
  eyebrow,
  title,
  description,
  children,
  className = '',
}: {
  eyebrow?: string
  title?: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`bg-[#02050a] py-12 ${className}`}>
      <div className={inriContainer}>
        {(eyebrow || title || description) && (
          <div className="mb-8 grid gap-4 lg:grid-cols-[0.8fr_1fr] lg:items-end">
            <div>
              {eyebrow ? <InriEyebrow>{eyebrow}</InriEyebrow> : null}
              {title ? (
                <h2 className="mt-5 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.07em] text-white lg:text-6xl">
                  {title}
                </h2>
              ) : null}
            </div>
            {description ? <p className="max-w-3xl text-base leading-8 text-white/62">{description}</p> : null}
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
  cta = 'Open route',
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
        {icon || <Zap className="h-5 w-5" />}
      </div>
      <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/58">{text}</p>
      {href ? (
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-cyan-200">
          {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      ) : null}
    </>
  )

  const cls = `group block ${inriSmallGlassCard} p-6 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_34px_90px_rgba(0,0,0,0.42),0_0_48px_rgba(34,211,238,0.08)]`

  if (href) {
    return (
      <Link href={href} className={cls} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {content}
      </Link>
    )
  }

  return <div className={cls}>{content}</div>
}

export function InriCardGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const xl = cols === 2 ? 'xl:grid-cols-2' : cols === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'
  return <div className={`grid gap-4 md:grid-cols-2 ${xl}`}>{children}</div>
}

export function InriClientFrame({ children }: { children: ReactNode }) {
  return (
    <InriSection className="pt-0">
      <div className={`${inriGlassCard} p-3 sm:p-5 lg:p-6`}>
        {children}
      </div>
    </InriSection>
  )
}
