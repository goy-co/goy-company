# The Goy Company - Global Build System

.PHONY: install dev dev-grid dev-corporate dev-identity dev-api dev-hub tauri-hub-dev deploy-api build build-all build-corporate build-identity build-hub tauri-hub-build lint test check db-migrate-local clean help

# --- Installation ---
install:
	pnpm install

# --- Development ---
dev: dev-corporate

# Starts the entire ecosystem: Corporate Site, Identity App, and Edge API
dev-grid:
	pnpm --filter corporate-site --filter identity-app --filter @goy/api-worker --parallel dev

dev-corporate:
	pnpm --filter corporate-site dev

dev-identity:
	pnpm --filter identity-app dev

dev-api:
	pnpm --filter @goy/api-worker dev

dev-hub:
	pnpm --filter goy-hub dev

tauri-hub-dev:
	pnpm --filter goy-hub tauri dev

# --- Deployment ---
deploy-api:
	pnpm --filter @goy/api-worker deploy

# --- Database ---
db-migrate-local:
	pnpm --filter @goy/api-worker wrangler d1 migrations apply goy-db --local

db-studio:
	pnpm --filter @goy/api-worker run db:studio

# --- Build ---
build: build-all

build-all:
	pnpm -r build

build-corporate:
	pnpm --filter corporate-site build

build-identity:
	pnpm --filter identity-app build

build-hub:
	pnpm --filter goy-hub build

tauri-hub-build:
	pnpm --filter goy-hub tauri build

# --- Quality Control ---
lint:
	pnpm -r lint

test:
	pnpm -r test

check:
	pnpm -r check

# --- Cleanup ---
clean:
	find . -name "dist" -type d -exec rm -rf {} +
	find . -name ".astro" -type d -exec rm -rf {} +
	find . -name "node_modules" -type d -exec rm -rf {} +
	rm -rf apps/goy-hub/src-tauri/target

# --- Help ---
help:
	@echo "The Goy Company Monorepo CLI"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install          Install all dependencies"
	@echo "  dev-grid         Run all apps (Corporate, Identity, API) in parallel"
	@echo "  dev-corporate    Run corporate-site in dev mode"
	@echo "  dev-identity     Run identity-app in dev mode"
	@echo "  dev-api          Run api-worker in dev mode"
	@echo "  dev-hub          Run goy-hub in dev mode"
	@echo "  tauri-hub-dev    Run goy-hub in Tauri desktop client"
	@echo "  db-migrate-local Apply D1 migrations to local development database"
	@echo "  db-studio        Open Drizzle Studio to visualize local data"
	@echo "  build-all        Build all workspace projects"
	@echo "  build-hub        Build goy-hub static frontend"
	@echo "  tauri-hub-build  Build and package goy-hub Tauri native client"
	@echo "  lint             Lint all projects"
	@echo "  test             Run all tests"
	@echo "  clean            Remove all build artifacts and node_modules"
