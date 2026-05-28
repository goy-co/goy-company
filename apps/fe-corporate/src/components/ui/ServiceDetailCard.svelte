<script lang="ts">
  import type { Service } from '$lib/services-data';
  import { cn } from '$lib/utils';

  interface Props {
    service: Service;
    color?: string;
  }

  let { service, color = '#18181b' }: Props = $props();
  const isWhite = $derived(color === 'white');
</script>

<div 
  class={cn(
    "group relative p-5 transition-all border border-zinc-900/10 flex flex-col justify-between h-full",
    !isWhite ? "bg-zinc-50 hover:border-zinc-900" : "bg-white/5 border-white/10 hover:border-white/40 hover:bg-white/10"
  )}
>
  <!-- Background Indexing (Subtle) -->
  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
    <span class={cn("font-mono text-[4rem] font-black leading-none", isWhite ? "text-white" : "text-zinc-900")}>
      +
    </span>
  </div>

  <div>
    <header class="flex justify-between items-start mb-4">
      <h4 
        class={cn(
          "text-base font-black uppercase tracking-tight transition-colors",
          isWhite ? "text-white" : "text-zinc-900"
        )}
      >{service.name}</h4>
      
      <div class="flex items-center gap-1.5">
        <div 
          class={cn(
            "w-2 h-2 rounded-full",
            service.status === 'Active' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
            service.status === 'Development' ? "bg-zinc-400" : "bg-zinc-200"
          )}
        ></div>
      </div>
    </header>

    <p 
      class={cn(
        "text-xs uppercase font-bold leading-relaxed mb-8 tracking-tight transition-colors line-clamp-3",
        isWhite ? "text-white/70" : "text-zinc-500"
      )}
    >{service.description}</p>
  </div>

  <footer class="flex justify-between items-end">
    <div class="flex flex-col">
      <span 
        class={cn(
          "text-[10px] font-mono tracking-tighter transition-colors",
          isWhite ? "text-white/30" : "text-zinc-400"
        )}
      >{service.version || 'v0.0.0-core'}</span>
      <span 
        class={cn(
          "text-[8px] font-black uppercase tracking-widest transition-colors",
          isWhite ? "text-white/40" : "text-zinc-300"
        )}
      >{service.status}</span>
    </div>

    {#if service.status === 'Active'}
      <button 
        class={cn(
          "text-[11px] font-black uppercase tracking-widest transition-all hover:translate-x-1",
          isWhite ? "text-white" : "text-zinc-900"
        )}
      >
        Uplink_
      </button>
    {:else}
      <span class={cn("text-[11px] font-black uppercase tracking-widest opacity-20", isWhite ? "text-white" : "text-zinc-900")}>
        Locked
      </span>
    {/if}
  </footer>
</div>
