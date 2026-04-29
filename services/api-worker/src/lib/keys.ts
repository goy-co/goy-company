import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import * as schema from '../db/schema';
import { decryptSecret, encryptSecret } from './crypto';
import { Env } from './types';

// --- KEY PROVISIONING ---
export async function ensureNostrKeys(userId: string, env: Env): Promise<{ pubkey: string, nsec: string }> {
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
