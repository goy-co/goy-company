import { drizzle } from 'drizzle-orm/d1';
import { eq, or, like } from 'drizzle-orm';
import { Relay } from 'nostr-tools/relay';
import * as schema from '../db/schema';
import { Env } from './types';

export async function aggregateIdentity(identifier: string, env: Env): Promise<any> {
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
