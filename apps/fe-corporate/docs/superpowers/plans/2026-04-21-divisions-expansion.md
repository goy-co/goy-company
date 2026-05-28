# Divisions Physical Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Physical Accordion Expansion" for the Divisions page, where clicking a row expands it to fill the screen and reveals the app grid.

**Architecture:** Use Svelte 5 `$state` and dynamic CSS classes (`h-0`, `h-screen`) to handle row heights. Use the View Transitions API for morphing.

**Tech Stack:** Astro 5, Svelte 5 (Runes), Tailwind CSS v4.

---

### Task 1: Refactor DivisionsList State Logic

**Files:**
- Modify: `src/components/DivisionsList.svelte`

- [ ] **Step 1: Implement the "In-Place" expansion layout using dynamic classes**

```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';
  import { ecosystems } from '$lib/divisions-data';
  import AppCard from './ui/AppCard.svelte';

  // ... (interfaces)

  let selectedDivisionId = $state<string | null>(null);
  let selectedEcosystem = $derived(selectedDivisionId ? ecosystems[selectedDivisionId] : null);

  // Scroll and UI locking
  $effect(() => {
    if (selectedDivisionId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  function toggleDivision(id: string | null) {
    if (!document.startViewTransition) {
      selectedDivisionId = id;
      return;
    }
    document.startViewTransition(() => {
      selectedDivisionId = id;
    });
  }
</script>

<!-- The Parent Container should clip site UI when active -->
<main class="bg-zinc-50 font-mono relative overflow-hidden" class:h-screen={selectedDivisionId}>
  <div class="flex flex-col min-h-screen">
    {#each divisions as division (division.id)}
      {@const isSelected = selectedDivisionId === division.id}
      {@const isAnySelected = selectedDivisionId !== null}
      
      <div 
        class="relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        class:h-0={isAnySelected && !isSelected}
        class:h-[25vh]={!isAnySelected}
        class:h-screen={isSelected}
        class:z-10={isSelected}
        style="view-transition-name: division-row-{division.id}; --division-color: {division.color}"
      >
        <!-- The Background / Trigger Area -->
        <button 
          onclick={() => !isSelected && toggleDivision(division.id)}
          class="w-full h-full text-left flex flex-col cursor-pointer transition-colors duration-400 p-6 md:p-12"
          class:bg-zinc-50={!isSelected}
          class:hover:bg-[var(--division-color)]={!isAnySelected}
          class:hover:text-white={!isAnySelected}
          style="background-color: {isSelected ? division.color : ''}"
        >
          <!-- Header Area: Morphs position -->
          <div class="flex justify-between w-full items-baseline" class:text-white={isSelected}>
            <span class="text-xl md:text-2xl font-black opacity-30" class:opacity-100={isSelected}>{division.id}</span>
            <h2 
              class="font-black uppercase tracking-tighter leading-none transition-all duration-400"
              class:text-5xl={!isSelected}
              class:md:text-[clamp(3rem,15vw,9rem)]={!isSelected}
              class:text-4xl={isSelected}
              class:md:text-6xl={isSelected}
            >
              {division.name}
            </h2>
            <span class="hidden md:block text-xs font-black uppercase tracking-[0.3em] opacity-40" class:opacity-100={isSelected}>
              {division.category}
            </span>
          </div>

          <!-- Deep-Dive Content: Fades in inside the row -->
          {#if isSelected && selectedEcosystem}
            <div in:fade={{ delay: 300, duration: 300 }} class="flex-1 flex flex-col mt-12 md:mt-24 overflow-y-auto pr-2">
              <!-- Grid Header Toggle -->
              <div class="flex justify-end mb-8">
                <button 
                  onclick={(e) => { e.stopPropagation(); toggleDivision(null); }}
                  class="text-4xl md:text-6xl font-black hover:opacity-50 transition-opacity"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <!-- The Technical Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/20 mb-24">
                {#each selectedEcosystem.apps as app (app.name)}
                  <AppCard {app} />
                {/each}
              </div>

              <footer class="mt-auto flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] opacity-40 pb-8">
                <span>{selectedEcosystem.name} // Ecosystem_Index</span>
                <span>Secure // Encrypted</span>
              </footer>
            </div>
          {/if}
        </button>
      </div>
    {/each}
  </div>
</main>
```

- [ ] **Step 2: Verification**

Run: `make check`
Expected: 0 errors
- Ensure clicking a row makes it grow while others shrink to 0 height.
- Ensure the Close button correctly restores the list.
