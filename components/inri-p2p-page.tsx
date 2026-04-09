import { InriShell, InriLinkButton } from '@/components/inri-site-shell'

export function InriP2PPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(19,164,255,0.08),_transparent_28%),linear-gradient(180deg,#02060b_0%,#000000_100%)]">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_35%),linear-gradient(180deg,#07111d_0%,#04070d_100%)]">
          <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-8 xl:px-12 2xl:px-16 lg:py-18">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-primary/85">INRI CHAIN</p>
                <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-[3.5rem]">P2P Escrow Market</h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
                  Buy and sell INRI with on-chain escrow, off-chain payment instructions, buyer fee deduction on release,
                  dispute tools and direct wallet interaction inside the site.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <InriLinkButton href="/apps/inri-p2p.html" variant="secondary" noTranslate>
                  Open full screen
                </InriLinkButton>
                <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                  INRI Wallet
                </InriLinkButton>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ['Escrow on-chain', 'Seller deposits INRI into escrow and releases only after confirming the off-chain payment.'],
                ['Buyer fee 0.2%', 'The buyer fee is deducted in INRI on release, with withdrawable net balance tracked in the app.'],
                ['Dispute tools', 'Paid and dispute alerts, moderator voting and owner resolution are already part of the flow.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                  <h2 className="text-lg font-extrabold text-white">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/65">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12 pt-8 sm:pb-16">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12 2xl:px-16">
            <div className="rounded-[2rem] border border-primary/18 bg-[linear-gradient(180deg,rgba(7,17,29,0.95),rgba(0,0,0,0.98))] p-2 shadow-[0_30px_100px_rgba(0,0,0,0.45),0_0_0_1px_rgba(19,164,255,0.05)] sm:p-3">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                <iframe
                  src="/apps/inri-p2p.html"
                  title="INRI P2P"
                  className="block h-[1450px] w-full bg-black md:h-[1320px] xl:h-[1220px]"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
