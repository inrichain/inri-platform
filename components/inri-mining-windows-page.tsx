import type { ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, CheckCircle2, Download, FolderCog, HardDrive, Pickaxe, ShieldCheck, TerminalSquare } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const gethZipUrl = 'https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip'
const windowsLauncher = '/downloads/mining/windows/Run-INRI-Windows-Miner-Installer.bat'
const windowsInstaller = '/downloads/mining/windows/INRI-Windows-Miner-Installer.ps1'
const chaindataUrl = 'https://www.inri.life/mining-windows'

const quickFacts = [
  ['Route', 'Windows CPU Miner'],
  ['Chain ID', '3777'],
  ['Main folder', 'C:\\INRI'],
  ['Required binary', 'geth-inri-windows'],
  ['Fork reminder', 'Block 6000000'],
] as const

const requiredFiles = [
  'C:\\INRI\\geth-inri-windows',
  'C:\\INRI\\genesis.json',
  'C:\\INRI\\password.txt',
  'C:\\INRI\\wallet.txt',
  'C:\\INRI\\miner_real.bat',
  'C:\\INRI\\data\\',
] as const

const steps = [
  {
    number: 'Step 0',
    title: 'Clean everything',
    body: 'Start from a fully clean route. The mining flow expects C:\\INRI and C:\\INRI\\data to be clean before you create accounts, add chaindata or start the node.',
    bullets: [
      'Run CMD as Administrator.',
      'Delete old chaindata and wrong network files before starting over.',
      'Keep only one clean Windows mining route for INRI.',
    ],
    icon: <FolderCog className="h-5 w-5" />,
  },
  {
    number: 'Step 1',
    title: 'Create the mining account',
    body: 'Create a dedicated mining account one time and store the password file in the INRI root folder. This account is for the local miner and is different from MetaMask.',
    bullets: [
      'Choose a simple mining password for the local account.',
      'Save the password in C:\\INRI\\password.txt.',
      'Write down the generated address and save it in C:\\INRI\\wallet.txt.',
    ],
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    number: 'Step 2',
    title: 'Place the correct files',
    body: 'The setup only works cleanly when the Windows route contains the correct fork package and the correct genesis file.',
    bullets: [
      'Download the official fork 6000000 geth ZIP.',
      'Extract the correct Windows binary into C:\\INRI.',
      'Save genesis.json directly inside C:\\INRI.',
      'If the binary is not the INRI Windows one, stop and replace it before going further.',
    ],
    icon: <Download className="h-5 w-5" />,
  },
  {
    number: 'Step 3',
    title: 'Create the miner batch file',
    body: 'The batch file should only need your payout address and the thread count changed. Save it inside the INRI folder so the launch path stays clean and repeatable.',
    bullets: [
      'Change only COINBASE and THREADS.',
      'Save the file as C:\\INRI\\miner_real.bat.',
      'Keep the rest of the launch parameters aligned to INRI CHAIN.',
    ],
    icon: <TerminalSquare className="h-5 w-5" />,
  },
  {
    number: 'Step 4',
    title: 'Add chaindata',
    body: 'Before the first live run, add the chaindata package to speed up initial sync for new miners.',
    bullets: [
      'Download the latest chaindata package.',
      'Extract the ZIP.',
      'Copy the chaindata folder into C:\\INRI\\data before the first run.',
    ],
    icon: <HardDrive className="h-5 w-5" />,
  },
  {
    number: 'Step 5',
    title: 'Start mining',
    body: 'Right-click the batch file and run it as Administrator. Then confirm that your wallet, peers and network behavior are correct before leaving the miner running.',
    bullets: [
      'Run the miner batch as Administrator.',
      'Verify you are on the original INRI network.',
      'Confirm the account, block progress and peer activity.',
    ],
    icon: <Pickaxe className="h-5 w-5" />,
  },
] as const

function StepCard({
  number,
  title,
  body,
  bullets,
  icon,
}: {
  number: string
  title: string
  body: string
  bullets: readonly string[]
  icon: ReactNode
}) {
  return (
    <section className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">{number}</p>
          <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">{body}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-black/25 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm leading-6 text-white/78">{bullet}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CodePanel({ title, note, code }: { title: string; note?: string; code: string }) {
  return (
    <div className="rounded-[1.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(5,17,28,0.98),rgba(1,7,12,0.99))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <h3 className="text-lg font-black text-white">{title}</h3>
      {note ? <p className="mt-2 text-sm leading-7 text-white/64">{note}</p> : null}
      <pre className="mt-4 overflow-x-auto rounded-[1.15rem] border border-white/10 bg-black/45 p-4 text-xs leading-6 text-white/84">{code}</pre>
    </div>
  )
}

export function InriMiningWindowsPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_28%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 xl:py-20">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_440px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  Mining Windows
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.2rem]">
                  Windows CPU Miner for <span className="text-primary">INRI CHAIN</span>
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  Start mining in the same clean sequence used by the INRI Windows route: prepare the folders, create the local mining account, place the correct files, add chaindata and then launch the miner.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href={windowsLauncher}>Download Windows launcher</InriLinkButton>
                  <InriLinkButton href={windowsInstaller} variant="secondary">PowerShell installer</InriLinkButton>
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

              <aside className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Before you start</p>
                <div className="mt-5 grid gap-3">
                  {requiredFiles.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="break-all text-sm leading-6 text-white/74">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-[1.25rem] border border-amber-400/20 bg-amber-400/10 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <p className="text-sm leading-6 text-white/76">
                      Keep the correct fork 6000000 package and do not rerun the chain initialization after a correct sync unless you really want to wipe local blockchain data.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 xl:grid-cols-2">
              {steps.map((step) => (
                <StepCard key={step.title} {...step} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/8 py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-6">
                <CodePanel
                  title="Folder structure"
                  note="Keep the main route clean and predictable so the miner can be supported more easily."
                  code={`C:\\INRI\\
├─ geth-inri-windows
├─ genesis.json
├─ password.txt
├─ wallet.txt
├─ miner_real.bat
└─ data\\chaindata`}
                />
                <CodePanel
                  title="Only these values normally change"
                  note="The Windows batch should mainly ask you to replace the payout address and choose the thread count."
                  code={`set COINBASE=0x0000000000000000000000000000000000000000
set THREADS=4`}
                />
              </div>

              <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Next routes</p>
                <div className="mt-4 grid gap-3">
                  {[
                    { title: 'Pool', text: 'Watch miner activity, payments, blocks and top miners after setup.', href: '/pool' },
                    { title: 'Wallets', text: 'Prepare a payout wallet before starting the miner.', href: '/wallets' },
                    { title: 'Mining Ubuntu', text: 'Open the Linux route if you want the Ubuntu installer path.', href: '/mining-ubuntu' },
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
                <a
                  href={chaindataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-between rounded-[1.2rem] border border-primary/24 bg-primary/10 px-4 py-4 transition hover:bg-primary/15"
                >
                  <div>
                    <p className="text-sm font-black text-white">Chaindata reference</p>
                    <p className="mt-1 text-sm leading-6 text-white/60">Use the published chaindata route when a fresh sync needs acceleration.</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
