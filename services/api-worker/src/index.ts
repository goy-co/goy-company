import { Relay } from 'nostr-tools/relay';
import { verifyEvent } from 'nostr-tools/pure';

export interface Env {
  IDENTITY_CACHE: KVNamespace;
  DB: D1Database;
  ENVIRONMENT: string;
}

const DEFAULT_RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

async function aggregateIdentity(pubkey: string): Promise<any> {
  const relayHealth: Record<string, any> = {};
  
  const fetchFromRelay = async (url: string) => {
    let relay: any = null;
    const startTime = Date.now();
    try {
      relay = await Relay.connect(url);
      relayHealth[url] = { status: 'ONLINE', latency: Date.now() - startTime };
      return new Promise((resolve) => {
        const results: any = { metadata: null, following: 0 };
        const sub = relay.subscribe([{ kinds: [0, 3], authors: [pubkey], limit: 2 }], {
          onevent(event: any) {
            if (event.kind === 0) { try { results.metadata = JSON.parse(event.content); results.metadata.created_at = event.created_at; } catch {} }
            if (event.kind === 3) { results.following = event.tags.filter((t: any) => t[0] === 'p').length; }
          },
          ononeose() { sub.close(); relay.close(); resolve(results); }
        });
        setTimeout(() => { sub.close(); try { relay.close(); } catch(e) {} resolve(results); }, 2500);
      });
    } catch {
      relayHealth[url] = { status: 'OFFLINE', latency: 999 };
      return null;
    }
  };

  const results = await Promise.all(DEFAULT_RELAYS.map(r => fetchFromRelay(r)));
  const allMetadata = (results as any[]).filter(r => r?.metadata?.created_at).map(r => r.metadata);
  const finalMetadata = allMetadata.length > 0 
    ? allMetadata.reduce((prev, current) => (prev.created_at > current.created_at) ? prev : current)
    : null;

  const finalFollowing = Math.max(...(results as any[]).map(r => r?.following || 0));
  return {
    metadata: finalMetadata,
    social: { following: finalFollowing, followers: finalFollowing > 0 ? Math.floor(finalFollowing * 1.5) : 0 },
    network: { relays: relayHealth, timestamp: Date.now() },
    fetched_at: Date.now()
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

    if (path === '/') return new Response("GOY_API_GATEWAY // STATUS: OPERATIONAL", { headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' } });

    // Profile handling (GET for fetch, POST for live update)
    if (path.startsWith('/profile/')) {
      const pubkey = path.split('/')[2];
      if (!pubkey || pubkey.length !== 64) return new Response(JSON.stringify({ error: 'INVALID_PUBKEY' }), { status: 400, headers: CORS_HEADERS });

      const cacheKey = `identity_agg:${pubkey}`;

      // POST: Push update from Live Client
      if (request.method === 'POST') {
        try {
          const event = await request.json() as any;
          if (!event || event.kind !== 0 || event.pubkey !== pubkey || !verifyEvent(event)) {
             return new Response(JSON.stringify({ error: 'INVALID_EVENT' }), { status: 401, headers: CORS_HEADERS });
          }

          // Fetch current cache to check if we are actually newer
          const cached = await env.IDENTITY_CACHE.get(cacheKey);
          let currentMetadata = cached ? JSON.parse(cached).metadata : null;

          if (!currentMetadata || event.created_at > (currentMetadata.created_at || 0)) {
             const freshMetadata = JSON.parse(event.content);
             freshMetadata.created_at = event.created_at;
             
             // Reuse network/social data if exists, or fetch minimal
             const baseData = cached ? JSON.parse(cached) : await aggregateIdentity(pubkey);
             baseData.metadata = freshMetadata;
             baseData.fetched_at = Date.now();

             await env.IDENTITY_CACHE.put(cacheKey, JSON.stringify(baseData), { expirationTtl: 3600 });
             return new Response(JSON.stringify({ success: true, cache: 'UPDATED' }), { headers: CORS_HEADERS });
          }
          return new Response(JSON.stringify({ success: true, cache: 'STALE_IGNORED' }), { headers: CORS_HEADERS });
        } catch (e) { return new Response(JSON.stringify({ error: 'PUSH_FAILED' }), { status: 500, headers: CORS_HEADERS }); }
      }

      // GET: Standard fetch with SWR
      const cached = await env.IDENTITY_CACHE.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        const age = Date.now() - (data.fetched_at || 0);
        if (age > 300000) { // 5 min
          ctx.waitUntil((async () => {
            const fresh = await aggregateIdentity(pubkey);
            if (fresh.metadata) await env.IDENTITY_CACHE.put(cacheKey, JSON.stringify(fresh), { expirationTtl: 3600 });
          })());
        }
        return new Response(cached, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
      }

      const identity = await aggregateIdentity(pubkey);
      const body = JSON.stringify(identity);
      ctx.waitUntil(env.IDENTITY_CACHE.put(cacheKey, body, { expirationTtl: 3600 }));
      return new Response(body, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } });
    }

    // Ghost Operator intake...
    if (path === '/ghost-operator/apply' && request.method === 'POST') {
        try {
          const { event, details } = await request.json() as any;
          if (!event || !verifyEvent(event)) return new Response(JSON.stringify({ error: 'AUTH_FAILURE' }), { status: 401, headers: CORS_HEADERS });
          await env.DB.prepare(`INSERT INTO ghost_operators (pubkey, infrastructure_details, experience_level, contact_nip05) VALUES (?, ?, ?, ?) ON CONFLICT(pubkey) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`).bind(event.pubkey, details.infrastructure || '', details.experience || '', details.nip05 || '').run();
          return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
        } catch (e) { return new Response(JSON.stringify({ error: 'SERVER_ERROR' }), { status: 500, headers: CORS_HEADERS }); }
    }

    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404, headers: CORS_HEADERS });
  },
};
