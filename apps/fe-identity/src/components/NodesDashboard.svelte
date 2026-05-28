<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { grid } from '$lib/grid-state.svelte';

  let isLoading = $state(true);
  let relayInput = $state('');
  
  // Simulated node health for Ghost Operators
  let nodeHealth = $state({
    cpu: 12,
    ram: 42,
    storage: 68,
    uptime: '99.98%',
    version: 'GOY_NODE_V2.1.0'
  });

  async function addRelay() {
    if (!relayInput.startsWith('wss://')) {
       alert('INVALID_PROTOCOL: Use wss://');
       return;
    }
    const newRelay = {
       name: relayInput.replace('wss://', '').toUpperCase(),
       status: 'ONLINE',
       latency: 0
    };
    grid.relays = [...grid.relays, newRelay];
    grid.addLog(`CONNECTING_TO_RELAY: ${relayInput.toUpperCase()}`);
    await grid.saveNodes();
    relayInput = '';
  }

  async function removeRelay(relayName: string) {
    grid.relays = grid.relays.filter(r => r.name !== relayName);
    grid.addLog(`NODE_REMOVED: ${relayName}`);
    await grid.saveNodes();
  }

  onMount(() => {
    const activePubkey = sessionStorage.getItem('goy_pubkey');
    if (activePubkey) {
      grid.sync(activePubkey);
    }
    
    setTimeout(() => {
      isLoading = false;
    }, 600);
  });
</script>

