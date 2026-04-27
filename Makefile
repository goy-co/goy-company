.PHONY: dev build preview check lint format test test-unit test-e2e install

dev:
	bun run dev

build:
	bun run build

preview:
	bun run preview

check:
	bun run astro check

lint:
	bun run eslint .

format:
	bun run prettier --write .

test: test-unit test-e2e

test-unit:
	bun run vitest run

test-e2e:
	bun run playwright test

install:
	bun install
