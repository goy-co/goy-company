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
    "group relative aspect-square border-2 border-zinc-900 dark:border-zinc-50 flex flex-col justify-between p-8 overflow-hidden transition-all duration-500 hover:scale-[1.01]",
    "bg-zinc-50 dark:bg-zinc-900"
  )}
>
  <!-- Interactive Hover Overlay (Flood Fill Effect) -->
  <div 
    class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none"
    style="background-color: {color}; mix-blend-mode: multiply;"
  ></div>

  <!-- Background ID Number -->
  <span class="absolute top-4 right-8 text-[12rem] font-black opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none group-hover:opacity-10 transition-opacity duration-700">
    {id}
  </span>

  <header class="relative z-10">
    <div class="flex justify-between items-start mb-6">
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 group-hover:text-white transition-colors">Sector // {id}</span>
      <div class="w-10 h-1 bg-zinc-900 dark:bg-zinc-50 group-hover:bg-white transition-colors"></div>
    </div>
    <h3 class="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4 group-hover:text-white transition-colors text-zinc-900 dark:text-zinc-50">
      {title}
    </h3>
  </header>

  <div class="relative z-10">
    <p class="text-xs font-bold uppercase tracking-widest leading-relaxed text-zinc-600 dark:text-zinc-400 group-hover:text-white/80 transition-colors mb-8 max-w-[80%]">
      {description}
    </p>
    
    <div class="flex justify-between items-end">
      <div class="flex flex-col">
        <span class="text-[8px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white/60 transition-colors">Active_Modules</span>
        <span class="text-xl font-black text-zinc-900 dark:text-zinc-50 group-hover:text-white transition-colors">{appsCount}</span>
      </div>
      
      <a 
        href="/divisions" 
        class="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest group-hover:bg-white group-hover:text-zinc-900 transition-all border-2 border-transparent"
      >
        ACCESS_GATE
      </a>
    </div>
  </div>
</div>
