import Link from 'next/link'
import { ArrowRight, CheckCircle2, Download, FolderCog, HardDriveDownload, Pickaxe, TerminalSquare, Wallet } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const gethZipUrl = 'https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip'

const cleanCode = `REM Delete old INRI folders completely
rd /s /q C:\\INRI

REM Recreate folders for blockchain data
mkdir C:\\INRI
mkdir C:\\INRI\\data`

const genesisCode = `{
  "config": {
    "chainId": 3777,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "muirGlacierBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "arrowGlacierBlock": 0,
    "grayGlacierBlock": 0,
    "ethash": {}
  },
  "nonce": "0x0000000000000000",
  "timestamp": "0x0",
  "extraData": "0x00",
  "gasLimit": "0x1fffffffffffff",
  "difficulty": "0x1",
  "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "coinbase": "0x0000000000000000000000000000000000000000",
  "alloc": {
    "0x0cec4852f2141aeea1111583e788009a3b18e705": { "balance": "20000000000000000000000000" }
  },
  "number": "0x0",
  "gasUsed": "0x0",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
}`

const initCode = `C:\\INRI\\geth-inri-windows --datadir C:\\INRI\\data init C:\\INRI\\genesis.json`

const accountCode = `C:\\INRI\\geth-inri-windows account new --datadir C:\\INRI\\data --password C:\\INRI\\password.txt`

const batchCode = `@echo off
chcp 65001 >nul
title INRI CHAIN - PUBLIC MINER (WORKING)

REM ==================================================
REM CONFIGURACAO
REM ==================================================
set GETH=C:\\INRI\\geth-inri-windows.exe
set DATADIR=C:\\INRI\\data
set NETWORKID=3777
set COINBASE=0x0000000000000000000000000000000000000000
set PASSWORD=C:\\INRI\\password.txt

REM ==================================================
REM REDE
REM ==================================================
set P2P_PORT=30303
set MAXPEERS=100
set CACHE=1024
set THREADS=4

REM ==================================================
REM BOOTNODES
REM ==================================================
set BOOTNODES=enode://453d847d192861e020ae9bd44734c6d985f07786af3f2543c1a4a4578405c5232215852d02cab335f86376bfed4fb4fe8065f122cf36f41e5c7c805a04d7dc2b@134.199.203.8:30303,enode://5480948164d342bd728bf8a26fae74e8282c5f3fb905b03e25ab708866ea38cb0ec7015211623f0bc6f83aa7afa2dd7ae6789fdda788c5234564a794a938e15f@170.64.222.34:30303

REM ==================================================
REM VERIFICACOES
REM ==================================================
if not exist "%GETH%" (
  echo ERRO: Geth nao encontrado.
  pause
  exit /b
)

if not exist "%DATADIR%" mkdir "%DATADIR%"

REM ==================================================
REM FIREWALL
REM ==================================================
net session >nul 2>&1
if %errorlevel%==0 (
  netsh advfirewall firewall add rule name="INRI TCP 30303" dir=in action=allow protocol=TCP localport=30303 >nul 2>&1
  netsh advfirewall firewall add rule name="INRI UDP 30303" dir=in action=allow protocol=UDP localport=30303 >nul 2>&1
)

REM ==================================================
REM START MINER
REM ==================================================

echo ============================================
echo INRI CHAIN - PUBLIC MINER
echo ============================================
echo Network   : %NETWORKID%
echo MaxPeers  : %MAXPEERS%
echo Threads   : %THREADS%
echo ============================================
echo.

"%GETH%" ^
 --datadir "%DATADIR%" ^
 --networkid %NETWORKID% ^
 --port %P2P_PORT% ^
 --bootnodes "%BOOTNODES%" ^
 --syncmode full ^
 --snapshot=false ^
 --maxpeers %MAXPEERS% ^
 --cache %CACHE% ^
 --mine ^
 --miner.threads %THREADS% ^
 --miner.etherbase "%COINBASE%" ^
 --unlock "%COINBASE%" ^
 --password "%PASSWORD%" ^
 --verbosity 3

echo.
echo ============================================
echo GETH PAROU
echo ============================================
pause`

const checks = [
  'Use CMD as Administrator for the cleanup, init and first launch steps.',
  'Save password.txt before creating the account. This mining account is not MetaMask.',
  'If the binary is not named geth-inri-windows, stop and correct the files first.',
  'Do not run init again after the first correct initialization, or you will wipe the sync data.',
] as const

function StepCard({
  eyebrow,
  title,
  text,
  icon,
  children,
}: {
  eyebrow: string
  title: string
  text: string
  icon: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section className="rounded-[1.9rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">{text}</p>
          {children ? <div className="mt-5">{children}</div> : null}
        </div>
      </div>
    </section>
  )
}

function CodePanel({ title, note, code }: { title: string; note?: string; code: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-black/35 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black text-white">{title}</h3>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          Copy &amp; paste
        </span>
      </div>
      {note ? <p className="mt-2 text-sm leading-6 text-white/58">{note}</p> : null}
      <pre className="mt-4 overflow-x-auto rounded-[1rem] border border-white/10 bg-[#020814] p-4 text-xs leading-6 text-white/82">{code}</pre>
    </div>
  )
}

