# The Goy Company - Global Build System

.PHONY: install dev-corporate dev-identity build-all clean help

# --- Installation ---
install:
	pnpm install

# --- Development ---
dev: dev-corporate

dev-corporate:
	pnpm --filter corporate-site dev

dev-identity:
	pnpm --filter identity-app dev

dev-api:
	pnpm --filter @goy/api-worker dev

# --- Build ---
build: build-all

build-all:
	pnpm -r build

build-corporate:
	pnpm --filter corporate-site build

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

# --- Help ---
help:
	@echo "The Goy Company Monorepo CLI"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install          Install all dependencies"
	@echo "  dev-corporate    Run corporate-site in dev mode"
	@echo "  dev-identity     Run identity-app in dev mode"
	@echo "  dev-api          Run api-worker in dev mode"
	@echo "  build-all        Build all workspace projects"
	@echo "  lint             Lint all projects"
	@echo "  test             Run all tests"
	@echo "  clean            Remove all build artifacts and node_modules"
