# Spec: Divisions Directory Page

**Date**: 2026-04-21  
**Status**: Approved  
**Topic**: Implementation of the "Swiss Directory" layout for the Goy Company app divisions.

## 1. Overview

A high-impact, typographically heavy landing page (`/divisions`) that serves as the index for all corporate divisions (GoySocial, GoyPay, GoyOps, GoyFlix).

## 2. Visual Design (Swiss-Modern)

- **Layout**: Full-width vertical rows.
- **Typography**:
  - Font: JetBrains Mono Variable.
  - Sizes: Massive using `clamp(3rem, 15vw, 9rem)`.
  - Weight: `font-black` (900).
- **Spacing**: Each division entry occupies `25vh` (viewport height), creating a stark, imposing structure.

## 3. Interaction Model: The "Flood Fill"

- **Default State**: White background, Zinc-900 text, 4px border-bottom.
- **Hover/Focus State**:
  - Background "floods" with a division-specific accent color via CSS variables (`--division-color`).
  - Typography flips to pure white (or black based on luminance).
  - Content slides 20px to the right (`translateX`).
- **Transitions**: 400ms cubic-bezier(0.16, 1, 0.3, 1).
- **Accessibility**: Support `prefers-reduced-motion` and ensure full keyboard focus parity.

## 4. Technical Architecture

- **Framework**: Astro 5 (Page) + Svelte 5 (Components).
- **Routing**: `/src/pages/divisions.astro`.
- **Component**: `/src/components/DivisionsList.svelte`.
- **Styling**: Tailwind CSS v4 + Svelte `style:` directive for dynamic color injection.

## 5. Mobile & UX

- Typography scales smoothly via `clamp()`.
- Row height shifts to `20vh` or fixed `180px` on mobile.
- Touch states utilize `:active` to mimic the hover effect.

## 6. Success Criteria

- [x] Perfect typographic alignment with the Swiss grid.
- [x] Zero-lag hover transitions.
- [x] Consistent footer/nav integration.
