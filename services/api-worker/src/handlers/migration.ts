import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { Relay } from 'nostr-tools/relay';
import { finalizeEvent } from 'nostr-tools/pure';
import * as schema from '../db/schema';
import { decryptSecret } from '../lib/crypto';
import { CORS_HEADERS, DEFAULT_RELAYS } from '../lib/constants';
import { Env } from '../lib/types';

export async function handleMigration(request: Request, env: Env): Promise<Response> {
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

    // 2. Build final Nostr Metadata (Kind 0)
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

    // 4. Purge Centralized Identity
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
