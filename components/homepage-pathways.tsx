'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Blocks, Cpu, Factory, Globe2, Hammer, Pickaxe, Shield, Shuffle, Wallet } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const pathways: Array<{
  key: string
  label: string
  eyebrow: string
  title: string
  text: string
  primary: { label: string; href: string; external?: boolean }
  secondary: { label: string; href: string; external?: boolean }
  bullets: Array<{ title: string; text: string; icon: LucideIcon }>
}> = [
  {
    key: 'users',
    label: 'Users',
    eyebrow: 'Onboard faster',
    title: 'A cleaner route for people discovering INRI for the first time.',
    text: 'The best homepages reduce friction. This route highlights wallet, explorer and swap access first, then explains what the chain is doing in real time.',
    primary: { label: 'Open INRI Wallet', href: 'https://wallet.inri.life', external: true },
    secondary: { label: 'Explore the network', href: '/explorer' },
    bullets: [
      { title: 'Wallet-first onboarding', text: 'Push the official wallet as the main entry point, not as one of many equal links.', icon: Wallet },
      { title: 'Proof before promise', text: 'Show live block, peers and base fee right on the homepage to create trust faster.', icon: Globe2 },
      { title: 'Clear ecosystem actions', text: 'Keep swap, staking and whitepaper one click away from the first screen.', icon: Shuffle },
    ],
  },
  {
    key: 'miners',
    label: 'Miners',
    eyebrow: 'Participation',
    title: 'A better mining funnel for CPU miners, pool users and node operators.',
    text: 'Proof-of-Work needs a stronger participation layer. This route makes mining feel official by surfacing Windows, Ubuntu, pool access and network health together.',
    primary: { label: 'Start mining', href: '/mining' },
    secondary: { label: 'Open pool', href: '/pool' },
    bullets: [
      { title: 'Mining choices grouped', text: 'Pool, Windows and Ubuntu should be presented as one participation journey.', icon: Pickaxe },
      { title: 'Health signals visible', text: 'Miners respond better when the site shows recent block movement and connected peers.', icon: Cpu },
      { title: 'Stronger credibility', text: 'A premium live dashboard makes the network feel alive instead of early-stage.', icon: Hammer },
    ],
  },
  {
    key: 'builders',
    label: 'Builders',
    eyebrow: 'Ecosystem growth',
    title: 'A route for token creators, builders and partners entering the ecosystem.',
    text: 'The strongest blockchain sites separate “what this network is” from “what can I build here.” This tab gives Token Factory, docs surfaces and live chain signals a proper home.',
    primary: { label: 'Open Token Factory', href: '/token-factory' },
    secondary: { label: 'Read whitepaper', href: '/whitepaper' },
    bullets: [
      { title: 'Products as platforms', text: 'Token Factory and future P2P should feel like product surfaces, not placeholder links.', icon: Factory },
      { title: 'Chain identity kept simple', text: 'Call out EVM, Chain ID 3777 and Proof-of-Work consistently across the homepage.', icon: Blocks },
      { title: 'Trust and utility together', text: 'Builders convert better when technical identity and visible activity are side by side.', icon: Shield },
    ],
  },
]

export function HomepagePathways() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary/85">Interactive routes</p>
          <h2 className="mt-3 max-w-4xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Let each visitor choose how they enter the INRI ecosystem.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-8 text-white/70 sm:text-base">
          This is one of the biggest differences between basic crypto sites and premium blockchain platforms: the homepage adapts to the visitor instead of dumping every section at once.
        </p>
      </div>

      <Tabs defaultValue="users" className="gap-6">
        <TabsList className="h-auto w-full flex-wrap rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-2 md:w-fit">
          {pathways.map((pathway) => (
            <TabsTrigger
              key={pathway.key}
              value={pathway.key}
              className="rounded-[1rem] px-4 py-3 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {pathway.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {pathways.map((pathway) => (
          <TabsContent key={pathway.key} value={pathway.key}>
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary/85">{pathway.eyebrow}</p>
                <h3 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{pathway.title}</h3>
                <p className="mt-5 text-sm leading-8 text-white/72 sm:text-base">{pathway.text}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={pathway.primary.href}
                    {...(pathway.primary.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-[#27b4ff]"
                  >
                    {pathway.primary.label}
                  </Link>
                  <Link
                    href={pathway.secondary.href}
                    {...(pathway.secondary.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="inline-flex items-center rounded-full border border-white/14 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-primary/45 hover:bg-primary/10"
                  >
                    {pathway.secondary.label}
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {pathway.bullets.map((bullet) => {
                  const Icon = bullet.icon
                  return (
                    <div
                      key={bullet.title}
                      className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.18)] transition hover:border-primary/30 hover:bg-white/[0.06]"
                    >
                      <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="mt-5 text-xl font-bold text-white">{bullet.title}</h4>
                      <p className="mt-3 text-sm leading-7 text-white/70">{bullet.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
