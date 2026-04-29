# Tech Stack // The Grid's Internal Organs

We use a high-performance, edge-first technology stack optimized for low latency and developer velocity.

## Frontend
- **Astro 5**: The backbone of our applications. Used for SSR and static site generation.
- **Svelte 5 (Runes)**: Used for all interactive modules. We leverage Runes for fine-grained reactivity in the Identity Dashboard.
- **Vanilla CSS / Tailwind**: Styling is kept close to the metal. We avoid heavy component libraries, preferring custom brutalist primitives.

## Backend / Edge
- **Cloudflare Workers**: Serverless execution at the edge.
- **Cloudflare Durable Objects**: For stateful, real-time coordination (The `NostrAgent`).
- **Cloudflare D1**: SQLite at the edge for relational data.
- **Drizzle ORM**: Type-safe database interactions with D1.

## Protocols
- **Nostr (Notes and Other Stuff Transmitted by Relays)**: The fundamental protocol for identity and communication.
- **Better Auth**: Handles the traditional auth path (Email/Password) with D1 persistence.
- **Liquid Network**: Used for $GOYCO balance and asset management (Sidechain of Bitcoin).

## Dev Tooling
- **pnpm**: Fast, disk-space-efficient package management.
- **TypeScript**: Strict typing across the entire monorepo.
- **Vitest / Playwright**: Automated testing for logic and UI integrity.
- **Makefile**: For common orchestration tasks (DB migrations, studio, etc.).
