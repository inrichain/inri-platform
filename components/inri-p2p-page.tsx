import Link from 'next/link'
import { ArrowUpRight, ShieldCheck, Wallet, Workflow } from 'lucide-react'
import { InriP2PClient } from '@/components/inri-p2p-client'
import { InriShell } from '@/components/inri-site-shell'

const stats = [
  { label: 'Contract', value: '0xF6e3...98f01', note: 'Escrow contract on INRI CHAIN' },
  { label: 'Network', value: 'Chain 3777', note: 'Runs on the INRI mainnet' },
  { label: 'Buyer fee', value: '0.2% INRI', note: 'Deducted only on release' },
]

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Escrow on-chain',
    text: 'Seller deposits INRI into escrow and the release stays on-chain.',
  },
  {
    icon: Wallet,
    title: 'Wallet-native flow',
    text: 'Users connect the wallet, create offers, accept, mark paid and release without leaving the site.',
  },
  {
    icon: Workflow,
    title: 'Dispute controls',
    text: 'The app already includes buyer paid flow, disputes, moderator votes and owner resolution paths.',
  },
]

export function InriP2PPage() {
  return (
    <InriShell>
      <main className="bg-black text-white">
        <section className="mx-auto flex max-w-[1500px] flex-col gap-8 px-4 pb-16 pt-10 sm:px-8 xl:px-12 2xl:px-16">
          <div className="rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(19,164,255,0.16),transparent_30%),linear-gradient(180deg,rgba(6,14,25,0.98),rgba(0,0,0,1))] px-6 py-7 shadow-[0_32px_120px_rgba(0,0,0,0.38)] sm:px-8 sm:py-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[820px]">
                <div className="inline-flex rounded-full border border-primary/20 bg-primary/[0.10] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                  P2P • Escrow Market
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl xl:text-[3.65rem]">
                  Buy and sell INRI through a native escrow flow inside the new site.
                </h1>
                <p className="mt-4 max-w-[760px] text-base leading-8 text-white/62 sm:text-lg">
                  Create offers, accept deals, mark payments, release escrow and manage disputes without leaving the new INRI experience.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="https://wallet.inri.life"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary/28 bg-primary px-5 text-[14px] font-black text-black transition hover:brightness-105"
                >
                  Open INRI Wallet
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/explorer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-5 text-[14px] font-black text-white transition hover:border-primary/45 hover:bg-primary/[0.08]"
                >
                  Explorer
                </Link>
              </div>
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/42">{item.label}</div>
                  <div className="mt-2 text-xl font-black text-white">{item.value}</div>
                  <div className="mt-1 text-sm leading-6 text-white/46">{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] px-5 py-5">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/24 bg-primary/[0.10] text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-black text-white">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-white/56">{text}</p>
              </div>
            ))}
          </div>

          <InriP2PClient />
        </section>
      </main>
    </InriShell>
  )
}
