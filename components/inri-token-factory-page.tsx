import { Rocket, ShieldCheck, Wallet, WandSparkles } from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriTokenFactoryClient } from '@/components/inri-token-factory-client'
import { InriPageHero, InriPanelFrame } from '@/components/inri-design-system'

export function InriTokenFactoryPage() {
  return (
    <InriShell>
      <main className="inri-site-v2 overflow-hidden">
        <InriPageHero
          eyebrow="Token Factory"
          title="Launch tokens from the INRI control room."
          description="Create tokens on Chain 3777 with the same premium visual system as the new Home. Connect once in the header, review details and deploy from the factory panel."
          actions={[
            { label: 'Open factory panel', href: '#token-factory-panel' },
            { label: 'Open Wallet', href: 'https://wallet.inri.life', external: true, variant: 'secondary' },
            { label: 'Explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
          ]}
          stats={[
            { label: 'Network', value: 'INRI', text: 'Chain 3777' },
            { label: 'Flow', value: 'Deploy', text: 'Token creation' },
            { label: 'Review', value: 'Before submit', text: 'Safer launch' },
            { label: 'Wallet', value: 'Connected', text: 'Header state' },
          ]}
          features={[
            { title: 'One wallet flow', text: 'Use the connected wallet from the top header.', icon: Wallet },
            { title: 'Review before deploy', text: 'Confirm token name, symbol, decimals and supply before sending.', icon: ShieldCheck },
            { title: 'Mainnet factory', text: 'Deploy assets directly on INRI Chain 3777.', icon: Rocket },
            { title: 'Creator-ready UI', text: 'Better spacing and card hierarchy make token creation feel official.', icon: WandSparkles },
          ]}
          visualEyebrow="Creator tools"
          visualTitle="A stronger launch page for community tokens."
          visualText="The factory now has the same serious interface language as the rest of the INRI ecosystem."
        />

        <div id="token-factory-panel">
          <InriPanelFrame
            eyebrow="Token factory"
            title="Create, review and deploy from one polished panel."
            description="The token factory client is preserved and placed inside a shared INRI product frame."
          >
            <InriTokenFactoryClient />
          </InriPanelFrame>
        </div>
      </main>
    </InriShell>
  )
}
