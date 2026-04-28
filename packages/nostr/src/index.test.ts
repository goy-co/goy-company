import { expect, test } from 'vitest';
import { generateIdentity } from './index';

test('generates a valid nostr identity', () => {
  const identity = generateIdentity();
  expect(identity.privkey).toBeDefined();
  expect(identity.pubkey).toBeDefined();
  expect(identity.privkey.length).toBe(64);
  expect(identity.pubkey.length).toBe(64);
});
