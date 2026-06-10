# Goy Grid Edge API (be-api)

This is the core infrastructure of The Goy Company, running on **Cloudflare Workers** and utilizing the full power of the Cloudflare ecosystem.

## 🛠 Tech Stack
- **Runtime**: Cloudflare Workers
- **State**: Durable Objects (Nostr Agents)
- **Database**: Cloudflare D1 (SQLite at the Edge)
- **Cache**: Cloudflare KV
- **Storage**: Cloudflare R2
- **Auth**: Better Auth with Drizzle ORM

## 🏗 Architectural Components

### Nostr Agents (Durable Objects)
Each user/identity is represented by a `NostrAgent` Durable Object. This ensures:
- Real-time WebSocket connectivity.
- Guaranteed message ordering for Nostr events.
- Highly available state management.

### Hybrid Identity Gateway
The API acts as a bridge between traditional Web2 authentication and the Nostr protocol, allowing for "Ritual" migrations of identity.

## 🚀 Deployment
Deploys are automated via the GitHub CD pipeline using `wrangler`.

```bash
# Apply migrations locally
make db-migrate-local

# View local database
make db-studio
```

---
&copy; 2026 The Goy Company. BSL 1.1 Licensed.
