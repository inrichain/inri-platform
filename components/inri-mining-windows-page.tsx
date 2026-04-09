import Link from 'next/link'
import { ArrowRight, CheckCircle2, Copy, Download, FolderOpen, HardDriveDownload, Pickaxe, ShieldCheck, TerminalSquare } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const gethZipUrl = 'https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip'

const genesisJson = `{
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

const initCommand = `C:\\INRI\\geth-inri-windows init C:\\INRI\\genesis.json --datadir C:\\INRI\\data`

const minerBatch = `@echo off
set DATADIR=C:\\INRI\\data
set COINBASE=0xYOUR_MINING_ADDRESS
set THREADS=4

C:\\INRI\\geth-inri-windows ^
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

const steps = [
  {
    title: 'Step 0 — Clean everything',
    text: 'Reset old folders first. The current Windows page says to start from zero and keep the path C:\\INRI\\data fully clean before doing anything else.',
    icon: <FolderOpen className="h-5 w-5" />,
  },
  {
    title: 'Step 1 — Create the mining account',
    text: 'Create the mining account only once, choose a simple password and save it in C:\\INRI\\password.txt. The page warns that this is not MetaMask and is required for mining.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Step 2 — Place the correct files',
    text: 'Inside C:\\INRI\\ you need the official geth-inri-windows binary and the genesis.json file. The current page warns to stop if the binary name is not geth-inri-windows.',
    icon: <Download className="h-5 w-5" />,
  },
  {
    title: 'Step 3 — Create the miner batch file',
    text: 'Create miner_real.bat and only change the COINBASE address and thread count. Save the batch in C:\\INRI\\miner_real.bat.',
    icon: <TerminalSquare className="h-5 w-5" />,
  },
  {
    title: 'Step 4 — Add chaindata',
    text: 'The Windows page recommends downloading chaindata before the first start. It says the package is updated every Thursday to accelerate mining setup for new users.',
    icon: <HardDriveDownload className="h-5 w-5" />,
  },
  {
    title: 'Step 5 — Start mining',
    text: 'Run the batch as administrator only after the previous steps are done. The page also highlights the final C:\\INRI folder structure and how to confirm that you are mining the original network.',
    icon: <Pickaxe className="h-5 w-5" />,
  },
] as const

function CopyBlock({ title, code, note }: { title: string; code: string; note?: string }) {
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
                  Windows CPU Miner
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.35rem]">
                  Windows mining on <span className="text-primary">INRI CHAIN</span>, from zero to a clean first launch.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  This route rebuilds the official Windows page into one cleaner sequence: clean folders, create the mining account,
                  place the right files, initialize the chain, add chaindata and then launch the miner on the original network.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href={gethZipUrl} external>
                    Download official package
                  </InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">Open Pool</InriLinkButton>
                  <InriLinkButton href="/mining/ubuntu" variant="secondary">Ubuntu route</InriLinkButton>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Fork reminder: block 6000000</div>
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Main folder: C:\\INRI</div>
                  <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-semibold">Data path: C:\\INRI\\data</div>
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Quick checklist</p>
                <div className="mt-5 grid gap-3">
                  {[
                    'Run CMD as administrator.',
                    'Keep only the official geth-inri-windows binary.',
                    'Save genesis as C:\\INRI\\genesis.json.',
                    'Do not run init twice after syncing unless you intentionally want to reset the chain.',
                    'Save the generated mining address in wallet.txt.',
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {steps.map((step) => (
                <div key={step.title} className="rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">{step.icon}</div>
                  <h2 className="mt-4 text-lg font-black text-white">{step.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/66">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/8 py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-6">
                <CopyBlock
                  title="genesis.json"
                  code={genesisJson}
                  note="Save this file as C:\\INRI\\genesis.json before running the init command."
                />
                <CopyBlock
                  title="Initialization command"
                  code={initCommand}
                  note="Run this command once to create the local blockchain structure that points to INRI CHAIN. Do not run it again after syncing unless you intentionally want to reset the chain data."
                />
                <CopyBlock
                  title="miner_real.bat template"
                  code={minerBatch}
                  note="Only replace COINBASE with your INRI mining address and THREADS with the number you want to use. Save it as C:\\INRI\\miner_real.bat."
                />
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Files you need</p>
                  <div className="mt-4 grid gap-3">
                    {[
                      { label: 'Official package ZIP', value: 'INRI-GETH-FORK-6000000.zip' },
                      { label: 'Windows binary name', value: 'geth-inri-windows' },
                      { label: 'Genesis path', value: 'C:\\INRI\\genesis.json' },
                      { label: 'Password file', value: 'C:\\INRI\\password.txt' },
                      { label: 'Miner batch', value: 'C:\\INRI\\miner_real.bat' },
                      { label: 'Wallet note', value: 'C:\\INRI\\wallet.txt' },
                    ].map((row) => (
                      <div key={row.label} className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/44">{row.label}</div>
                        <div className="mt-1 break-all text-sm font-bold text-white">{row.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,18,29,0.97),rgba(3,8,15,0.99))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Useful routes</p>
                  <div className="mt-4 grid gap-3">
                    {[
                      { title: 'Pool', text: 'Compare PPLNS and SOLO after setup.', href: '/pool' },
                      { title: 'Wallets', text: 'Prepare a compatible address first.', href: '/wallets' },
                      { title: 'Explorer', text: 'Verify blocks, miner address and chain activity.', href: '/explorer' },
                      { title: 'Ubuntu mining', text: 'Open the Linux installer route.', href: '/mining/ubuntu' },
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
          </div>
        </section>
      </main>
    </InriShell>
  )
}
