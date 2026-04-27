# Divisions Deep-Dive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Zoom-in" deep-dive interaction for the Divisions page, featuring a full-screen technical grid of apps for each division.

**Architecture:** Update `DivisionsList.svelte` to manage expansion state and render a nested "App Grid" using a new `AppCard` component. Use the View Transitions API for the morphing effect.

**Tech Stack:** Astro 5, Svelte 5 (Runes), Tailwind CSS v4.

---

### Task 1: Setup Ecosystem Mock Data

**Files:**
- Create: `src/lib/divisions-data.ts`

- [ ] **Step 1: Define the app data for each division**

```typescript
export interface App {
  name: string;
  description: string;
  status: 'Active' | 'Beta' | 'Legacy';
  version: string;
  nodes: number;
}

export interface DivisionEcosystem {
  id: string;
  name: string;
  color: string;
  apps: App[];
}

export const ecosystems: Record<string, DivisionEcosystem> = {
  '01': {
    id: '01',
    name: 'GoySocial',
    color: '#2563eb',
    apps: [
      { name: 'GoyChat', description: 'End-to-end encrypted messaging via Nostr.', status: 'Active', version: 'v1.2.4', nodes: 1242 },
      { name: 'GoyCircles', description: 'Decentralized social graphs for trusted associations.', status: 'Beta', version: 'v0.8.2', nodes: 482 },
      { name: 'GoyCast', description: 'P2P broadcasting and event streaming.', status: 'Active', version: 'v1.1.0', nodes: 2911 },
    ]
  },
  '02': {
    id: '02',
    name: 'GoyPay',
    color: '#10b981',
    apps: [
      { name: 'GoyWallet', description: 'Lightning-fast non-custodial sats management.', status: 'Active', version: 'v2.0.1', nodes: 8593 },
      { name: 'GoyStream', description: 'Real-time micro-payments for content creators.', status: 'Beta', version: 'v0.9.1', nodes: 312 },
    ]
  },
  '03': {
    id: '03',
    name: 'GoyOps',
    color: '#ea580c',
    apps: [
      { name: 'NodeCommander', description: 'Centralized dashboard for decentralized relays.', status: 'Active', version: 'v3.1.2', nodes: 541 },
      { name: 'VaultSafe', description: 'Encrypted backup and recovery for Nostr keys.', status: 'Active', version: 'v1.0.5', nodes: 212 },
    ]
  },
  '04': {
    id: '04',
    name: 'GoyFlix',
    color: '#9333ea',
    apps: [
      { name: 'VoidCinema', description: 'Decentralized video streaming over the mesh.', status: 'Beta', version: 'v0.5.4', nodes: 128 },
    ]
  }
};
```

---

### Task 2: Create AppCard Component

**Files:**
- Create: `src/components/ui/AppCard.svelte`

- [ ] **Step 1: Implement the technical grid card**

```svelte
<script lang="ts">
  import type { App } from '$lib/divisions-data';
  let { app }: { app: App } = $props();
</script>

<div class="p-8 border-r border-b border-white/20 flex flex-col justify-between aspect-square group/card hover:bg-white/5 transition-colors">
  <div>
    <div class="flex justify-between items-start mb-8">
      <span class="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 {app.status === 'Active' ? 'bg-white text-black' : 'border border-white/40 text-white/80'}">
        {app.status}
      </span>
      <span class="text-[10px] opacity-40 font-bold">{app.version}</span>
    </div>
    <h2 class="text-3xl font-black uppercase tracking-tighter leading-none mb-4 group-hover/card:translate-x-2 transition-transform">
      {app.name}
    </h2>
    <p class="text-xs opacity-60 leading-relaxed uppercase max-w-[200px]">
      {app.description}
    </p>
  </div>
  <div class="mt-12 flex justify-between items-end">
    <div class="flex flex-col">
      <span class="text-[8px] font-black uppercase opacity-40">Active_Nodes</span>
      <span class="text-sm font-black tabular-nums">{app.nodes}</span>
    </div>
    <button class="underline decoration-2 underline-offset-4 text-xs font-black uppercase hover:opacity-50">
      Launch_Module
    </button>
  </div>
</div>
```

