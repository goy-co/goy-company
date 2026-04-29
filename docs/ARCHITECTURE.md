# Architecture // Monorepo Blueprint

The Goy Company monorepo is managed using **pnpm workspaces**. It is designed for high-performance delivery via the Cloudflare Edge network.

## Project Structure

### `/apps`
High-level user interfaces.
- **`corporate-site`**: The public-facing portal (Astro 5). Focuses on high-speed static delivery and corporate presence.
- **`identity-app`**: The "GoyID" dashboard. A Svelte 5-powered SPA embedded within Astro, focused on real-time identity management and asset control.

### `/services`
Backend logic and edge compute.
- **`api-worker`**: The central nervous system. A Cloudflare Worker handling Hybrid Identity lookups, Better Auth integration, and D1 database management. Includes:
  - **NostrAgent**: A Durable Object managing real-time WebSocket uplinks for telemetry and decentralized messaging.

### `/packages`
Shared logic and UI components.
- **`nostr`**: Core protocol implementation, signing logic, and relay interaction helpers.
- **`ui`**: Shared design tokens and primitive components (buttons, cards, modals) following the Brutalist Luxury spec.
- **`types`**: Common TypeScript definitions across the stack.

## Identity Flow
1. **Entry**: User selects Portal Access (Email) or Sync Access (Nostr).
2. **Aggregator**: The `api-worker` receives a request and performs a multi-layer lookup (D1 for traditional users, Nostr relays for sovereign ones).
3. **Uplink**: The `NostrAgent` Durable Object creates a live WebSocket link to synchronize the dashboard in real-time.

## Persistence Layer
- **Cloudflare D1**: Relational SQL database for traditional user data and sovereign metadata caching.
- **Cloudflare R2**: Asset storage for avatars, banners, and digital artifacts.
- **Nostr Relays**: The source of truth for all sovereign entity metadata.
