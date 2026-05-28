# Spec: Monorepo Restructuring & Global Configurations

**Status:** Draft  
**Date:** 2026-05-28  
**Topic:** Monorepo Architecture Optimization

## 1. Goal
Optimize the project structure for better scalability, maintainability, and developer experience by standardizing workspace organization and centralizing shared configurations.

## 2. Proposed Changes

### 2.1. Directory Restructuring (Apps & Services)
Consolidate all deployable units under `apps/` with functional prefixes and use the `@goy/` scope for package names:
- `apps/corporate-site` -> `apps/fe-corporate` (Package: `@goy/fe-corporate`)
- `apps/identity-app` -> `apps/fe-identity` (Package: `@goy/fe-identity`)
- `apps/goy-hub` -> `apps/fe-hub` (Package: `@goy/fe-hub`)
- `services/api-worker` -> `apps/be-api` (Package: `@goy/be-api`)

*Outcome: The `services/` directory will be deprecated.*

### 2.2. Global Configurations (`packages/`)
Introduce internal configuration packages to enforce consistency:
- **`packages/config-ts`**: Shared TypeScript configurations.
- **`packages/config-eslint`**: Standardized ESLint Flat Config rules.
- **`packages/design-system`**: Move root `design-system/the-goy-company` to this package and create a `package.json`.

### 2.3. Workspace & Tooling Updates
- **`pnpm-workspace.yaml`**: Update to track only `apps/*` and `packages/*`.
- **`Makefile` & Root `package.json`**: Update all `--filter` commands to use the new `@goy/` scoped names.
- **`wrangler.jsonc`**: Update the worker name to `be-api`.
- **`docs/SETUP.md`**: Update all file paths and instructions.

## 3. Implementation Strategy

1. **Scaffold Configuration Packages**: Create `package.json` with proper `exports` and config files for `config-ts` and `config-eslint`.
2. **Move Design System**: Migrate existing design system files to `packages/design-system` and initialize as a package.
3. **Restructure Apps**: Rename and move directories using `git mv`. Update their `package.json` names to use the `@goy/` scope.
4. **Update References**:
   - Update `pnpm-workspace.yaml`.
   - Update `Makefile` and root scripts.
   - Refactor `tsconfig.json` and `eslint.config.js` in each app to extend from the new shared packages.
   - Standardize on `pnpm` (replace `bun` references in `playwright.config.ts` etc.).
5. **Validation**: Run `pnpm install` and verify builds/tests for all apps using the updated `Makefile`.

## 4. Success Criteria
- [ ] All apps build successfully using `pnpm`.
- [ ] No duplicated TS/ESLint rules across apps.
- [ ] Clean directory structure with functional prefixes.
- [ ] `pnpm install` works without workspace errors.
- [ ] `Makefile` tasks work with new scoped names.
