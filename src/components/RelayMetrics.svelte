<script lang="ts">
  import { onMount } from 'svelte';

  let relays = $state([
    { url: 'WSS://ZURICH.GOY.CO', status: 'ONLINE', latency: 18, color: 'bg-zinc-900' },
    { url: 'WSS://LONDON.GOY.CO', status: 'ONLINE', latency: 24, color: 'bg-zinc-500' },
    { url: 'WSS://NEWYORK.GOY.CO', status: 'ONLINE', latency: 42, color: 'bg-zinc-300' },
    { url: 'WSS://TOKYO.GOY.CO', status: 'ONLINE', latency: 31, color: 'bg-zinc-400' },
    { url: 'WSS://DUBAI.GOY.CO', status: 'ONLINE', latency: 29, color: 'bg-zinc-800' },
    { url: 'WSS://SAOPAULO.GOY.CO', status: 'ONLINE', latency: 45, color: 'bg-zinc-400' },
    { url: 'WSS://MADRID.GOY.CO', status: 'ONLINE', latency: 22, color: 'bg-zinc-700' },
    { url: 'WSS://SFO.GOY.CO', status: 'ONLINE', latency: 54, color: 'bg-zinc-300' },
    { url: 'WSS://SINGAPORE.GOY.CO', status: 'ONLINE', latency: 48, color: 'bg-zinc-500' },
    { url: 'WSS://SYDNEY.GOY.CO', status: 'ONLINE', latency: 57, color: 'bg-zinc-600' },
  ]);

  $effect(() => {
    const interval = setInterval(() => {
      for (const r of relays) {
        const jitter = Math.floor(Math.random() * 10) - 5; 
        r.latency = Math.max(18, Math.min(57, r.latency + jitter));
      }
    }, 2000);

    return () => clearInterval(interval);
  });
</script>

<div class="flex flex-col gap-8 font-mono text-zinc-900 transition-colors">
  <header class="mb-4">
    <h2
      class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2 border-l-2 border-zinc-900 pl-3 transition-colors"
    >
      Network Status // Global_Mesh
    </h2>
    <div class="flex items-baseline gap-3">
      <span class="text-5xl md:text-6xl font-black uppercase tracking-tighter text-zinc-900 transition-colors">99.9</span>
      <span class="text-lg font-bold uppercase text-zinc-400">Uptime</span>
    </div>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
    {#each relays as relay (relay.url)}
      <div class="group border-b border-zinc-100 pb-4 flex flex-col justify-center transition-colors">
        <div class="flex justify-between items-center mb-1">
          <h3
            class="text-sm md:text-base font-black tracking-tight uppercase break-all max-w-[65%] text-zinc-800 transition-colors"
          >
            {relay.url}
          </h3>
          
          <div class="relative overflow-hidden h-6 md:h-8 flex items-center">
            {#key relay.latency}
              <span
                class="text-xl md:text-2xl font-black tracking-tighter tabular-nums text-zinc-900 animate-value-change transition-colors"
              >
                {relay.latency}ms
              </span>
            {/key}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full {relay.color} animate-pulse"></div>
          <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-colors">{relay.status}</span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  @keyframes slide-up-fade {
    0% {
      opacity: 0;
      transform: translateY(5px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-value-change {
    display: inline-block;
    animation: slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>
