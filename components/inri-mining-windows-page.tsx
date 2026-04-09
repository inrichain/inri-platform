import Link from 'next/link'
import { ArrowRight, CheckCircle2, Download, FolderCog, Pickaxe, ShieldAlert, ShieldCheck, TerminalSquare } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const gethZipUrl = 'https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip'
const windowsLauncher = '/downloads/mining/windows/Run-INRI-Windows-Miner-Installer.bat'
const windowsInstaller = '/downloads/mining/windows/INRI-Windows-Miner-Installer.ps1'

const quickFacts = [
  ['Route', 'Mining Windows'],
  ['Folder', 'C:\\INRI'],
  ['Chain', '3777'],
  ['Fork reminder', 'Block 6000000'],
] as const

const steps = [
  {
    title: 'Step 0 — Clean everything',
    text: 'Reset everything and prepare the clean folders. The old page highlights C:\\INRI and C:\\INRI\\data as the clean base before any mining action.',
    bullets: [
      'Use CMD as Administrator.',
      'Prepare the folder structure from zero.',
      'Avoid old spam, wrong network data and wrong accounts.',
    ],
    icon: <FolderCog className="h-5 w-5" />,
  },
  {
    title: 'Step 1 — Create a mining account',
    text: 'Create the mining account only once and keep the password file saved in the INRI route.',
    bullets: [
      'Choose a simple password, for example inri123.',
      'This is not MetaMask.',
      'Save the password file as C:\\INRI\\password.txt.',
    ],
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Step 2 — Place the correct files',
    text: 'The classic guide insists on the correct binary name and the correct genesis file before moving on.',
    bullets: [
      'Inside C:\\INRI you need the correct files only.',
      'If geth is not geth-inri-windows, stop there.',
      'Save genesis as C:\\INRI\\genesis.json.',
      'Download the geth ZIP and place the extracted geth-inri-windows binary in C:\\INRI.',
    ],
    icon: <Download className="h-5 w-5" />,
  },
  {
    title: 'Step 3 — Create the miner batch file',
    text: 'The old route uses a batch file with your payout address and thread count. Save it in the INRI folder and only change the wallet and thread values.',
    bullets: [
      'Change only COINBASE and THREADS.',
      'Save the file as C:\\INRI\\miner_real.bat.',
      'Keep the rest of the launch parameters aligned with INRI CHAIN.',
    ],
    icon: <TerminalSquare className="h-5 w-5" />,
  },
  {
    title: 'Step 4 — Add chaindata',
    text: 'The old site recommends adding chaindata before the first launch to speed up the initial sync for new miners.',
    bullets: [
      'Download the chaindata package.',
      'Extract the ZIP file.',
      'Copy the chaindata folder into the correct route before the first run.',
    ],
    icon: <Pickaxe className="h-5 w-5" />,
  },
  {
    title: 'Step 5 — Start mining',
    text: 'Run the miner as Administrator and then verify that you are really mining on the original network.',
    bullets: [
      'Right-click and run the batch as Administrator.',
      'Watch the miner output and peers.',
      'Confirm the wallet address and network behavior before leaving it unattended.',
    ],
    icon: <ShieldAlert className="h-5 w-5" />,
  },
] as const

const layoutChecks = [
  'Final structure should stay inside C:\\INRI.',
  'Do not rerun init after the first correct initialization unless you really want to wipe sync data.',
  'Write down the generated wallet/account address and keep wallet.txt saved.',
  'Keep only the fork 6000000 package and correct genesis for this route.',
] as const

function CodeBlock({ title, code, note }: { title: string; code: string; note?: string }) {
  return (
    <div className="rounded-[1.55rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <h3 className="text-lg font-black text-white">{title}</h3>
      {note ? <p className="mt-2 text-sm leading-7 text-white/64">{note}</p> : null}
      <pre className="mt-4 overflow-x-auto rounded-[1.1rem] border border-white/10 bg-black/45 p-4 text-xs leading-6 text-white/82">{code}</pre>
    </div>
  )
}

export function InriMiningWindowsPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.14),transparent_24%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 xl:py-20">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_430px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  Windows CPU Miner
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.2rem]">
                  The classic <span className="text-primary">Mining Windows</span> route, rebuilt in a cleaner premium layout.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  This page keeps the same practical order from the old INRI site: clean everything, create the mining account, place the correct files, add chaindata and then start mining on the original network.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href={windowsLauncher}>Download Windows launcher</InriLinkButton>
                  <InriLinkButton href={windowsInstaller} variant="secondary">Download PowerShell installer</InriLinkButton>
                  <InriLinkButton href={gethZipUrl} variant="secondary">Official geth ZIP</InriLinkButton>
                </div>
                <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
                  {quickFacts.map(([label, value]) => (
                    <div key={label} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">
                      <span className="text-white/45">{label}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Legacy flow preserved</p>
                <div className="mt-5 grid gap-3">
                  {layoutChecks.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-white/74">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 xl:grid-cols-2">
              {steps.map((step) => (
                <div key={step.title} className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">{step.icon}</div>
                  <h2 className="mt-4 text-2xl font-black text-white">{step.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/66">{step.text}</p>
                  <ul className="mt-4 space-y-3 text-sm text-white/72">
                    {step.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.025] px-4 py-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="leading-6">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/8 py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-6">
                <CodeBlock
                  title="Folder structure reminder"
                  note="The old page keeps reinforcing the same root route and asks the user to store the files in the INRI folder."
                  code={String.raw`C:\INRI\
├─ geth-inri-windows.exe
├─ genesis.json
├─ password.txt
├─ wallet.txt
├─ miner_real.bat
└─ data\`}
                />
                <CodeBlock
                  title="What to change in the miner batch"
                  note="The old guide says to change only the payout address and the thread count before saving the batch file."
                  code={String.raw`set COINBASE=0x0000000000000000000000000000000000000000
set THREADS=4`}
                />
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Useful routes</p>
                <div className="mt-4 grid gap-3">
                  {[
                    { title: 'Pool', text: 'Use the pool page after setup to watch miner activity.', href: '/pool' },
                    { title: 'Wallets', text: 'Prepare the payout wallet before mining.', href: '/wallets' },
                    { title: 'Mining Ubuntu', text: 'Open the Ubuntu route if you want Linux instead.', href: '/mining-ubuntu' },
                    { title: 'Explorer', text: 'Verify addresses and network blocks.', href: '/explorer' },
                  ].map((item) => (
                    <Link key={item.title} href={item.href} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-primary/40 hover:bg-primary/[0.08]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-black text-white">{item.title}</span>
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
