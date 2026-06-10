import { DurableObject } from "cloudflare:workers";
import { Relay } from 'nostr-tools/relay';
import { nip19 } from 'nostr-tools';
import { Env } from "../lib/types";
import { anchorIdentity } from "../lib/identity";
import { instrumentDurableObjectWithSentry } from "@sentry/cloudflare";

/**
 * NOSTR AGENT: Stateful listener and broadcaster.
 * Acts as the real-time bridge between the Decentralized Grid and the Goy ID Cockpit.
 */
class NostrAgentBase extends DurableObject {
  private sessions = new Set<WebSocket>();
  private relayConnections: Map<string, any> = new Map();
  private pubkey: string = "";
  private hexPubkey: string = "";
  private monitorInterval: any = null;
  private lastEventCreatedAt: number = 0;

  constructor(state: DurableObjectState, env: Env) { super(state, env); }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    this.pubkey = url.pathname.split('/').pop() || "";
    
    // Normalize to HEX for protocol consistency
    if (this.pubkey.startsWith('npub1')) {
      try {
        const decoded = nip19.decode(this.pubkey);
        if (decoded.type === 'npub') this.hexPubkey = (decoded.data as string).toLowerCase();
      } catch (e) {}
    } else if (/^[0-9a-f]{64}$/i.test(this.pubkey)) {
      this.hexPubkey = this.pubkey.toLowerCase();
    }

    // 1. WebSocket Entry (Uplink from Browser)
    if (request.headers.get("Upgrade") === "websocket") {
      const [client, server] = new WebSocketPair();
      await this.handleSession(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    // 2. Control Entry (Internal signals from Worker)
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
    
    // Connect to relays if not already active
    if (this.relayConnections.size === 0 && this.hexPubkey) {
      this.connectToRelays();
    }
    
    this.startNetworkMonitor();
    
    ws.addEventListener("close", () => {
      this.sessions.delete(ws);
      if (this.sessions.size === 0) {
        this.stopNetworkMonitor();
        // Keep relay connections alive for a while or close immediately
        // For now, we close to save resources
        this.relayConnections.forEach(r => { try { r.close(); } catch {} });
        this.relayConnections.clear();
      }
    });
  }

  private async connectToRelays() {
    const RELAYS = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.snort.social'];
    
    RELAYS.forEach(async (url) => {
      try {
        const relay = await Relay.connect(url);
        this.relayConnections.set(url, relay);
        
        // Listen for Metadata Updates (Kind 0)
        relay.subscribe([{ authors: [this.hexPubkey], kinds: [0] }], {
          onevent: async (event) => {
             // Only process if it's newer than what we've seen
             if (event.created_at <= this.lastEventCreatedAt) return;
             this.lastEventCreatedAt = event.created_at;

             console.log(`[AGENT_SYNC] Real-time event detected on ${url} for ${this.hexPubkey}`);

             try {
                const metadata = JSON.parse(event.content);
                
                // 1. Sync Internal Infrastructure (D1 + KV)
                await anchorIdentity(this.hexPubkey, metadata, this.env as any);

                // 2. Push to Browser UI
                this.broadcast({ 
                  type: 'metadata', 
                  content: metadata, 
                  rawEvent: event,
                  source: url 
                });

                // 3. Log Activity
                this.broadcast({ type: 'activity', content: event });

             } catch (e) {
                console.error(`[AGENT_SYNC] Failed to process real-time metadata:`, e);
             }
          }
        });
      } catch (e) {}
    });
  }

  private startNetworkMonitor() {
    if (this.monitorInterval) return;
    this.monitorInterval = setInterval(() => this.pingRelays(), 30000);
  }

  private stopNetworkMonitor() {
    if (this.monitorInterval) { clearInterval(this.monitorInterval); this.monitorInterval = null; }
  }

  private async pingRelays() {
    const healthReport: Record<string, any> = {};
    const relayUrls = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.snort.social'];

    const promises = relayUrls.map(async (url) => {
      const start = Date.now();
      try {
        const relay = this.relayConnections.get(url);
        if (relay) {
           healthReport[url] = { status: 'ONLINE', latency: Date.now() - start };
        } else {
           healthReport[url] = { status: 'OFFLINE', latency: 999 };
        }
      } catch { healthReport[url] = { status: 'ERROR', latency: 999 }; }
    });
    
    await Promise.all(promises);
    this.broadcast({ type: 'network_update', relays: healthReport });
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

export const NostrAgent = instrumentDurableObjectWithSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  })
)(NostrAgentBase);