<div class="flex flex-col gap-8 max-w-7xl w-full relative min-h-[600px] font-mono">
  {#if isLoading}
    <div class="fixed inset-0 z-[5000] bg-zinc-950 flex flex-col items-center justify-center space-y-6" out:fade>
       <div class="w-12 h-12 border-2 border-zinc-800 border-t-white animate-spin"></div>
       <span class="text-[10px] font-black text-white uppercase tracking-[0.5em]">Scanning_Mesh_Network...</span>
    </div>
  {/if}

  <!-- Header Section -->
  <header class="bg-zinc-950 border-2 border-zinc-800 p-8 relative overflow-hidden group">
    <div class="absolute top-0 right-0 p-4 text-[6rem] font-black text-white/5 leading-none tracking-tighter select-none uppercase">NODES</div>
    
    <div class="relative z-10">
      <span class="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-4 block">Infrastructure_Layer // Relay_Orchestration</span>
      <h1 class="text-5xl font-black text-white tracking-tighter uppercase">Node_Command_Center</h1>
      <p class="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">
        Active Uplinks: {grid.relays.filter(r => r.status === 'ONLINE').length} // Total Nodes in Mesh: 4
      </p>
    </div>
  </header>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <main class="lg:col-span-8 space-y-8">
      <!-- Active Relays -->
      <section class="bg-zinc-950 border-2 border-zinc-800 overflow-hidden">
        <header class="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
          <span class="text-[10px] font-black text-white uppercase tracking-widest">Active_Relay_Grid</span>
          <div class="flex gap-2">
             <div class="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
             <span class="text-[8px] font-bold text-zinc-600 uppercase">Synchronization: REAL_TIME</span>
          </div>
        </header>

        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each grid.relays as relay (relay.name)}
            <div class="bg-black border border-zinc-800 p-4 flex justify-between items-center group hover:border-zinc-500 transition-colors relative">
              <div>
                <span class="text-[10px] font-black text-white uppercase block">{relay.name}</span>
                <div class="flex items-center gap-2 mt-1">
                  <div class={`w-1.5 h-1.5 rounded-full ${relay.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span class="text-[8px] font-bold text-zinc-500 uppercase">{relay.status}</span>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <div class="text-right">
                  <span class="text-xl font-black text-white tabular-nums tracking-tighter">{relay.latency.toFixed(0)}ms</span>
                  <span class="text-[7px] block font-black text-zinc-700">RTT_DELAY</span>
                </div>
                <button 
                  onclick={() => removeRelay(relay.name)}
                  class="opacity-0 group-hover:opacity-100 text-red-900 hover:text-red-500 transition-all text-[8px] font-black border border-red-900/20 px-2 py-1"
                >
                  [ DISCONNECT ]
                </button>
              </div>
            </div>
          {/each}
        </div>

        <footer class="p-4 bg-zinc-900/20 border-t border-zinc-900">
           <div class="flex gap-4">
              <input 
                bind:value={relayInput}
                type="text" 
                placeholder="wss://new-relay-address.io" 
                class="flex-1 bg-black border border-zinc-800 p-3 text-[10px] text-white font-mono focus:outline-none focus:border-white transition-colors"
              />
              <button 
                onclick={addRelay}
                class="bg-white text-zinc-950 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
              >
                Connect_Node
              </button>
           </div>
        </footer>
      </section>

      <!-- Ghost Operator Intelligence -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-zinc-950 border-2 border-zinc-800 p-6 flex flex-col justify-between">
           <span class="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Node_CPU_Load</span>
           <div class="flex items-baseline gap-2">
             <span class="text-4xl font-black text-white tabular-nums">{nodeHealth.cpu}%</span>
             <div class="flex-1 h-1 bg-zinc-900 relative overflow-hidden">
                <div class="absolute inset-0 bg-green-500/40" style="width: {nodeHealth.cpu}%"></div>
             </div>
           </div>
        </div>
        <div class="bg-zinc-950 border-2 border-zinc-800 p-6 flex flex-col justify-between">
           <span class="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Memory_Allocation</span>
           <div class="flex items-baseline gap-2">
             <span class="text-4xl font-black text-white tabular-nums">{nodeHealth.ram}%</span>
             <div class="flex-1 h-1 bg-zinc-900 relative overflow-hidden">
                <div class="absolute inset-0 bg-green-600/40" style="width: {nodeHealth.ram}%"></div>
             </div>
           </div>
        </div>
        <div class="bg-zinc-950 border-2 border-zinc-800 p-6 flex flex-col justify-between">
           <span class="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Storage_Capacity</span>
           <div class="flex items-baseline gap-2">
             <span class="text-4xl font-black text-white tabular-nums">{nodeHealth.storage}%</span>
             <div class="flex-1 h-1 bg-zinc-900 relative overflow-hidden">
                <div class="absolute inset-0 bg-green-700/40" style="width: {nodeHealth.storage}%"></div>
             </div>
           </div>
        </div>
      </section>
    </main>

    <!-- Side Intelligence -->
    <aside class="lg:col-span-4 space-y-8">
       <section class="bg-black border-2 border-zinc-800 p-6 font-mono">
         <header class="mb-6 border-b border-zinc-900 pb-4">
            <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Network_Optimizer</span>
         </header>
         
         <div class="space-y-4">
            <div class="p-4 border border-zinc-800 hover:border-green-500/50 transition-colors cursor-pointer group">
               <span class="text-[9px] font-black text-white uppercase block mb-1">Auto-Connect Fastest</span>
               <p class="text-[8px] text-zinc-600 uppercase leading-tight">Switch uplink to lowest latency node automatically.</p>
               <div class="mt-3 flex justify-end">
                  <div class="w-8 h-4 bg-green-500/20 border border-green-500/50 relative">
                     <div class="absolute right-0 top-0 bottom-0 w-4 bg-green-400"></div>
                  </div>
               </div>
            </div>

            <div class="p-4 border border-zinc-800 opacity-40 grayscale pointer-events-none">
               <span class="text-[9px] font-black text-white uppercase block mb-1">On-Chain Relay (DVM)</span>
               <p class="text-[8px] text-zinc-600 uppercase leading-tight">Enable automated task execution on decentralized VM.</p>
               <span class="text-[7px] text-zinc-700 block mt-2">UNLOCKED_AT_GOY_LEVEL_4</span>
            </div>
         </div>
       </section>

       <section class="bg-zinc-950 border-2 border-zinc-800 p-8">
          <header class="mb-4">
             <span class="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Technical_Identity</span>
             <h4 class="text-sm font-black text-white uppercase tracking-tighter">{nodeHealth.version}</h4>
          </header>
          <div class="text-[9px] text-zinc-500 space-y-1 uppercase">
             <p>Boot: 2026-04-20 09:12:44</p>
             <p>Uptime: {nodeHealth.uptime}</p>
             <p>Encryption: ChaCha20-Poly1305</p>
             <p>Region: Europe-Zurich-01</p>
          </div>
          <div class="mt-8">
             <button class="w-full border border-red-900/50 text-red-500 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
               [ Hard_Reset_Node ]
             </button>
          </div>
       </section>
    </aside>
  </div>
</div>