export function InriMiningWindowsPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_24%),linear-gradient(180deg,#041222_0%,#000000_72%)]">
          <div className="mx-auto max-w-[1460px] px-4 py-14 sm:px-6 lg:px-8 xl:py-18">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_420px] xl:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                  Windows CPU Miner
                </div>
                <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.15rem]">
                  Mining Windows, with the <span className="text-primary">same working flow</span> and cleaner premium presentation.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  Keep the exact sequence that already works: clean the folders, create the mining account, place the correct files, initialize the chain, add chaindata and only then start the miner.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href={gethZipUrl} external>
                    Download official geth ZIP
                  </InriLinkButton>
                  <InriLinkButton href="#chaindata-step" variant="secondary">
                    Chaindata step
                  </InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">
                    Open pool
                  </InriLinkButton>
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.5px] border-white/14 bg-[linear-gradient(180deg,rgba(5,17,28,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.32)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Before you start</p>
                <div className="mt-5 grid gap-3">
                  {checks.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.035] px-4 py-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-white/74">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Downloads</p>
                  <div className="mt-3 grid gap-3">
                    <a href={gethZipUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-primary/40 hover:bg-primary/[0.08]">
                      <div>
                        <div className="text-sm font-black text-white">Official geth package</div>
                        <div className="mt-1 text-xs text-white/58">Fork 6000000 ZIP package</div>
                      </div>
                      <HardDriveDownload className="h-5 w-5 text-primary" />
                    </a>
                    <a href="#chaindata-step" className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-primary/40 hover:bg-primary/[0.08]">
                      <div>
                        <div className="text-sm font-black text-white">Chaindata package</div>
                        <div className="mt-1 text-xs text-white/58">Weekly fast-sync step highlighted below</div>
                      </div>
                      <Download className="h-5 w-5 text-primary" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1460px] space-y-6 px-4 sm:px-6 lg:px-8">
            <StepCard
              eyebrow="Step 0"
              title="Clean everything"
              text="This resets the route and recreates the clean folder structure from zero. Run these commands in Windows CMD as Administrator."
              icon={<FolderCog className="h-5 w-5" />}
            >
              <CodePanel title="Folder preparation" code={cleanCode} />
            </StepCard>

            <StepCard
              eyebrow="Step 1"
              title="Create a mining account"
              text="Choose a simple password such as inri123, save it as C:\\INRI\\password.txt, and then create the local mining account. This account is for the miner route and is not MetaMask."
              icon={<Wallet className="h-5 w-5" />}
            >
              <div className="grid gap-4 xl:grid-cols-2">
                <CodePanel title="Password file note" code={`Save this first:\nC:\\INRI\\password.txt`} note="Open Notepad and save the password text file before creating the account." />
                <CodePanel title="Create the mining account" code={accountCode} />
              </div>
            </StepCard>

            <StepCard
              eyebrow="Step 2"
              title="Place the correct files"
              text="Inside C:\\INRI you need the correct binary and the correct genesis file. If the binary is not named geth-inri-windows, stop and fix it before continuing."
              icon={<Download className="h-5 w-5" />}
            >
              <div className="space-y-4">
                <CodePanel title="Save as C:\\INRI\\genesis.json" code={genesisCode} />
                <CodePanel title="Initialize the local blockchain" code={initCode} note="Run this command once. Never run init again after the first correct initialization or you will erase the synchronized blockchain." />
              </div>
            </StepCard>

            <StepCard
              eyebrow="Step 3"
              title="Create the miner batch file"
              text="Save the batch below as C:\\INRI\\miner_real.bat. Change only COINBASE and THREADS before running it."
              icon={<TerminalSquare className="h-5 w-5" />}
            >
              <CodePanel title="C:\\INRI\\miner_real.bat" code={batchCode} />
            </StepCard>

            <StepCard
              eyebrow="Step 4"
              title="Add chaindata"
              text="Before the first launch, download the chaindata package, extract the ZIP file and copy the chaindata folder into your INRI data route. This is the fast-sync step highlighted on the current mining page."
              icon={<Pickaxe className="h-5 w-5" />}
            >
              <div id="chaindata-step" className="rounded-[1.4rem] border border-white/10 bg-black/30 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-white">Chaindata route</h3>
                    <p className="mt-2 text-sm leading-6 text-white/62">Fast Sync (Recommended). Download the current chaindata package, extract the ZIP, then copy the folder <span className="font-semibold text-white">chaindata</span> into <span className="font-semibold text-white">C:\\INRI\\data</span> before the first run.</p>
                  </div>
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Updated weekly</span>
                </div>
              </div>
            </StepCard>

            <StepCard
              eyebrow="Step 5"
              title="Start mining"
              text="Right-click the batch and run it as Administrator. Then verify that you are really mining on the original network and keep the final C:\\INRI folder structure intact."
              icon={<CheckCircle2 className="h-5 w-5" />}
            >
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-[1.4rem] border border-white/10 bg-black/30 p-5">
                  <h3 className="text-lg font-black text-white">Start checklist</h3>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>Right-click the batch file and run as Administrator.</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>Check the wallet address saved in wallet.txt and the COINBASE value in the batch.</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>Watch peers, sync progress and mining output before leaving the machine unattended.</span></li>
                  </ul>
                </div>
                <CodePanel title="Final C:\\INRI structure" code={`C:\\INRI\\\n├─ data\\\n├─ genesis.json\n├─ geth-inri-windows.exe\n├─ miner_real.bat\n├─ password.txt\n└─ wallet.txt`} />
              </div>
            </StepCard>

            <section className="grid gap-4 xl:grid-cols-4">
              {[
                { title: 'Pool', text: 'Use the pool page after setup to monitor miners, payments and blocks.', href: '/pool' },
                { title: 'Wallets', text: 'Prepare or review the payout wallet before mining.', href: '/wallets' },
                { title: 'Mining Ubuntu', text: 'Open the Ubuntu page for the full single-command Linux route.', href: '/mining-ubuntu' },
                { title: 'Explorer', text: 'Verify addresses and network blocks on-chain.', href: '/explorer' },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="rounded-[1.4rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 transition hover:border-primary/40 hover:bg-primary/[0.08]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-white">{item.title}</span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/58">{item.text}</p>
                </Link>
              ))}
            </section>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
