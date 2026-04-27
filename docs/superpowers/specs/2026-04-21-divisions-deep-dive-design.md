# Spec: Divisions Ecosystem Deep-Dive

**Date**: 2026-04-21  
**Status**: Approved  
**Topic**: Implementation of the "Zoom-in" interactive grid for division-specific apps.

## 1. Overview
Enhance the `/divisions` directory to allow users to "Zoom into" a specific division. This interaction replaces the vertical ledger with a full-screen technical grid showcasing the apps within that division.

## 2. Interaction Model: The Modal Zoom
- **Trigger**: Clicking a division row in `DivisionsList.svelte`.
- **Behavior**: 
    - The selected row expands to cover the entire viewport (`fixed inset-0`).
    - **View Transitions**: Use `document.startViewTransition` (if supported) or Svelte `crossfade` to animate the transition between the ledger state and the deep-dive state.
    - The background persists as the division's accent color (`--accent-color`).
    - **Scroll Management**: Lock scroll on the underlying body when `selectedDivision` is active.
- **Escape**: A prominent "✕" button in the top-right to reset `selectedDivision` to `null`.

## 3. The Technical Grid (Hairline Model)
- **Layout**: 
    - Rigid 3-column (desktop), 1-column (mobile).
    - **Grid Strategy**: `gap-0` with overlapping `1px` borders (`border-white/20`) to create a "Technical Blueprint" or "Circuit" look.
- **App Data Structure**:
    ```typescript
    interface App {
        name: string;
        description: string;
        status: 'Active' | 'Beta' | 'Legacy';
        version: string;
        nodes: number;
    }
    ```
- **Visual Style**:
    - Typography: All monospaced (JetBrains Mono).
    - Status Pills: Contrast-flipped (white background with color text).
    - Content: Aligned top-left for that technical ledger feel.

## 4. Animation & Motion
- **Entrance**: Scale-up and staggered fade-in for the app cards.
- **Exit**: Quick fade-out back to the index.
- **Accessibility**: Respect `prefers-reduced-motion` by disabling the View Transition and using simple opacity fades.

## 5. Technical Architecture
- **Component**: Update `src/components/DivisionsList.svelte` to manage the `selectedDivision` state.
- **Mock Data**: Define division-specific app lists directly in the script block.

## 6. Success Criteria
- [x] Physically coherent "Zoom" from row to full-screen.
- [x] Precise "Hairline" grid alignment.
- [x] Zero-lag interactivity on high-refresh-rate displays.
