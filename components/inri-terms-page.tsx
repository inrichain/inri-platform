import { legalIcons, InriLegalPage } from '@/components/inri-legal-page'

const facts = [
  { label: 'Network', value: 'INRI CHAIN' },
  { label: 'Chain ID', value: '3777' },
  { label: 'Consensus', value: 'PoW · Ethash' },
  { label: 'Service model', value: 'Experimental & community-driven' },
]

const sections = [
  {
    id: 'overview',
    label: 'Overview',
    title: 'Terms and Conditions',
    content: (
      <>
        <p>
          These Terms and Conditions govern access to and use of INRI CHAIN-related websites and services, including <strong>https://inri.life</strong>,
          <strong> https://explorer.inri.life</strong> and <strong>https://rpc.inri.life</strong>.
        </p>
        <p>
          INRI CHAIN is an experimental, community-driven blockchain project. By accessing or using any of the Services, you confirm that you have read,
          understood and agree to be bound by these terms.
        </p>
        <p>
          Nothing in these Terms constitutes financial, investment, legal or tax advice. Users remain solely responsible for their own decisions and compliance with local laws.
        </p>
      </>
    ),
  },
  {
    id: 'acceptance',
    label: '1. Acceptance of Terms',
    title: 'Acceptance of Terms',
    content: (
      <>
        <ul>
          <li>You confirm you are legally able to enter into these Terms.</li>
          <li>You agree to comply with these Terms and any referenced guidelines.</li>
          <li>You confirm you are not barred from using such services under applicable law.</li>
        </ul>
        <p>If you use the Services on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</p>
      </>
    ),
  },
  {
    id: 'nature-project',
    label: '2. Nature of the Project',
    title: 'Nature of the Project',
    content: (
      <>
        <h3>2.1 Community-Driven & Open Source</h3>
        <p>INRI CHAIN is open-source, Proof-of-Work infrastructure with no traditional corporate structure, no guaranteed funding and no promise of profit.</p>
        <h3>2.2 No Custody & No KYC</h3>
        <p>The project does not operate as a custodian of user funds and does not perform identity verification on-chain. Users stay fully responsible for wallets and keys.</p>
        <h3>2.3 Experimental Infrastructure</h3>
        <p>Nodes, explorer, RPC and related tools are experimental and provided on an “as is” basis without guarantees of uptime, stability or data accuracy.</p>
      </>
    ),
  },
  {
    id: 'use-services',
    label: '3. Use of the Services',
    title: 'Use of the Services',
    content: (
      <>
        <h3>3.1 Permitted Use</h3>
        <ul>
          <li>Reading documentation and project information.</li>
          <li>Viewing blocks, transactions and addresses via the explorer.</li>
          <li>Broadcasting valid INRI CHAIN transactions through the RPC.</li>
          <li>Building and testing applications that interact with the network.</li>
        </ul>
        <h3>3.2 No Guarantee of Availability</h3>
        <p>The Services may be modified, rate-limited, interrupted or discontinued at any time, with or without notice.</p>
        <h3>3.3 Third-Party Services</h3>
        <p>Wallets, exchanges, bridges and other dApps are provided by third parties under their own terms and policies.</p>
      </>
    ),
  },
  {
    id: 'wallets-responsibility',
    label: '4. Wallets & Responsibility',
    title: 'Wallets & Responsibility',
    content: (
      <>
        <ul>
          <li>You are solely responsible for the security of your wallets, seed phrases, private keys and devices.</li>
          <li>Confirmed blockchain transactions are generally irreversible.</li>
          <li>You are fully responsible for all actions performed through your wallets and devices.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'risks',
    label: '5. Risks & No Guarantees',
    title: 'Risks & No Guarantees',
    content: (
      <>
        <h3>5.1 Technological & Security Risks</h3>
        <ul>
          <li>Software bugs or vulnerabilities in nodes, wallets or contracts.</li>
          <li>Network attacks, reorganizations or forks.</li>
          <li>Loss or compromise of private keys.</li>
        </ul>
        <h3>5.2 Market & Economic Risks</h3>
        <p>INRI and other tokens may be volatile, may lose value, or may have no liquid market at all.</p>
        <h3>5.3 Regulatory & Legal Risks</h3>
        <p>Regulations and interpretations may change across jurisdictions.</p>
        <h3>5.4 No Promise of Profit</h3>
        <p>Nothing in the project design, documentation or communications is a promise of return, interest, dividend or similar benefit.</p>
      </>
    ),
  },
  {
    id: 'prohibited',
    label: '6. Prohibited Activities',
    title: 'Prohibited Activities',
    content: (
      <>
        <ul>
          <li>Violating applicable laws or regulations.</li>
          <li>Attacking, abusing or overloading the network, explorer, RPC or related infrastructure.</li>
          <li>Interfering with other users’ ability to use the Services.</li>
          <li>Using the Services in connection with fraud, scams or illegal activity.</li>
          <li>Impersonating the team or misrepresenting official affiliation.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'ip',
    label: '7. Intellectual Property',
    title: 'Intellectual Property',
    content: (
      <>
        <p>Many components of INRI CHAIN are open source and governed by their respective licenses.</p>
        <p>The INRI CHAIN name, logos, visual identity, website design and documentation may still be protected by copyright, trademark or similar rights.</p>
        <p>You may reference the project, but should not imply official endorsement or sponsorship without permission.</p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    label: '8. Disclaimers',
    title: 'Disclaimers',
    content: (
      <>
        <p>The Services are provided on an <strong>“as is” and “as available”</strong> basis, without warranties of any kind, express or implied.</p>
        <p>Explorer data, RPC responses and website content may contain delays, inaccuracies or errors. Users should not rely on a single source for critical decisions.</p>
        <p>Nothing in the Services constitutes financial, investment, legal or tax advice.</p>
      </>
    ),
  },
  {
    id: 'liability',
    label: '9. Limitation of Liability',
    title: 'Limitation of Liability',
    content: (
      <>
        <p>To the maximum extent permitted by law, the founder, contributors and infrastructure operators shall not be liable for:</p>
        <ul>
          <li>Loss of funds, data or access to wallets.</li>
          <li>Indirect, incidental, special, punitive or consequential damages.</li>
          <li>Damages related to hacks, software bugs, incorrect data or service interruptions.</li>
        </ul>
        <p>Your sole remedy for dissatisfaction with the Services is to stop using them.</p>
      </>
    ),
  },
  {
    id: 'changes-termination',
    label: '10. Changes & Termination',
    title: 'Changes & Termination',
    content: (
      <>
        <p>These Terms may be updated from time to time, and continued use of the Services after changes means you accept the updated version.</p>
        <p>The project team may modify, suspend or discontinue parts of the Services at any time without liability.</p>
      </>
    ),
  },
  {
    id: 'governing-law',
    label: '11. Governing Law',
    title: 'Governing Law',
    content: (
      <>
        <p>
          These Terms are intended to be interpreted neutrally for a global internet-based community. Any governing law question should be determined according to the relevant parties and applicable conflict-of-law rules.
        </p>
        <p>You remain responsible for ensuring that your use of the Services is legal in your own jurisdiction.</p>
      </>
    ),
  },
  {
    id: 'contact',
    label: '12. Contact',
    title: 'Contact',
    content: (
      <>
        <p>Questions about these Terms or about the INRI CHAIN project can be directed through the official channels published on:</p>
        <ul>
          <li><strong>Website:</strong> <a href="https://inri.life">https://inri.life</a></li>
          <li><strong>Explorer:</strong> <a href="https://explorer.inri.life">https://explorer.inri.life</a></li>
          <li><strong>Official community and social channels</strong> listed on the website.</li>
        </ul>
      </>
    ),
  },
]

export function InriTermsPage() {
  return (
    <InriLegalPage
      eyebrow="Terms & Conditions"
      title="Terms and Conditions in the same premium visual system as the main INRI site."
      description="This page now uses the real legal structure for how users access INRI CHAIN websites, explorer and RPC — including risk disclosure, self-custody responsibility, prohibited activity, disclaimers and liability boundaries."
      facts={facts}
      sections={sections}
      summaryTitle="Clear service rules, honest boundaries."
      summaryText="The document makes the project’s nature explicit: experimental infrastructure, community-driven operation, self-custody responsibility and no promise of profit, uptime or guaranteed performance."
      quickItems={legalIcons.terms}
      primaryAction={{ label: 'Open privacy policy', href: '/privacy-policy' }}
      secondaryAction={{ label: 'Open whitepaper', href: '/whitepaper' }}
    />
  )
}
