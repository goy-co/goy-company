# Divisions Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a high-impact, Swiss-Modern "Divisions Directory" page with "Flood Fill" hover effects.

**Architecture:** Use Svelte 5 (Runes) for the interactive directory component and Astro 5 for the static route wrapper.

**Tech Stack:** Astro 5, Svelte 5, Tailwind CSS v4.

---

### Task 1: Create DivisionsList Svelte Component

**Files:**

- Create: `src/components/DivisionsList.svelte`

- [ ] **Step 1: Implement the Svelte 5 component with the requested "Flood Fill" logic**

```svelte
<script lang="ts">
  const divisions = [
    { id: '01', name: 'GoySocial', category: 'Communication', color: '#2563eb' }, // Blue
    { id: '02', name: 'GoyPay', category: 'Finance', color: '#10b981' }, // Emerald
    { id: '03', name: 'GoyOps', category: 'Infrastructure', color: '#ea580c' }, // Orange
    { id: '04', name: 'GoyFlix', category: 'Media', color: '#9333ea' }, // Purple
  ];
</script>

<main class="bg-zinc-50">
  {#each divisions as division (division.id)}
    <div
      class="group border-b-4 border-zinc-900 h-[25vh] flex items-center px-6 md:px-12 cursor-pointer overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] relative"
      style="--accent-color: {division.color}"
    >
      <!-- Flood Background -->
      <div
        class="absolute inset-0 bg-[var(--accent-color)] translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
      ></div>

      <div
        class="flex justify-between w-full items-baseline relative z-10 group-hover:text-white transition-colors duration-400"
      >
        <span class="text-xl md:text-2xl font-black opacity-30 group-hover:opacity-100"
          >{division.id}</span
        >
        <h2
          class="text-5xl md:text-[clamp(3rem,15vw,9rem)] font-black uppercase tracking-tighter leading-none transition-transform duration-400 group-hover:translate-x-4 md:group-hover:translate-x-12"
        >
          {division.name}
        </h2>
        <span
          class="hidden md:block text-xs font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100"
        >
          {division.category}
        </span>
      </div>
    </div>
  {/each}
</main>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DivisionsList.svelte
git commit -m "feat: add DivisionsList component with flood-fill effect"
```

---

### Task 2: Create Divisions Astro Page

**Files:**

- Create: `src/pages/divisions.astro`

- [ ] **Step 1: Scaffold the Astro page and integrate the Svelte component**

```astro
---
import Layout from '@layouts/Layout.astro';
import DivisionsList from '@components/DivisionsList.svelte';
---

<Layout title="Divisions | The Goy Company">
  <main
    class="min-h-screen bg-zinc-50 text-zinc-900 font-mono selection:bg-zinc-900 selection:text-zinc-50"
  >
    <!-- Navbar -->
    <nav
      class="flex justify-between items-end px-6 py-8 md:px-12 md:py-12 border-b-4 border-zinc-900 bg-zinc-50 sticky top-0 z-50"
    >
      <div class="flex flex-col">
        <a href="/" class="hover:opacity-70 transition-opacity">
          <h1 class="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">
            The Goy<br />Company.
          </h1>
        </a>
      </div>

      <div class="flex items-center gap-8">
        <div class="flex gap-8 text-xs font-black uppercase tracking-widest">
          <a
            href="/manifesto"
            class="hover:bg-zinc-900 hover:text-zinc-50 px-2 py-1 transition-colors">Manifesto</a
          >
          <a href="/relays" class="hover:bg-zinc-900 hover:text-zinc-50 px-2 py-1 transition-colors"
            >Relays</a
          >
          <a href="/divisions" class="bg-zinc-900 text-zinc-50 px-2 py-1 transition-colors"
            >Divisions</a
          >
        </div>
      </div>
    </nav>

    <DivisionsList client:load />

    <!-- Footer -->
    <footer class="px-6 py-12 md:px-12 md:py-24 border-t-8 border-zinc-900 bg-zinc-100">
      <div
        class="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm uppercase font-black text-zinc-500 gap-4"
      >
        <span>© 2026 The Goy Company.</span>
        <span class="flex items-center gap-2">
          <div class="w-2 h-2 bg-zinc-500 rounded-full animate-pulse"></div>
          Privacy by Default. Satire by Design.
        </span>
      </div>
    </footer>
  </main>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/divisions.astro
git commit -m "feat: create divisions page route"
```

---

### Task 3: Update Global Navigation

**Files:**

- Modify: `src/pages/index.astro`
- Modify: `src/pages/manifesto.astro`
- Modify: `src/pages/relays.astro`

- [ ] **Step 1: Update index.astro nav links**
- [ ] **Step 2: Update manifesto.astro nav links**
- [ ] **Step 3: Update relays.astro nav links**

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/manifesto.astro src/pages/relays.astro
git commit -m "fix: update navigation links across all pages"
```

---

### Task 4: Final Verification

- [ ] **Step 1: Run diagnostics**

Run: `make check`
Expected: 0 errors

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Successful build