---

### Task 3: Update DivisionsList with Zoom & View Transitions

**Files:**
- Modify: `src/components/DivisionsList.svelte`

- [ ] **Step 1: Implement expansion logic, scroll lock, and View Transitions**

```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';
  import { ecosystems } from '$lib/divisions-data';
  import AppCard from './ui/AppCard.svelte';

  interface Division {
    id: string;
    name: string;
    category: string;
    color: string;
  }

  let {
    divisions = [
      { id: '01', name: 'GoySocial', category: 'Communication', color: '#2563eb' },
      { id: '02', name: 'GoyPay', category: 'Finance', color: '#10b981' },
      { id: '03', name: 'GoyOps', category: 'Infrastructure', color: '#ea580c' },
      { id: '04', name: 'GoyFlix', category: 'Media', color: '#9333ea' },
    ] as Division[],
  } = $props();

  let selectedDivisionId = $state<string | null>(null);
  let selectedEcosystem = $derived(selectedDivisionId ? ecosystems[selectedDivisionId] : null);

  // Scroll lock management
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

<main class="bg-zinc-50 font-mono relative min-h-screen">
  <!-- The Vertical Index -->
  <div class="flex flex-col">
    {#each divisions as division (division.id)}
      <button 
        onclick={() => toggleDivision(division.id)}
        class="group w-full text-left border-b-4 border-zinc-900 h-[25vh] flex items-center px-6 md:px-12 cursor-pointer overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] relative"
        style="--accent-color: {division.color}; view-transition-name: division-card-{division.id}"
      >
        <div class="absolute inset-0 bg-[var(--accent-color)] translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"></div>
        <div class="flex justify-between w-full items-baseline relative z-10 group-hover:text-white transition-colors duration-400">
          <span class="text-xl md:text-2xl font-black opacity-30 group-hover:opacity-100">{division.id}</span>
          <h2 class="text-5xl md:text-[clamp(3rem,15vw,9rem)] font-black uppercase tracking-tighter leading-none group-hover:translate-x-4 md:group-hover:translate-x-12 transition-transform">
            {division.name}
          </h2>
          <span class="hidden md:block text-xs font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100">
            {division.category}
          </span>
        </div>
      </button>
    {/each}
  </div>

  <!-- The Deep-Dive Modal -->
  {#if selectedDivisionId && selectedEcosystem}
    <div 
      class="fixed inset-0 z-50 flex flex-col overflow-y-auto text-white p-6 md:p-12"
      style="background-color: {selectedEcosystem.color}; view-transition-name: division-card-{selectedDivisionId}"
      in:fade={{ duration: 400 }}
    >
      <nav class="flex justify-between items-start mb-12 md:mb-24">
        <div>
          <span class="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Division // {selectedEcosystem.id}</span>
          <h1 class="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none mt-2">
            {selectedEcosystem.name}
          </h1>
        </div>
        <button 
          onclick={() => toggleDivision(null)}
          class="text-4xl md:text-6xl font-black hover:opacity-50 transition-opacity"
        >
          ✕
        </button>
      </nav>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/20 mb-24">
        {#each selectedEcosystem.apps as app}
          <AppCard {app} />
        {/each}
      </div>

      <footer class="mt-auto flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] opacity-40 pb-8">
        <span>{selectedEcosystem.name} // Ecosystem_Index</span>
        <span>Secure // Encrypted</span>
      </footer>
    </div>
  {/if}
</main>
```

---

### Task 4: Final Verification

- [ ] **Step 1: Run diagnostics**

Run: `make check`
Expected: 0 errors

- [ ] **Step 2: Verify View Transitions**
- Ensure the row appears to morph into the modal background in Chromium-based browsers.
- Ensure the fallback (fade) works in other browsers.
