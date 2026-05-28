# Monorepo Restructuring & Global Configs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate services into apps, rename with functional prefixes and @goy scope, centralize TS/ESLint configs, and standardize on pnpm.

**Architecture:** Functional prefixing for apps (`fe-`, `be-`), scoped naming (`@goy/*`), and configuration inheritance from `packages/`.

**Tech Stack:** pnpm workspaces, TypeScript, ESLint (Flat Config), Cloudflare Workers, Astro.

---

### Task 1: Initialize Configuration Packages

**Files:**
- Create: `packages/config-ts/package.json`
- Create: `packages/config-ts/base.json`
- Create: `packages/config-ts/astro.json`
- Create: `packages/config-eslint/package.json`
- Create: `packages/config-eslint/index.js`

- [ ] **Step 1: Create `packages/config-ts/package.json`**
```json
{
  "name": "@goy/config-ts",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./base.json": "./base.json",
    "./astro.json": "./astro.json"
  }
}
```

- [ ] **Step 2: Create `packages/config-ts/base.json`**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true
  }
}
```

- [ ] **Step 3: Create `packages/config-eslint/package.json`**
```json
{
  "name": "@goy/config-eslint",
  "version": "0.0.0",
  "private": true,
  "main": "index.js"
}
```

- [ ] **Step 4: Create `packages/config-eslint/index.js`**
Define a basic ESM flat config.

- [ ] **Step 5: Commit config scaffolding**
```bash
git add packages/config-ts packages/config-eslint
git commit -m "chore: scaffold global config packages"
```

### Task 2: Migrate Design System & Cleanup Bun

**Files:**
- Move: `design-system/the-goy-company` -> `packages/design-system`
- Create: `packages/design-system/package.json`
- Delete: `bun.lock`, `apps/corporate-site/bun.lock`

- [x] **Step 1: Move design-system**
```bash
git mv design-system/the-goy-company packages/design-system
```

- [x] **Step 2: Create `packages/design-system/package.json`**
```json
{
  "name": "@goy/design-system",
  "version": "0.0.0",
  "private": true
}
```

- [x] **Step 3: Remove bun.lock files**
```bash
rm bun.lock apps/corporate-site/bun.lock
```

- [x] **Step 4: Commit migration and cleanup**
```bash
git add .
git commit -m "chore: migrate design-system and remove bun.lock files"
```

### Task 3: Restructure Apps and Services

**Files:**
- Move: `apps/corporate-site` -> `apps/fe-corporate`
- Move: `apps/identity-app` -> `apps/fe-identity`
- Move: `apps/goy-hub` -> `apps/fe-hub`
- Move: `services/api-worker` -> `apps/be-api`

- [ ] **Step 1: Execute git mv commands**
```bash
git mv apps/corporate-site apps/fe-corporate
git mv apps/identity-app apps/fe-identity
git mv apps/goy-hub apps/fe-hub
git mv services/api-worker apps/be-api
rmdir services
```

- [ ] **Step 2: Update `package.json` names**
Update `name` field in each app's `package.json` to `@goy/fe-corporate`, `@goy/fe-identity`, `@goy/fe-hub`, and `@goy/be-api`.

- [ ] **Step 3: Add config dependencies**
Add `@goy/config-ts` and `@goy/config-eslint` to `devDependencies` of all apps.

- [ ] **Step 4: Run pnpm install**
Link the new workspace members.

- [ ] **Step 5: Commit restructuring**
```bash
git add .
git commit -m "refactor: restructure apps with functional prefixes and @goy scope"
```

### Task 4: Update Workspace, Tooling, and Hardcoded URLs

**Files:**
- Modify: `pnpm-workspace.yaml`, `Makefile`, `package.json` (root)
- Modify: `apps/be-api/wrangler.jsonc`
- Modify: `packages/nostr/src/index.ts`, `apps/fe-identity/src/lib/auth-client.ts`

- [ ] **Step 1: Update `pnpm-workspace.yaml`**
Include `apps/*` and `packages/*`.

- [ ] **Step 2: Update `Makefile` & Root `package.json` scripts**
Update all `--filter` commands and script names (e.g., `dev:corporate` -> `dev:fe-corporate`). Fix `clean` paths.

- [ ] **Step 3: Update `wrangler.jsonc` name**
Set `"name": "be-api"`.

- [ ] **Step 4: Fix hardcoded API URLs**
Update any references to `api-worker.goycompany.workers.dev` to `be-api.goycompany.workers.dev` (or the new production URL).

- [ ] **Step 5: Commit tooling and URL updates**
```bash
git add .
git commit -m "chore: update workspace, tooling, and api urls"
```

### Task 5: Refactor Apps to Use Global Configs

**Files:**
- Modify: `apps/*/tsconfig.json`, `apps/*/eslint.config.js`, `apps/*/playwright.config.ts`

- [ ] **Step 1: Refactor `tsconfig.json` files**
Extend `@goy/config-ts/base.json` or specialized configs.

- [ ] **Step 2: Update Playwright configs**
Replace `bun run dev` with `pnpm run dev`.

- [ ] **Step 3: Commit config refactor**
```bash
git add .
git commit -m "chore: extend global configs and fix playwright commands"
```

### Task 6: Documentation & Final Validation

- [ ] **Step 1: Run build via Makefile**
```bash
make build
```

- [ ] **Step 2: Update all documentation**
Update `docs/SETUP.md`, `docs/ARCHITECTURE.md`, and `docs/IDENTITY.md` with new paths and names.

- [ ] **Step 3: Final commit**
```bash
git add .
git commit -m "docs: update documentation and finalize restructuring"
```
