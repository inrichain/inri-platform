import Link from 'next/link'
import { InriShell } from '@/components/inri-site-shell'

export default function Page() {
  return (
    <InriShell>
      <main className="flex min-h-[70vh] items-center justify-center bg-black px-4 text-white">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(6,18,30,0.98),rgba(1,6,12,0.99))] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Official wallet</p>
          <h1 className="mt-4 text-4xl font-black text-white">Open the live INRI Wallet.</h1>
          <p className="mt-4 text-base leading-8 text-white/68">The official INRI Wallet runs on wallet.inri.life. Use the button below to open the live wallet directly.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="https://wallet.inri.life" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#7ed4ff]/90 bg-[linear-gradient(135deg,#0b9fff_0%,#37bbff_60%,#91e4ff_100%)] px-5 text-[14px] font-extrabold text-black shadow-[0_14px_34px_rgba(19,164,255,0.28),inset_0_1px_0_rgba(255,255,255,0.52)] transition hover:-translate-y-px hover:brightness-105">Open live wallet</Link>
            <Link href="/wallets" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_26px_rgba(0,0,0,0.18)] transition hover:-translate-y-px hover:border-primary/55 hover:bg-primary/[0.10]">See supported wallets</Link>
          </div>
        </div>
      </main>
    </InriShell>
  )
}
