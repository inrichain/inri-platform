import Link from 'next/link'
import { ArrowRight, Download, FileCode2, FolderOpen, HardDriveDownload, Pickaxe, ShieldCheck, TerminalSquare } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'

const gethZipUrl = 'https://github.com/inrichain/inri-geth/releases/download/v3.0-fork6000000/INRI-GETH-FORK-6000000.zip'
const chaindataUrl = 'https://www.inri.life/chaindata'

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

const cleanCommands = `rmdir /s /q C:\\INRI
mkdir C:\\INRI
mkdir C:\\INRI\\data`

const accountCommand = `C:\\INRI\\geth-inri-windows account new --datadir C:\\INRI\\data --password C:\\INRI\\password.txt`

const initCommand = `C:\\INRI\\geth-inri-windows init C:\\INRI\\genesis.json --datadir C:\\INRI\\data`

const minerBatch = `@echo off
set DATADIR=C:\\INRI\\data
set COINBASE=0x0000000000000000000000000000000000000000
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

const minerCommands = `eth.blockNumber
net.peerCount
eth.coinbase
miner.stop()
miner.start(4)`

const folderTree = `C:\\INRI
├── data
│   └── geth
│       └── chaindata
├── genesis.json
├── geth-inri-windows
├── miner_real.bat
├── password.txt
└── wallet.txt`

function CodeBox({ title, code, note }: { title: string; code: string; note?: string }) {
  return (
    <div className="rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-black text-white">{title}</h3>
        <div className="inline-flex h-10 items-center rounded-full border border-white/14 bg-white/[0.04] px-4 text-sm font-bold text-white/78">Select and copy</div>
      </div>
      {note ? <p className="mt-2 text-sm leading-7 text-white/62">{note}</p> : null}
      <pre className="mt-4 overflow-x-auto rounded-[1.2rem] border border-white/10 bg-black/40 p-4 text-xs leading-6 text-white/82">{code}</pre>
    </div>
  )
}

function StepCard({ number, title, children, icon }: { number: string; title: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <section className="rounded-[1.85rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/22 bg-primary/10 text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">{number}</p>
          <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-white/72">{children}</div>
        </div>
      </div>
    </section>
  )
}

export function InriMiningWindowsPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(19,164,255,0.09),transparent_28%),linear-gradient(180deg,#03101d_0%,#000000_78%)]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-8 xl:py-20">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.06fr)_420px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/28 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                  Windows CPU Miner
                </div>
                <p className="mt-5 text-[11px] font-black uppercase tracking-[0.24em] text-primary/92">CMD fork at block 6000000</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl xl:text-[4.2rem]">
                  INRI CHAIN — CPU Miner for Windows
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
                  Start mining INRI tokens in a few simple steps. This page keeps the exact flow miners already use: clean everything,
                  create the mining account, place the correct files, initialize the chain, create the batch, add chaindata and only then start mining.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <InriLinkButton href={gethZipUrl} external>Download Geth</InriLinkButton>
                  <InriLinkButton href={chaindataUrl} external variant="secondary">Download chaindata</InriLinkButton>
                  <InriLinkButton href="/pool" variant="secondary">Open Pool</InriLinkButton>
                </div>
              </div>

              <div className="rounded-[2rem] border-[1.6px] border-white/14 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Correct order — from zero to mining on Windows</p>
                <div className="mt-5 grid gap-3">
                  {[
                    'Step 0 — Clean everything (required)',
                    'Step 1 — Create a mining account',
                    'Step 2 — Place the correct files',
                    'Step 3 — Create the miner batch file',
                    'Step 4 — Add chaindata',
                    'Step 5 — Start mining',
                  ].map((item) => (
                    <div key={item} className="rounded-[1.1rem] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-white/78">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] space-y-6 px-4 sm:px-6 lg:px-8">
            <StepCard number="Step 0" title="Clean everything (required)" icon={<FolderOpen className="h-5 w-5" />}>
              <p>This resets everything and creates two clean folders: <span className="font-semibold text-white">C:\\INRI</span> and <span className="font-semibold text-white">C:\\INRI\\data</span>.</p>
              <p>Now it is 100% clean. This ensures there is no old spam, wrong network, wrong account or leftover chain data.</p>
              <CodeBox title="Folder preparation steps (Windows CMD Administrator)" code={cleanCommands} />
            </StepCard>

            <StepCard number="Step 1" title="Create a mining account" icon={<ShieldCheck className="h-5 w-5" />}>
              <p>Create a mining account only once. Choose a simple password, for example <span className="font-semibold text-white">inri123</span>.</p>
              <p className="font-semibold text-white">⚠️ This is not MetaMask. ⚠️ This is required for mining.</p>
              <p>Go to Notepad and save the password file as <span className="font-semibold text-white">C:\\INRI\\password.txt</span>.</p>
              <CodeBox title="Account creation command" code={accountCommand} note="After running the command, write down the generated address and save it in C:\\INRI\\wallet.txt." />
            </StepCard>

            <StepCard number="Step 2" title="Placing the correct files" icon={<Download className="h-5 w-5" />}>
              <p>Inside <span className="font-semibold text-white">C:\\INRI</span> you need to have the official geth binary and the genesis file.</p>
              <p className="font-semibold text-white">⚠️ If geth is not geth-inri-windows, stop everything here.</p>
              <p>Save the GENESIS file in Notepad as a JSON file in the folder <span className="font-semibold text-white">C:\\INRI\\genesis.json</span> (very important).</p>
              <p>Download <span className="font-semibold text-white">geth-inri-windows</span>, unzip it and save it to <span className="font-semibold text-white">C:\\INRI\\geth-inri-windows</span>.</p>
              <CodeBox title="genesis.json" code={genesisJson} />
              <CodeBox title="Initialize the local blockchain" code={initCommand} note="This step creates the local blockchain that points to the INRI network. ✔️ Create a basic network structure. ❌ Never run this command again after syncing, or you will erase the synchronized blockchain." />
            </StepCard>

            <StepCard number="Step 3" title="Create the miner batch file" icon={<TerminalSquare className="h-5 w-5" />}>
              <p>Just change this: <span className="font-semibold text-white">set COINBASE=0x0000000000000000000000000000000000000000</span> and <span className="font-semibold text-white">set THREADS=4</span> with the desired value.</p>
              <p>Save it in Notepad as <span className="font-semibold text-white">C:\\INRI\\miner_real.bat</span>.</p>
              <CodeBox title="miner_real.bat" code={minerBatch} />
            </StepCard>

            <StepCard number="Step 4" title="Add chaindata" icon={<HardDriveDownload className="h-5 w-5" />}>
              <p>Chaindata will be updated every Thursday to accelerate the mining process for new users.</p>
              <p className="font-semibold text-white">Fast Sync (recommended)</p>
              <p>Before running the miner for the first time, download and add the chaindata:</p>
              <ol className="ml-5 list-decimal space-y-1 text-white/72">
                <li>Download the chaindata package.</li>
                <li>Extract the ZIP file.</li>
                <li>Copy the folder <span className="font-semibold text-white">chaindata</span> to <span className="font-semibold text-white">C:\\INRI\\data\\geth\\</span>.</li>
              </ol>
            </StepCard>

            <StepCard number="Step 5" title="Start mining (now we can)" icon={<Pickaxe className="h-5 w-5" />}>
              <p>Right-click the batch file and run it as administrator.</p>
              <p className="font-semibold text-white">How to know if you are really mining? Are you really mining on the original network?</p>
              <CodeBox title="Miner commands" code={minerCommands} note="Use these commands in the console to check the local miner state after startup." />
              <CodeBox title="Final structure of the C:\\INRI folder" code={folderTree} />
            </StepCard>
          </div>
        </section>

        <section className="border-t border-white/8 py-10 sm:py-12">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { title: 'Pool', text: 'Open PPLNS and SOLO after setup.', href: '/pool' },
                { title: 'Wallets', text: 'Prepare wallet support before mining.', href: '/wallets' },
                { title: 'Explorer', text: 'Verify chain activity and blocks.', href: '/explorer' },
                { title: 'Ubuntu', text: 'Open the Linux mining route.', href: '/mining-ubuntu' },
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
        </section>
      </main>
    </InriShell>
  )
}
