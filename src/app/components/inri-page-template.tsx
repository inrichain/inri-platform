import Link from "next/link"
import { ExternalLink } from "lucide-react"
import * as React from "react"

type CtaItem = {
  label: string
  href: string
  external?: boolean
}

type InfoCard = {
  title: string
  description: string
  href?: string
  external?: boolean
}

type InriPageTemplateProps = {
  eyebrow?: string
  title?: string
  description?: string
  primaryCta?: CtaItem
  secondaryCta?: CtaItem
  cards?: InfoCard[]
  children?: React.ReactNode

  /**
   * deixa passar props extras sem quebrar TypeScript
   */
  [key: string]: any
}

function ActionLink({
  href,
  label,
  external = false,
  variant = "primary",
}: {
  href: string
  label: string
  external?: boolean
  variant?: "primary" | "secondary"
}) {
  const className =
    variant === "primary"
      ? "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
      : "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-primary/40 hover:bg-primary/10"

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={className}
    >
      {label}
      {external ? <ExternalLink className="h-4 w-4" /> : null}
    </Link>
  )
}

export function InriPageTemplate({
  eyebrow = "INRI CHAIN",
  title = "INRI Page",
  description = "This page is being adapted to the new official INRI website style.",
  primaryCta,
  secondaryCta,
  cards = [],
  children,
}: InriPageTemplateProps) {
  return (
    <main className="min-h-screen bg-[#07111e] text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(0,163,255,0.18),_transparent_38%),linear-gradient(180deg,#081223_0%,#07111e_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary/85">
            {eyebrow}
          </p>

          <h1 className="mt-5 max-w-5xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
            {description}
          </p>

          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryCta ? (
                <ActionLink
                  href={primaryCta.href}
                  label={primaryCta.label}
                  external={primaryCta.external}
                  variant="primary"
                />
              ) : null}

              {secondaryCta ? (
                <ActionLink
                  href={secondaryCta.href}
                  label={secondaryCta.label}
                  external={secondaryCta.external}
                  variant="secondary"
                />
              ) : null}
            </div>
          )}
        </div>
      </section>

      {(cards?.length ?? 0) > 0 && (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card, index) => {
                const content = (
                  <div className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm transition hover:border-primary/40 hover:bg-white/[0.07]">
                    <h3 className="text-2xl font-bold text-white">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">
                      {card.description}
                    </p>
                    {card.href ? (
                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                        Open
                        {card.external ? (
                          <ExternalLink className="h-4 w-4" />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )

                if (!card.href) {
                  return <div key={index}>{content}</div>
                }

                return (
                  <Link
                    key={index}
                    href={card.href}
                    {...(card.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {content}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.16)] sm:p-8 lg:p-10">
            {children ? (
              children
            ) : (
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h2 className="text-2xl font-bold text-white sm:text-3xl">
                    Official INRI ecosystem page
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-white/70">
                    This section is ready to receive the final content for this
                    page while keeping the same premium visual style across the
                    INRI website.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">
                    Next step
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/75">
                    You can now replace this placeholder content with the final
                    text, buttons, downloads, links, tutorials, stats or
                    ecosystem actions for this section.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
