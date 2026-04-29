import { Relay } from 'nostr-tools/relay';
import { verifyEvent, finalizeEvent } from 'nostr-tools/pure';
import { CORS_HEADERS, DEFAULT_RELAYS } from '../lib/constants';
import { Env } from '../lib/types';
import { ensureNostrKeys } from '../lib/keys';
import { aggregateIdentity } from '../lib/identity';

export async function handleProfile(
  request: Request, 
  env: Env, 
  ctx: ExecutionContext, 
  session: any
): Promise<Response> {
  const url = new URL(request.url);
  const identifier = url.pathname.split('/')[2];

  try {
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
