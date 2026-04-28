import { Relay } from 'nostr-tools/relay';
import { verifyEvent } from 'nostr-tools/pure';
import { DurableObject } from "cloudflare:workers";
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema';
import { getAuth } from './lib/auth';

/**
 * NOSTR AGENT: Stateful listener and broadcaster.
 * Focuses on infrastructure, metadata and technical logs.
 */
export class NostrAgent extends DurableObject {
  private sessions = new Set<WebSocket>();
  private relayConnections: Map<string, any> = new Map();
  private pubkey: string = "";
  private monitorInterval: any = null;

  constructor(state: DurableObjectState, env: Env) { super(state, env); }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    this.pubkey = url.pathname.split('/').pop() || "";
    if (request.headers.get("Upgrade") === "websocket") {
      const [client, server] = new WebSocketPair();
      await this.handleSession(server);
      return new Response(null, { status: 101, webSocket: client });
    }
    if (request.method === 'POST') {
      const data = await request.json() as any;
      this.broadcast(data);
      return new Response("OK");
    }
    return new Response("Expected WebSocket", { status: 426 });
  }

  private async handleSession(ws: WebSocket) {
    this.sessions.add(ws);
    ws.accept();
    if (this.relayConnections.size === 0) {
      this.connectToRelays();
      this.startNetworkMonitor();
    }
    ws.addEventListener("close", () => {
      this.sessions.delete(ws);
      if (this.sessions.size === 0) this.stopNetworkMonitor();
    });
  }

  private async connectToRelays() {
    const RELAYS = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://nos.lol'];
    RELAYS.forEach(async (url) => {
      try {
        const relay = await Relay.connect(url);
        this.relayConnections.set(url, relay);
        relay.subscribe([{ authors: [this.pubkey], kinds: [0] }], {
          onevent: (event) => {
             this.broadcast({ type: 'activity', content: event });
             if (event.kind === 0) this.broadcast({ type: 'metadata', content: JSON.parse(event.content), rawEvent: event });
          }
        });
      } catch (e) {}
    });
  }

  private startNetworkMonitor() {
    this.monitorInterval = setInterval(() => this.pingRelays(), 45000);
  }

  private stopNetworkMonitor() {
    if (this.monitorInterval) { clearInterval(this.monitorInterval); this.monitorInterval = null; }
  }

  private async pingRelays() {
    const healthReport: Record<string, any> = {};
    const promises = Array.from(this.relayConnections.keys()).map(async (url) => {
      const start = Date.now();
      try {
        const relay = this.relayConnections.get(url);
        await new Promise((resolve) => {
          const sub = relay.subscribe([{ limit: 1 }], { ononeose: () => { sub.close(); resolve(true); } });
          setTimeout(() => { sub.close(); resolve(true); }, 2000);
        });
        healthReport[url] = { status: 'ONLINE', latency: Date.now() - start };
      } catch { healthReport[url] = { status: 'OFFLINE', latency: 999 }; }
    });
    await Promise.all(promises);
    this.broadcast({ type: 'network_update', relays: healthReport });
  }

  private broadcast(data: any) {
    const message = JSON.stringify(data);
    for (const session of this.sessions) {
      try { session.send(message); } catch (e) { this.sessions.delete(session); }
    }
  }
}

export interface Env {
  IDENTITY_CACHE: KVNamespace;
  DB: D1Database;
  ASSETS: R2Bucket;
  NOSTR_AGENT: DurableObjectNamespace<NostrAgent>;
  BETTER_AUTH_SECRET: string;
}

const DEFAULT_RELAYS = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://nos.lol'];
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

