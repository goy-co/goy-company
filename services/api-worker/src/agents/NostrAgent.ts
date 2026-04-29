import { DurableObject } from "cloudflare:workers";
import { Relay } from 'nostr-tools/relay';
import { Env } from "../lib/types";

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
