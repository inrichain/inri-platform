import { ArrowRight, CheckCircle2, Pickaxe, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { InriShell, InriLinkButton } from '@/components/inri-site-shell'

const cleanEverythingCode = `REM Delete old INRI folders completely
rd /s /q C:\\INRI`

const recreateFoldersCode = `REM Recreate folders for blockchain data
mkdir C:\\INRI
mkdir C:\\INRI\\data`

const genesisJsonCode = `{
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

const accountNewCode = `C:\\INRI\\geth-inri-windows account new --datadir C:\\INRI\\data --password C:\\INRI\\password.txt`

const minerBatchCode = `@echo off
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

function CodeSection({
  index,
  title,
  subtitle,
  code,
}: {
  index: string
  title: string
  subtitle?: string
  code: string
}) {
  return (
    <section className="rounded-[2rem] border border-white/12 bg-[#091425] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary/90">{index}</p>
          <h2 className="mt-3 text-3xl font-black text-white">{title}</h2>
          {subtitle ? <p className="mt-4 text-base leading-8 text-white/72">{subtitle}</p> : null}
        </div>
        <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-primary/25 bg-primary/10 text-primary">
          <Pickaxe className="h-7 w-7" />
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/35">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary/85">Copy and paste</div>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words px-4 py-4 text-sm leading-7 text-white/78">{code}</pre>
      </div>
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
                Follow the same working flow and the same commands: clean the folder, create the chain structure, save the
                genesis, initialize the local chain, create the mining account and run the miner batch with your own address.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InriLinkButton href="/pool">Pool</InriLinkButton>
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
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1.15fr,0.85fr] lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.2)] sm:p-8">
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-extrabold uppercase tracking-[0.22em]">Keep the same working order</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  'Clean old folders first',
                  'Recreate C:\\INRI and C:\\INRI\\data',
                  'Save genesis.json exactly',
                  'Initialize the chain',
                  'Create the mining account',
                  'Edit COINBASE and THREADS only',
                ].map((item) => (
                  <div key={item} className="rounded-[1.4rem] border border-white/10 bg-[#091425] p-5 text-sm leading-7 text-white/74">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#091425] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.2)] sm:p-8">
              <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary/90">Before starting</p>
              <div className="mt-5 space-y-4">
                {[
                  'Save your password in C:\\INRI\\password.txt before running the account creation command.',
                  'Replace the COINBASE address in the miner batch with your own mining address.',
                  'Change THREADS only to the number you want to use on your machine.',
                  'Run the miner batch after the chain is initialized and the account already exists.',
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
            <CodeSection index="Step 1" title="Clean everything" subtitle="Delete the old folder first so you start from zero." code={cleanEverythingCode} />
            <CodeSection index="Step 2" title="Recreate folders" subtitle="Create the same folders used by the working setup." code={recreateFoldersCode} />
            <CodeSection index="Step 3" title="Save genesis.json" subtitle="Create C:\\INRI\\genesis.json with this exact content." code={genesisJsonCode} />
            <CodeSection index="Step 4" title="Initialize the local chain" subtitle="Run init using the same path structure." code={initCode} />
            <CodeSection index="Step 5" title="Create mining account" subtitle="Create the geth account with your password file." code={accountNewCode} />
            <CodeSection index="Step 6" title="Create miner batch" subtitle="Edit only COINBASE and THREADS before saving and running the batch." code={minerBatchCode} />
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#091425,#060b13)] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary/90">Final reminder</p>
                  <h2 className="mt-3 text-3xl font-black text-white">Replace your address, keep the paths the same and run the batch.</h2>
                  <p className="mt-4 text-base leading-8 text-white/72">
                    The working Windows flow depends on keeping the same file names and paths. Save the files exactly in C:\\INRI\\,
                    replace only your address and your thread count, then run the miner batch.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <InriLinkButton href="/explorer">Explorer</InriLinkButton>
                  <InriLinkButton href="/mining-ubuntu" variant="secondary">
                    Ubuntu
                  </InriLinkButton>
                </div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  'Save password.txt before creating the account.',
                  'Use your own wallet in COINBASE.',
                  'Keep the rest of the batch structure identical.',
                ].map((item) => (
                  <div key={item} className="rounded-[1.25rem] border border-white/10 bg-black/30 p-5 text-sm leading-7 text-white/72">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/mining-ubuntu" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                  Open Ubuntu page
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
