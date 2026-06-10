# Contributing to The Goy Company

First off, thank you for considering contributing to the Goy Grid! It's people like you that make decentralization possible.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct: be respectful, be professional, and stay focused on the mission of digital sovereignty.

## Our Development Workflow

We use a Monorepo structure managed by **pnpm** and **Turborepo**.

1. **Fork and Clone**: Fork the repository and create your feature branch.
2. **Standard Commands**:
   - `make install`: Setup your environment.
   - `make dev-grid`: Run the ecosystem locally.
   - `make lint`: Ensure your code follows our style guides.
   - `make test`: Ensure no regressions were introduced.
3. **Creating Changesets**: Every contribution that affects packages must include a changeset. Use `make change` to generate one.
4. **Pull Requests**: Open a PR against the `main` branch. Provide a clear description of your changes.

## License Agreement

By contributing to this repository, you agree that your contributions will be licensed under the project's **Business Source License 1.1 (BSL 1.1)**.

---

Questions? Reach out to us via [Nostr](https://primal.net/p/npub1...) or join our community discussions.
