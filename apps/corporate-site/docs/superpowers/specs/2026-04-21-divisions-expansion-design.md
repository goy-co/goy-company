# Spec: Divisions Physical Accordion Expansion

**Date**: 2026-04-21  
**Status**: Approved  
**Topic**: Transitioning the Divisions list from a ledger into a full-screen background via physical expansion.

## 1. Overview
Redesign the `/divisions` interaction to feel like a physical expansion. Clicking a row expands it to fill the entire viewport, while its "Flood Fill" color becomes the persistent background for the ecosystem deep-dive.

## 2. Interaction Model: The Accordion Zoom
- **Trigger**: Clicking a division row.
- **State**: `selectedDivisionId` (Svelte 5 `$state`).
- **Expansion Logic**:
    - **Selected Row**: Expands from `h-[25vh]` to `h-screen`. Assigned `z-10` during transition.
    - **Unselected Rows**: Contract to `h-0`.
    - **Header Morph**: The large division name moves from a centered position (Index) to the top-left (Deep-Dive).
- **View Transitions**: Use `document.startViewTransition` to morph heights and positions.
- **Viewport Clipping**: The parent container clips global UI (nav/footer) when a division is active to ensure the accent color fills the screen.

## 3. Foreground Grid Reveal
- **Component**: The `AppCard` grid sits inside the expanded row.
- **Timing**: Grid items fade in with a 300ms delay after expansion starts.
- **Layout**: "Hairline" technical grid (overlapping 1px borders, `gap-0`).

## 4. Visual Continuity
- **Background**: The `--accent-color` fill becomes the permanent background.
- **Return Path**: A "✕" button triggers the reverse animation: sibling rows expand back to `25vh`.
- **Scroll Management**: Lock scroll on body and unselected rows; enable `overflow-y-auto` on the selected row only after expansion finishes.

## 5. Technical Implementation
- **Svelte 5 Logic**: 
    - Use dynamic classes based on `selectedDivisionId`.
    - Apply unique `view-transition-name` to all rows.
- **Containment**: Use `contain: layout` or `relative` on the list wrapper to anchor the expansion.

## 6. Success Criteria
- [x] Smooth physical expansion without jank.
- [x] Correct z-index handling (no overlap artifacts).
- [x] Immersive "Viewport Takeover" effect.
