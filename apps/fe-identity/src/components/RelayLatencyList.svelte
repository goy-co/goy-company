<script lang="ts">
  import { onMount } from 'svelte';

  interface Relay {
    id: string;
    location: string;
    region: string;
    latency: number;
    status: 'online' | 'optimizing' | 'offline';
  }

  let relays = $state<Relay[]>([
    { id: 'rel-1', location: 'London', region: 'Europe', latency: 24, status: 'online' },
    { id: 'rel-2', location: 'New York', region: 'North America', latency: 42, status: 'online' },
    { id: 'rel-3', location: 'Tokyo', region: 'Asia Pacific', latency: 156, status: 'online' },
    { id: 'rel-4', location: 'Zurich', region: 'Europe', latency: 12, status: 'online' },
    { id: 'rel-5', location: 'São Paulo', region: 'South America', latency: 89, status: 'online' },
    { id: 'rel-6', location: 'Singapore', region: 'Asia Pacific', latency: 112, status: 'online' },
    { id: 'rel-7', location: 'Dubai', region: 'Middle East', latency: 67, status: 'online' },
  ]);

  onMount(() => {
    const interval = setInterval(() => {
      relays = relays.map(r => ({
        ...r,
        latency: Math.max(8, r.latency + (Math.random() * 4 - 2))
      }));
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

<div class="h-full flex flex-col bg-zinc-900/50 backdrop-blur-md border-r border-zinc-800/50 p-6 font-mono overflow-hidden min-h-0">
  <header class="mb-8 shrink-0">
    <div class="flex items-center gap-2 mb-2">
      <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-white">Relay_Topology_Status</span>
    </div>
    <div class="h-[1px] w-full bg-zinc-800"></div>
  </header>

  <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar min-h-0 pr-2">
    {#each relays as relay (relay.id)}
      <div class="flex justify-between items-center group">
        <div class="flex flex-col">
          <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{relay.region}</span>
          <span class="text-xs font-black text-white uppercase tracking-tighter">{relay.location}</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex flex-col items-end">
            <span class="text-[8px] font-black text-zinc-600 uppercase">Latency</span>
            <span class="text-xs font-mono {relay.latency < 50 ? 'text-green-500' : relay.latency < 100 ? 'text-yellow-500' : 'text-zinc-400'}">
              {relay.latency.toFixed(0)}ms
            </span>
          </div>
          <div class="w-1.5 h-1.5 rounded-full {relay.status === 'online' ? 'bg-green-500' : 'bg-zinc-700'}"></div>
        </div>
      </div>
      <div class="h-[1px] w-full bg-zinc-800/30"></div>
    {/each}
  </div>

  <footer class="mt-8 pt-6 border-t border-zinc-800 flex flex-col gap-4 shrink-0">
    <div class="flex justify-between items-center">
      <div class="flex flex-col">
        <span class="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Mesh_Integrity</span>
        <span class="text-xs font-black text-green-500">99.99%</span>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Active_Nodes</span>
        <span class="text-xs font-black text-white">4,281</span>
      </div>
    </div>
  </footer>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #27272a;
  }
</style>
