import { InriShell } from '@/components/inri-site-shell'
import { InriPoolClient } from '@/components/inri-pool-client'

export function InriPoolPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.16),_transparent_20%),linear-gradient(180deg,#02070c_0%,#000000_48%,#03111d_100%)]">
        <section className="border-b border-white/8">
          <div className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
            <InriPoolClient />
          </div>
        </section>
      </main>
    </InriShell>
  )
}
