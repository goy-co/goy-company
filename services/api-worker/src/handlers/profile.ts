import { verifyEvent, finalizeEvent } from 'nostr-tools';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { Env } from '../lib/types';
import { ensureNostrKeys } from '../lib/keys';
import { aggregateIdentity, anchorIdentity } from '../lib/identity';
import { broadcastToGrid } from '../lib/broadcast';
import { getCorsHeaders } from '../index';

export async function handleProfile(
  request: Request, 
  env: Env, 
  ctx: ExecutionContext, 
  session: any
): Promise<Response> {
  const url = new URL(request.url);
  const identifier = url.pathname.split('/')[2];
  const db = drizzle(env.DB, { schema });
  const corsHeaders = getCorsHeaders(request);

  try {
    if (request.method === 'POST') {
      const body = await request.json() as any;
      
      // A: Sovereign Path (Signed Event)
      if (body.sig && body.pubkey) {
        if (!verifyEvent(body)) return new Response("INVALID_SIG", { status: 400, headers: corsHeaders });
        
        // Only update cache and broadcast if it's a Metadata Event (Kind 0)
        if (body.kind === 0) {
           const metadata = JSON.parse(body.content);
           const pk = body.pubkey.toLowerCase();

           // 1. Robust Anchor (D1 + KV)
           const kvPayload = await anchorIdentity(pk, metadata, env);
           
           // 2. Grid Agent Uplink
           ctx.waitUntil(env.NOSTR_AGENT.get(env.NOSTR_AGENT.idFromName(pk)).fetch(new Request(`http://uplink/uplink/${pk}`, {
              method: 'POST',
              body: JSON.stringify({ type: 'metadata', content: kvPayload.metadata, rawEvent: body })
           })));

           // 3. Decentralized Broadcast
           ctx.waitUntil(broadcastToGrid(body));
        }
        
        return new Response(JSON.stringify({ success: true, kind: body.kind }), { headers: corsHeaders });
      }

      // B: Traditional Path (Raw JSON + Session)
      if (!session?.user) return new Response("UNAUTHORIZED", { status: 401, headers: corsHeaders });
      const keys = await ensureNostrKeys(session.user.id, env);
      
      // Clean metadata payload for D1 update logic (handled by anchorIdentity)
      const kvPayload = await anchorIdentity(keys.pubkey, body, env);
      
      // Sign for Nostr
      const skHex = keys.nsec.trim();
      const skBytes = new Uint8Array(skHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      
      const eventTemplate = {
        kind: 0,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify(kvPayload.metadata)
      };
      const signedEvent = finalizeEvent(eventTemplate, skBytes);

      // Uplink and Broadcast
      ctx.waitUntil(env.NOSTR_AGENT.get(env.NOSTR_AGENT.idFromName(keys.pubkey)).fetch(new Request(`http://uplink/uplink/${keys.pubkey}`, {
        method: 'POST',
        body: JSON.stringify({ type: 'metadata', content: kvPayload.metadata, rawEvent: signedEvent })
      })));
      ctx.waitUntil(broadcastToGrid(signedEvent));
      
      return new Response(JSON.stringify({ success: true, pubkey: keys.pubkey }), { headers: corsHeaders });
    }

    const identity = await aggregateIdentity(identifier, env, ctx);
    return new Response(JSON.stringify(identity), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } 
    });
  } catch (e: any) {
    console.error('PROFILE_ERROR:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
}
