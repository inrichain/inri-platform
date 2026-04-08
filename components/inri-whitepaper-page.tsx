import Link from 'next/link'
import type { ReactNode } from 'react'
import { ExternalLink, Flame, Gauge, Pickaxe, ShieldCheck } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const chapters = [
  { id: 'abstract', label: 'Abstract' },
  { id: 'introduction', label: '1. Introduction' },
  { id: 'core-parameters', label: '2. Core Parameters' },
  { id: 'architecture', label: '3. Architecture' },
  { id: 'consensus', label: '4. Consensus & Network' },
  { id: 'tokenomics', label: '5. Tokenomics' },
  { id: 'fees', label: '6. Fees & Burning' },
  { id: 'winri', label: '7. WINRI & Contracts' },
  { id: 'ecosystem', label: '8. Ecosystem' },
  { id: 'governance', label: '9. Governance' },
  { id: 'roadmap', label: '10. Roadmap' },
  { id: 'risks', label: '11. Risks' },
  { id: 'legal', label: '12. Legal' },
  { id: 'conclusion', label: '13. Conclusion' },
] as const

function FactPill({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-full border border-primary/25 bg-primary/[0.08] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
      {children}
    </div>
  )
}

function QuickCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <div className="rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.98),rgba(3,8,15,0.98))] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.10] text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-white/66">{text}</p>
    </div>
  )
}

function WhitepaperCard({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <article
      id={id}
      className="scroll-mt-36 rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,16,27,0.96),rgba(2,7,14,0.98))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.34)] sm:p-8"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/90">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-5 text-[15px] leading-8 text-white/72 [&_code]:rounded-md [&_code]:border [&_code]:border-white/10 [&_code]:bg-white/[0.05] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:text-primary [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h4]:mt-6 [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-white [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ol_li]:list-decimal">
        {children}
      </div>
    </article>
  )
}

function NavChapter({ id, label }: { id: string; label: string }) {
  return (
    <a
      href={`#${id}`}
      className="block rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:border-primary/40 hover:bg-primary/[0.08] hover:text-white"
    >
      {label}
    </a>
  )
}

