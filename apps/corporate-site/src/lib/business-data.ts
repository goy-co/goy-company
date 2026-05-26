export interface BusinessProduct {
  name: string;
  description: string;
  status: 'Active' | 'Development' | 'Conceptual';
  features: string[];
}

export interface BusinessCategory {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  products: BusinessProduct[];
}

export const businessData: Record<string, BusinessCategory> = {
  '01': {
    id: '01',
    name: 'Institutional Infrastructure',
    tagline: 'Sovereign_Foundation',
    description: 'The backbone for decentralized organizations. Deploy institutional nodes, manage multi-sig treasuries, and establish domain-verified identities.',
    color: '#3b82f6', // Blue
    products: [
      {
        name: 'Goy Business',
        description: 'Comprehensive efficiency suite for institutional efficiency and sovereign node management.',
        status: 'Active',
        features: ['NIP-05 Domain Verification', 'Master Key Multi-Sig', 'Goy Enterprise Nodes', 'Treasury Management']
      },
      {
        name: 'Goy Governance',
        description: 'On-chain voting and decision-making infrastructure for shareholders and partners.',
        status: 'Active',
        features: ['Immutable Voting Logs', 'Weighted Stake Voting', 'Proposal Management']
      }
    ]
  },
  '02': {
    id: '02',
    name: 'Intelligent Operations',
    tagline: 'Data_Sovereignty',
    description: 'Turn your organization into an intelligent entity without spying on users. Privacy-preserving metrics and AI that runs on your hardware.',
    color: '#10b981', // Green
    products: [
      {
        name: 'Goy Analytics',
        description: 'Business intelligence using Zero-Knowledge Proofs. Edge aggregation for conversion funnels without tracking.',
        status: 'Active',
        features: ['ZKP Metrics', 'Edge Aggregation', 'Privacy-by-Design BI', 'Consent-Based Data Marketplace']
      },
      {
        name: 'Goy Local AI',
        description: 'LLMs that run strictly on your Goy Node. Secure your business strategy and trade secrets.',
        status: 'Development',
        features: ['On-Premise Inference', 'Private Data Fine-Tuning', 'Zero Data Leakage']
      }
    ]
  },
  '03': {
    id: '03',
    name: 'Strategic Relationship',
    tagline: 'Trustless_Engagement',
    description: 'Manage customers and support with absolute data ownership. Eliminate middleman platforms and vendor lock-in.',
    color: '#f59e0b', // Yellow
    products: [
      {
        name: 'Goy CRM',
        description: 'Relationship Ledger indexing Nostr events. Smart pipelines with built-in escrow and payment integration.',
        status: 'Active',
        features: ['Relationship Ledger', 'Smart Escrow Pipelines', 'Goy Lead Marketplace', 'Native Nostr Integration']
      },
      {
        name: 'Goy Desk',
        description: 'ID-First customer support. Portable history owned by the client and prioritized via attention auctions (Zaps).',
        status: 'Active',
        features: ['Cryptographic Authentication', 'Zapped Priority', 'Goy Knowledge Base', 'Multi-Channel Inbox']
      }
    ]
  },
  '04': {
    id: '04',
    name: 'Workforce & Delivery',
    tagline: 'Performance_Protocol',
    description: 'Scale your team with verified merit. Settle payments instantly upon delivery and eliminate recruitment noise.',
    color: '#8b5cf6', // Purple
    products: [
      {
        name: 'Goy Projects',
        description: 'Work-to-value bridge. Tasks as Nostr events with automatic Lightning settlement on milestone approval.',
        status: 'Active',
        features: ['Smart Milestones', 'Task-to-Value Bridge', 'P2P Team Sync', 'Time Tracking Audits']
      },
      {
        name: 'Goy Talent',
        description: 'Proof of Competence inventory. Recruitment based on cryptographic signatures of past work, not CVs.',
        status: 'Development',
        features: ['Sovereign Career History', 'Blind Hiring Protocols', 'Interview Staking', 'Merit-Based Search']
      }
    ]
  }
};
