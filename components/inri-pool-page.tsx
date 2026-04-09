import { InriShell } from '@/components/inri-site-shell'
import { InriPoolClient } from '@/components/inri-pool-client'

export function InriPoolPage() {
  return (
    <InriShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(19,164,255,0.16),_transparent_20%),linear-gradient(180deg,#02070c_0%,#000000_48%,#03111d_100%)]">
        <section className="inri-hero-surface">
          <div className="inri-page-container py-10 lg:py-12">
            <InriPoolClient />
          </div>
        </section>
      </main>
    </InriShell>
  )
}