async function aggregateIdentity(pubkey: string, env: Env): Promise<any> {
  const db = drizzle(env.DB);
  const metadata: any = { content: null, created_at: 0 };

  try {
    const userRelayList = await db.select().from(schema.userRelays).where(eq(schema.userRelays.pubkey, pubkey));
    const relayList = userRelayList.length > 0 ? userRelayList.map(r => r.relayUrl) : DEFAULT_RELAYS;

    const relay = await Relay.connect(relayList[0] || 'wss://relay.damus.io');
    await new Promise((resolve) => {
      const sub = relay.subscribe([{ kinds: [0], authors: [pubkey], limit: 1 }], {
        onevent(event: any) {
          metadata.content = JSON.parse(event.content);
          metadata.created_at = event.created_at;
          metadata.raw = event;
        },
        ononeose() { sub.close(); resolve(true); }
      });
      setTimeout(() => { sub.close(); resolve(true); }, 3000);
    });
    relay.close();

    return { metadata: metadata.content, fetched_at: Date.now() };
  } catch (e) {
    return { metadata: null, fetched_at: Date.now() };
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const db = drizzle(env.DB);
    const auth = getAuth(env.DB, env);

    if (path.startsWith("/api/auth")) return auth.handler(request);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

    if (request.headers.get("Upgrade") === "websocket" && path.startsWith('/uplink/')) {
       const pubkey = path.split('/').pop();
       if (!pubkey) return new Response(null, { status: 400 });
       return env.NOSTR_AGENT.get(env.NOSTR_AGENT.idFromName(pubkey)).fetch(request);
    }

    if (path.startsWith('/profile/')) {
      const pubkey = path.split('/')[2];
      const cacheKey = `identity_agg:${pubkey}`;

      if (request.method === 'POST') {
        const identity = await aggregateIdentity(pubkey, env);
        await env.IDENTITY_CACHE.put(cacheKey, JSON.stringify(identity), { expirationTtl: 3600 });
        return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
      }

      const cachedBody = await env.IDENTITY_CACHE.get(cacheKey);
      ctx.waitUntil((async () => {
        try {
          const fresh = await aggregateIdentity(pubkey, env);
          if (cachedBody) {
            const cached = JSON.parse(cachedBody);
            if ((fresh.metadata?.created_at || 0) > (cached.metadata?.created_at || 0)) {
              await env.IDENTITY_CACHE.put(cacheKey, JSON.stringify(fresh), { expirationTtl: 3600 });
              const id = env.NOSTR_AGENT.idFromName(pubkey);
              await env.NOSTR_AGENT.get(id).fetch(new Request(`${url.origin}/internal`, {
                method: 'POST',
                body: JSON.stringify({ type: 'metadata', content: fresh.metadata, rawEvent: fresh.metadata.raw })
              }));
            }
          } else {
            await env.IDENTITY_CACHE.put(cacheKey, JSON.stringify(fresh), { expirationTtl: 3600 });
          }
        } catch (e) {}
      })());

      if (cachedBody) return new Response(cachedBody, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } });
      const identity = await aggregateIdentity(pubkey, env);
      await env.IDENTITY_CACHE.put(cacheKey, JSON.stringify(identity), { expirationTtl: 3600 });
      return new Response(JSON.stringify(identity), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } });
    }

    if (path.startsWith('/nodes/')) {
       const pubkey = path.split('/')[2];
       if (request.method === 'GET') {
          const relays = await db.select().from(schema.userRelays).where(eq(schema.userRelays.pubkey, pubkey));
          return new Response(JSON.stringify({ relays: relays.map(r => r.relayUrl) }), { headers: CORS_HEADERS });
       }
       if (request.method === 'POST') {
          const { event, relays } = await request.json() as any;
          if (!verifyEvent(event)) return new Response(null, { status: 401 });
          await db.delete(schema.userRelays).where(eq(schema.userRelays.pubkey, pubkey));
          if (relays.length > 0) await db.insert(schema.userRelays).values(relays.map((u: string) => ({ pubkey, relayUrl: u })));
          return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
       }
    }

    if (path.startsWith('/assets/')) {
      const key = path.split('/')[2];
      const object = await env.ASSETS.get(key);
      if (!object) return new Response(null, { status: 404 });
      const headers = new Headers(); object.writeHttpMetadata(headers);
      headers.set('Access-Control-Allow-Origin', '*');
      return new Response(object.body, { headers });
    }
    
    if (path === '/upload') {
       const formData = await request.formData();
       const file = formData.get('file') as File;
       const auth = JSON.parse(formData.get('event') as string);
       if (!verifyEvent(auth)) return new Response(null, { status: 401 });
       const key = `${auth.pubkey}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
       await env.ASSETS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
       return new Response(JSON.stringify({ success: true, url: `${url.origin}/assets/${key}` }), { headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404, headers: CORS_HEADERS });
  },
};
