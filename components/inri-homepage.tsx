import {
  Coins,
  Factory,
  Globe2,
  Pickaxe,
  ShieldCheck,
  Trophy,
  Wallet,
} from 'lucide-react'
import { InriShell } from '@/components/inri-site-shell'
import { InriCard, InriCardGrid, InriHero, InriSection } from '@/components/inri-premium-model'
import { NetworkPulse } from '@/components/network-pulse'

const cards = [
  {
    title: 'Official Wallet',
    text: 'Create, connect and use INRI from the official ecosystem wallet.',
    href: 'https://wallet.inri.life',
    external: true,
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    title: 'Mining Pool',
    text: 'Live miners, blocks, payments and network participation in one route.',
    href: '/pool',
    icon: <Pickaxe className="h-5 w-5" />,
  },
  {
    title: 'Staking Program',
    text: 'A cleaner reward interface for long-term ecosystem participants.',
    href: '/staking',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Token Factory',
    text: 'Launch assets on INRI with a premium builder-focused product flow.',
    href: '/token-factory',
    icon: <Factory className="h-5 w-5" />,
  },
] as const

export function InriHomepage() {
  return (
    <InriShell>
      <main>
        <InriHero
          eyebrow="Official INRI Network"
          title="Mining, staking and building on one premium INRI interface."
          description="A dark-blue network experience for miners, builders and users — wallet, explorer, pool, staking, token factory and P2P routes unified under one professional standard."
          actions={[
            { label: 'Start with Wallet', href: 'https://wallet.inri.life', external: true },
            { label: 'Explore Network', href: 'https://explorer.inri.life', external: true, variant: 'secondary' },
            { label: 'Start Mining', href: '/mining', variant: 'secondary' },
          ]}
          stats={[
            { label: 'Chain ID', value: '3777' },
            { label: 'Consensus', value: 'Proof-of-Work' },
            { label: 'Runtime', value: 'EVM' },
            { label: 'Ecosystem', value: 'Wallet · Pool · P2P' },
          ]}
          sideTitle="Built to look like a real chain, not a test page."
          sideText="Every page follows the same structure: strong hero, glass cards, clean actions and INRI blue highlights."
          sideItems={[
            { title: 'Explorer + RPC', text: 'Clear route to chain information and verification.', icon: <Globe2 className="h-4 w-4" /> },
            { title: 'Mining Ready', text: 'Windows, Ubuntu, pool and championship paths.', icon: <Pickaxe className="h-4 w-4" /> },
            { title: 'Campaign Grade', text: 'Made for growth posts and official announcements.', icon: <Trophy className="h-4 w-4" /> },
          ]}
        />

        <InriSection
          eyebrow="Ecosystem"
          title="All routes under the same INRI brand system."
          description="No more each page looking different. Cards, containers, buttons and spacing follow one professional direction."
        >
          <InriCardGrid cols={4}>
            {cards.map((item) => (
              <InriCard
                key={item.title}
                title={item.title}
                text={item.text}
                href={item.href}
                external={'external' in item ? item.external : false}
                icon={item.icon}
              />
            ))}
          </InriCardGrid>
        </InriSection>

        <NetworkPulse />

        <InriSection
          eyebrow="Active Campaign"
          title="Mining championship and community growth."
          description="The site is ready for public campaigns, staking posts, mining posts and ecosystem onboarding with one premium design."
        >
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <InriCard
              title="Solo Mining Championship"
              text="Open the campaign page with ranking, wallet lookup and reward visibility."
              href="/mining-championship/"
              icon={<Trophy className="h-5 w-5" />}
              cta="Open championship"
            />
            <InriCard
              title="INRI Network Explorer"
              text="Verify blocks, contracts, addresses and public network activity."
              href="https://explorer.inri.life"
              external
              icon={<Globe2 className="h-5 w-5" />}
              cta="Open explorer"
            />
          </div>
        </InriSection>
      </main>
    </InriShell>
  )
}
