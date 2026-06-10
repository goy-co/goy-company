/**
 * Copyright (c) 2026 The Goy Company
 * Licensed under the Business Source License 1.1 (BSL 1.1)
 * See LICENSE file in the project root for details.
 */

import { withSentry } from "@sentry/cloudflare";
import { getAuth } from './lib/auth';
import { CORS_HEADERS_BASE } from './lib/constants';
import { Env } from './lib/types';
import { ensureNostrKeys } from './lib/keys';
import { handleMigration } from './handlers/migration';
import { handleProfile } from './handlers/profile';

// Export Durable Objects for Cloudflare
export { NostrAgent } from "./agents/NostrAgent";

/**
 * Dynamic CORS helper to support multiple origins (dev/prod)
 */
export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = { ...CORS_HEADERS_BASE };
  
  if (origin) {
    const isLocalhost = origin.includes('localhost:');
    const isOfficial = origin === 'https://goycompany.com' || origin === 'https://identity.goycompany.com' || origin.endsWith('.goycompany.workers.dev');
    
    if (isLocalhost || isOfficial) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  }
  return headers;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = getCorsHeaders(request);

    // 1. Global CORS Preflight
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    const auth = getAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });
    
    // 2. Auto-Provisioning for Traditional Users (silent background task)
    if (session?.user) {
       ctx.waitUntil(ensureNostrKeys(session.user.id, env));
    }

    // 3. Routing Matrix
    
    // Identity Migration (Ritual)
    if (request.method === 'POST' && path === '/api/migrate-to-nostr') {
       return handleMigration(request, env, session);
    }

    // Better Auth Gateway
    if (path.startsWith("/api/auth")) {
       const res = await auth.handler(request);
       const newRes = new Response(res.body, res);
       Object.entries(corsHeaders).forEach(([k, v]) => newRes.headers.set(k, v));
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
    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404, headers: corsHeaders });
  },
};

export default withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    enabled: !!env.SENTRY_DSN,
    environment: env.ENVIRONMENT,
  }),
  worker
);
