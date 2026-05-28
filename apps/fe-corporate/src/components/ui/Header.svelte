<script lang="ts">
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';
  
  interface Props {
    currentPath?: string;
  }

  let { currentPath = '/' }: Props = $props();

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath === '';
    return currentPath.startsWith(path);
  };

  // Real-time Latency State for a single node
  let latency = $state(12);
  const nodeID = 'NODE_0x842AF';

  onMount(() => {
    const interval = setInterval(() => {
      // Simulate minor network fluctuations
      const change = Math.floor(Math.random() * 5) - 2;
      latency = Math.max(8, Math.min(45, latency + change));
    }, 2000);

    return () => clearInterval(interval);
  });
</script>

<header
  class="flex flex-col sticky top-0 bg-zinc-950/80 backdrop-blur-md z-50 font-mono transition-colors border-b-2 border-zinc-900"
>
  <!-- Main Navigation -->
  <div class="flex justify-between items-end px-6 py-3 md:px-12 md:py-4">
    <div class="flex items-end gap-6">
      <a href="/" class="hover:opacity-70 transition-opacity decoration-none shrink-0">
        <h1 class="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none text-white">
          The Goy<br />Company.
        </h1>
      </a>

      <!-- Single Node Real-time Indicator (Static) -->
      <div class="hidden lg:flex items-center gap-3 border-l border-zinc-900 pl-6 mb-0.5">
        <div class="relative flex items-center justify-center w-2 h-2 shrink-0">
          <div class="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
          <div class="w-1 h-1 bg-green-500 rounded-full"></div>
        </div>
        <div class="flex flex-col">
          <span class="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Grid_Uplink: Active</span>
          <div class="flex items-baseline gap-1.5 leading-none">
            <span class="text-[9px] font-bold text-white/40 tracking-tight">LATENCY:</span>
            <span class="text-[10px] font-black text-white tabular-nums tracking-tighter">{latency}MS</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-8">
      <div class="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest items-center">
        <!-- 01: The Vision & Core Tech -->
        <div class="flex flex-wrap gap-4 border-r border-zinc-800 pr-6 mr-2">
          <a
            href="/manifesto"
            class={cn(
              "px-3 py-2 transition-colors whitespace-nowrap",
              isActive('/manifesto') ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-white hover:text-zinc-950"
            )}
            >Manifesto</a
          >
          <a
            href="https://docs.goycompany.com"
            class={cn(
              "px-3 py-2 transition-colors whitespace-nowrap",
              isActive('/docs') ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-white hover:text-zinc-950"
            )}
            >Docs</a
          >          <a
            href="https://status.goycompany.com"
            class="px-3 py-2 transition-colors whitespace-nowrap text-zinc-400 hover:bg-white hover:text-zinc-950"
            >Network</a
          >
        </div>

        <!-- 02: Utility & Ecosystem -->
        <div class="flex flex-wrap gap-4 border-r border-zinc-800 pr-6 mr-2">
          <a
            href="/services"
            class={cn(
              "px-3 py-2 transition-colors whitespace-nowrap",
              isActive('/services') ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-white hover:text-zinc-950"
            )}
            >Services</a
          >
          <a
            href="/business"
            class={cn(
              "px-3 py-2 transition-colors whitespace-nowrap",
              isActive('/business') ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-white hover:text-zinc-950"
            )}
            >Business</a
          >
        </div>

        <!-- 03: Transition & Support -->
        <div class="flex flex-wrap gap-4">
          <a
            href="/investors"
            class={cn(
              "px-3 py-2 transition-colors whitespace-nowrap",
              isActive('/investors') ? "bg-white text-zinc-950" : "text-zinc-400 hover:bg-white hover:text-zinc-950"
            )}
            >Investors</a
          >
        </div>
        
        <a
          href="/download"
          class="bg-white text-zinc-950 px-5 py-2 hover:bg-zinc-200 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] ml-2 font-black uppercase text-[10px] tracking-widest whitespace-nowrap"
        >
          GET STARTED
        </a>
      </div>
    </div>
  </div>
</header>

<style>
  @keyframes ticker-slow {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .animate-ticker-slow {
    display: flex;
    width: fit-content;
    animation: ticker-slow 10s linear infinite;
  }
</style>
