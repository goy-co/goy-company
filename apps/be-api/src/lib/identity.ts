import { drizzle } from 'drizzle-orm/d1';
import { eq, or } from 'drizzle-orm';
import { Relay } from 'nostr-tools/relay';
import { nip19 } from 'nostr-tools';
import * as schema from '../db/schema';
import { Env } from './types';
import { DEFAULT_RELAYS } from './constants';

/**
 * Validates NIP-05 identifier.
 * Returns true if the pubkey matches the entry in the domain's nostr.json.
 */
export async function verifyNip05(nip05: string, pubkey: string): Promise<boolean> {
  if (!nip05 || !nip05.includes('@')) return false;
  
  const [name, domain] = nip05.split('@');
  const url = `https://${domain}/.well-known/nostr.json?name=${name}`;
  
  try {
    const res = await fetch(url, { 
      cf: { cacheTtl: 3600 },
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) return false;
    
    const data = await res.json() as any;
    const mappedPubkey = data?.names?.[name];
    
    return mappedPubkey?.toLowerCase() === pubkey.toLowerCase();
  } catch (e) {
    console.error(`[NIP05_VERIFY_ERROR] Domain: ${domain}`, e);
    return false;
  }
}

/**
 * Aggregates identity with Stale-While-Revalidate strategy.
 */
export async function aggregateIdentity(identifier: string, env: Env, ctx?: ExecutionContext): Promise<any> {
  // 1. Normalize Identifier to Lowercase Hex
  let hexPubkey = identifier.toLowerCase();
  if (identifier.startsWith('npub1')) {
    try {
      const decoded = nip19.decode(identifier);
      if (decoded.type === 'npub') hexPubkey = (decoded.data as string).toLowerCase();
    } catch (e) {}
  }

  // 2. Try KV Cache first (Instant)
  try {
    const cached = await env.IDENTITY_CACHE.get(`identity_agg:${hexPubkey}`);
    if (cached) {
       const data = JSON.parse(cached);
       
       // Trigger Background Revalidation if ctx is available
       if (ctx) {
          ctx.waitUntil(revalidateIdentity(hexPubkey, data, env));
       }
       
       return { ...data, cached: true };
    }
  } catch (e) {}

  // 3. Cache Miss: Full Fetch from Sources
  const freshData = await fetchFromSource(hexPubkey, env);
  
  // Perform initial NIP-05 verification if present
  if (freshData.metadata?.nip05) {
     freshData.metadata.nip05_verified = await verifyNip05(freshData.metadata.nip05, hexPubkey);
  }

  // Populate KV for next time
  if (freshData && !freshData.is_fallback) {
     ctx?.waitUntil(env.IDENTITY_CACHE.put(`identity_agg:${hexPubkey}`, JSON.stringify(freshData), { expirationTtl: 3600 }));
  }

  return freshData;
}

/**
 * Background task to check if KV data is still valid
 */
async function revalidateIdentity(pubkey: string, cachedData: any, env: Env) {
  const freshData = await fetchFromSource(pubkey, env);
  
  if (!freshData || freshData.is_fallback) return;

  // Check NIP-05 status in background
  if (freshData.metadata?.nip05) {
     freshData.metadata.nip05_verified = await verifyNip05(freshData.metadata.nip05, pubkey);
  }

  // Simple comparison: check if metadata stringified is different
  const hasChanged = JSON.stringify(freshData.metadata) !== JSON.stringify(cachedData.metadata);

  if (hasChanged) {
     console.log(`[IDENTITY_REVALIDATE] Update detected for ${pubkey}. Refreshing KV and notifying Agent.`);
     
     // Robust Anchor (Updates D1 and KV)
     await anchorIdentity(pubkey, freshData.metadata, env);

     // Notify Grid Agent so the UI updates via WebSocket
     await env.NOSTR_AGENT.get(env.NOSTR_AGENT.idFromName(pubkey)).fetch(new Request(`http://uplink/uplink/${pubkey}`, {
        method: 'POST',
        body: JSON.stringify({ type: 'metadata', content: freshData.metadata })
     }));
  }
}

/**
 * Orchestrates fetching from D1 and Relays
 */
async function fetchFromSource(hexPubkey: string, env: Env): Promise<any> {
  const db = drizzle(env.DB, { schema });

  // 1. Search in D1
  try {
    const d1User = await db.query.user.findFirst({
      where: or(eq(schema.user.id, hexPubkey), eq(schema.user.pubkey, hexPubkey))
    });

    if (d1User && d1User.name) {
      return {
        metadata: {
          name: d1User.name || '',
          display_name: d1User.displayName || d1User.name || 'ANONYMOUS_ENTITY',
          picture: d1User.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${hexPubkey}`,
          banner: d1User.banner || '',
          about: d1User.bio || '',
          website: d1User.website || '',
          nip05: d1User.nip05 || '',
          lud16: d1User.lud16 || '',
          pubkey: hexPubkey
        },
        fetched_at: Date.now()
      };
    }
  } catch (e) {}

  // 2. Race across Relays
  const relayMetadata: any = { content: null };
  try {
    const promises = DEFAULT_RELAYS.slice(0, 4).map(async (url) => {
      let relay;
      try {
        relay = await Relay.connect(url);
        return new Promise((resolve) => {
          const sub = relay.subscribe([{ kinds: [0], authors: [hexPubkey], limit: 1 }], {
            onevent(event: any) { 
              try { 
                const content = JSON.parse(event.content);
                relayMetadata.content = content;
                resolve(true); 
              } catch {} 
            },
            ononeose() { resolve(false); }
          });
          setTimeout(() => { sub.close(); resolve(false); }, 3000);
        }).finally(() => { if (relay) relay.close(); });
      } catch (e) { return false; }
    });
    
    await Promise.allSettled(promises);
    
    if (relayMetadata.content) {
      return { 
        metadata: { ...relayMetadata.content, pubkey: hexPubkey }, 
        fetched_at: Date.now() 
      };
    }
  } catch (e) {}

  // 3. Absolute Fallback
  return { 
    metadata: {
      name: `ENTITY_${hexPubkey.slice(0, 12)}`,
      display_name: 'UNINITIALIZED_ENTITY',
      picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${hexPubkey}`,
      pubkey: hexPubkey
    }, 
    fetched_at: Date.now(),
    is_fallback: true
  };
}

/**
 * Anchors identity in D1 and KV Cache. 
 * Shared between handleProfile and NostrAgent.
 */
export async function anchorIdentity(pk: string, metadata: any, env: Env) {
  const db = drizzle(env.DB, { schema });
  const hexPk = pk.toLowerCase();

  // Perform NIP-05 verification if present in metadata being anchored
  let nip05_verified = false;
  if (metadata.nip05) {
     nip05_verified = await verifyNip05(metadata.nip05, hexPk);
  }

  // 1. Clean metadata mapping
  const mappedData = {
    name: metadata.name || metadata.display_name || `entity_${hexPk.slice(0, 8)}`,
    displayName: metadata.display_name || metadata.name || `ENTITY_${hexPk.slice(0, 8)}`,
    bio: metadata.about || metadata.bio || '',
    image: metadata.picture || metadata.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${hexPk}`,
    banner: metadata.banner || '',
    website: metadata.website || '',
    nip05: metadata.nip05 || '',
    lud16: metadata.lud16 || ''
  };

  // 2. Anchor in D1
  try {
    await db.insert(schema.user).values({
      id: hexPk,
      pubkey: hexPk,
      name: mappedData.name,
      displayName: mappedData.displayName,
      bio: mappedData.bio,
      image: mappedData.image,
      banner: mappedData.banner,
      website: mappedData.website,
      nip05: mappedData.nip05,
      lud16: mappedData.lud16,
      email: null,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: schema.user.pubkey,
      set: {
        name: mappedData.name,
        displayName: mappedData.displayName,
        bio: mappedData.bio,
        image: mappedData.image,
        banner: mappedData.banner,
        website: mappedData.website,
        nip05: mappedData.nip05,
        lud16: mappedData.lud16,
        updatedAt: new Date()
      }
    });
  } catch (e) { console.error('D1_ANCHOR_ERROR:', e); }

  // 3. Update KV Cache
  const kvPayload = {
    metadata: { 
       ...metadata, 
       pubkey: hexPk,
       display_name: mappedData.displayName,
       picture: mappedData.image,
       nip05_verified // Add verified flag to cache
    },
    fetched_at: Date.now()
  };
  await env.IDENTITY_CACHE.put(`identity_agg:${hexPk}`, JSON.stringify(kvPayload), { expirationTtl: 3600 });
  
  return kvPayload;
}
