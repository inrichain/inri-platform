import { Coins, ExternalLink, FileText, Flame, Gauge, Pickaxe, ShieldCheck, Wallet } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriCard, InriCardGrid, InriHero, InriSection, inriGlassCard } from '@/components/inri-premium-model'

const chapters = [
  ['Abstract', 'INRI CHAIN is a Proof-of-Work, EVM-compatible blockchain focused on open participation, mining, wallet access and ecosystem utilities.'],
  ['Core Parameters', 'INRI mainnet uses Chain ID 3777 and supports EVM-compatible tooling, wallets and smart contracts.'],
  ['Architecture', 'The ecosystem connects wallet, explorer, RPC, mining, staking, token creation and P2P routes under one official interface.'],
  ['Consensus & Network', 'INRI uses Proof-of-Work mining with public network participation and explorer-verifiable activity.'],
  ['Tokenomics', 'Supply and ecosystem allocations are documented publicly, including staking and community incentive allocations.'],
  ['Staking', 'The staking program is designed as an on-chain participation layer connected with the official INRI wallet.'],
  ['Mining', 'Mining routes include Windows, Ubuntu, pool access and solo mining campaign visibility.'],
  ['P2P Market', 'The P2P route supports direct INRI market activity with an escrow-style product flow.'],
  ['Token Factory', 'Builders can create tokens on INRI through the official factory route and wallet flow.'],
  ['Governance & Operations', 'Network operations are transparent through public addresses, explorer routes and published infrastructure.'],
  ['Roadmap', 'The roadmap is focused on stronger wallet UX, mining growth, staking, token tooling and ecosystem liquidity routes.'],
  ['Risks', 'Blockchain use involves volatility, smart contract risk, infrastructure risk and self-custody responsibility.'],
  ['Conclusion', 'INRI aims to become a useful, community-driven EVM Proof-of-Work ecosystem with public tools and open participation.'],
] as const

export function InriWhitepaperPage() {
  return (
    <InriShell>
      <main>
        <InriHero
          eyebrow="INRI Whitepaper"
          title="The official structure behind the INRI ecosystem."
          description="A premium, readable whitepaper route for network parameters, mining, staking, tokenomics, P2P, token factory, risks and ecosystem direction."
          actions={[
            { label: 'Open Wallet', href: 'https://wallet.inri.life', external: true },
            { label: 'Explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
            { label: 'Mining Hub', href: '/mining', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Chain ID', value: '3777' },
            { label: 'Consensus', value: 'PoW' },
            { label: 'Runtime', value: 'EVM' },
            { label: 'Document', value: '13 Sections' },
          ]}
          sideTitle="Whitepaper in the same premium model."
          sideText="Documentation pages now follow the same approved INRI dark-blue style as the functional pages."
          sideItems={[
            { title: 'Network parameters', text: 'Chain ID, consensus and EVM compatibility.', icon: <Gauge className="h-4 w-4" /> },
            { title: 'Ecosystem utility', text: 'Mining, staking, token factory and P2P routes.', icon: <ShieldCheck className="h-4 w-4" /> },
            { title: 'User responsibility', text: 'Self-custody, risk and public blockchain transparency.', icon: <FileText className="h-4 w-4" /> },
          ]}
        />

        <InriSection eyebrow="Core overview" title="INRI CHAIN in one document." description="The whitepaper page keeps the same visual rhythm as the rest of the platform.">
          <InriCardGrid cols={4}>
            <InriCard title="Proof-of-Work" text="Open mining participation remains a core network identity." icon={<Pickaxe className="h-5 w-5" />} />
            <InriCard title="EVM Runtime" text="INRI supports familiar wallet and smart contract tooling." icon={<Gauge className="h-5 w-5" />} />
            <InriCard title="Staking Program" text="The staking route connects token participation with wallet UX." icon={<Coins className="h-5 w-5" />} />
            <InriCard title="Wallet + Tools" text="Wallet, explorer, factory and P2P routes are part of one ecosystem." icon={<Wallet className="h-5 w-5" />} />
          </InriCardGrid>
        </InriSection>

        <InriSection eyebrow="Chapters" title="Whitepaper sections.">
          <div className="grid gap-6 xl:grid-cols-[290px_1fr]">
            <aside className={`${inriGlassCard} h-fit p-5 xl:sticky xl:top-[132px]`}>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/82">Sections</div>
              <div className="mt-4 grid gap-2">
                {chapters.map(([title], i) => (
                  <a key={title} href={`#chapter-${i}`} className="rounded-[14px] border border-cyan-300/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/68 transition hover:border-cyan-300/28 hover:bg-cyan-400/10 hover:text-white">
                    {i + 1}. {title}
                  </a>
                ))}
              </div>
            </aside>

            <div className="space-y-5">
              {chapters.map(([title, text], i) => (
                <article key={title} id={`chapter-${i}`} className={`${inriGlassCard} scroll-mt-32 p-6 lg:p-8`}>
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/82">Chapter {i + 1}</div>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">{title}</h2>
                  <p className="mt-5 text-[15px] leading-8 text-white/66">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </InriSection>

        <InriSection eyebrow="Useful links" title="Verify the ecosystem.">
          <InriCardGrid cols={4}>
            <InriCard title="Explorer" text="Inspect contracts, addresses, blocks and public activity." href="https://explorer.inri.life" external icon={<ExternalLink className="h-5 w-5" />} />
            <InriCard title="Mining" text="Open the mining hub and setup routes." href="/mining" icon={<Pickaxe className="h-5 w-5" />} />
            <InriCard title="Staking" text="Open the staking product route." href="/staking" icon={<Coins className="h-5 w-5" />} />
            <InriCard title="Token Factory" text="Open the builder launch route." href="/token-factory" icon={<Flame className="h-5 w-5" />} />
          </InriCardGrid>
        </InriSection>
      </main>
    </InriShell>
  )
}
