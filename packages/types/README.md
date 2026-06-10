# @goy-co/types

Shared TypeScript definitions and interfaces for the Goy Grid ecosystem. This package ensures type safety and consistency across the API, Frontend, and other packages.

## Features

- **Nostr Metadata**: Standardized interface for Kind 0 events.
- **UserProfile**: Unified profile structure for the Goy Identity aggregator.
- **Infrastructure Types**: Definitions for Ghost Operators and Grid Assets.

## Installation

```bash
pnpm add @goy-co/types
```

## Usage

```typescript
import { UserProfile, NostrMetadata } from '@goy-co/types';

const myProfile: UserProfile = {
  id: "user_123",
  metadata: {
    name: "Goy Dev",
    about: "Building the Grid."
  },
  social: {
    following: 10,
    followers: 100
  }
};
```

## License

This package is licensed under the **Business Source License 1.1 (BSL-1.1)**. See the LICENSE file in the project root for more details.
