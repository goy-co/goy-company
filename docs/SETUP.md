# Setup & Development // Joining the Grid

## Prerequisites
- **Node.js**: v20+ 
- **pnpm**: v9+
- **Wrangler**: For Cloudflare service development.
- **Nostr Extension**: (Optional) For sovereign uplink testing.

## Local Uplink Protocol

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Database Initialization**:
   Create a local D1 instance and run migrations:
   ```bash
   cd services/api-worker
   pnpm wrangler d1 migrations apply goy-db --local
   ```

3. **Start Development Environment**:
   From the root directory:
   ```bash
   # Start the API Worker (Edge Simulator)
   cd services/api-worker
   pnpm dev
   
   # Start the Identity App
   cd apps/identity-app
   pnpm dev
   ```

## Workflow Standards
- **Surgical Edits**: We do not perform mass refactors. Every change must be targeted.
- **Validation**: Run `pnpm test` before any PR.
- **Brutalist CSS**: When adding components, adhere to the `packages/ui` design tokens. No rounded corners. No gradients unless specified.

## Deployment
Deployment is handled automatically via GitHub Actions to Cloudflare Pages (Apps) and Cloudflare Workers (Services).

---

**WELCOME TO THE GRID. STAY EFFICIENT.**