export function InriWhitepaperPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.14),_transparent_26%),linear-gradient(180deg,#02060b_0%,#000000_42%,#020812_100%)]">
        <section className="border-b border-white/8">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_430px] xl:items-start">
              <div>
                <div className="flex flex-wrap gap-3">
                  <FactPill>Whitepaper</FactPill>
                  <FactPill>Chain ID 3777</FactPill>
                  <FactPill>PoW · Ethash</FactPill>
                  <FactPill>EIP-1559</FactPill>
                </div>
                <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-[4.35rem]">
                  INRI CHAIN whitepaper in the same black-and-blue language as the main site.
                </h1>
                <p className="mt-6 max-w-4xl text-base leading-8 text-white/68 sm:text-lg">
                  This page brings the full project structure into the live site language: Proof-of-Work, EVM compatibility,
                  fee burning, transparent tokenomics, staking allocation and founder vesting — all in one serious route for users,
                  miners and partners. fileciteturn3file0
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <InriLinkButton href="https://www.inri.life/whitepaper" external noTranslate>
                    Open live whitepaper
                  </InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" variant="secondary" external noTranslate>
                    Open explorer
                  </InriLinkButton>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <QuickCard icon={<Pickaxe className="h-5 w-5" />} title="Proof-of-Work" text="Ethash mining, open participation and real block production visible on-chain." />
                  <QuickCard icon={<Gauge className="h-5 w-5" />} title="EVM compatible" text="Deploy contracts with familiar Ethereum tooling, wallets and developer flows." />
                  <QuickCard icon={<Flame className="h-5 w-5" />} title="Fee burning" text="EIP-1559 burns base fees at protocol level and pays only priority fees to miners." />
                  <QuickCard icon={<ShieldCheck className="h-5 w-5" />} title="Transparent reserves" text="Community, staking and vesting allocations are described with public on-chain visibility." />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.98),rgba(2,8,15,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Whitepaper summary</p>
                <h2 className="mt-3 text-3xl font-black text-white">Core facts first.</h2>
                <div className="mt-6 grid gap-3">
                  {[
                    ['Network', 'INRI CHAIN'],
                    ['Native asset', 'INRI'],
                    ['Chain ID', '3777 (0xEC1)'],
                    ['Consensus', 'Proof-of-Work (Ethash)'],
                    ['Average block time', '~15 seconds'],
                    ['Fee model', 'EIP-1559 active from block 0'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/44">{label}</span>
                      <span className="text-right text-sm font-bold text-white">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-[1.4rem] border border-primary/20 bg-primary/[0.07] p-4 text-sm leading-7 text-white/78">
                  This route was rebuilt from your uploaded whitepaper structure and content, including the updated tokenomics,
                  staking contract, founder vesting and reward schedule. fileciteturn3file0
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="xl:sticky xl:top-[132px] xl:self-start">
                <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Sections</p>
                  <div className="mt-4 grid gap-2">
                    {chapters.map((chapter) => (
                      <NavChapter key={chapter.id} id={chapter.id} label={chapter.label} />
                    ))}
                  </div>
                </div>
              </aside>

              <div className="space-y-6">
                <WhitepaperCard id="abstract" eyebrow="Whitepaper" title="Abstract">
                  <p>
                    INRI CHAIN is a Proof-of-Work blockchain compatible with Ethereum, focused on fair mining, decentralization,
                    transparent treasury management and long-term sustainability through EIP-1559 fee burning.
                  </p>
                  <p>
                    The network is fully compatible with the Ethereum Virtual Machine, allowing developers to deploy contracts and
                    dApps with familiar tools such as Remix, MetaMask and Hardhat.
                  </p>
                  <p>
                    INRI is the native asset of the chain. It pays fees, rewards miners and coordinates community incentives. A portion
                    of network fees is burned at protocol level, offsetting issuance from block rewards and aligning long-term interests
                    across holders, miners and users.
                  </p>
                  <p>
                    INRI CHAIN also follows a transparent on-chain allocation model. Community reserves, staking allocation and founder
                    vesting are described with contract-level visibility so participants can independently audit the system through the
                    explorer.
                  </p>
                  <p>
                    INRI CHAIN is a grassroots project with no venture capital, no guaranteed funding and no corporate control. The goal is
                    to grow an ecosystem in which miners, users and builders share responsibility for decentralization and security.
                  </p>
                </WhitepaperCard>

                <WhitepaperCard id="introduction" eyebrow="Chapter 1" title="Introduction">
                  <h3>1.1 Motivation</h3>
                  <p>Most new blockchains today are either heavily pre-mined and VC-funded, or operated by a small set of validators and companies.</p>
                  <p>INRI CHAIN follows a different path:</p>
                  <ul>
                    <li><strong>Proof-of-Work (Ethash)</strong>: anyone with suitable hardware can participate.</li>
                    <li><strong>Transparent genesis</strong> and a publicly auditable treasury structure.</li>
                    <li><strong>No promises of financial return</strong>, no guaranteed salaries and no fixed payroll.</li>
                    <li><strong>EIP-1559 fee burning</strong> to counterbalance inflation from block rewards.</li>
                    <li><strong>Programmed reward reductions</strong> to gradually lower issuance over time.</li>
                  </ul>
                  <p>The goal is to build a network that is simple to understand, transparent and operated by a global community.</p>

                  <h3>1.2 Design Goals</h3>
                  <ul>
                    <li><strong>Decentralization</strong> – low barriers to running nodes and mining.</li>
                    <li><strong>Fairness</strong> – no hidden premine, no backdoors and no privileged minting.</li>
                    <li><strong>Sustainability</strong> – fee burning and decreasing block rewards over time.</li>
                    <li><strong>Compatibility</strong> – fully EVM-compatible.</li>
                    <li><strong>Simplicity</strong> – conservative, battle-tested components.</li>
                  </ul>
                </WhitepaperCard>

                <WhitepaperCard id="core-parameters" eyebrow="Chapter 2" title="Core Parameters">
                  <ul>
                    <li><strong>Network Name:</strong> INRI CHAIN</li>
                    <li><strong>Native Asset:</strong> INRI</li>
                    <li><strong>Symbol:</strong> INRI</li>
                    <li><strong>Decimals:</strong> 18</li>
                    <li><strong>Chain ID:</strong> 3777 (0xEC1)</li>
                    <li><strong>Consensus:</strong> Proof-of-Work (Ethash)</li>
                    <li><strong>Average Block Time:</strong> ~15 seconds (empirical)</li>
                    <li><strong>VM:</strong> Ethereum Virtual Machine (EVM)</li>
                    <li><strong>Fee Mechanism:</strong> EIP-1559 active from block 0</li>
                  </ul>

                  <h3>2.1 Network Endpoints</h3>
                  <ul>
                    <li><strong>Website:</strong> https://inri.life</li>
                    <li><strong>Explorer:</strong> https://explorer.inri.life</li>
                    <li><strong>Public RPC (HTTP):</strong> https://rpc.inri.life</li>
                    <li><strong>WebSocket RPC (planned):</strong> wss://rpc.inri.life</li>
                  </ul>

                  <h3>2.2 Genesis File and Protocol Rules</h3>
                  <ul>
                    <li><strong>Network identity</strong> – chainId 3777 (0xEC1).</li>
                    <li><strong>Consensus</strong> – Ethash PoW with major Ethereum hard forks enabled from block 0.</li>
                    <li><strong>Fee mechanism</strong> – London with EIP-1559 active from genesis.</li>
                    <li><strong>Transparent premine of 20,000,000 INRI</strong> – allocated to treasury buckets described below.</li>
                    <li><strong>Reward schedule update from block 6,000,000</strong> – a stepped reduction model enforced by the client.</li>
                  </ul>
                  <p>There is no pause key, block reversal switch or arbitrary mint path. New INRI is created only via block rewards and tips, partially offset by fee burning.</p>
                </WhitepaperCard>

                <WhitepaperCard id="architecture" eyebrow="Chapter 3" title="Architecture Overview">
                  <p>INRI CHAIN closely follows Ethereum PoW with four main layers:</p>
                  <ul>
                    <li><strong>Consensus &amp; Network</strong> – Ethash PoW, devp2p and community bootnodes.</li>
                    <li><strong>Execution Layer</strong> – EVM, Solidity/Vyper smart contracts.</li>
                    <li><strong>Fee &amp; Burning</strong> – EIP-1559 base fee plus tips with burning.</li>
                    <li><strong>Application &amp; Ecosystem</strong> – dApps, WINRI, explorers, wallets, staking and vesting infrastructure.</li>
                  </ul>

                  <h3>3.1 Decentralization Properties</h3>
                  <ul>
                    <li>Anyone can run a node.</li>
                    <li>Anyone can mine.</li>
                    <li>No central pause or censorship authority.</li>
                    <li>Official infrastructure helps early on but is not required forever.</li>
                    <li>Treasury addresses and core allocation contracts are public and auditable.</li>
                    <li>Over time, balances can migrate to multisigs and governance contracts.</li>
                  </ul>
                </WhitepaperCard>

                <WhitepaperCard id="consensus" eyebrow="Chapter 4" title="Consensus & Network">
                  <h3>4.1 Proof-of-Work (Ethash)</h3>
                  <p>INRI CHAIN uses Ethash, known from Ethereum’s PoW era. It is memory-hard, relatively friendly to GPUs and battle-tested in production.</p>
                  <p>Miners compete to find a valid nonce under the current difficulty target. The first valid block receives the reward applicable to that era plus transaction tips.</p>

                  <h3>4.2 Difficulty Adjustment</h3>
                  <p>Difficulty adjusts automatically to keep average block time near target. More hashpower increases difficulty; less hashpower decreases it.</p>

                  <h3>4.3 Network Topology &amp; Bootnodes</h3>
                  <p>Public bootnodes help new nodes discover peers. After that, nodes connect directly via P2P and no single machine remains critical.</p>

                  <h3>4.4 How to Mine INRI CHAIN</h3>
                  <h4>Basic requirements</h4>
                  <ul>
                    <li>EVM wallet configured for INRI.</li>
                    <li>GPU hardware with enough memory for the Ethash DAG.</li>
                    <li>Stable internet connection.</li>
                    <li>Node client for solo mining or a compatible mining pool.</li>
                  </ul>

                  <h4>Setting up INRI in MetaMask</h4>
                  <ol>
                    <li>Open MetaMask and click Add network.</li>
                    <li>Enter network name INRI CHAIN, RPC URL https://rpc.inri.life, chain ID 3777, symbol INRI and explorer https://explorer.inri.life.</li>
                    <li>Save. Your 0x address now works on INRI CHAIN and can receive mining rewards.</li>
                  </ol>

                  <h4>Solo mining</h4>
                  <ol>
                    <li>Install a Geth/Ethash client configured for INRI CHAIN.</li>
                    <li>Initialize with the INRI genesis and sync to the current block.</li>
                    <li>Set <code>--miner.etherbase 0xYOUR_ADDRESS</code>.</li>
                    <li>Start the node with <code>--mine</code> and thread parameters.</li>
                  </ol>

                  <h4>Security and best practices</h4>
                  <ul>
                    <li>Keep OS and drivers updated.</li>
                    <li>Monitor temperature and power usage.</li>
                    <li>Never share seeds or private keys.</li>
                    <li>Use 2FA on services related to mining.</li>
                  </ul>
                </WhitepaperCard>

                <WhitepaperCard id="tokenomics" eyebrow="Chapter 5" title="Tokenomics">
                  <h3>5.1 Native Asset: INRI</h3>
                  <ul>
                    <li>Paying transaction and contract interaction fees.</li>
                    <li>Rewarding miners.</li>
                    <li>Supporting staking and ecosystem programs.</li>
                    <li>Coordinating incentives, liquidity and infrastructure funding.</li>
                  </ul>

                  <h3>5.2 Block Reward Schedule</h3>
                  <ul>
                    <li><strong>Blocks 0 – 5,999,999:</strong> 2.00 INRI per block</li>
                    <li><strong>Blocks 6,000,000 – 11,999,999:</strong> 1.50 INRI per block</li>
                    <li><strong>Blocks 12,000,000 – 17,999,999:</strong> 1.00 INRI per block</li>
                    <li><strong>Blocks 18,000,000 – 23,999,999:</strong> 0.75 INRI per block</li>
                    <li><strong>Blocks 24,000,000 – 29,999,999:</strong> 0.50 INRI per block</li>
                    <li><strong>Blocks 30,000,000 onward:</strong> 0.25 INRI per block</li>
                  </ul>
                  <p>At roughly 15 seconds per block, the initial 2.00 INRI era corresponds to about 11,520 INRI per day before fee burning.</p>

                  <h3>5.3 Burning Mechanism (EIP-1559)</h3>
                  <p><code>Total Fee = gasUsed × (baseFee + priorityFee)</code></p>
                  <ul>
                    <li><strong>baseFee</strong> – burned at protocol level.</li>
                    <li><strong>priorityFee</strong> – paid to the miner.</li>
                  </ul>
                  <p>Net inflation follows: <code>Block Rewards + Priority Fees − Burned Fees</code>.</p>

                  <h3>5.4 Genesis Allocation (20,000,000 INRI)</h3>
                  <ul>
                    <li>Community / Airdrops / Incentives – 9,000,000 INRI (45%).</li>
                    <li>Founder + Early Contributors – 4,000,000 INRI (20%).</li>
                    <li>Infrastructure, Liquidity &amp; Partnerships – 3,000,000 INRI (15%).</li>
                    <li>Long-Term Reserve / Security – 2,000,000 INRI (10%).</li>
                    <li>Charity Fund – 2,000,000 INRI (10%).</li>
                  </ul>

                  <h4>5.4.1 Community / Airdrops / Incentives</h4>
                  <ul>
                    <li><strong>5,000,000 INRI</strong> were allocated to the staking program through contract <code>0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9</code>.</li>
                    <li><strong>351,916.31091192 INRI</strong> have already been deployed in community growth and incentives.</li>
                    <li>The <strong>current remaining balance</strong> in the original reserve is <strong>3,648,083.68908808 INRI</strong>.</li>
                  </ul>

                  <h4>5.4.2 Founder + Early Contributors</h4>
                  <p>
                    The founder allocation is governed on-chain through <code>INRIFounderEarlyCollaboratorsVesting</code> at
                    <code> 0xB0577Aba661Aab49fadc920EB76f734e8114dF25</code>.
                  </p>
                  <ul>
                    <li><strong>10%</strong> released at contract start.</li>
                    <li><strong>90%</strong> unlocked over <strong>24 equal installments</strong>, each every <strong>30 days</strong>.</li>
                    <li><strong>3,000,000 INRI</strong> allocated to the project creator.</li>
                    <li><strong>1,000,000 INRI</strong> allocated to an early contributor.</li>
                  </ul>

                  <h4>5.4.3 Transparency addresses</h4>
                  <ul>
                    <li>Community / Airdrops Reserve – <code>0xCC82Ffd96B647F60CdE65249F21e602b900Ff174</code></li>
                    <li>Staking Contract – <code>0xbE7eB939065Fa28d9d81Ab7842e0b615F02e26c9</code></li>
                    <li>Founder Vesting Contract – <code>0xB0577Aba661Aab49fadc920EB76f734e8114dF25</code></li>
                    <li>Infrastructure – <code>0x4788bb6101afcadd8daccfcb57531150684da2aa</code></li>
                    <li>Reserve – <code>0x8d2624ab570fab0d48992404a5135af5a566ca36</code></li>
                    <li>Charity – <code>0xc94593778692266226fb598a66626946047cb716</code></li>
                  </ul>
                </WhitepaperCard>

                <WhitepaperCard id="fees" eyebrow="Chapter 6" title="Fee Mechanism & Burning (EIP-1559)">
                  <h3>6.1 Overview</h3>
                  <p>With EIP-1559, each transaction pays:</p>
                  <p><code>Total Fee = gasUsed × (baseFee + priorityFee)</code></p>
                  <ul>
                    <li><strong>baseFee</strong> – burned.</li>
                    <li><strong>priorityFee</strong> – paid to the miner.</li>
                  </ul>

                  <h3>6.2 Per-block flows</h3>
                  <ul>
                    <li><strong>Burned:</strong> gasUsed × baseFee</li>
                    <li><strong>Fees to miner:</strong> gasUsed × priorityFee</li>
                    <li><strong>Subsidy:</strong> era-based block reward defined by schedule</li>
                  </ul>

                  <h3>6.3 Economic impact</h3>
                  <p>Light usage means lower burning. Heavy usage increases burning and can offset a significant part of issuance.</p>
                  <p>Combined with reward reductions over time, the long-term emission model becomes progressively more conservative.</p>
                </WhitepaperCard>

                <WhitepaperCard id="winri" eyebrow="Chapter 7" title="Wrapped INRI (WINRI) & Smart Contracts">
                  <h3>7.1 WINRI: ERC-20 wrapper</h3>
                  <ul>
                    <li>WINRI is an ERC-20 token on INRI CHAIN.</li>
                    <li>1 native INRI ↔ 1 WINRI via a simple deposit and withdraw contract.</li>
                    <li>dApps can use WINRI as a standard ERC-20.</li>
                    <li>Key for AMMs, DEXs, lending, staking and pools.</li>
                  </ul>

                  <h3>7.2 Smart contract compatibility</h3>
                  <p>
                    INRI CHAIN is fully EVM-compatible. Developers can deploy Solidity 0.8.x contracts with standard tools such as Remix,
                    Hardhat, Foundry and Truffle by configuring the RPC URL and chain ID.
                  </p>

                  <h3>7.3 Core on-chain allocation contracts</h3>
                  <p>
                    Important token distribution components already operate through transparent smart contracts, including the staking contract
                    and founder vesting contract, both independently inspectable on-chain through the explorer.
                  </p>
                </WhitepaperCard>

                <WhitepaperCard id="ecosystem" eyebrow="Chapter 8" title="Ecosystem & Infrastructure">
                  <h3>8.1 Explorer</h3>
                  <p>Main explorer: Blockscout-based <strong>INRI Explorer</strong> – https://explorer.inri.life</p>
                  <ul>
                    <li>Browse blocks, transactions and addresses.</li>
                    <li>Token pages, contract verification and ABI display.</li>
                    <li>Read and write contract interaction through the web UI.</li>
                  </ul>

                  <h3>8.2 RPC & Nodes</h3>
                  <ul>
                    <li>Public full node: https://rpc.inri.life</li>
                    <li>Dedicated bootnodes for peer discovery.</li>
                    <li>Community-run full nodes are strongly encouraged.</li>
                  </ul>

                  <h3>8.3 Wallets</h3>
                  <ul>
                    <li>MetaMask and other browser wallets via custom network configuration.</li>
                    <li>Hardware wallets via EVM-compatible interfaces.</li>
                    <li>Official INRI wallet route inside the main site.</li>
                  </ul>
                </WhitepaperCard>

                <WhitepaperCard id="governance" eyebrow="Chapter 9" title="Governance & Community">
                  <h3>9.1 Principles</h3>
                  <ul>
                    <li>No central authority controlling the protocol.</li>
                    <li>Open participation for miners, developers, users and contributors.</li>
                    <li>Transparency for proposals and changes.</li>
                  </ul>

                  <h3>9.2 Community treasury & incentives</h3>
                  <p>
                    The community treasury holds part of the genesis allocation and should support infrastructure, education, community initiatives,
                    liquidity bootstrapping, staking programs and ecosystem growth.
                  </p>

                  <h3>9.3 Charity fund & community voting</h3>
                  <p>
                    The Charity Fund represents a transparent social treasury that may evolve into a community-governed framework with on-chain
                    proposal execution in the future.
                  </p>

                  <h3>9.4 Role of the founder</h3>
                  <p>
                    The founder’s role is to kickstart the network, share the vision and provide initial infrastructure and documentation, then
                    progressively step back as the community takes over more of the ecosystem.
                  </p>
                </WhitepaperCard>

                <WhitepaperCard id="roadmap" eyebrow="Chapter 10" title="Roadmap (Indicative)">
                  <h3>Phase 1 – Bootstrap</h3>
                  <ul>
                    <li>Mainnet launch, bootnodes, RPC and explorer online.</li>
                    <li>Basic documentation and parameters published.</li>
                  </ul>

                  <h3>Phase 2 – Ecosystem Foundation</h3>
                  <ul>
                    <li>WINRI deployment and first community dApps and tokens.</li>
                    <li>Explorer improvements and contract verification.</li>
                    <li>Staking and core allocation contracts documented transparently.</li>
                  </ul>

                  <h3>Phase 3 – Decentralization & Resilience</h3>
                  <ul>
                    <li>More community-run nodes and RPCs, archive nodes and monitoring.</li>
                    <li>Additional explorers and infrastructure tools.</li>
                    <li>Broader participation in treasury and ecosystem initiatives.</li>
                  </ul>

                  <h3>Phase 4 – Governance & Expansion</h3>
                  <ul>
                    <li>Formal governance discussions and parameter proposals.</li>
                    <li>Cross-chain integrations, bridges and potential listings.</li>
                  </ul>
                </WhitepaperCard>

                <WhitepaperCard id="risks" eyebrow="Chapter 11" title="Risks & Limitations">
                  <ul>
                    <li><strong>Technical:</strong> bugs in clients, contracts or tools.</li>
                    <li><strong>Economic:</strong> volatility, mining-power concentration and fee dynamics.</li>
                    <li><strong>Governance:</strong> low participation or fragmentation.</li>
                    <li><strong>Regulatory & Legal:</strong> changing regulations and uncertainty.</li>
                  </ul>
                  <p>Participants should not treat INRI as an investment with guaranteed returns and should evaluate risks carefully.</p>
                </WhitepaperCard>

                <WhitepaperCard id="legal" eyebrow="Chapter 12" title="Legal Disclaimer">
                  <ul>
                    <li>INRI CHAIN is an open-source, community-driven project.</li>
                    <li>INRI tokens do not represent equity or shares in any company and do not guarantee profits or income.</li>
                    <li>This document is not financial, investment or legal advice.</li>
                    <li>Each participant is responsible for complying with local laws and seeking professional advice when needed.</li>
                  </ul>
                </WhitepaperCard>

                <WhitepaperCard id="conclusion" eyebrow="Chapter 13" title="Conclusion">
                  <p>
                    INRI CHAIN combines battle-tested PoW consensus, full EVM compatibility, programmed reward reductions and modern EIP-1559 fee
                    burning to favor honest miners, active users and long-term builders over short-term speculation and centralized control.
                  </p>
                  <p>
                    The project is intentionally lean: no VC, no guaranteed funding and no central company in charge. Its survival depends on the
                    community’s willingness to mine honestly, build useful applications, run infrastructure, audit allocations and coordinate
                    upgrades transparently.
                  </p>
                  <p>INRI CHAIN is an invitation to mine, build, experiment and help shape a network that truly belongs to its community.</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <InriLinkButton href="https://explorer.inri.life" variant="secondary" external noTranslate>
                      Verify on explorer
                    </InriLinkButton>
                    <InriLinkButton href="/wallets" variant="secondary">
                      Open wallets route
                    </InriLinkButton>
                    <InriLinkButton href="/mining" variant="secondary">
                      Open mining route
                    </InriLinkButton>
                  </div>
                </WhitepaperCard>

                <section className="rounded-[2rem] border border-primary/18 bg-primary/[0.08] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)] sm:p-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Useful routes</p>
                  <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Continue through the rest of the network.</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      { title: 'Wallets', text: 'Onboarding and wallet access.', href: '/wallets' },
                      { title: 'Mining', text: 'Windows, Ubuntu and network mining routes.', href: '/mining' },
                      { title: 'Pool', text: 'Pool entry and mining stats routes.', href: '/pool' },
                      { title: 'Explorer', text: 'Public chain verification route.', href: 'https://explorer.inri.life', external: true },
                    ].map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group rounded-[1.5rem] border border-white/12 bg-black/35 p-5 transition hover:border-primary/40 hover:bg-black/50"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-lg font-extrabold text-white">{item.title}</h3>
                          <ExternalLink className="h-4 w-4 text-primary/75 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/66">{item.text}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
