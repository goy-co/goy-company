<script lang="ts">
  import type { App } from '$lib/divisions-data';
  import { cn } from '$lib/utils';

  interface Props {
    app: App;
    color?: string;
  }

  let { app, color = '#18181b' }: Props = $props();
  const isWhite = $derived(color === 'white');
</script>

<div 
  class={cn(
    "group relative p-6 transition-all hover:-translate-y-1 border-2",
    !isWhite ? "bg-zinc-50 border-zinc-900 hover:shadow-[8px_8px_0px_0px_rgba(24,24,27,1)]" : "bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/60"
  )}
>
  <!-- Decorative technical pattern container -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div 
      class={cn(
        "absolute -right-4 -bottom-4 w-12 h-12 border-t border-l opacity-20 transition-colors",
        isWhite ? "border-white" : "border-zinc-200"
      )}
    ></div>
  </div>

  <!-- Status Badge -->
  <div class="flex justify-between items-start mb-6">
    <span 
      class={cn(
        "text-[8px] font-black uppercase tracking-[0.3em] px-2 py-1 transition-colors",
        isWhite ? "text-zinc-900 bg-white" : "text-zinc-50"
      )}
      style={!isWhite ? `background-color: ${color};` : ''}
    >
      {app.status}
    </span>
    <span 
      class={cn(
        "text-[8px] font-mono transition-colors",
        isWhite ? "text-white/40" : "text-zinc-400"
      )}
    >{app.version}</span>
  </div>

  <h4 
    class={cn(
      "text-xl font-black uppercase tracking-tighter mb-4 transition-colors",
      isWhite ? "text-white" : "text-zinc-900"
    )}
  >{app.name}</h4>
  <p 
    class={cn(
      "text-xs uppercase font-bold leading-relaxed mb-8 tracking-wider transition-colors",
      isWhite ? "text-white/70" : "text-zinc-600"
    )}
  >{app.description}</p>

  <div 
    class={cn(
      "flex justify-between items-center pt-6 border-t transition-colors",
      isWhite ? "border-white/10" : "border-zinc-200"
    )}
  >
    <div class="flex flex-col">
      <span 
        class={cn(
          "text-[8px] font-black uppercase tracking-widest",
          isWhite ? "text-white/40" : "text-zinc-400"
        )}
      >Global_Nodes</span>
      <span 
        class={cn(
          "text-sm font-black tabular-nums transition-colors",
          isWhite ? "text-white" : "text-zinc-900"
        )}
      >{app.nodes}</span>
    </div>
    <button 
      class={cn(
        "text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-colors",
        isWhite ? "bg-white text-zinc-900 hover:bg-zinc-100" : "text-zinc-50 hover:bg-zinc-700"
      )}
      style={!isWhite ? `background-color: ${color};` : ''}
    >
      Launch_App
    </button>
  </div>
</div>
