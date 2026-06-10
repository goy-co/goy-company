import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { Relay } from 'nostr-tools/relay';
import { finalizeEvent } from 'nostr-tools/pure';

export const PRIMAL_RELAY = 'wss://relay.primal.net';
export const GOY_GRID_GATEWAY = 'https://be-api.goycompany.workers.dev';

export const DEFAULT_RELAYS = [
  PRIMAL_RELAY,
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social'
];

export interface NostrConfig {
  gatewayUrl?: string;
  relays?: string[];
  useGateway?: boolean;
}

const DEFAULT_CONFIG: NostrConfig = {
  gatewayUrl: GOY_GRID_GATEWAY,
  relays: DEFAULT_RELAYS,
  useGateway: true
};

export function generateIdentity() {
  const privkey = generateSecretKey();
  const pubkey = getPublicKey(privkey);
  
  return {
    privkey: nip19.nsecEncode(privkey),
    pubkey: nip19.npubEncode(pubkey)
  };
}

export function getPublicKeyFromSecret(nsecOrHex: string): string {
  try {
    let sk: Uint8Array;
    if (nsecOrHex.startsWith('nsec1')) {
      const decoded = nip19.decode(nsecOrHex);
      if (decoded.type !== 'nsec') throw new Error('INVALID_NSEC');
      sk = decoded.data as Uint8Array;
    } else {
      // Assume hex
      const cleanHex = nsecOrHex.trim();
      if (!/^[0-9a-f]{64}$/i.test(cleanHex)) throw new Error('INVALID_HEX');
      sk = new Uint8Array(cleanHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    }
    return getPublicKey(sk);
  } catch (e) {
    throw new Error('SEC_KEY_DECODE_FAILED');
  }
}

export async function getPublicKeyFromExtension(): Promise<string> {
  if (typeof window === 'undefined' || !(window as any).nostr) {
    throw new Error('Nostr extension not found');
  }
  
  try {
    const pubkey = await (window as any).nostr.getPublicKey();
    return pubkey;
  } catch (error) {
    throw new Error('Failed to get public key from extension');
  }
}

export function toNpub(pubkey: string): string {
  if (pubkey.startsWith('npub1')) return pubkey;
  try {
    return nip19.npubEncode(pubkey);
  } catch (e) {
    return pubkey;
  }
}

export function hasNostrExtension(): boolean {
  return typeof window !== 'undefined' && !!(window as any).nostr;
}

export function signEventWithSecret(eventTemplate: any, nsecOrHex: string) {
  try {
    let sk: Uint8Array;
    if (nsecOrHex.startsWith('nsec1')) {
      const decoded = nip19.decode(nsecOrHex);
      if (decoded.type !== 'nsec') throw new Error('INVALID_NSEC');
      sk = decoded.data as Uint8Array;
    } else {
      const cleanHex = nsecOrHex.trim();
      sk = new Uint8Array(cleanHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    }
    return finalizeEvent(eventTemplate, sk);
  } catch (e) {
    throw new Error('SIGNING_FAILED');
  }
}

/**
 * Maps Nostr Event Kinds to human readable technical actions
 */
export function mapEventToAction(event: any): string {
  switch (event.kind) {
    case 0: return 'IDENTITY_METADATA_UPDATE';
    case 1: return 'TEXT_NOTE_BROADCAST';
    case 3: return 'SOCIAL_GRAPH_SYNCHRONIZATION';
    case 6: return 'REPOST_TRANSMISSION';
    case 7: return 'REACTION_ACKNOWLEDGED';
    default: return `EVENT_KIND_${event.kind}_DETECTED`;
  }
}

/**
 * Fetches profile metadata and contact list.
 * Strategy: Tries API Worker first (Edge Cache), fallbacks to Direct Relays.
 */
export async function fetchFullIdentity(pubkey: string, options: NostrConfig = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };

  if (config.useGateway && typeof window !== 'undefined') {
    try {
      const host = window.location.hostname === 'localhost' ? 'http://localhost:8787' : config.gatewayUrl;
      const finalUrl = `${host}/profile/${pubkey}`;

      const res = await fetch(finalUrl, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        return { 
          metadata: data.metadata, 
          following: data.social?.following || 0, 
          followers: data.social?.followers || 0,
          network: data.network || null
        };
      }
    } catch (e) {
      console.warn('Grid Edge unreachable, failing back to Sovereign Mode');
    }
  }

  // Fallback: Direct Relay Fetch (Sovereign Mode)
  const fetchFromRelay = async (url: string) => {
    let relay: any = null;
    let isFinished = false;

    return new Promise((resolve) => {
      const results: any = { metadata: null, following: 0 };
      
      const cleanup = async () => {
        if (isFinished) return;
        isFinished = true;
        try {
          if (relay) {
            await relay.close();
          }
        } catch (e) {}
        resolve(results);
      };

      const timeout = setTimeout(cleanup, 3000);

      Relay.connect(url).then((connectedRelay) => {
        relay = connectedRelay;
        const sub = relay.subscribe([{ kinds: [0, 3], authors: [pubkey], limit: 2 }], {
          onevent(event) {
            if (event.kind === 0) { try { results.metadata = JSON.parse(event.content); } catch {} }
            if (event.kind === 3) { results.following = event.tags.filter((t: any) => t[0] === 'p').length; }
          },
          ononeose() {
            try { sub.close(); } catch {}
            cleanup();
          }
        });
      }).catch(() => cleanup());
    });
  };

  const results = await Promise.all((config.relays || DEFAULT_RELAYS).map(r => fetchFromRelay(r)));
  const finalMetadata = (results as any[]).find(r => r?.metadata)?.metadata || null;
  const finalFollowing = Math.max(...(results as any[]).map(r => r?.following || 0));
  
  return { metadata: finalMetadata, following: finalFollowing, followers: 0, network: null };
}

/**
 * Submits an application to become a Ghost Operator.
 * Requires a signed Nostr event as proof of identity.
 */
export async function applyAsGhostOperator(event: any, details: { infrastructure: string, experience: string, nip05?: string }, config: NostrConfig = {}) {
  try {
    const host = window.location.hostname === 'localhost' ? 'http://localhost:8787' : (config.gatewayUrl || GOY_GRID_GATEWAY);
    const res = await fetch(`${host}/ghost-operator/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, details })
    });
    
    return await res.json();
  } catch (e) {
    throw new Error('GRID_TRANSMISSION_FAILED');
  }
}

/**
 * Uploads a file to the Grid Asset Storage (R2).
 * Requires a signed event for authentication.
 */
export async function uploadAsset(file: File, config: NostrConfig = {}) {
  if (typeof window === 'undefined' || !(window as any).nostr) {
    throw new Error('NOSTR_EXTENSION_REQUIRED');
  }

  try {
    const host = window.location.hostname === 'localhost' ? 'http://localhost:8787' : (config.gatewayUrl || GOY_GRID_GATEWAY);
    
    // 1. Sign Auth Event
    const event = await (window as any).nostr.signEvent({
      kind: 27235,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['u', `${host}/upload`]],
      content: `Upload file: ${file.name}`
    });

    // 2. Transmit multipart data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('event', JSON.stringify(event));

    const res = await fetch(`${host}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('UPLOAD_REJECTED');
    
    return await res.json();
  } catch (e) {
    console.error('Upload Error:', e);
    throw e;
  }
}

/**
 * Subscribes to identity updates and user activity
 */
export async function subscribeToIdentity(pubkey: string, callback: (data: any) => void, relays: string[] = DEFAULT_RELAYS) {
  const activeRelays: any[] = [];
  const activeSubs: any[] = [];
  let lastTimestamps: Record<number, number> = {};

  relays.forEach(async (url) => {
    try {
      const relay = await Relay.connect(url);
      activeRelays.push(relay);

      const sub = relay.subscribe([
        { kinds: [0, 1, 3, 6, 7], authors: [pubkey], limit: 10 }
      ], {
        onevent(event) {
          callback({ type: 'activity', content: event });
          if (event.kind === 0 && (!lastTimestamps[0] || event.created_at > lastTimestamps[0])) {
            lastTimestamps[0] = event.created_at;
            try {
              const metadata = JSON.parse(event.content);
              callback({ type: 'metadata', content: metadata, rawEvent: event });
            } catch {}
          }
          if (event.kind === 3 && (!lastTimestamps[3] || event.created_at > lastTimestamps[3])) {
            lastTimestamps[3] = event.created_at;
            const following = event.tags.filter(t => t[0] === 'p').length;
            callback({ type: 'following', content: following });
          }
        }
      });
      activeSubs.push(sub);
    } catch (e) {
      console.warn(`Failed to connect live link to ${url}`);
    }
  });

  return () => {
    activeSubs.forEach(s => { try { s.close(); } catch {} });
    activeRelays.forEach(r => { try { r.close(); } catch {} });
  };
}
