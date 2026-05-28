export interface Service {
  name: string;
  description: string;
  status: 'Active' | 'Development' | 'Conceptual';
  version?: string;
}

export interface ServiceLayer {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  services: Service[];
}

export const servicesData: Record<string, ServiceLayer> = {
  '01': {
    id: '01',
    name: 'Finance & ID',
    tagline: 'The_Core',
    description: 'Personal sovereignty for your wealth and identity. Secure your digital self without middlemen or central banks.',
    color: '#e21b23', // Red
    services: [
      { name: 'Goy ID', description: 'Self-sovereign digital identity based on cryptography.', status: 'Active', version: 'v2.0.0' },
      { name: 'Goy Wallet', description: 'Non-custodial bank for Bitcoin, Lightning, and digital assets.', status: 'Active', version: 'v3.1.2' },
      { name: 'Goy Pay', description: 'Instant, fee-less payments for your daily life.', status: 'Active' },
      { name: 'Key Recovery', description: "Shamir's Secret Sharing protocol for secure account recovery.", status: 'Active' },
      { name: 'Goy Score', description: 'Your personal web-of-trust reputation index.', status: 'Conceptual' }
    ]
  },
  '02': {
    id: '02',
    name: 'Personal Productivity',
    tagline: 'Deep_Work',
    description: 'Professional-grade tools for the individual creator. Manage your time, projects, and learning with total privacy.',
    color: '#009345', // Green
    services: [
      { name: 'Goy Projects', description: 'Personal task management with cryptographic progress logs.', status: 'Active' },
      { name: 'Goy Academy', description: 'Learn-to-earn education platform with verifiable skills.', status: 'Conceptual' },
      { name: 'Goy Drive', description: 'Encrypted file storage with seamless local mirroring.', status: 'Active' },
      { name: 'Goy Cal', description: 'Private scheduling with integrated value settlement.', status: 'Active' }
    ]
  },
  '03': {
    id: '03',
    name: 'Social & Society',
    tagline: 'Human_Uplink',
    description: 'Connect with the world without being the product. Algorithm-free social graphs and verified news.',
    color: '#8b5cf6', // Purple
    services: [
      { name: 'Goy Social', description: 'Censorship-resistant social media based on Nostr.', status: 'Active' },
      { name: 'Goy News', description: 'Independent journalism verified via cryptographic proof.', status: 'Active' },
      { name: 'Goy Market', description: 'Direct P2P marketplace for goods and services.', status: 'Development' },
      { name: 'Goy Ticket', description: 'Scalper-proof event ticketing for real fans.', status: 'Active' }
    ]
  },
  '04': {
    id: '04',
    name: 'Digital Communication',
    tagline: 'Encrypted_Flow',
    description: 'High-fidelity communication protocols for your private conversations and data.',
    color: '#06b6d4', // Cyan
    services: [
      { name: 'Goy Chat', description: 'End-to-end encrypted messaging for private humans.', status: 'Active' },
      { name: 'Goy Meet', description: 'P2P video collaboration with zero server-side logging.', status: 'Development' },
      { name: 'Goy Mail', description: 'Spam-free, authenticated asynchronous communication.', status: 'Active' },
      { name: 'Goy Stream', description: 'Direct-monetized video and live streaming for creators.', status: 'Conceptual' }
    ]
  }
};
