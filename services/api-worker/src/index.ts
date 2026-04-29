import { Relay } from 'nostr-tools/relay';
import { verifyEvent, generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools/pure';
import { DurableObject } from "cloudflare:workers";
import { drizzle } from 'drizzle-orm/d1';
import { eq, or, like } from 'drizzle-orm';
import * as schema from './db/schema';
import { getAuth } from './lib/auth';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'http://localhost:4321',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Better-Auth-Policy',
  'Access-Control-Allow-Credentials': 'true'
};

/**
 * NOSTR AGENT: Stateful listener and broadcaster.
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
    const isSovereign = /^[0-9a-f]{64}$/.test(this.pubkey);
    if (this.relayConnections.size === 0 && isSovereign) {
      this.connectToRelays();
    }
    this.startNetworkMonitor();
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
    const relayUrls = this.relayConnections.size > 0 
      ? Array.from(this.relayConnections.keys()) 
      : ['wss://relay.primal.net', 'wss://relay.damus.io'];

    const promises = relayUrls.map(async (url) => {
      const start = Date.now();
      try {
        const relay = this.relayConnections.get(url) || await Relay.connect(url);
        if (!this.relayConnections.has(url)) relay.close();
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
  ENVIRONMENT: string;
}

const DEFAULT_RELAYS = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://nos.lol'];

// --- CRYPTO SUITE (AES-GCM) ---
async function encryptSecret(text: string, masterKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(masterKey));
  const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(text));
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decryptSecret(cipher: string, masterKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const combined = new Uint8Array(atob(cipher).split("").map(c => c.charCodeAt(0)));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const keyBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(masterKey));
  const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

// --- KEY PROVISIONING ---
async function ensureNostrKeys(userId: string, env: Env): Promise<{ pubkey: string, nsec: string }> {
  const db = drizzle(env.DB, { schema });
  const user = await db.query.user.findFirst({ where: eq(schema.user.id, userId) });
  
  if (user?.pubkey && user?.nsec) {
    const nsec = await decryptSecret(user.nsec, env.BETTER_AUTH_SECRET);
    return { pubkey: user.pubkey, nsec };
  }

  // Generate New Identity
  const skBytes = generateSecretKey();
  const pk = getPublicKey(skBytes);
  const toHex = (bytes: Uint8Array) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const sk = toHex(skBytes);
  const encryptedSk = await encryptSecret(sk, env.BETTER_AUTH_SECRET);

  await db.update(schema.user)
    .set({ pubkey: pk, nsec: encryptedSk })
    .where(eq(schema.user.id, userId));

  return { pubkey: pk, nsec: sk };
}

async function aggregateIdentity(identifier: string, env: Env): Promise<any> {
  const db = drizzle(env.DB, { schema });
  
  // Normalize identifier
  const cleanId = identifier.replace('GUEST_', '');
  
  try {
    // 1. Search in D1 with maximum flexibility
    const d1User = await db.query.user.findFirst({
      where: or(
        eq(schema.user.id, cleanId),
        eq(schema.user.pubkey, identifier),
        like(schema.user.id, `${cleanId}%`)
      )
    });

    if (d1User) {
      return {
        metadata: {
          name: d1User.name || '',
          display_name: d1User.displayName || d1User.name || 'ANONYMOUS',
          picture: d1User.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${d1User.id}`,
          banner: d1User.banner || '',
          about: d1User.bio || '',
          website: d1User.website || '',
          nip05: d1User.nip05 || '',
          lud16: d1User.lud16 || '',
          pubkey: d1User.pubkey || d1User.id,
          is_d1_user: true,
          has_nsec: !!d1User.nsec
        },
        fetched_at: Date.now()
      };
    }
  } catch (e) {
    console.error('D1_QUERY_ERROR:', e);
  }

  // 2. Nostr Fallback (Standard 64-char hex pubkey only)
  if (/^[0-9a-f]{64}$/.test(identifier)) {
    const metadata: any = { content: null };
    try {
      const relay = await Relay.connect('wss://relay.damus.io');
      await new Promise((resolve) => {
        const sub = relay.subscribe([{ kinds: [0], authors: [identifier], limit: 1 }], {
          onevent(event: any) { try { metadata.content = JSON.parse(event.content); } catch {} },
          ononeose() { sub.close(); resolve(true); }
        });
        setTimeout(() => { sub.close(); resolve(true); }, 2000);
      });
      relay.close();
      if (metadata.content) return { metadata: metadata.content, fetched_at: Date.now() };
    } catch (e) {}
  }

  // 3. Absolute Fallback
  return { 
    metadata: {
      name: `ENTITY_${identifier.slice(0, 8)}`,
      display_name: `GUEST_${identifier.slice(0, 8)}`,
      picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${identifier}`,
      pubkey: identifier
    }, 
    fetched_at: Date.now() 
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

    const auth = getAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });
    
    // Auto-Provisioning for Traditional Users
    if (session?.user) {
       ctx.waitUntil(ensureNostrKeys(session.user.id, env));
    }

    if (request.method === 'POST' && path === '/api/migrate-to-nostr') {
       try {
         const db = drizzle(env.DB, { schema });
         const body = await request.json() as any;
         const userId = body.userId;
         if (!userId) return new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401, headers: CORS_HEADERS });

         const d1User = await db.query.user.findFirst({ where: eq(schema.user.id, userId) });
         if (!d1User || !d1User.nsec) return new Response(JSON.stringify({ error: 'USER_NOT_FOUND_OR_NOT_PROVISIONED' }), { status: 404, headers: CORS_HEADERS });

         // 1. Retrieve Provisioned Keys
         const sk = await decryptSecret(d1User.nsec, env.BETTER_AUTH_SECRET);
         const pk = d1User.pubkey!;

         // 2. Build final Nostr Metadata (Kind 0) to ensure relays are updated
         const metadata = {
           name: d1User.name || '',
           display_name: d1User.displayName || d1User.name || 'ANONYMOUS',
           picture: d1User.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${d1User.id}`,
           banner: d1User.banner || '',
           about: d1User.bio || '',
           website: d1User.website || '',
           nip05: d1User.nip05 || '',
           lud16: d1User.lud16 || ''
         };

         const skBytes = new Uint8Array(sk.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
         const eventTemplate = {
           kind: 0,
           created_at: Math.floor(Date.now() / 1000),
           tags: [],
           content: JSON.stringify(metadata)
         };
         const signedEvent = finalizeEvent(eventTemplate, skBytes);

         // 3. Multicast to Relays
         const publishPromises = DEFAULT_RELAYS.map(async (url) => {
           try {
             const relay = await Relay.connect(url);
             await relay.publish(signedEvent);
             relay.close();
           } catch (e) {}
         });
         await Promise.allSettled(publishPromises);

         // 4. Purge Centralized Identity (The Ritual)
         await db.delete(schema.session).where(eq(schema.session.userId, userId));
         await db.delete(schema.account).where(eq(schema.account.userId, userId));
         await db.delete(schema.user).where(eq(schema.user.id, userId));

         // Clear cache
         await env.IDENTITY_CACHE.delete(`identity_agg:${pk}`);

         return new Response(JSON.stringify({ 
           success: true, 
           keys: { privkey: sk, pubkey: pk } 
         }), { headers: CORS_HEADERS });
       } catch (e: any) {
         return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
       }
    }

    if (path.startsWith("/api/auth")) {
       const res = await auth.handler(request);
       const newRes = new Response(res.body, res);
       Object.entries(CORS_HEADERS).forEach(([k, v]) => newRes.headers.set(k, v));
       return newRes;
    }

    if (path.startsWith('/profile/')) {
      try {
        const identifier = path.split('/')[2];

        if (request.method === 'POST') {
           const body = await request.json() as any;
           
           // A: Sovereign Path (Signed Event)
           if (body.sig && body.pubkey) {
              if (!verifyEvent(body)) return new Response("INVALID_SIG", { status: 400, headers: CORS_HEADERS });
              await env.IDENTITY_CACHE.put(`identity_agg:${body.pubkey}`, JSON.stringify({ metadata: JSON.parse(body.content), fetched_at: Date.now() }), { expirationTtl: 3600 });
              return new Response(JSON.stringify({ success: true }), { headers: CORS_HEADERS });
           }

           // B: Traditional Path (Raw JSON + Session)
           if (!session?.user) return new Response("UNAUTHORIZED", { status: 401, headers: CORS_HEADERS });
           const keys = await ensureNostrKeys(session.user.id, env);
           
           const skHex = keys.nsec.trim();
           const skBytes = new Uint8Array(skHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
           
           const eventTemplate = {
             kind: 0,
             created_at: Math.floor(Date.now() / 1000),
             tags: [],
             content: JSON.stringify(body)
           };
           const signedEvent = finalizeEvent(eventTemplate, skBytes);

           // Broadcast to relays
           ctx.waitUntil(Promise.all(DEFAULT_RELAYS.map(async (url) => {
              try {
                const relay = await Relay.connect(url);
                await relay.publish(signedEvent);
                relay.close();
              } catch (e) {}
           })));

           // Immediate KV update for speed
           await env.IDENTITY_CACHE.put(`identity_agg:${keys.pubkey}`, JSON.stringify({ metadata: body, fetched_at: Date.now() }), { expirationTtl: 3600 });
           
           return new Response(JSON.stringify({ success: true, pubkey: keys.pubkey }), { headers: CORS_HEADERS });
        }

        const identity = await aggregateIdentity(identifier, env);
        return new Response(JSON.stringify(identity), { 
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } 
        });
      } catch (e: any) {
        console.error('PROFILE_ERROR:', e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
      }
    }

    if (request.headers.get("Upgrade") === "websocket" && path.startsWith('/uplink/')) {
       const pubkey = path.split('/').pop();
       if (!pubkey) return new Response(null, { status: 400 });
       return env.NOSTR_AGENT.get(env.NOSTR_AGENT.idFromName(pubkey)).fetch(request);
    }

    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404, headers: CORS_HEADERS });
  },
};
