import { InriP2PClient } from '@/components/inri-p2p-client'
import { InriShell, InriLinkButton } from '@/components/inri-site-shell'

export function InriP2PPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(19,164,255,0.08),_transparent_28%),linear-gradient(180deg,#02060b_0%,#000000_100%)]">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_35%),linear-gradient(180deg,#07111d_0%,#04070d_100%)]">
          <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-8 xl:px-12 2xl:px-16 lg:py-18">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-primary/85">P2P • ESCROW MARKET</p>
                <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-[3.4rem]">
                  Buy and sell INRI directly inside the new site.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
                  Native escrow flow on INRI CHAIN with create, market, paid, dispute, withdraw and moderator tools
                  all rendered directly in the new site experience.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                  Open INRI Wallet
                </InriLinkButton>
                <InriLinkButton href="/explorer" variant="secondary" noTranslate>
                  Explorer
                </InriLinkButton>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ['Contract', '0xF6e3...98f01', 'Escrow contract on INRI CHAIN'],
                ['Network', 'chain 3777', 'Runs on the INRI mainnet'],
                ['Buyer fee', '0.2% INRI', 'Deducted only on release'],
              ].map(([title, value, text]) => (
                <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/45">{title}</p>
                  <p className="mt-3 text-2xl font-black text-white">{value}</p>
                  <p className="mt-2 text-sm leading-7 text-white/60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12 pt-8 sm:pb-16">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12 2xl:px-16">
            <InriP2PClient />
          </div>
        </section>
      </main>
    </InriShell>
  )
}
