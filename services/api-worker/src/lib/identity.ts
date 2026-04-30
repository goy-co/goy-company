import { drizzle } from 'drizzle-orm/d1';
import { eq, or } from 'drizzle-orm';
import { Relay } from 'nostr-tools/relay';
import { nip19 } from 'nostr-tools';
import * as schema from '../db/schema';
import { Env } from './types';
import { DEFAULT_RELAYS } from './constants';

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

  // Simple comparison: check if metadata stringified is different
  const hasChanged = JSON.stringify(freshData.metadata) !== JSON.stringify(cachedData.metadata);

  if (hasChanged) {
     console.log(`[IDENTITY_REVALIDATE] Update detected for ${pubkey}. Refreshing KV and notifying Agent.`);
     
     // 1. Update KV
     await env.IDENTITY_CACHE.put(`identity_agg:${pubkey}`, JSON.stringify(freshData), { expirationTtl: 3600 });

     // 2. Notify Grid Agent so the UI updates via WebSocket
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
