import type { ComponentType } from 'react'
import { ArrowRight, Blocks, FolderCog, HardDriveDownload, KeyRound, Pickaxe, Rocket, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { InriShell, InriLinkButton } from '@/components/inri-site-shell'

const bootnodes =
  'enode://453d847d192861e020ae9bd44734c6d985f07786af3f2543c1a4a4578405c5232215852d02cab335f86376bfed4fb4fe8065f122cf36f41e5c7c805a04d7dc2b@134.199.203.8:30303,enode://5480948164d342bd728bf8a26fae74e8282c5f3fb905b03e25ab708866ea38cb0ec7015211623f0bc6f83aa7afa2dd7ae6789fdda788c5234564a794a938e15f@170.64.222.34:30303'

const steps = [
  {
    eyebrow: 'Step 0',
    title: 'Clean everything',
    text: 'Reset the local folders first so there is no old spam, wrong network, wrong account or broken chaindata mixed into the setup.',
    icon: FolderCog,
    body: [
      'Create a clean working folder such as C:\\INRI\\ and a data folder such as C:\\INRI\\data.',
      'If you already tested older setups, delete the previous chain data before starting again.',
      'The goal of this step is the same as the current public guide: start from zero before mining.',
    ],
    codeTitle: 'Target folder structure before you continue',
    code: 'C:\\INRI\\\nC:\\INRI\\data\\',
  },
  {
    eyebrow: 'Step 1',
    title: 'Create a mining account',
    text: 'Create the mining account only once. This is the local geth account used by the miner — not MetaMask.',
    icon: KeyRound,
    body: [
      'Choose a simple password and save it in Notepad as C:\\INRI\\password.txt.',
      'Run the account creation command only after your folders are clean and the binary is in place.',
      'Write down the generated address and save it in a file such as C:\\INRI\\wallet.txt.',
    ],
    codeTitle: 'Password file example',
    code: 'inri123',
    commandTitle: 'Create the local mining account',
    command: 'cd /d C:\\INRI\ngeth-inri-windows account new --datadir C:\\INRI\\data --password C:\\INRI\\password.txt',
  },
  {
    eyebrow: 'Step 2',
    title: 'Place the correct files',
    text: 'Inside C:\\INRI\\ you need the correct Windows binary and the correct genesis file before you initialize the chain.',
    icon: HardDriveDownload,
    body: [
      'If the binary is not named geth-inri-windows, stop and replace it with the correct one.',
      'Save the genesis file in Notepad as C:\\INRI\\genesis.json.',
      'Download the official Windows geth package, extract it and keep the Windows binary in C:\\INRI\\geth-inri-windows.',
    ],
    codeTitle: 'Files expected in C:\\INRI\\',
    code: 'C:\\INRI\\geth-inri-windows\nC:\\INRI\\genesis.json\nC:\\INRI\\password.txt',
  },
  {
    eyebrow: 'Step 3',
    title: 'Initialize the local chain structure',
    text: 'This creates the local blockchain structure that points to the INRI network. Run it once. Do not run it again after you already synced.',
    icon: Blocks,
    body: [
      'The current public page warns about this clearly: re-running init later can wipe the synchronized chain data.',
      'Only use the command after the correct genesis file is already saved in C:\\INRI\\genesis.json.',
    ],
    commandTitle: 'Initialize the INRI chain',
    command: 'cd /d C:\\INRI\ngeth-inri-windows --datadir C:\\INRI\\data init C:\\INRI\\genesis.json',
  },
  {
    eyebrow: 'Step 4',
    title: 'Create the miner batch file',
    text: 'Keep the batch simple. The public guide highlights the same two values to change before saving: the payout address and the thread count.',
    icon: ShieldCheck,
    body: [
      'Replace only the payout address and the number of threads you want to use.',
      'Save the file in Notepad as C:\\INRI\\miner_real.bat.',
      'Run the batch as Administrator when you are ready to start mining.',
    ],
    codeTitle: 'What you change in the batch file',
    code: 'set COINBASE=0x0000000000000000000000000000000000000000\nset THREADS=4',
    commandTitle: 'Batch structure',
    command: '@echo off\nset COINBASE=0x0000000000000000000000000000000000000000\nset THREADS=4\n\nC:\\INRI\\geth-inri-windows ^\n  --datadir C:\\INRI\\data ^\n  --networkid 3777 ^\n  --bootnodes ' + bootnodes + ' ^\n  --syncmode full ^\n  --snapshot=false ^\n  --maxpeers 100 ^\n  --cache 1024 ^\n  --mine ^\n  --miner.threads %THREADS% ^\n  --miner.etherbase %COINBASE% ^\n  --http ^\n  --http.addr 0.0.0.0 ^\n  --http.port 8545 ^\n  --http.api eth,net,web3,txpool,miner ^\n  --verbosity 3',
  },
  {
    eyebrow: 'Step 5',
    title: 'Add chaindata and start mining',
    text: 'Before the first full run, add the chaindata package to accelerate sync. Then launch the miner batch as Administrator.',
    icon: Rocket,
    body: [
      'Download the chaindata package, extract it and copy the chaindata folder into your data directory.',
      'The current public guide recommends Fast Sync through this chaindata step for new users.',
      'After that, right-click the miner batch and run it as Administrator.',
      'Watch the console to confirm peers, sync progress and mining activity on the original network.',
    ],
    codeTitle: 'Chaindata target path',
    code: 'C:\\INRI\\data\\geth\\chaindata',
  },
]

function StepCard({
  eyebrow,
  title,
  text,
  body,
  codeTitle,
  code,
  commandTitle,
  command,
  icon: Icon,
}: {
  eyebrow: string
  title: string
  text: string
  body: string[]
  codeTitle?: string
  code?: string
  commandTitle?: string
  command?: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#091425] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary/90">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black text-white">{title}</h2>
          <p className="mt-4 text-base leading-8 text-white/72">{text}</p>
          <div className="mt-6 space-y-3">
            {body.map((line) => (
              <div key={line} className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white/74">
                {line}
              </div>
            ))}
          </div>
        </div>
        <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] border border-primary/25 bg-primary/10 text-primary">
          <Icon className="h-8 w-8" />
        </div>
      </div>

      {(codeTitle && code) || (commandTitle && command) ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {codeTitle && code ? (
            <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/35">
              <div className="border-b border-white/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary/85">{codeTitle}</div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words px-4 py-4 text-sm leading-7 text-white/78">{code}</pre>
            </div>
          ) : null}
          {commandTitle && command ? (
            <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/35">
              <div className="border-b border-white/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary/85">{commandTitle}</div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words px-4 py-4 text-sm leading-7 text-white/78">{command}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export function InriMiningWindowsPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-black text-white">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(17,143,240,0.22),transparent_36%),linear-gradient(180deg,#07111e_0%,#04070d_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-4xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-primary/90">Mining Windows</p>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Windows CPU Miner</h1>
              <p className="mt-4 inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.22em] text-primary">
                Fork at block 6000000
              </p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                Start mining INRI tokens in the same order miners already know: clean everything, create the mining account,
                place the correct files, initialize the chain, prepare the batch file, add chaindata and then start mining.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InriLinkButton href="/pool">Open Pool</InriLinkButton>
                <InriLinkButton href="/wallets" variant="secondary">
                  Wallets
                </InriLinkButton>
                <InriLinkButton href="/explorer" variant="secondary">
                  Explorer
                </InriLinkButton>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1.18fr,0.82fr] lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.2)] sm:p-8">
              <div className="flex items-center gap-3 text-primary">
                <Pickaxe className="h-5 w-5" />
                <p className="text-sm font-extrabold uppercase tracking-[0.22em]">Correct order from zero to mining on Windows</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {steps.map((step, index) => (
                  <div key={step.title} className="rounded-[1.4rem] border border-white/10 bg-[#091425] p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary/80">{index === 0 ? 'Required first' : `Phase ${index + 1}`}</p>
                    <h2 className="mt-3 text-xl font-black text-white">{step.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-white/68">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#091425] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.2)] sm:p-8">
              <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary/90">Before you start</p>
              <div className="mt-5 space-y-4">
                {[
                  'This route is for the Windows CPU miner and follows the same logic the current INRI network guide already teaches.',
                  'The mining account created here is local to geth. It is not MetaMask and it is not your browser wallet.',
                  'Do not re-run the init step after you already synced, because that can wipe your local chain data.',
                  'Use the pool page if you want a pool route. This page is focused on the Windows node-based setup path.',
                ].map((item) => (
                  <div key={item} className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/74">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
            {steps.map((step) => (
              <StepCard key={step.title} {...step} />
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#091425,#060b13)] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary/90">Final check</p>
                  <h2 className="mt-3 text-3xl font-black text-white">How to know if you are really mining on the original network</h2>
                  <p className="mt-4 text-base leading-8 text-white/72">
                    After the batch starts, watch the node output for peer connections, sync progress, imported blocks and mining
                    activity. Keep your wallet address noted in C:\\INRI\\wallet.txt and compare activity against the public explorer
                    and pool pages when needed.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <InriLinkButton href="/explorer">Open Explorer</InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">
                    Pool Page
                  </InriLinkButton>
                </div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  { title: 'Wallet file', text: 'Keep the generated address written down and easy to find.' },
                  { title: 'Final folder', text: 'C:\\INRI\\ should contain your binary, genesis, password, batch and wallet note.' },
                  { title: 'Run as admin', text: 'The final miner batch should be started with Administrator permissions.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-[1.25rem] border border-white/10 bg-black/30 p-5">
                    <h3 className="text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/mining-ubuntu" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                  Prefer Ubuntu instead?
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
