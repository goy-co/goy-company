<script lang="ts">
  import { cn } from '$lib/utils';
  
  interface Props {
    title: string;
    description: string;
    id: string;
    appsCount: number;
    color: string;
  }

  let { title, description, id, appsCount, color }: Props = $props();
</script>

<div
  class={cn(
    "group relative aspect-square border-2 border-zinc-900 flex flex-col justify-between p-6 overflow-hidden transition-all duration-500",
    "bg-zinc-50"
  )}
>
  <!-- Interactive Hover Overlay (Slide Fill Effect) -->
  <div 
    class="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0 pointer-events-none"
    style="background-color: {color};"
  ></div>

  <!-- Background ID Number -->
  <span class="absolute top-2 right-4 text-[8rem] font-black opacity-[0.03] pointer-events-none select-none group-hover:opacity-100 group-hover:text-white transition-all duration-500 text-zinc-900 z-10">
    {id}
  </span>

  <header class="relative z-10">
    <div class="flex justify-between items-start mb-4">
      <span class="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 group-hover:text-white transition-colors duration-300">Sector // {id}</span>
      <div class="w-8 h-1 bg-zinc-900 group-hover:bg-white transition-colors duration-300"></div>
    </div>
    <h3 class="text-2xl font-black uppercase tracking-tighter leading-none mb-3 group-hover:text-white transition-colors duration-300 text-zinc-900">
      {title}
    </h3>
  </header>

  <div class="relative z-10">
    <p class="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-zinc-600 group-hover:text-white transition-colors duration-300 mb-6 max-w-[90%]">
      {description}
    </p>
    
    <div class="flex justify-between items-end">
      <div class="flex flex-col">
        <span class="text-[7px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white/60 transition-colors duration-300">Active_Modules</span>
        <span class="text-lg font-black text-zinc-900 group-hover:text-white transition-colors duration-300">{appsCount}</span>
      </div>
      
      <a 
        href="/divisions" 
        class="bg-zinc-900 text-white px-3 py-1.5 text-[8px] font-black uppercase tracking-widest group-hover:bg-white group-hover:text-zinc-900 transition-all duration-300 border-2 border-transparent"
      >
        ACCESS_GATE
      </a>
    </div>
  </div>
</div>
