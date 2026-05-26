export interface DownloadArtifact {
  platform: string;
  version: string;
  size: string;
  link: string;
  checksum: string;
}

export interface SoftwarePackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'Infrastructure' | 'Client';
  installCommand?: string;
  artifacts?: DownloadArtifact[];
}

export const downloadData: SoftwarePackage[] = [
  {
    id: 'goy-os',
    name: 'Goy OS',
    tagline: 'Server_Infrastructure',
    category: 'Infrastructure',
    description: 'The definitive operating environment for running sovereign nodes. Universal installation for any Linux/Unix server via our automated provisioning script.',
    installCommand: 'curl -sSL https://get.goycompany.com/os | sudo bash'
  },
  {
    id: 'goy-hub',
    name: 'Goy Hub',
    tagline: 'Sovereign_Client',
    category: 'Client',
    description: 'Your personal gateway to the Grid. A unified client for identity management, encrypted communication, and peer-to-peer services.',
    artifacts: [
      { platform: 'macOS (Universal)', version: 'v2.0.1', size: '120 MB', link: '#', checksum: 'sha256:4d5e...d4' },
      { platform: 'Windows (x64)', version: 'v2.0.1', size: '115 MB', link: '#', checksum: 'sha256:1b2c...e5' },
      { platform: 'Linux (AppImage)', version: 'v2.0.1', size: '130 MB', link: '#', checksum: 'sha256:6f7g...f6' },
      { platform: 'iOS (App Store)', version: 'v2.0.1', size: '45 MB', link: '#', checksum: 'Signed_by_Apple' },
      { platform: 'Android (APK)', version: 'v2.0.1', size: '52 MB', link: '#', checksum: 'sha256:9a1c...c3' }
    ]
  }
];
