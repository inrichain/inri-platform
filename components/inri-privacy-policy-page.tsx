import { legalIcons, InriLegalPage } from '@/components/inri-legal-page'

const facts = [
  { label: 'Website', value: 'inri.life' },
  { label: 'Explorer', value: 'explorer.inri.life' },
  { label: 'RPC', value: 'rpc.inri.life' },
  { label: 'Approach', value: 'Minimal data collection' },
]

const sections = [
  {
    id: 'overview',
    label: 'Overview',
    title: 'Privacy Policy',
    content: (
      <>
        <p>
          This Privacy Policy explains how the INRI CHAIN project and its related websites and services — including
          <strong> https://inri.life</strong>, <strong>https://explorer.inri.life</strong> and <strong>https://rpc.inri.life</strong> — handle information.
        </p>
        <p>
          INRI CHAIN is a community-driven, experimental blockchain project. It does not operate as a traditional financial institution
          and does not perform KYC or identity verification on-chain. The goal is to collect as little personal data as reasonably possible
          while still being able to operate, improve and protect the ecosystem.
        </p>
        <p>
          By using the Services, you agree to the practices described in this Privacy Policy. If you do not agree, you should not use the Services.
        </p>
      </>
    ),
  },
  {
    id: 'scope-controller',
    label: '1. Scope & Controller',
    title: 'Scope & Controller',
    content: (
      <>
        <h3>1.1 Scope</h3>
        <ul>
          <li>The public websites under <strong>inri.life</strong> and subdomains.</li>
          <li>The public block explorer at <strong>explorer.inri.life</strong>.</li>
          <li>The public RPC endpoint at <strong>rpc.inri.life</strong>.</li>
          <li>Documentation, forms, pages and tools directly hosted under these domains.</li>
        </ul>
        <h3>1.2 Community & Open-Source Nature</h3>
        <p>
          INRI CHAIN is an open-source, community-first project. Infrastructure such as nodes, explorers or mirrors may also be operated by
          third parties outside direct control. This policy covers services maintained by the core project team.
        </p>
        <h3>1.3 Data Controller</h3>
        <p>
          For services directly maintained by the core INRI CHAIN team, the practical data controller is the founder and the small core team
          coordinating infrastructure and development.
        </p>
      </>
    ),
  },
  {
    id: 'data-collect',
    label: '2. Data We Collect',
    title: 'Data We Collect',
    content: (
      <>
        <h3>2.1 Information You Provide Voluntarily</h3>
        <ul>
          <li>Contact forms or contributor applications, including names, handles, emails or profile links you choose to submit.</li>
          <li>Support messages by email or other channels, including message content and attachments.</li>
          <li>Community participation on linked third-party platforms, subject to those platforms’ own policies.</li>
        </ul>
        <h3>2.2 Automatically Collected Information</h3>
        <ul>
          <li>IP address and approximate region derived from the IP.</li>
          <li>Browser, operating system and basic device information.</li>
          <li>Pages visited, time spent, referrers and click paths.</li>
          <li>Dates, technical logs, RPC request metadata, errors and performance metrics.</li>
        </ul>
        <h3>2.3 On-Chain Data</h3>
        <p>
          Transactions, wallet addresses and contract interactions on INRI CHAIN are public by design and can be indexed, analyzed and mirrored by anyone.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    label: '3. How We Use Data',
    title: 'How We Use Data',
    content: (
      <>
        <h3>3.1 Operating the Services</h3>
        <ul>
          <li>Provide and maintain the website, explorer and RPC.</li>
          <li>Monitor uptime, performance and security.</li>
          <li>Debug errors and improve service stability.</li>
        </ul>
        <h3>3.2 Community & Ecosystem</h3>
        <ul>
          <li>Review applications to contributor or coordination roles.</li>
          <li>Respond to questions and support requests.</li>
          <li>Coordinate community initiatives, airdrops or events when applicable.</li>
        </ul>
        <h3>3.3 Legal, Safety & Abuse Prevention</h3>
        <ul>
          <li>Detect abuse, spam or malicious traffic.</li>
          <li>Investigate technical incidents or misuse.</li>
          <li>Comply with applicable laws where required.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies-analytics',
    label: '4. Cookies & Analytics',
    title: 'Cookies & Analytics',
    content: (
      <>
        <p>The Services may use cookies or similar technologies to remember preferences, protect against abuse and measure aggregate usage and performance.</p>
        <p>
          Analytics should be configured to avoid collecting more personal data than necessary. Users can generally manage cookies at the browser level,
          although doing so may affect some site features.
        </p>
      </>
    ),
  },
  {
    id: 'onchain-public',
    label: '5. On-Chain & Public Data',
    title: 'On-Chain & Public Data',
    content: (
      <>
        <h3>5.1 Public Nature of Blockchain Data</h3>
        <p>
          Wallet addresses, transaction amounts, contract calls and related metadata are recorded on-chain and are readable by anyone through explorers or full nodes.
        </p>
        <h3>5.2 Immutability & Right to be Forgotten</h3>
        <p>
          The project generally cannot edit or delete on-chain data, even upon request. Creating a new wallet may reduce identity linkage going forward, but blockchain history remains public.
        </p>
        <h3>5.3 Explorer & Indexing</h3>
        <p>
          The explorer simply organizes and displays data that already exists on-chain. Removing it from one interface does not remove it from the blockchain itself.
        </p>
      </>
    ),
  },
  {
    id: 'sharing-third-parties',
    label: '6. Sharing & Third Parties',
    title: 'Sharing & Third Parties',
    content: (
      <>
        <ul>
          <li>Infrastructure may rely on third-party hosting, logging or analytics providers.</li>
          <li>Wallets, dApps, bridges and exchanges have their own privacy policies and are outside direct control.</li>
          <li>Information may be disclosed where reasonably necessary to comply with law or protect users and infrastructure.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'storage-security',
    label: '7. Storage, Security & Retention',
    title: 'Storage, Security & Retention',
    content: (
      <>
        <p>Operational data may be stored on servers run by hosting providers in different regions. On-chain data is stored by any node participating in the network.</p>
        <p>
          Reasonable measures are used to protect systems, including credential restriction, updates, monitoring and HTTPS where appropriate, but no system is perfectly secure.
        </p>
        <p>
          Logs and operational data are retained only as long as reasonably necessary for debugging, security, analytics or legal obligations.
        </p>
      </>
    ),
  },
  {
    id: 'rights-choices',
    label: '8. Your Rights & Choices',
    title: 'Your Rights & Choices',
    content: (
      <>
        <ul>
          <li>You may request access, correction or deletion of off-chain information you voluntarily provided, where technically possible.</li>
          <li>On-chain information cannot be altered or erased by the project.</li>
          <li>You may opt out of non-essential communications by replying and requesting removal.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'children',
    label: '9. Children’s Privacy',
    title: 'Children’s Privacy',
    content: (
      <>
        <p>
          The Services are not directed to children under the age required by local law to provide valid consent to data processing. If a child has provided personal data,
          contact the team through official channels for review.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    label: '10. Changes to this Policy',
    title: 'Changes to this Policy',
    content: (
      <>
        <p>
          This Privacy Policy may be updated from time to time to reflect changes in the project, the Services or applicable law. Continued use of the Services after an update means you accept the revised policy.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    label: '11. Contact',
    title: 'Contact',
    content: (
      <>
        <p>If you have questions about this Privacy Policy or how your data is handled, use the official channels listed on:</p>
        <ul>
          <li><strong>Website:</strong> <a href="https://inri.life">https://inri.life</a></li>
          <li><strong>Explorer:</strong> <a href="https://explorer.inri.life">https://explorer.inri.life</a></li>
          <li><strong>Official social and community links</strong> published on the website.</li>
        </ul>
      </>
    ),
  },
]

export function InriPrivacyPolicyPage() {
  return (
    <InriLegalPage
      eyebrow="Privacy Policy"
      title="Privacy Policy for the INRI ecosystem."
      description="This page now carries the real privacy policy structure for the INRI ecosystem: website, explorer, RPC, on-chain public data, off-chain handling, cookies, analytics and user rights — all in one clean route."
      facts={facts}
      sections={sections}
      summaryTitle="Minimal collection, clear boundaries."
      summaryText="The policy is built around a simple idea: collect as little personal data as reasonably possible, operate infrastructure carefully, and make it clear that blockchain data remains public and immutable by design."
      quickItems={legalIcons.privacy}
      primaryAction={{ label: 'Open whitepaper', href: '/whitepaper' }}
      secondaryAction={{ label: 'Open terms', href: '/terms-and-conditions' }}
    />
  )
}
