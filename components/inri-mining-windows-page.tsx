import Link from 'next/link'
import { AlertTriangle, ArrowRight, Blocks, Download, FolderCog, KeyRound, Pickaxe, Rocket, ShieldCheck } from 'lucide-react'
import { InriShell, InriLinkButton } from '@/components/inri-site-shell'

const gethZipUrl = 'https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip'

const windowsSteps = [
  {
    eyebrow: 'Step 0',
    title: 'Clean everything (required)',
    lead: 'Folder preparation steps (Windows CMD Administrator). This resets everything and creates two clean folders. C:\\INRI\\data. Now it is 100% clean.',
    bullets: [
      'Correct order — from zero to mining on Windows.',
      'This ensures there is no old spam, wrong network, wrong account or broken data mixed into the setup.',
      'Create a fresh working folder and a clean data folder before doing anything else.',
    ],
    code: 'C:\\INRI\\\nC:\\INRI\\data\\',
  },
  {
    eyebrow: 'Step 1',
    title: 'Create a mining account',
    lead: 'Create a mining account only once. Choose a simple password, for example inri123. This is not MetaMask. This is required for mining.',
    bullets: [
      'Go to Notepad and save the password as C:\\INRI\\password.txt.',
      'Run the account creation command after the folders are clean and the binary is already in place.',
      'Write down the generated address and save it as C:\\INRI\\wallet.txt.',
    ],
    code: 'cd /d C:\\INRI\\\ngeth-inri-windows account new --datadir C:\\INRI\\data --password C:\\INRI\\password.txt',
  },
  {
    eyebrow: 'Step 2',
    title: 'Placing the correct files',
    lead: 'Inside C:\\INRI\\ you need to have the correct files. If geth is not geth-inri-windows, stop everything here. Save the genesis file in Notepad as C:\\INRI\\genesis.json.',
    bullets: [
      'Download Geth geth-inri-windows, unzip it and save it to C:\\INRI\\geth-inri-windows.',
      'Keep the genesis file in the root INRI folder before you initialize the chain.',
      'Do not continue if the binary name or folder structure is wrong.',
    ],
    code: 'C:\\INRI\\geth-inri-windows\nC:\\INRI\\genesis.json\nC:\\INRI\\password.txt',
  },
  {
    eyebrow: 'Step 3',
    title: 'Initialize the local blockchain structure',
    lead: 'This step creates the local blockchain that points to the INRI network. Go back to CMD and run this command. Create a basic network structure. Never run this command again after you already synced.',
    bullets: [
      'If you run init again later, it can erase the entire synchronized blockchain.',
      'Run init only once, after the correct genesis file is already saved.',
      'The generated address from the previous step will be the one you keep recorded in wallet.txt.',
    ],
    code: 'cd /d C:\\INRI\\\ngeth-inri-windows --datadir C:\\INRI\\data init C:\\INRI\\genesis.json',
  },
  {
    eyebrow: 'Step 4',
    title: 'Create the miner batch file',
    lead: 'Save it in Notepad at C:\\INRI\\miner_real.bat. Just change set COINBASE=0x0000000000000000000000000000000000000000 and set THREADS=4 with the desired value.',
    bullets: [
      'Change only the payout address and the thread count before saving.',
      'Keep the file in the root INRI folder so the path remains simple.',
      'Run the batch as Administrator when you are ready to mine.',
    ],
    code: '@echo off\nset COINBASE=0x0000000000000000000000000000000000000000\nset THREADS=4',
  },
  {
    eyebrow: 'Step 5',
    title: 'Add chaindata and start mining',
    lead: 'Chaindata will be updated every Thursday to accelerate the mining process for new users. Fast Sync is recommended. Before running the miner for the first time, download and add the chaindata package.',
    bullets: [
      'Download the chaindata package.',
      'Extract the ZIP file.',
      'Copy the chaindata folder to C:\\INRI\\data\\geth\\chaindata.',
      'Right-click the miner batch and run as Administrator.',
    ],
    code: 'C:\\INRI\\data\\geth\\chaindata',
  },
]

