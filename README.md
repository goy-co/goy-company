# The Goy Company - Global Infrastructure

Welcome to the official monorepo of **The Goy Company**. We are building a decentralized, sovereign ecosystem powered by the Nostr protocol and modern edge computing. Our mission is to restore digital autonomy to individuals and organizations through the **Goy Grid**.

## 🌐 Ecosystem Overview

This monorepo contains the following core components:

### Applications
- **[fe-corporate](./apps/fe-corporate)**: The public face of The Goy Company. Built with Astro and Svelte.
- **[fe-identity](./apps/fe-identity)**: The Goy Identity aggregator and dashboard. Manage your hybrid identity (Web2 + Nostr).
- **[be-api](./apps/be-api)**: High-performance Edge API running on Cloudflare Workers and Durable Objects.

### Public Packages (@goy-co)
These packages are available on [GitHub Packages](https://github.com/orgs/goy-co/packages) for the community to build upon:
- **`@goy-co/nostr`**: Agnostic Nostr protocol utilities for identity and relay communication.
- **`@goy-co/types`**: Standardized TypeScript definitions for the Goy Grid ecosystem.
- **`@goy-co/design-system`**: Branding tokens, colors, and visual philosophy.

---

## 🛠 Developer Guide

### Prerequisites
- [pnpm](https://pnpm.io/) (v9+)
- [Node.js](https://nodejs.org/) (v20+)

### Quick Start
```bash
# Install dependencies
make install

# Start the entire grid (API + Sites) in development mode
make dev-grid
```

### Automation & Releases
We use a standardized "Big Tech" workflow orchestrated via `Makefile`:
- `make change`: Create a new release record (Changeset).
- `make release`: Build, test, and push to trigger the automated release pipeline.
- `make test`: Run the test suite across all packages.

---

## ⚖️ License & Contributions

### License
This repository is licensed under the **Business Source License 1.1 (BSL 1.1)**. 
- You are free to read, audit, and use this code for non-commercial purposes.
- Commercial use of the Goy Grid infrastructure requires a specific agreement with The Goy Company.
- Certain public packages (under `packages/`) may have more permissive usage within the BSL terms.

### Contributing
Please read our **[CONTRIBUTING.md](./CONTRIBUTING.md)** for details on our code of conduct and the process for submitting pull requests.

### Security
If you discover a security vulnerability, please refer to our **[SECURITY.md](./SECURITY.md)**. **Do not report security issues via public GitHub issues.**

---

&copy; 2026 The Goy Company. All rights reserved.
