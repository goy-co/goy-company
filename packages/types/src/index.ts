/**
 * Core types for The Goy Company ecosystem.
 * Shared between API, Frontend and Packages.
 */

export interface NostrMetadata {
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  website?: string;
  nip05?: string;
  lud16?: string;
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  pubkey?: string;
  metadata: NostrMetadata;
  social: {
    following: number;
    followers: number;
  };
  network?: any;
}

export interface GhostOperatorApplication {
  pubkey: string;
  infrastructure: string;
  experience: string;
  contactNip05?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface GridAsset {
  id: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}