function StepSection({
  eyebrow,
  title,
  lead,
  bullets,
  code,
}: {
  eyebrow: string
  title: string
  lead: string
  bullets: string[]
  code: string
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#081322] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-primary/90">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">{title}</h2>
          <p className="mt-4 text-sm leading-8 text-white/72 sm:text-base">{lead}</p>
        </div>
        <div className="hidden rounded-[1.25rem] border border-primary/25 bg-primary/10 p-3 text-primary lg:block">
          <Pickaxe className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-3">
          {bullets.map((item) => (
            <div key={item} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white/74">
              {item}
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/35">
          <div className="border-b border-white/10 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.22em] text-primary/90">Reference block</div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words px-4 py-4 text-sm leading-7 text-white/78">{code}</pre>
        </div>
      </div>
    </section>
  )
}

export function InriMiningWindowsPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-black text-white">
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(17,143,240,0.2),transparent_38%),linear-gradient(180deg,#07111d_0%,#04070d_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-4xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-primary/90">Mining Windows</p>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Windows CPU Miner</h1>
              <div className="mt-5 inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-extrabold uppercase tracking-[0.22em] text-primary">
                CMD fork at block 6000000
              </div>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                INRI CHAIN — CPU Miner for Windows. Start mining INRI tokens in a few simple steps, keeping the same setup order miners already use today on the network page.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InriLinkButton href={gethZipUrl} external>
                  Download Geth
                </InriLinkButton>
                <InriLinkButton href="/pool" variant="secondary">
                  Pool
                </InriLinkButton>
                <InriLinkButton href="/explorer" variant="secondary">
                  Explorer
                </InriLinkButton>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1.14fr,0.86fr] lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:p-8">
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-extrabold uppercase tracking-[0.22em]">Correct order — from zero to mining on Windows</p>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  { title: 'Clean everything', text: 'This resets everything and creates two clean folders.', icon: FolderCog },
                  { title: 'Create a mining account', text: 'Local geth account only once. This is not MetaMask.', icon: KeyRound },
                  { title: 'Place the correct files', text: 'Keep geth-inri-windows and genesis.json in the right folder.', icon: Download },
                  { title: 'Init and start mining', text: 'Initialize once, add chaindata, then run the miner batch as Administrator.', icon: Rocket },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="rounded-[1.35rem] border border-white/10 bg-[#091425] p-5">
                      <div className="inline-flex rounded-2xl border border-primary/25 bg-primary/10 p-3 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="mt-4 text-xl font-black text-white">{item.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-white/68">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#091425] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:p-8">
              <div className="flex items-center gap-3 text-primary">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm font-extrabold uppercase tracking-[0.22em]">Important reminders</p>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  'If geth is not geth-inri-windows, stop everything here.',
                  'Never run init again after the synchronized blockchain is already in place.',
                  'Save the generated mining address in C:\\INRI\\wallet.txt.',
                  'Right-click the miner batch and run as Administrator when you start mining.',
                  'Use the pool and explorer to verify that you are really mining on the original network.',
                ].map((item) => (
                  <div key={item} className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/74">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-8">
          <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
            {windowsSteps.map((step) => (
              <StepSection key={step.title} {...step} />
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[#081322] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary/90">Useful routes</p>
                  <h2 className="mt-3 text-3xl font-black text-white">Keep the same mining logic, with a cleaner premium layout.</h2>
                  <p className="mt-4 text-base leading-8 text-white/72">
                    Open Pool to track miner activity, Explorer to verify chain data, or Wallets if you still need to configure a compatible wallet before mining.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <InriLinkButton href="/pool">Pool</InriLinkButton>
                  <InriLinkButton href="/wallets" variant="secondary">Wallets</InriLinkButton>
                </div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  { title: 'Pool', text: 'Track live miners, blocks, payments and address lookup.', href: '/pool' },
                  { title: 'Explorer', text: 'Verify public chain activity and confirm the network state.', href: '/explorer' },
                  { title: 'Ubuntu guide', text: 'Open the simpler Ubuntu mining page in the same visual style.', href: '/mining-ubuntu' },
                ].map((item) => (
                  <Link key={item.title} href={item.href} className="group rounded-[1.25rem] border border-white/10 bg-black/30 p-5 transition hover:border-primary/45 hover:bg-black/40">
                    <h3 className="text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">{item.text}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                      Open
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
