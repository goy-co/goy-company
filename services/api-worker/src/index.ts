import { getAuth } from './lib/auth';
import { CORS_HEADERS } from './lib/constants';
import { Env } from './lib/types';
import { ensureNostrKeys } from './lib/keys';
import { handleMigration } from './handlers/migration';
import { handleProfile } from './handlers/profile';

// Export Durable Objects for Cloudflare
export { NostrAgent } from "./agents/NostrAgent";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Global CORS Preflight
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

    const auth = getAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });
    
    // 2. Auto-Provisioning for Traditional Users (silent background task)
    if (session?.user) {
       ctx.waitUntil(ensureNostrKeys(session.user.id, env));
    }

    // 3. Routing Matrix
    
    // Identity Migration (Ritual)
    if (request.method === 'POST' && path === '/api/migrate-to-nostr') {
       return handleMigration(request, env);
    }

    // Better Auth Gateway
    if (path.startsWith("/api/auth")) {
       const res = await auth.handler(request);
       const newRes = new Response(res.body, res);
       Object.entries(CORS_HEADERS).forEach(([k, v]) => newRes.headers.set(k, v));
       return newRes;
    }

    // Profile Management (Hybrid Identity Aggregator)
    if (path.startsWith('/profile/')) {
       return handleProfile(request, env, ctx, session);
    }

    // Real-time Grid Uplink (Durable Object)
    if (request.headers.get("Upgrade") === "websocket" && path.startsWith('/uplink/')) {
       const pubkey = path.split('/').pop();
       if (!pubkey) return new Response(null, { status: 400 });
       return env.NOSTR_AGENT.get(env.NOSTR_AGENT.idFromName(pubkey)).fetch(request);
    }

    // Default Fallback
    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404, headers: CORS_HEADERS });
  },
};
