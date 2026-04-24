import { CheckCircle2, Download, ShieldCheck, Wallet } from 'lucide-react'
import { InriLinkButton } from '@/components/inri-site-shell'

const walletCards = [
  {
    title: 'INRI Wallet',
    description: 'Official wallet experience for the INRI ecosystem.',
    actions: [
      { label: 'Open live wallet', href: 'https://wallet.inri.life', external: true },
      { label: 'Wallet route', href: '/inri-wallet' },
    ],
  },
  {
    title: 'MetaMask setup',
    description: 'Use the INRI network inside MetaMask after adding the chain values.',
    actions: [
      { label: 'Explorer', href: 'https://explorer.inri.life', external: true },
      { label: 'Whitepaper', href: '/whitepaper' },
    ],
  },
] as const

export function InriWalletsPage() {
  return (
    <main className="inri-bright-main">
      <section className="inri-bright-hero">
        <div className="inri-page-container py-14 lg:py-20">
          <div className="grid gap-7 xl:grid-cols-[minmax(0,1.04fr)_390px] xl:items-stretch">
            <div className="inri-bright-card flex flex-col justify-center">
              <div className="inri-bright-chip w-fit">SUPPORTED WALLETS</div>
              <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-900 sm:text-5xl xl:text-[4.4rem]">
                Wallet page with clearer setup, stronger actions and the same bright premium standard.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                This route now works as a cleaner onboarding page for the INRI wallet experience, showing the official wallet entry and helping the user move to the ecosystem without the page feeling visually weak.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InriLinkButton href="https://wallet.inri.life" external>Open INRI Wallet</InriLinkButton>
                <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Explorer</InriLinkButton>
              </div>
            </div>
            <aside className="inri-bright-card">
              <div className="grid gap-3">
                {[
                  { title: 'Official entry', text: 'Give users a clear path to the live INRI wallet.', icon: <Wallet className="h-5 w-5" /> },
                  { title: 'Setup help', text: 'Keep onboarding steps cleaner and more visible.', icon: <Download className="h-5 w-5" /> },
                  { title: 'Trust-focused design', text: 'Bright surfaces make the wallet area feel more official.', icon: <ShieldCheck className="h-5 w-5" /> },
                ].map((item) => (
                  <div key={item.title} className="inri-bright-subcard">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">{item.icon}</div>
                      <div className="text-base font-black text-slate-900">{item.title}</div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="inri-bright-section">
        <div className="inri-page-container">
          <div className="grid gap-4 md:grid-cols-2">
            {walletCards.map((card) => (
              <div key={card.title} className="inri-bright-card">
                <h2 className="text-3xl font-black text-slate-900">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {card.actions.map((action) => (
                    <InriLinkButton key={action.label} href={action.href} external={action.external} variant={action.external ? 'primary' : 'secondary'}>
                      {action.label}
                    </InriLinkButton>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inri-bright-section pt-0">
        <div className="inri-page-container">
          <div className="inri-bright-card">
            <p className="inri-bright-kicker">Quick network notes</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                ['Chain ID', '3777'],
                ['Network type', 'EVM compatible'],
                ['Recommended route', 'Official INRI Wallet'],
              ].map(([label, value]) => (
                <div key={label} className="inri-bright-subcard">
                  <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-sky-600" />
                    {label}
                  </div>
                  <p className="mt-3 text-lg font-black text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
