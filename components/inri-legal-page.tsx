import Link from 'next/link'
import type { ReactNode } from 'react'
import { ExternalLink, FileText, Lock, Scale, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

type LegalFact = { label: string; value: string }
type LegalSection = { id: string; label: string; title: string; content: ReactNode }
type QuickItem = { title: string; text: string; icon: ReactNode }

type Props = {
  eyebrow: string
  title: string
  description: string
  facts: LegalFact[]
  sections: LegalSection[]
  summaryTitle: string
  summaryText: string
  quickItems: QuickItem[]
  primaryAction?: { label: string; href: string; external?: boolean }
  secondaryAction?: { label: string; href: string; external?: boolean }
}

function FactPill({ children }: { children: ReactNode }) {
  return <div className="inri-bright-chip">{children}</div>
}

export function InriLegalPage({
  eyebrow,
  title,
  description,
  facts,
  sections,
  summaryTitle,
  summaryText,
  quickItems,
  primaryAction,
  secondaryAction,
}: Props) {
  return (
    <InriShell>
      <main className="inri-bright-main">
        <section className="inri-bright-hero">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.12fr)_390px] xl:items-start">
              <div className="inri-bright-card">
                <div className="flex flex-wrap gap-2.5">
                  <FactPill>{eyebrow}</FactPill>
                  {facts.slice(0, 3).map((fact) => (
                    <FactPill key={fact.label}>{fact.value}</FactPill>
                  ))}
                </div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.96] tracking-[-0.05em] text-slate-900 sm:text-5xl xl:text-[4.4rem]">
                  {title}
                </h1>
                <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
                {(primaryAction || secondaryAction) && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {primaryAction ? <InriLinkButton href={primaryAction.href} external={primaryAction.external}>{primaryAction.label}</InriLinkButton> : null}
                    {secondaryAction ? <InriLinkButton href={secondaryAction.href} external={secondaryAction.external} variant="secondary">{secondaryAction.label}</InriLinkButton> : null}
                  </div>
                )}
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {quickItems.map((item) => (
                    <div key={item.title} className="inri-bright-subcard">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">{item.icon}</div>
                      <h3 className="mt-4 text-lg font-black text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="inri-bright-card xl:sticky xl:top-[120px] xl:self-start">
                <p className="inri-bright-kicker">Document summary</p>
                <h2 className="mt-3 text-3xl font-black text-slate-900">{summaryTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{summaryText}</p>
                <div className="mt-6 grid gap-3">
                  {facts.map((fact) => (
                    <div key={fact.label} className="inri-bright-subcard flex items-center justify-between gap-4">
                      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{fact.label}</span>
                      <span className="text-right text-sm font-black text-slate-900">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="inri-bright-section">
          <div className="inri-page-container">
            <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="xl:sticky xl:top-[120px] xl:self-start">
                <div className="inri-bright-card">
                  <p className="inri-bright-kicker">Sections</p>
                  <div className="mt-4 grid gap-2">
                    {sections.map((section) => (
                      <a key={section.id} href={`#${section.id}`} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700">
                        {section.label}
                      </a>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="space-y-6">
                {sections.map((section, index) => (
                  <article key={section.id} id={section.id} className="inri-bright-card scroll-mt-32">
                    <p className="inri-bright-kicker">{index === 0 ? eyebrow : `Section ${index}`}</p>
                    <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">{section.title}</h2>
                    <div className="mt-5 space-y-5 text-[15px] leading-8 text-slate-600 [&_a]:text-sky-700 [&_a]:underline-offset-4 [&_a:hover]:underline [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1">
                      {section.content}
                    </div>
                  </article>
                ))}

                <div className="inri-bright-card">
                  <p className="inri-bright-kicker">Useful routes</p>
                  <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Keep the legal pages visually connected to the rest of the site.</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      { title: 'Whitepaper', href: '/whitepaper', text: 'Read the project structure and tokenomics.', icon: <FileText className="h-5 w-5" /> },
                      { title: 'Explorer', href: 'https://explorer.inri.life', text: 'Inspect addresses, contracts and transactions.', icon: <ExternalLink className="h-5 w-5" />, external: true },
                      { title: 'Privacy Policy', href: '/privacy-policy', text: 'Review the privacy practices for site use.', icon: <Lock className="h-5 w-5" /> },
                      { title: 'Terms', href: '/terms-and-conditions', text: 'See conditions, limitations and responsibilities.', icon: <Scale className="h-5 w-5" /> },
                    ].map((item) => (
                      <Link key={item.title} href={item.href} {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})} className="inri-bright-subcard transition hover:-translate-y-px hover:border-sky-300">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">{item.icon}</div>
                        <h3 className="mt-4 text-lg font-black text-slate-900">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}

export const legalIcons = {
  privacy: [
    { title: 'Minimal collection', text: 'The policy is built around collecting only what is reasonably necessary.', icon: <ShieldCheck className="h-5 w-5" /> },
    { title: 'Public blockchain data', text: 'Transactions and addresses are public by design on blockchain networks.', icon: <FileText className="h-5 w-5" /> },
    { title: 'Security focus', text: 'Logs and technical data may be used to protect the service and prevent abuse.', icon: <Lock className="h-5 w-5" /> },
    { title: 'Transparency', text: 'The document explains how the project handles site and infrastructure data.', icon: <ExternalLink className="h-5 w-5" /> },
  ],
  terms: [
    { title: 'Experimental project', text: 'INRI CHAIN services are provided on an experimental and community-driven basis.', icon: <ShieldCheck className="h-5 w-5" /> },
    { title: 'User responsibility', text: 'Users are responsible for wallets, keys and their own decisions.', icon: <Scale className="h-5 w-5" /> },
    { title: 'No guarantees', text: 'Availability, uptime and results cannot be guaranteed.', icon: <FileText className="h-5 w-5" /> },
    { title: 'Third-party services', text: 'External wallets and services follow their own rules and policies.', icon: <ExternalLink className="h-5 w-5" /> },
  ],
}
