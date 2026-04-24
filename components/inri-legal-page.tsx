import Link from 'next/link'
import type { ReactNode } from 'react'
import { ExternalLink, FileText, Lock, Scale, ShieldCheck } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriCard, InriCardGrid, InriHero, InriSection, inriGlassCard } from '@/components/inri-premium-model'

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
      <main>
        <InriHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={[
            ...(primaryAction ? [{ label: primaryAction.label, href: primaryAction.href, external: primaryAction.external }] : []),
            ...(secondaryAction ? [{ label: secondaryAction.label, href: secondaryAction.href, external: secondaryAction.external, variant: 'secondary' as const }] : []),
          ]}
          stats={facts.slice(0, 4).map((fact) => ({ label: fact.label, value: fact.value }))}
          sideTitle={summaryTitle}
          sideText={summaryText}
          sideItems={quickItems.slice(0, 3).map((item) => ({ title: item.title, text: item.text, icon: item.icon }))}
        />

        <InriSection eyebrow="Document" title="Important sections." description="The legal pages now use the same approved INRI dark-blue model as the rest of the website.">
          <div className="grid gap-6 xl:grid-cols-[290px_1fr]">
            <aside className={`${inriGlassCard} h-fit p-5 xl:sticky xl:top-[132px]`}>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/82">Sections</div>
              <div className="mt-4 grid gap-2">
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`} className="rounded-[14px] border border-cyan-300/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/68 transition hover:border-cyan-300/28 hover:bg-cyan-400/10 hover:text-white">
                    {section.label}
                  </a>
                ))}
              </div>
            </aside>

            <div className="space-y-5">
              {sections.map((section, index) => (
                <article key={section.id} id={section.id} className={`${inriGlassCard} scroll-mt-32 p-6 lg:p-8`}>
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/82">
                    {index === 0 ? eyebrow : `Section ${index}`}
                  </div>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">{section.title}</h2>
                  <div className="mt-5 space-y-5 text-[15px] leading-8 text-white/66 [&_a]:text-cyan-200 [&_a]:underline-offset-4 [&_a:hover]:underline [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-white [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1">
                    {section.content}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </InriSection>

        <InriSection eyebrow="Useful routes" title="Connected to the INRI platform.">
          <InriCardGrid cols={4}>
            <InriCard title="Whitepaper" text="Read project structure, tokenomics and ecosystem direction." href="/whitepaper" icon={<FileText className="h-5 w-5" />} />
            <InriCard title="Explorer" text="Inspect contracts, addresses and public transactions." href="https://explorer.inri.life" external icon={<ExternalLink className="h-5 w-5" />} />
            <InriCard title="Privacy Policy" text="Review how the site handles user information and blockchain data." href="/privacy-policy" icon={<Lock className="h-5 w-5" />} />
            <InriCard title="Terms" text="See service rules, limitations and responsibility boundaries." href="/terms-and-conditions" icon={<Scale className="h-5 w-5" />} />
          </InriCardGrid>
        </InriSection>
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
