<script lang="ts">
  import { businessData } from '$lib/business-data';

  let selectedId = $state<string | null>(null);
  let isTransitioning = $state(false);

  function selectCategory(id: string) {
    if (isTransitioning) return;

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

  const selectedCategory = $derived(selectedId ? businessData[selectedId] : null);
</script>

<div class="w-full font-mono bg-zinc-950 transition-colors">
  {#if !selectedId}
    <section class="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20 md:mb-24">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-[1px] bg-white"></div>
            <span class="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">Institutional_Solutions</span>
          </div>
          <h2 class="text-[clamp(2.5rem,7vw,7rem)] font-black uppercase tracking-tighter leading-[0.85] text-white">
            Business<br />Infrastructure.
          </h2>
        </div>
        <div class="max-w-xs border-l border-zinc-900 pl-6 py-1">
          <p class="font-mono text-[10px] text-zinc-500 uppercase leading-relaxed font-bold tracking-tight">
            High-precision tools for sovereign organizations. Replace centralized platforms with institutional-grade protocols designed for total data ownership and rapid settlement.
          </p>
        </div>
      </div>

      <div class="border-t border-zinc-900">
        {#each Object.values(businessData) as category}
          <button
            onclick={() => selectCategory(category.id)}
            class="group relative w-full border-b border-zinc-900 py-10 md:py-12 transition-all duration-500 hover:bg-white/[0.01] text-left block"
            style="view-transition-name: cat-{category.id}"
          >
            <div
              class="absolute left-0 top-0 bottom-0 w-[1px] transition-all duration-500 opacity-20 group-hover:opacity-100 group-hover:w-1"
              style="background-color: {category.color};"
            ></div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center px-4 md:px-6">
              <div class="md:col-span-3 flex items-center gap-6">
                <span class="font-mono text-2xl md:text-3xl font-black text-zinc-900 group-hover:text-white transition-all duration-500 leading-none">
                  {category.id}
                </span>
                <div class="flex flex-col">
                  <span class="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700 group-hover:text-zinc-500 mb-1.5 transition-colors">
                    {category.tagline}
                  </span>
                  <h3 class="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                    {category.name}
                  </h3>
                </div>
              </div>

              <div class="md:col-span-6">
                <p class="font-mono text-[11px] md:text-xs text-zinc-500 leading-relaxed max-w-xl group-hover:text-zinc-300 transition-colors duration-500">
                  {category.description}
                </p>
              </div>

              <div class="md:col-span-3 flex justify-end">
                <div class="flex items-center gap-3 group-hover:gap-5 transition-all duration-500">
                  <span class="font-mono text-[8px] font-black uppercase tracking-widest text-zinc-700 group-hover:text-white transition-colors">
                    Deploy_Specs
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
    <div
      class="fixed inset-0 z-[100] flex flex-col p-6 md:p-12 lg:p-20 overflow-hidden transition-colors duration-500 bg-zinc-950"
      style="view-transition-name: cat-{selectedId};"
    >
      <header class="flex justify-between items-end border-b border-zinc-900 pb-12 mb-16">
        <div class="flex items-end gap-10">
          <span class="font-mono text-5xl md:text-7xl font-black text-zinc-800 leading-none italic">{selectedCategory?.id}</span>
          <div>
            <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-3 block">{selectedCategory?.tagline}</span>
            <h2 class="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">
              {selectedCategory?.name}
            </h2>
          </div>
        </div>
        <button
          onclick={close}
          class="bg-white text-zinc-950 px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          [ Close_Specs ]
        </button>
      </header>

      <div class="flex-1 overflow-y-auto custom-scrollbar pr-4">
        <div class="flex flex-col gap-10 mb-20">
          <span class="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-700">Enterprise_Product_Catalog:</span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            {#each selectedCategory?.products ?? [] as product}
              <div class="group relative bg-zinc-900/30 border border-zinc-900 p-10 hover:border-zinc-700 transition-all duration-500">
                <div class="flex justify-between items-start mb-8">
                  <div class="space-y-2">
                    <span class="text-[8px] font-black uppercase tracking-widest text-zinc-600">Product_Model</span>
                    <h4 class="text-2xl font-black uppercase tracking-tight text-white">{product.name}</h4>
                  </div>
                  <span class="px-2 py-0.5 border border-zinc-800 text-[7px] font-black uppercase tracking-widest text-zinc-600">
                    {product.status}
                  </span>
                </div>
                
                <p class="font-mono text-sm text-zinc-500 leading-relaxed mb-10 group-hover:text-zinc-400 transition-colors">
                  {product.description}
                </p>

                <div class="space-y-4">
                  <span class="text-[8px] font-black uppercase tracking-widest text-zinc-700 block border-b border-zinc-900 pb-2">Key_Features:</span>
                  <ul class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {#each product.features as feature}
                      <li class="flex items-center gap-3">
                        <div class="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
                        <span class="text-[10px] font-bold uppercase text-zinc-500 tracking-tight">{feature}</span>
                      </li>
                    {/each}
                  </ul>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <footer class="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-zinc-700">
        <span>Goy_Business // Institutional_Grid // Category_{selectedCategory?.id}</span>
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
            <span>Status: Mission_Critical</span>
          </div>
          <div class="h-4 w-[1px] bg-zinc-900"></div>
          <span class="font-mono tracking-normal">{selectedCategory?.color} // SYNC_OK</span>
        </div>
      </footer>
    </div>
  {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #18181b;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #27272a;
  }
</style>
