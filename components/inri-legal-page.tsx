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
  return (
    <div className="rounded-full border border-primary/25 bg-primary/[0.08] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
      {children}
    </div>
  )
}

function QuickCard({ icon, title, text }: QuickItem) {
  return (
    <div className="rounded-[1.55rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.98),rgba(3,8,15,0.98))] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/66">{text}</p>
    </div>
  )
}

function SectionCard({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <article
      id={id}
      className="scroll-mt-32 rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.96),rgba(2,7,14,0.98))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.34)] sm:p-8"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/90">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-5 text-[15px] leading-8 text-white/72 [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_code]:rounded-md [&_code]:border [&_code]:border-white/10 [&_code]:bg-white/[0.05] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:text-primary [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1">
        {children}
      </div>
    </article>
  )
}

function NavItem({ id, label }: { id: string; label: string }) {
  return (
    <a
      href={`#${id}`}
      className="block rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:border-primary/40 hover:bg-primary/[0.08] hover:text-white"
    >
      {label}
    </a>
  )
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
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_26%),linear-gradient(180deg,#02060b_0%,#000000_42%,#020812_100%)]">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_430px] xl:items-start">
              <div>
                <div className="flex flex-wrap gap-3">
                  <FactPill>{eyebrow}</FactPill>
                  {facts.slice(0, 3).map((fact) => (
                    <FactPill key={fact.label}>{fact.value}</FactPill>
                  ))}
                </div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-[4.15rem]">
                  {title}
                </h1>
                <p className="mt-6 max-w-4xl text-base leading-8 text-white/68 sm:text-lg">{description}</p>

                {(primaryAction || secondaryAction) && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {primaryAction ? (
                      <InriLinkButton href={primaryAction.href} external={primaryAction.external}>
                        {primaryAction.label}
                      </InriLinkButton>
                    ) : null}
                    {secondaryAction ? (
                      <InriLinkButton href={secondaryAction.href} external={secondaryAction.external} variant="secondary">
                        {secondaryAction.label}
                      </InriLinkButton>
                    ) : null}
                  </div>
                )}

                <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {quickItems.map((item) => (
                    <QuickCard key={item.title} {...item} />
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.98),rgba(2,8,15,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Document summary</p>
                <h2 className="mt-3 text-3xl font-black text-white">{summaryTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-white/72">{summaryText}</p>
                <div className="mt-6 grid gap-3">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/44">{fact.label}</span>
                      <span className="text-right text-sm font-bold text-white">{fact.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-[1.4rem] border border-primary/20 bg-primary/[0.07] p-4 text-sm leading-7 text-white/78">
                  This route uses the official legal text for the site while keeping the same layout system used across the INRI platform.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="inri-page-container">
            <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="xl:sticky xl:top-[132px] xl:self-start">
                <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Sections</p>
                  <div className="mt-4 grid gap-2">
                    {sections.map((section) => (
                      <NavItem key={section.id} id={section.id} label={section.label} />
                    ))}
                  </div>
                </div>
              </aside>

              <div className="space-y-6">
                {sections.map((section, index) => (
                  <SectionCard
                    key={section.id}
                    id={section.id}
                    eyebrow={index === 0 ? eyebrow : `Section ${index}`}
                    title={section.title}
                  >
                    {section.content}
                  </SectionCard>
                ))}

                <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.96),rgba(2,7,14,0.98))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.34)] sm:p-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/90">Useful routes</p>
                  <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Keep the legal pages connected to the rest of the site.</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      { title: 'Whitepaper', href: '/whitepaper', text: 'Read the project structure, tokenomics and on-chain allocation model.', icon: <FileText className="h-5 w-5" /> },
                      { title: 'Explorer', href: '/explorer', text: 'Inspect contracts, treasury addresses and public transactions.', icon: <ExternalLink className="h-5 w-5" /> },
                      { title: 'Privacy Policy', href: '/privacy-policy', text: 'Review how the site handles user information and public blockchain data.', icon: <Lock className="h-5 w-5" /> },
                      { title: 'Terms', href: '/terms-and-conditions', text: 'See service rules, limitations and responsibility boundaries.', icon: <Scale className="h-5 w-5" /> },
                    ].map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group rounded-[1.5rem] border border-white/12 bg-black/35 p-5 transition hover:border-primary/40 hover:bg-black/50"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
                          {item.icon}
                        </div>
                        <h3 className="mt-4 text-lg font-extrabold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-white/66">{item.text}</p>
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
    { title: 'Minimal collection', text: 'Collect only what is reasonably necessary to operate, protect and improve the ecosystem.', icon: <ShieldCheck className="h-5 w-5" /> },
    { title: 'Public chain data', text: 'Transactions and addresses on INRI CHAIN remain public and cannot be deleted from the blockchain.', icon: <Lock className="h-5 w-5" /> },
    { title: 'User control', text: 'Users keep control over wallets, devices, browser settings and opt-out choices for off-chain contact.', icon: <Scale className="h-5 w-5" /> },
    { title: 'Security mindset', text: 'Servers and tools are operated carefully, but no system or node infrastructure can be guaranteed risk-free.', icon: <FileText className="h-5 w-5" /> },
  ],
  terms: [
    { title: 'Experimental service', text: 'INRI websites, explorer and RPC are community infrastructure provided without uptime or profit guarantees.', icon: <ShieldCheck className="h-5 w-5" /> },
    { title: 'Self-custody first', text: 'Users remain responsible for private keys, wallet actions and verification of irreversible transactions.', icon: <Lock className="h-5 w-5" /> },
    { title: 'Risk disclosure', text: 'Blockchain usage carries technology, market, regulatory and security risks that remain with the user.', icon: <Scale className="h-5 w-5" /> },
    { title: 'Lawful usage', text: 'Services must not be used for abuse, fraud, attacks or unlawful activity that harms the network or users.', icon: <FileText className="h-5 w-5" /> },
  ],
}
