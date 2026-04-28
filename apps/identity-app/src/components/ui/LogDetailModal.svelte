<script lang="ts">
  import { fade, fly } from 'svelte/transition';

  interface Props {
    log: { id: string; time: string; action: string; status: string; raw?: any };
    onClose: () => void;
  }

  let { log, onClose }: Props = $props();
</script>

<div 
  transition:fade={{ duration: 200 }}
  class="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 font-mono pl-20 md:pl-64"
>
  <div 
    transition:fly={{ y: 20, duration: 400 }}
    class="bg-zinc-950 border-2 border-zinc-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)] relative z-[5001]"
  >
    <header class="p-6 border-b border-zinc-900 flex justify-between items-start bg-zinc-900/30">
      <div>
        <span class="text-[9px] font-black text-cyan-500 uppercase tracking-[0.4em] block mb-1">Transmission_Inspector // {log.id}</span>
        <h3 class="text-xl font-black text-white uppercase tracking-tighter">{log.action}</h3>
      </div>
      <button 
        onclick={onClose}
        class="text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest border border-zinc-800 px-4 py-2 hover:bg-zinc-900"
      >
        [ Close_X ]
      </button>
    </header>

    <div class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.02),transparent)]">
      <div class="space-y-4">
         <div class="flex justify-between items-center">
            <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Raw_Event_Buffer</span>
            <span class="text-[8px] text-green-900/60 font-black">ENCRYPTED_SCHNORR_AUTHENTICATED</span>
         </div>
         <div class="bg-black border border-zinc-900 p-6 text-[11px] leading-relaxed overflow-x-auto font-mono text-cyan-900/70 shadow-inner">
            {#if log.raw}
              <pre class="whitespace-pre-wrap break-all">{JSON.stringify(log.raw, null, 2)}</pre>
            {:else}
              <div class="text-red-500 italic">!! NO_PAYLOAD_AVAILABLE // EVENT_SAMPLED_WITHOUT_RAW_BUFFER</div>
            {/if}
         </div>
      </div>

      <!-- Technical Metadata Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 border border-zinc-900 bg-black/40">
          <span class="text-[8px] font-black text-zinc-600 uppercase block mb-1">Time</span>
          <span class="text-[10px] text-zinc-300 tabular-nums">{log.time}</span>
        </div>
        <div class="p-4 border border-zinc-900 bg-black/40">
          <span class="text-[8px] font-black text-zinc-600 uppercase block mb-1">Event_Kind</span>
          <span class="text-[10px] text-zinc-300 tabular-nums">{log.raw?.kind ?? 'N/A'}</span>
        </div>
        <div class="p-4 border border-zinc-900 bg-black/40 col-span-2">
          <span class="text-[8px] font-black text-zinc-600 uppercase block mb-1">Protocol_Signature</span>
          <span class="text-[9px] text-cyan-500/40 truncate block">{log.raw?.sig ?? 'UNAVAILABLE'}</span>
        </div>
      </div>
    </div>

    <footer class="p-6 border-t border-zinc-900 flex justify-between items-center bg-zinc-900/10">
       <div class="flex items-center gap-4">
          <div class="flex gap-1">
             <div class="w-1 h-3 bg-cyan-500/40"></div>
             <div class="w-1 h-3 bg-cyan-500/20"></div>
             <div class="w-1 h-3 bg-cyan-500/10"></div>
          </div>
          <span class="text-[8px] font-black text-zinc-700 uppercase">Goy_Grid_Inspector_v1.0 // SVR_LAYER: ACTIVE</span>
       </div>
       <span class="text-[8px] font-black text-zinc-800 uppercase italic">Confidential_Transmission_Sample</span>
    </footer>
  </div>
</div>
