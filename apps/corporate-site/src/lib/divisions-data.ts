export interface App {
  name: string;
  description: string;
  status: 'Active' | 'Beta' | 'Legacy';
  version: string;
  nodes: number;
}

export interface DivisionEcosystem {
  id: string;
  name: string;
  color: string;
  apps: App[];
}

export const ecosystems: Record<string, DivisionEcosystem> = {
  '01': {
    id: '01',
    name: 'GoySocial',
    color: '#2563eb',
    apps: [
      { name: 'GoyChat', description: 'End-to-end encrypted messaging via Nostr.', status: 'Active', version: 'v1.2.4', nodes: 1242 },
      { name: 'GoyCircles', description: 'Decentralized social graphs for trusted associations.', status: 'Beta', version: 'v0.8.2', nodes: 482 },
      { name: 'GoyCast', description: 'P2P broadcasting and event streaming.', status: 'Active', version: 'v1.1.0', nodes: 2911 },
    ]
  },
  '02': {
    id: '02',
    name: 'GoyPay',
    color: '#10b981',
    apps: [
      { name: 'GoyWallet', description: 'Lightning-fast non-custodial sats management.', status: 'Active', version: 'v2.0.1', nodes: 8593 },
      { name: 'GoyStream', description: 'Real-time micro-payments for content creators.', status: 'Beta', version: 'v0.9.1', nodes: 312 },
    ]
  },
  '03': {
    id: '03',
    name: 'GoyOps',
    color: '#ea580c',
    apps: [
      { name: 'NodeCommander', description: 'Centralized dashboard for decentralized relays.', status: 'Active', version: 'v3.1.2', nodes: 541 },
      { name: 'VaultSafe', description: 'Encrypted backup and recovery for Nostr keys.', status: 'Active', version: 'v1.0.5', nodes: 212 },
    ]
  },
  '04': {
    id: '04',
    name: 'GoyFlix',
    color: '#9333ea',
    apps: [
      { name: 'VoidCinema', description: 'Decentralized video streaming over the mesh.', status: 'Beta', version: 'v0.5.4', nodes: 128 },
    ]
  }
};
