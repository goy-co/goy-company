<script lang="ts">
  import { ecosystems } from '$lib/divisions-data';
  import DetailAppCard from './ui/DetailAppCard.svelte';

  let selectedId = $state<string | null>(null);
  let isTransitioning = $state(false);

  function selectDivision(id: string) {
    if (isTransitioning) return;
    
    // Physical expansion logic using View Transitions API
    if (!document.startViewTransition) {
      selectedId = id;
      return;
    }

    isTransitioning = true;
    
    // Lock scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('modal-open');

    document.startViewTransition(() => {
      selectedId = id;
    });

    setTimeout(() => { isTransitioning = false; }, 500);
  }

  function close() {
    if (!document.startViewTransition) {
      selectedId = null;
      return;
    }

    document.startViewTransition(() => {
      selectedId = null;
      // Restore scroll
      document.body.style.overflow = '';
      document.documentElement.classList.remove('modal-open');
    });
  }

  const selectedEcosystem = $derived(selectedId ? ecosystems[selectedId] : null);
</script>

<div class="w-full font-mono bg-zinc-50 transition-colors">
  {#if !selectedId}
    <!-- Grid of Divisions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 h-[calc(100vh-120px)] border-t-4 border-zinc-900 transition-colors">
      {#each Object.values(ecosystems) as division}
        <button
          onclick={() => selectDivision(division.id)}
          class="group relative flex flex-col items-center justify-center p-12 border-b-4 md:border-b-0 md:border-r-4 border-zinc-900 transition-all overflow-hidden bg-zinc-50"
          style="view-transition-name: div-{division.id}"
        >
          <!-- Interactive Hover Overlay (Slide Fill Effect) -->
          <div 
            class="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0 pointer-events-none"
            style="background-color: {division.color};"
          ></div>

          <!-- Background Number -->
          <span class="absolute inset-0 flex items-center justify-center text-[15rem] font-black opacity-[0.03] group-hover:opacity-20 group-hover:text-white transition-all duration-500 z-10">
            {division.id}
          </span>
          
          <h3 class="text-4xl md:text-5xl font-black uppercase tracking-tighter group-hover:text-white z-20 transition-colors text-zinc-900">
            {division.name}
          </h3>
          <span class="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 group-hover:text-white/80 z-20 transition-colors">
            Explore_Subsystems
          </span>
        </button>
      {/each}
    </div>
  {:else}
    <!-- Expanded Detail View -->
    <div 
      class="fixed inset-0 z-[100] flex flex-col p-6 md:p-12 overflow-hidden transition-colors duration-500"
      style="view-transition-name: div-{selectedId}; background-color: {selectedEcosystem?.color};"
    >
      <header 
        class="flex justify-between items-end border-b-8 pb-8 mb-12 border-white/20"
      >
        <div>
          <span class="text-xs font-black uppercase tracking-[0.4em] text-white/60 mb-2 block">Division // {selectedEcosystem?.id}</span>
          <h2 class="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white">{selectedEcosystem?.name}</h2>
        </div>
        <button 
          onclick={close}
          class="bg-white text-zinc-900 px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-zinc-100 transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
        >
          Close_Detail
        </button>
      </header>

      <div class="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 pb-12">
          {#each selectedEcosystem?.apps ?? [] as app}
            <DetailAppCard {app} color="white" />
          {/each}
        </div>
      </div>

      <footer class="mt-12 pt-8 border-t-2 border-white/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40 transition-colors">
        <span>Goy_Company // {selectedEcosystem?.name}_Subsystem</span>
        <span>Secure_Nostr_Backbone // Verified</span>
      </footer>
    </div>
  {/if}
</div>

<style>
  :global(.modal-open) {
    overflow: hidden !important;
  }

  /* Custom scrollbar for detail view */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f4f4f5; /* zinc-100 */
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #18181b; /* zinc-900 */
  }
</style>
