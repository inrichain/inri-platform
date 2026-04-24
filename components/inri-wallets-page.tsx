import { Download, ShieldCheck, Wallet, WalletCards } from 'lucide-react'
import { InriCard, InriCardGrid, InriHero, InriSection } from '@/components/inri-unified'

export function InriWalletsPage() {
  return (
    <main>
      <InriHero
        eyebrow="INRI WALLETS"
        title="Wallet access and network onboarding in one professional route."
        description="Users can start with the official INRI Wallet, open the explorer, and move into staking, P2P or token factory without leaving the same visual standard."
        actions={[
          { label: 'Open INRI Wallet', href: 'https://wallet.inri.life', external: true },
          { label: 'Explorer', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
          { label: 'Staking', href: '/staking', variant: 'secondary' },
        ]}
        stats={[
          { label: 'Chain ID', value: '3777', note: 'INRI mainnet' },
          { label: 'Wallet', value: 'Official', note: 'wallet.inri.life' },
          { label: 'Network', value: 'EVM', note: 'Compatible' },
        ]}
        sideTitle="Wallet route with trust."
        sideText="Wallet onboarding is the first impression for many users, so this page uses the same premium system as the whole INRI website."
        sideItems={[
          { title: 'Official wallet', text: 'Open wallet.inri.life from the main platform.', icon: <Wallet className="h-4 w-4" /> },
          { title: 'Browser wallets', text: 'Users can still connect with supported EVM wallets.', icon: <WalletCards className="h-4 w-4" /> },
          { title: 'Security first', text: 'The page keeps seed phrase responsibility clear.', icon: <ShieldCheck className="h-4 w-4" /> },
        ]}
      />

      <InriSection eyebrow="Wallet options" title="Choose how to enter INRI.">
        <InriCardGrid>
          <InriCard title="INRI Wallet" text="Open the official wallet interface for INRI ecosystem actions." href="https://wallet.inri.life" external icon={<Wallet className="h-5 w-5" />} cta="Open wallet" />
          <InriCard title="Explorer" text="Verify accounts, transactions and contracts from the official explorer." href="https://explorer.inri.life" external icon={<ShieldCheck className="h-5 w-5" />} cta="Open explorer" />
          <InriCard title="Mining setup" text="Move from wallet setup to mining, pool and campaign participation." href="/mining" icon={<Download className="h-5 w-5" />} cta="Start mining" />
        </InriCardGrid>
      </InriSection>
    </main>
  )
}
