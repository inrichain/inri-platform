import {
  ArrowRight,
  Coins,
  Factory,
  FileText,
  Globe,
  Layers3,
  Pickaxe,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
} from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const stats = [
  { label: 'Chain ID', value: '3777', note: 'Mainnet network identifier' },
  { label: 'Architecture', value: 'EVM', note: 'Compatible ecosystem' },
  { label: 'Consensus', value: 'PoW', note: 'Proof-of-Work foundation' },
  { label: 'Visual goal', value: 'Unified', note: 'Same premium standard on every page' },
] as const

const ecosystemCards = [
  {
    title: 'Wallet + explorer',
    text: 'Access the live wallet, check addresses, transactions and contracts with a brighter and clearer interface language.',
    href: 'https://wallet.inri.life',
    hrefLabel: 'Open wallet',
    external: true,
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    title: 'Mining + pool',
    text: 'Bring miners into the ecosystem through a visual system that feels official, modern and easier to follow on any screen.',
    href: '/mining',
    hrefLabel: 'Open mining hub',
    icon: <Pickaxe className="h-5 w-5" />,
  },
  {
    title: 'Staking + rewards',
    text: 'Guide users from the main platform to staking screens without the current broken visual rhythm between pages.',
    href: '/staking',
    hrefLabel: 'Open staking',
    icon: <Coins className="h-5 w-5" />,
  },
  {
    title: 'Token factory',
    text: 'Launch tokens inside INRI with a launch page that feels premium instead of disconnected from the main site.',
    href: '/token-factory',
    hrefLabel: 'Open factory',
    icon: <Factory className="h-5 w-5" />,
  },
  {
    title: 'P2P market',
    text: 'Keep the escrow market inside the same clean visual standard with better cards, spacing and white surfaces.',
    href: '/p2p',
    hrefLabel: 'Open P2P',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Whitepaper + docs',
    text: 'Move legal and documentation pages to the same brighter style so the site feels finished, complete and trustworthy.',
    href: '/whitepaper',
    hrefLabel: 'Read whitepaper',
    icon: <FileText className="h-5 w-5" />,
  },
] as const

const valueCards = [
  {
    title: 'Brighter identity',
    text: 'White premium surfaces with layered blue highlights instead of pages turning almost fully black.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'One standard for all pages',
    text: 'Hero, cards, buttons, spacing and typography follow the same system throughout the entire site.',
    icon: <Layers3 className="h-5 w-5" />,
  },
  {
    title: 'Responsive first',
    text: 'The platform keeps the same hierarchy and readability on desktop, tablet and mobile screens.',
    icon: <Globe className="h-5 w-5" />,
  },
] as const

const quickRoutes = [
  ['INRI Wallet', 'https://wallet.inri.life', true],
  ['Explorer', 'https://explorer.inri.life', true],
  ['Wallets', '/wallets', false],
  ['Pool', '/pool', false],
  ['Mining Windows', '/mining-windows', false],
  ['Mining Ubuntu', '/mining-ubuntu', false],
  ['Championship', '/mining-championship/', false],
  ['Privacy Policy', '/privacy-policy', false],
] as const

export function InriHomepage() {
  return (
    <InriShell>
      <main className="inri-bright-main">
        <section className="inri-bright-hero">
          <div className="inri-page-container py-14 lg:py-20">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.06fr)_430px] xl:items-stretch">
              <div className="inri-bright-card flex flex-col justify-center">
                <div className="inri-bright-chip w-fit">INRI CHAIN · PREMIUM WEBSITE</div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[0.92] tracking-[-0.06em] text-slate-900 sm:text-5xl xl:text-[4.8rem]">
                  Official INRI platform with a brighter, stronger and fully unified visual standard.
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  The goal now is simple: make the whole site feel premium, clean and connected. No more isolated dark pages. No more broken visual rhythm. Every route should look like part of the same official blockchain platform.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="https://wallet.inri.life" external noTranslate>
                    Open INRI Wallet
                  </InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" external noTranslate variant="secondary">
                    Open Explorer
                  </InriLinkButton>
                  <InriLinkButton href="/whitepaper" variant="secondary">
                    Read Whitepaper
                  </InriLinkButton>
                </div>
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-[1.25rem] border border-slate-200 bg-white/88 p-4 shadow-[0_16px_32px_rgba(15,23,42,0.05)]">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                      <div className="mt-2 text-2xl font-black text-slate-900">{item.value}</div>
                      <div className="mt-2 text-sm text-slate-600">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="grid gap-4">
                <div className="inri-bright-card">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-sky-200 bg-sky-50 text-sky-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="inri-bright-kicker mt-5">What changes now</p>
                  <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900">The website stops feeling random and starts feeling official.</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Light premium cards, stronger CTA buttons, cleaner sections and a consistent layout across home, mining, pool, staking, whitepaper, wallet routes and utility pages.
                  </p>
                  <div className="mt-6 grid gap-3">
                    {valueCards.map((item) => (
                      <div key={item.title} className="inri-bright-subcard">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
                            {item.icon}
                          </div>
                          <div className="text-base font-black text-slate-900">{item.title}</div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="inri-bright-card">
                  <p className="inri-bright-kicker">Fast navigation</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {quickRoutes.map(([label, href, external]) => (
                      <a
                        key={label}
                        href={href}
                        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group rounded-[1rem] border border-slate-200 bg-white/95 px-4 py-3 text-sm font-black text-slate-700 transition hover:-translate-y-px hover:border-sky-300 hover:text-sky-700"
                      >
                        <span className="flex items-center justify-between gap-3">
                          {label}
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="inri-bright-section">
          <div className="inri-page-container">
            <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="inri-bright-kicker">Main platform routes</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-900">Every page now belongs to the same visual family.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                Instead of a nice home and weaker internal screens, the entire INRI platform should follow the same bright premium direction across actions, cards and page composition.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ecosystemCards.map((card) => (
                <div key={card.title} className="inri-bright-card">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-sky-200 bg-sky-50 text-sky-600">
                    {card.icon}
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-slate-900">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
                  <div className="mt-6">
                    <InriLinkButton href={card.href} external={card.external} variant="secondary">
                      {card.hrefLabel}
                    </InriLinkButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="inri-bright-section pt-0">
          <div className="inri-page-container">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_380px]">
              <div className="inri-bright-card">
                <p className="inri-bright-kicker">Why this direction works</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-900">Cleaner brand trust for a blockchain ecosystem.</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: 'More trust',
                      text: 'Brighter pages feel cleaner, more finished and more institutional for new users.',
                    },
                    {
                      title: 'More clarity',
                      text: 'Actions stand out faster when the interface is not drowning in heavy dark surfaces.',
                    },
                    {
                      title: 'More consistency',
                      text: 'Users should recognize the same platform logic everywhere they navigate inside INRI.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="inri-bright-subcard">
                      <div className="text-lg font-black text-slate-900">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="inri-bright-card">
                <p className="inri-bright-kicker">Community energy</p>
                <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900">Keep the visual impact strong across campaigns.</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  A premium website helps Twitter posts, staking campaigns, mining announcements and token launch promotions feel more official and more memorable.
                </p>
                <div className="mt-6 rounded-[1.25rem] border border-sky-200 bg-sky-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-[0.16em] text-sky-700">Visual rule</div>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        Keep the same button language, same rounded cards, same spacing and the same bright premium color balance everywhere.
                      </p>
                    </div>
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
