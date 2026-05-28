import { expect, test } from 'vitest';
import { generateIdentity } from './index';

test('generates a valid nostr identity', () => {
  const identity = generateIdentity();
  expect(identity.privkey).toBeDefined();
  expect(identity.pubkey).toBeDefined();
  // nsec and npub are Bech32 encoded, typically 63 characters
  expect(identity.privkey.length).toBe(63);
  expect(identity.pubkey.length).toBe(63);
});
