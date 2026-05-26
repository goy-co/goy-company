<script lang="ts">
  import { servicesData } from '$lib/services-data';
  import ServiceDetailCard from './ui/ServiceDetailCard.svelte';

  let selectedId = $state<string | null>(null);
  let isTransitioning = $state(false);

  function selectLayer(id: string) {
    if (isTransitioning) return;

    // Use View Transitions if available
    if (!document.startViewTransition) {
      selectedId = id;
      return;
    }

    isTransitioning = true;
    document.body.style.overflow = 'hidden';

    document.startViewTransition(() => {
      selectedId = id;
    });

    setTimeout(() => {
      isTransitioning = false;
    }, 500);
  }

  function close() {
    if (!document.startViewTransition) {
      selectedId = null;
      return;
    }

    document.startViewTransition(() => {
      selectedId = null;
      document.body.style.overflow = '';
    });
  }

  const selectedLayer = $derived(selectedId ? servicesData[selectedId] : null);
</script>

<div class="w-full font-mono bg-zinc-950 transition-colors">
  {#if !selectedId}
    <section class="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <!-- Header Mirroring Goy Grid -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20 md:mb-24"
      >
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-[1px] bg-white"></div>
            <span class="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600"
              >Catalog</span
            >
          </div>
          <h2
            class="text-[clamp(2.5rem,7vw,7rem)] font-black uppercase tracking-tighter leading-[0.85] text-white"
          >
            Ecosystem<br />Architecture.
          </h2>
        </div>
        <div class="max-w-xs border-l border-zinc-900 pl-6 py-1">
          <p
            class="font-mono text-[10px] text-zinc-500 uppercase leading-relaxed font-bold tracking-tight"
          >
            A decentralized SaaS ecosystem for absolute privacy. The Goy Grid software suite
            replaces centralized platforms with high-precision tools designed for individual and
            institutional control.
          </p>
        </div>
      </div>

      <!-- Grid of Service Layers -->
      <div class="border-t border-zinc-900">
        {#each Object.values(servicesData) as layer}
          <button
            onclick={() => selectLayer(layer.id)}
            class="group relative w-full border-b border-zinc-900 py-10 md:py-12 transition-all duration-500 hover:bg-white/[0.01] text-left block"
            style="view-transition-name: layer-{layer.id}"
          >
            <!-- Accent Line -->
            <div
              class="absolute left-0 top-0 bottom-0 w-[1px] transition-all duration-500 opacity-20 group-hover:opacity-100 group-hover:w-1"
              style="background-color: {layer.color};"
            ></div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center px-4 md:px-6">
              <!-- ID & Label -->
              <div class="md:col-span-3 flex items-center gap-6">
                <span
                  class="font-mono text-2xl md:text-3xl font-black text-zinc-900 group-hover:text-white transition-all duration-500 leading-none"
                >
                  {layer.id}
                </span>
                <div class="flex flex-col">
                  <span
                    class="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700 group-hover:text-zinc-500 mb-1.5 transition-colors"
                  >
                    {layer.tagline}
                  </span>
                  <h3 class="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                    {layer.name}
                  </h3>
                </div>
              </div>

              <!-- Description -->
              <div class="md:col-span-6">
                <p
                  class="font-mono text-[11px] md:text-xs text-zinc-500 leading-relaxed max-w-xl group-hover:text-zinc-300 transition-colors duration-500"
                >
                  {layer.description}
                </p>
              </div>

              <!-- Action Indicator -->
              <div class="md:col-span-3 flex justify-end">
                <div class="flex items-center gap-3 group-hover:gap-5 transition-all duration-500">
                  <span
                    class="font-mono text-[8px] font-black uppercase tracking-widest text-zinc-700 group-hover:text-white transition-colors"
                  >
                    Explore_Details
                  </span>
                  <div class="w-8 h-[1px] bg-zinc-800 group-hover:bg-white transition-colors"></div>
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </section>
  {:else}
    <!-- Expanded Detail View (Dark Mode Refined) -->
    <div
      class="fixed inset-0 z-[100] flex flex-col p-6 md:p-12 lg:p-20 overflow-hidden transition-colors duration-500 bg-zinc-950"
      style="view-transition-name: layer-{selectedId};"
    >
      <header class="flex justify-between items-end border-b border-zinc-900 pb-12 mb-16">
        <div class="flex items-end gap-10">
          <span class="font-mono text-5xl md:text-7xl font-black text-zinc-800 leading-none italic"
            >{selectedLayer?.id}</span
          >
          <div>
            <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-3 block"
              >{selectedLayer?.tagline}</span
            >
            <h2
              class="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white"
            >
              {selectedLayer?.name}
            </h2>
          </div>
        </div>
        <button
          onclick={close}
          class="bg-white text-zinc-950 px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          [ Close_Detail ]
        </button>
      </header>

      <div class="flex-1 overflow-y-auto custom-scrollbar pr-4">
        <div class="flex flex-col gap-10 mb-20">
          <span class="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-700"
            >Module_Protocol_Specifications:</span
          >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each selectedLayer?.services ?? [] as service}
              <div
                class="group relative bg-zinc-900/30 border border-zinc-800 p-8 hover:border-zinc-600 transition-all duration-500"
              >
                <div class="flex justify-between items-start mb-6">
                  <h4
                    class="text-lg font-black uppercase tracking-tight text-white group-hover:text-white transition-colors"
                  >
                    {service.name}
                  </h4>
                  <span
                    class="px-2 py-0.5 border border-zinc-800 text-[7px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors"
                  >
                    {service.status}
                  </span>
                </div>
                <p
                  class="font-mono text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors"
                >
                  {service.description}
                </p>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <footer
        class="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-zinc-700"
      >
        <span>Goy_Grid // Protocol_Reference // Layer_{selectedLayer?.id}</span>
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
            <span>Status: Verified</span>
          </div>
          <div class="h-4 w-[1px] bg-zinc-900"></div>
          <span class="font-mono tracking-normal">{selectedLayer?.color} // SYNC_OK</span>
        </div>
      </footer>
    </div>
  {/if}
</div>

<style>
  /* Custom scrollbar for detail view */
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #27272a; /* zinc-800 */
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #3f3f46; /* zinc-700 */
  }
</style>
