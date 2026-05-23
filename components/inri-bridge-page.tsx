import Link from 'next/link'
import {
  ArrowDown,
  ArrowLeftRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { ConnectWalletButton } from '@/components/connect-wallet-button'
import { InriShell } from '@/components/inri-site-shell'

const BRIDGE_ORIGIN = 'https://iusd-bridge.inri.life'

const contracts = [
  ['Polygon Lockbox', '0x7E2e6d4881e1470D541599397b4876b449296071'],
  ['INRI Executor', '0x07DE046e96c33a8E575234282e1CccAC56d3d880'],
  ['iUSD on INRI', '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'],
]

const processSteps = [
  ['1', 'Connect wallet', 'Use the same wallet connection already available in the INRI website header.'],
  ['2', 'Choose route', 'Buy iUSD with Polygon USDT or sell iUSD back to Polygon USDT.'],
  ['3', 'Send source tx', 'Approve/deposit on Polygon or burn through the official live sell engine.'],
  ['4', 'Watcher detects', 'The existing watchers generate the claim/release signatures automatically.'],
  ['5', 'Claim and finish', 'The official claim screen completes iUSD or USDT delivery safely.'],
]

function RouteCard({
  title,
  from,
  to,
  description,
  href,
  primary = false,
}: {
  title: string
  from: string
  to: string
  description: string
  href: string
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group rounded-[26px] border p-5 shadow-[0_30px_90px_rgba(0,0,0,0.32)] transition hover:-translate-y-1 sm:p-6 ${
        primary
          ? 'border-cyan-300/30 bg-cyan-300/[0.09] hover:border-cyan-200/60'
          : 'border-white/12 bg-black/24 hover:border-cyan-300/35 hover:bg-cyan-300/[0.055]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">{title}</p>
          <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">{from}</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-cyan-300/25 bg-cyan-300/[0.12] text-cyan-200 transition group-hover:scale-105">
          <ExternalLink className="h-5 w-5" />
        </div>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-cyan-300/20" />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300 text-black">
          <ArrowDown className="h-5 w-5" />
        </div>
        <div className="h-px flex-1 bg-cyan-300/20" />
      </div>

      <h3 className="text-3xl font-black tracking-[-0.04em] text-white">{to}</h3>
      <p className="mt-4 text-sm leading-7 text-white/60">{description}</p>

      <span className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-cyan-300 px-4 py-3 text-sm font-black text-black transition group-hover:bg-cyan-200">
        Open route <Zap className="h-4 w-4" />
      </span>
    </Link>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-cyan-300/70 bg-white/[0.045] px-4 py-3 backdrop-blur-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/70">{label}</div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  )
}

function ContractRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/24 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/42">{label}</p>
      <p className="mt-2 break-all font-mono text-sm font-bold text-cyan-100/80">{value}</p>
    </div>
  )
}

export function InriBridgePage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="relative border-b border-cyan-300/15 bg-[radial-gradient(circle_at_18%_14%,rgba(0,174,255,0.50),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(122,232,255,0.23),transparent_34rem),linear-gradient(135deg,#071a32_0%,#02040a_42%,#000_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute -left-28 top-24 h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1560px] gap-9 px-4 py-14 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[460px] flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                <ShieldCheck className="h-4 w-4" />
                Official iUSD Bridge
              </div>

              <h1 className="mt-8 max-w-5xl text-[3.2rem] font-black leading-[0.84] tracking-[-0.075em] text-white sm:text-[5rem] xl:text-[6.8rem]">
                Bridge USDT and iUSD through the INRI network.
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-9 text-cyan-50/72">
                A clean professional entry point for the working iUSD bridge: connect wallet, choose Buy or Sell, continue through the official bridge engine and let the watchers prepare the claim automatically.
              </p>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                <StatCard label="Bridge fee" value="0.2%" />
                <StatCard label="Signature threshold" value="2 / 4" />
                <StatCard label="INRI Chain ID" value="3777" />
              </div>

              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                <Link href={`${BRIDGE_ORIGIN}/buy.html`} target="_blank" rel="noreferrer" className="inri-button-primary">
                  Buy iUSD
                </Link>
                <Link href={`${BRIDGE_ORIGIN}/sell.html`} target="_blank" rel="noreferrer" className="inri-button-secondary">
                  Sell iUSD
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-cyan-300/20 bg-white/[0.06] p-3 shadow-[0_44px_140px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl sm:p-5">
              <div className="rounded-[25px] border border-white/12 bg-[#030910]/95 p-4 sm:p-6">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Bridge terminal</p>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">iUSD Transfer</h2>
                  </div>
                  <div className="w-full sm:w-auto">
                    <ConnectWalletButton compact />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <RouteCard
                    primary
                    title="Buy iUSD"
                    from="Polygon USDT"
                    to="INRI iUSD"
                    description="Approve USDT, deposit into the Polygon lockbox, then claim iUSD on INRI when signatures are ready."
                    href={`${BRIDGE_ORIGIN}/buy.html`}
                  />
                  <RouteCard
                    title="Sell iUSD"
                    from="INRI iUSD"
                    to="Polygon USDT"
                    description="Burn iUSD on INRI, wait for the release signatures, then claim USDT on Polygon."
                    href={`${BRIDGE_ORIGIN}/sell.html`}
                  />
                </div>

                <div className="mt-5 rounded-[20px] border border-cyan-300/20 bg-cyan-300/[0.08] p-4">
                  <div className="flex items-start gap-3">
                    <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-cyan-200" />
                    <div>
                      <p className="font-black text-white">Safe integration mode</p>
                      <p className="mt-1 text-sm leading-6 text-white/62">
                        This page does not change contracts, watchers, PM2 or claim files. It uses the current working bridge engine while the final one-click UI is connected safely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#02040a] py-12">
          <div className="mx-auto grid max-w-[1560px] gap-5 px-4 sm:px-8 lg:grid-cols-[1fr_0.86fr] xl:px-12">
            <div className="rounded-[26px] border border-cyan-300/18 bg-white/[0.045] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.36)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-cyan-300/25 bg-cyan-300/[0.10] text-cyan-200">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Process</p>
                  <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">Current bridge flow</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {processSteps.map(([number, title, text]) => (
                  <div key={title} className="rounded-[18px] border border-white/10 bg-black/24 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-sm font-black text-black">{number}</div>
                      <div>
                        <p className="font-black text-white">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-white/58">{text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-cyan-300/18 bg-white/[0.045] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.36)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-cyan-300/25 bg-cyan-300/[0.10] text-cyan-200">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Infrastructure</p>
                  <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">Live contracts</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {contracts.map(([label, value]) => <ContractRow key={label} label={label} value={value} />)}
              </div>

              <div className="mt-6 grid gap-3 rounded-[20px] border border-white/10 bg-black/24 p-4 text-sm leading-6 text-white/58">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  Buy flow: approve, deposit, watcher, signatures and claim iUSD.
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  Sell flow: burn, watcher, release signatures and claim USDT.
                </div>
                <div className="flex gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                  Next upgrade: bring the full approve/deposit/burn/claim buttons into this page after route visibility is confirmed.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
