import { Relay } from 'nostr-tools/relay';
import { verifyEvent } from 'nostr-tools/pure';
import { DurableObject } from "cloudflare:workers";

/**
 * NOSTR AGENT: A stateful listener that lives on the Edge.
 * It maintains relay connections for a specific pubkey and 
 * pushes updates to all connected frontend clients.
 */
export class NostrAgent extends DurableObject {
  private sessions = new Set<WebSocket>();
  private relayConnections: Map<string, any> = new Map();
  private pubkey: string = "";

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    this.pubkey = url.pathname.split('/').pop() || "";

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket Upgrade", { status: 426 });
    }

    const [client, server] = new WebSocketPair();
    await this.handleSession(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleSession(ws: WebSocket) {
    this.sessions.add(ws);
    ws.accept();

    // Start relay listeners if this is the first session
    if (this.relayConnections.size === 0) {
      this.connectToRelays();
    }

    ws.addEventListener("close", () => {
      this.sessions.delete(ws);
      // Optional: close relays if no one is watching
      // if (this.sessions.size === 0) this.disconnectRelays();
    });
  }

  private async connectToRelays() {
    const RELAYS = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://nos.lol'];
    
    RELAYS.forEach(async (url) => {
      try {
        const relay = await Relay.connect(url);
        this.relayConnections.set(url, relay);

        relay.subscribe([{ authors: [this.pubkey], kinds: [0, 1, 3, 6, 7] }], {
          onevent: (event) => {
             this.broadcast({ type: 'activity', content: event });
             if (event.kind === 0) this.broadcast({ type: 'metadata', content: JSON.parse(event.content), rawEvent: event });
          }
        });
      } catch (e) {
        console.warn(`Agent failed to link with relay: ${url}`);
      }
    });
  }

  private broadcast(data: any) {
    const message = JSON.stringify(data);
    for (const session of this.sessions) {
      try {
        session.send(message);
      } catch (e) {
        this.sessions.delete(session);
      }
    }
  }
}

export interface Env {
  IDENTITY_CACHE: KVNamespace;
  DB: D1Database;
  ASSETS: R2Bucket;
  NOSTR_AGENT: DurableObjectNamespace<NostrAgent>;
  ENVIRONMENT: string;
}

const DEFAULT_RELAYS = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://nos.lol'];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

async function aggregateIdentity(pubkey: string, customRelays: string[] = []): Promise<any> {
  const relayList = customRelays.length > 0 ? customRelays : DEFAULT_RELAYS;
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
  const results = await Promise.all(relayList.map(r => fetchFromRelay(r)));
  const allMetadata = (results as any[]).filter(r => r?.metadata?.created_at).map(r => r.metadata);
  const finalMetadata = allMetadata.length > 0 ? allMetadata.reduce((p, c) => (p.created_at > c.created_at) ? p : c) : null;
  const finalFollowing = Math.max(...(results as any[]).map(r => r?.following || 0));
  return { metadata: finalMetadata, social: { following: finalFollowing, followers: finalFollowing > 0 ? Math.floor(finalFollowing * 1.5) : 0 }, network: { relays: relayHealth, timestamp: Date.now() }, fetched_at: Date.now() };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle WebSocket Upgrades for Durable Objects
    if (request.headers.get("Upgrade") === "websocket") {
       if (path.startsWith('/uplink/')) {
          const pubkey = path.split('/').pop();
          if (!pubkey) return new Response("Missing pubkey", { status: 400 });
          const id = env.NOSTR_AGENT.idFromName(pubkey);
          const obj = env.NOSTR_AGENT.get(id);
          return obj.fetch(request);
       }
    }

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

    // R2 Asset Proxy: GET /assets/:key
    if (path.startsWith('/assets/') && request.method === 'GET') {
      const key = path.split('/')[2];
      const object = await env.ASSETS.get(key);
      if (!object) return new Response("Asset Not Found", { status: 404 });
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Access-Control-Allow-Origin', '*');
      return new Response(object.body, { headers });
    }

    // Secure Upload: POST /upload
    if (path === '/upload' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const authEvent = JSON.parse(formData.get('event') as string);
        if (!authEvent || !verifyEvent(authEvent)) return new Response(JSON.stringify({ error: 'AUTH_FAILED' }), { status: 401, headers: CORS_HEADERS });
        const extension = file.name.split('.').pop();
        const key = `${authEvent.pubkey}/${crypto.randomUUID()}.${extension}`;
        await env.ASSETS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
        return new Response(JSON.stringify({ success: true, url: `${url.origin}/assets/${key}` }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      } catch (e) { return new Response(JSON.stringify({ error: 'UPLOAD_FAILED' }), { status: 500, headers: CORS_HEADERS }); }
    }

    // Profile handling...
    if (path.startsWith('/profile/')) {
      const pubkey = path.split('/')[2];
      const cacheKey = `identity_agg:${pubkey}`;
      
      if (request.method === 'POST') {
        const event = await request.json() as any;
        if (!event || !verifyEvent(event) || event.pubkey !== pubkey) return new Response(null, { status: 401, headers: CORS_HEADERS });
        const cached = await env.IDENTITY_CACHE.get(cacheKey);
        const baseData = cached ? JSON.parse(cached) : await aggregateIdentity(pubkey);
        baseData.metadata = JSON.parse(event.content);
        baseData.metadata.created_at = event.created_at;
        baseData.fetched_at = Date.now();
        await env.IDENTITY_CACHE.put(cacheKey, JSON.stringify(baseData), { expirationTtl: 3600 });
        return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
      }

      const cached = await env.IDENTITY_CACHE.get(cacheKey);
      if (cached) return new Response(cached, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
      const identity = await aggregateIdentity(pubkey);
      const body = JSON.stringify(identity);
      ctx.waitUntil(env.IDENTITY_CACHE.put(cacheKey, body, { expirationTtl: 3600 }));
      return new Response(body, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } });
    }

    // Nodes Management...
    if (path.startsWith('/nodes/')) {
       const pubkey = path.split('/')[2];
       if (request.method === 'GET') {
          const { results } = await env.DB.prepare('SELECT relay_url FROM user_relays WHERE pubkey = ?').bind(pubkey).all();
          return new Response(JSON.stringify({ relays: results.map((r: any) => r.relay_url) }), { headers: CORS_HEADERS });
       }
       if (request.method === 'POST') {
          const { event, relays } = await request.json() as any;
          if (!verifyEvent(event)) return new Response(null, { status: 401, headers: CORS_HEADERS });
          await env.DB.batch([env.DB.prepare('DELETE FROM user_relays WHERE pubkey = ?').bind(pubkey), ...relays.map((u: string) => env.DB.prepare('INSERT INTO user_relays (pubkey, relay_url) VALUES (?, ?)').bind(pubkey, u))]);
          return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
       }
    }

    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404, headers: CORS_HEADERS });
  },
};
