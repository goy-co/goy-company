# @goy-co/nostr

Nostr protocol utilities for The Goy Company ecosystem. This package provides a high-level API for handling Nostr identities, signing events, and communicating with relays.

## Features

- **Identity Management**: Generate and decode `nsec`/`npub`.
- **Event Signing**: Sign events using secret keys or browser extensions (NIP-07).
- **Relay Communication**: Easy abstraction for fetching profiles and subscribing to events.
- **Hybrid Identity**: Helpers for bridging traditional accounts with Nostr.

## Installation

```bash
pnpm add @goy-co/nostr
```

## Usage

### Generating an Identity

```typescript
import { generateIdentity } from '@goy-co/nostr';

const { privkey, pubkey } = generateIdentity();
console.log(`Private: ${privkey}, Public: ${pubkey}`);
```

### Fetching a Profile

```typescript
import { fetchFullIdentity } from '@goy-co/nostr';

const profile = await fetchFullIdentity('npub1...');
console.log(profile.metadata.name);
```

## License

This package is licensed under the **Business Source License 1.1 (BSL-1.1)**. See the LICENSE file in the project root for more details.
