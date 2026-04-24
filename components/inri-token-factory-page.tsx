import { Factory, Rocket, ShieldCheck, Wallet } from 'lucide-react'
import { InriLinkButton, InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
        <section className="relative border-b border-cyan-300/15 bg-[radial-gradient(circle_at_18%_14%,rgba(0,174,255,0.45),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(122,232,255,0.22),transparent_34rem),linear-gradient(135deg,#071a32_0%,#02040a_42%,#000_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(125,225,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,225,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute -left-28 top-20 h-[30rem] w-[30rem] rounded-full bg-cyan-400/18 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1560px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-18 xl:px-12">
            <div className="flex min-h-[440px] flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                Token Factory
              </div>

              <h1 className="mt-8 max-w-5xl text-[3rem] font-black leading-[0.86] tracking-[-0.075em] text-white sm:text-[4.8rem] xl:text-[6.5rem]">
                Launch tokens from the INRI control room.
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-9 text-cyan-50/72">
                Create tokens on Chain 3777 with the same premium visual system as the new Home. Connect once in the header, review details and deploy from the factory panel.
              </p>

              <div className="mt-10 grid gap-3 sm:flex sm:flex-wrap">
                  <InriLinkButton href="https://wallet.inri.life" external>Open Wallet</InriLinkButton>
                  <InriLinkButton href="https://explorer.inri.life" external variant="secondary">Explorer</InriLinkButton>
              </div>
            </div>

            <div className="grid content-center gap-4">
                <div className="rounded-[22px] border border-cyan-300/16 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-white">One wallet flow</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">Use the connected wallet from the top header.</p>
                </div>
                <div className="rounded-[22px] border border-cyan-300/16 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-white">Review before deploy</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">Confirm token name, symbol, decimals and supply.</p>
                </div>
                <div className="rounded-[22px] border border-cyan-300/16 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-white">Mainnet factory</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">Deploy assets directly on INRI Chain 3777.</p>
                </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#02040a] py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-[1560px] px-4 sm:px-8 xl:px-12">
            <div className="rounded-[24px] border border-cyan-300/18 bg-white/[0.045] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-6 lg:p-8">
              <InriTokenFactoryClient />
            </div>
          </div>
        </section>
      </main>
    </InriShell>
  )
}
