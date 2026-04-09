import Link from 'next/link'
import { ArrowRight, CheckCircle2, Copy, Download, FolderCog, HardDriveDownload, Pickaxe, ShieldCheck, TerminalSquare } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const downloadPs1 = '/downloads/mining/windows/INRI-Windows-Miner-Installer.ps1'
const downloadBat = '/downloads/mining/windows/Run-INRI-Windows-Miner-Installer.bat'
const gethZipUrl = 'https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip'

const powershellQuickStart = String.raw`Set-ExecutionPolicy -Scope Process Bypass -Force
irm https://www.inri.life/downloads/mining/windows/INRI-Windows-Miner-Installer.ps1 | iex`

const generatedFiles = [
  'C:\\INRI\\geth-inri-windows.exe',
  'C:\\INRI\\genesis.json',
  'C:\\INRI\\data',
  'C:\\INRI\\start-inri-miner.bat',
  'C:\\INRI\\reinit-inri-chain.bat',
  'C:\\INRI\\open-inri-folder.bat',
  'C:\\INRI\\wallet.txt',
] as const

const manualFallback = String.raw`C:\INRI\geth-inri-windows.exe --datadir C:\INRI\data init C:\INRI\genesis.json`

const startMinerTemplate = String.raw`@echo off
set DATADIR=C:\INRI\data
set COINBASE=0xYOUR_MINING_ADDRESS
set THREADS=4

C:\INRI\geth-inri-windows.exe ^
  --datadir %DATADIR% ^
  --networkid 3777 ^
  --port 30303 ^
  --bootnodes enode://453d847d192861e020ae9bd44734c6d985f07786af3f2543c1a4a4578405c5232215852d02cab335f86376bfed4fb4fe8065f122cf36f41e5c7c805a04d7dc2b@134.199.203.8:30303,enode://5480948164d342bd728bf8a26fae74e8282c5f3fb905b03e25ab708866ea38cb0ec7015211623f0bc6f83aa7afa2dd7ae6789fdda788c5234564a794a938e15f@170.64.222.34:30303 ^
  --syncmode full ^
  --snapshot=false ^
  --maxpeers 100 ^
  --cache 1024 ^
  --mine ^
  --miner.threads %THREADS% ^
  --miner.etherbase %COINBASE% ^
  --http ^
  --http.addr 0.0.0.0 ^
  --http.port 8545 ^
  --http.api eth,net,web3,txpool,miner ^
  --allow-insecure-unlock ^
  --verbosity 3
pause`

const highlights = [
  {
    title: 'One-file installer',
    text: 'The user can run one PowerShell file, type the wallet, confirm the thread count and let the script prepare the full C:\\INRI route.',
    icon: <Download className="h-5 w-5" />,
  },
  {
    title: 'Official package',
    text: 'The installer downloads the official fork 6000000 geth ZIP and extracts the correct Windows binary automatically.',
    icon: <HardDriveDownload className="h-5 w-5" />,
  },
  {
    title: 'Genesis + init',
    text: 'It writes genesis.json, cleans old chaindata and initializes the chain so the miner starts from the right network rules.',
    icon: <FolderCog className="h-5 w-5" />,
  },
  {
    title: 'Ready launchers',
    text: 'It creates start-inri-miner.bat and helper files in C:\\INRI so the user is not forced to build the batch manually.',
    icon: <TerminalSquare className="h-5 w-5" />,
  },
] as const

function CodeCard({ title, code, note }: { title: string; code: string; note?: string }) {
  return (
    <div className="rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-black text-white">{title}</h3>
        <div className="inline-flex h-10 items-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 text-sm font-bold text-white/78">
          <Copy className="h-4 w-4 text-primary" /> Select and copy
        </div>
      </div>
      {note ? <p className="mt-2 text-sm leading-7 text-white/62">{note}</p> : null}
      <pre className="mt-4 overflow-x-auto rounded-[1.2rem] border border-white/10 bg-black/40 p-4 text-xs leading-6 text-white/82">{code}</pre>
    </div>
  )
}

export function InriMiningWindowsPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(19,164,255,0.09),transparent_26%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 xl:py-20">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_430px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  Mining Windows
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.35rem]">
                  Windows miner installer with <span className="text-primary">one file</span>, one wallet prompt and a clean first launch.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  This route is now prepared for the user who does not want to build folders, genesis and batch files by hand.
                  Download the installer or paste the PowerShell command below and let it prepare the full C:\\INRI setup automatically.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href={downloadPs1}>Download .ps1 installer</InriLinkButton>
                  <InriLinkButton href={downloadBat} variant="secondary">Download .bat launcher</InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">Open Pool</InriLinkButton>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Main folder: C:\\INRI</div>
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Chain ID: 3777</div>
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Consensus: PoW · Ethash</div>
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">What the installer does</p>
                <div className="mt-5 grid gap-3">
                  {[
                    'Asks for the mining wallet address and validates the 0x format.',
                    'Uses the detected CPU count as the default mining thread value.',
                    'Downloads the official geth package from the INRI release.',
                    'Writes genesis.json, clears old chaindata and runs init.',
                    'Creates ready-to-use batch files and optional desktop shortcuts.',
                  ].map((item) => (
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">{item.icon}</div>
                  <h2 className="mt-4 text-lg font-black text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/66">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/8 py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-6">
                <CodeCard
                  title="PowerShell quick start"
                  code={powershellQuickStart}
                  note="Open Windows PowerShell as Administrator, paste these two lines and let the installer prepare the mining folder automatically."
                />
                <CodeCard
                  title="Manual fallback: reinitialize the chain"
                  code={manualFallback}
                  note="Use this only if you intentionally need to reset the local chain data later."
                />
                <CodeCard
                  title="Generated start-inri-miner.bat"
                  code={startMinerTemplate}
                  note="The installer generates a ready batch in C:\\INRI. This block is shown here so advanced users can audit or adjust the launch parameters."
                />
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Files created by the installer</p>
                  <div className="mt-4 grid gap-3">
                    {generatedFiles.map((file) => (
                      <div key={file} className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                        <div className="break-all text-sm font-bold text-white">{file}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Useful routes</p>
                  <div className="mt-4 grid gap-3">
                    {[
                      { title: 'Pool', text: 'Compare PPLNS and SOLO and search miners.', href: '/pool' },
                      { title: 'Wallets', text: 'Prepare a payout address before mining.', href: '/wallets' },
                      { title: 'Ubuntu route', text: 'Open the Linux installer path.', href: '/mining/ubuntu' },
                      { title: 'Official geth ZIP', text: 'Open the direct package URL.', href: gethZipUrl, external: true },
                    ].map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-primary/40 hover:bg-primary/[0.08]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-black text-white">{item.title}</span>
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-primary/16 bg-primary/[0.06] p-6 text-sm leading-7 text-white/72 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
                  <p className="font-black uppercase tracking-[0.24em] text-primary">Important note</p>
                  <p className="mt-3">
                    This installer prepares geth, genesis and the mining batch. It does not include a chaindata snapshot download yet.
                    If you want to add a snapshot stage later, send the official chaindata URL and this page can be upgraded again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
