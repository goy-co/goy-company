<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { grid } from '$lib/grid-state.svelte';
  import LogDetailModal from './ui/LogDetailModal.svelte';
  import EditProfileModal from './ui/EditProfileModal.svelte';

  // UI Local States
  let showLogoutModal = $state(false);
  let showEditModal = $state(false);
  let selectedLog = $state<any>(null);
  let avatarLoaded = $state(false);
  let bannerLoaded = $state(false);
  let toast = $state<{ message: string; visible: boolean }>({ message: '', visible: false });
  let toastTimeout: any;

  function showToast(message: string) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.message = message;
    toast.visible = true;
    toastTimeout = setTimeout(() => {
      toast.visible = false;
    }, 3000);
  }

  onMount(() => {
    const activePubkey = sessionStorage.getItem('goy_pubkey');
    if (!activePubkey) {
      window.location.href = '/';
      return;
    }
    grid.sync(activePubkey);
  });

  function copyPubKey() {
    navigator.clipboard.writeText(grid.profile.pubkey);
    showToast('PUBLIC_KEY_COPIED_TO_GRID');
  }

  function handleLogout() {
    sessionStorage.removeItem('goy_pubkey');
    grid.cleanup();
    window.location.href = '/';
  }
</script>

<!-- FIXED VIEWPORT CONTAINER (NO GLOBAL SCROLL) -->
<div class="flex flex-col h-[calc(100vh-100px)] w-full relative overflow-hidden font-mono text-white p-2">
  
  {#if grid.isLoading && !grid.isInitialized}
    <div class="fixed inset-0 z-[5000] bg-zinc-950 flex flex-col items-center justify-center space-y-6" out:fade>
       <div class="w-12 h-12 border-2 border-zinc-800 border-t-white animate-spin"></div>
       <span class="text-[10px] font-black text-white uppercase tracking-[0.5em]">Syncing_With_Grid...</span>
    </div>
  {/if}

  <!-- TOP BAR -->
  <header class="bg-zinc-950 border-2 border-zinc-800 p-2 px-4 flex justify-between items-center mb-2 shrink-0">
    <div class="flex gap-4 items-center">
      <div class="flex gap-1.5 items-center">
        <div class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
        <span class="text-[8px] font-black uppercase tracking-widest">Grid_Uplink_Active</span>
      </div>
      <span class="text-[9px] text-zinc-600 font-bold tabular-nums uppercase border-l border-zinc-900 pl-4">{grid.profile.pubkey.slice(0, 24)}...</span>
    </div>
    <button onclick={() => showLogoutModal = true} class="text-red-900 hover:text-red-500 transition-colors text-[8px] font-black uppercase border border-red-900/20 px-3 py-1">[ Terminate_Session ]</button>
  </header>

  <!-- MAIN FLEX CONTENT -->
  <div class="flex-1 flex flex-col gap-4 min-h-0">
    
    <!-- PRIMARY IDENTITY MODULE (Large - approx 50-60% height) -->
    <section class="flex-[1.5] bg-zinc-950 border-2 border-zinc-800 relative overflow-hidden group min-h-0 flex flex-col">
        <div class="absolute inset-0 h-full bg-zinc-900 overflow-hidden">
          {#if grid.profile.banner}
            <img src={grid.profile.banner} alt="" class="w-full h-full object-cover grayscale opacity-10" />
          {:else}
            <div class="w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.04),transparent)]"></div>
          {/if}
          <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        </div>

        <div class="relative p-10 flex gap-10 items-end flex-1 min-h-0">
           <!-- Avatar -->
           <div class="w-32 h-32 md:w-44 md:h-44 bg-zinc-950 border-2 border-zinc-800 shrink-0 relative overflow-hidden shadow-2xl">
              <img src={grid.profile.avatar} alt="" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
           </div>

           <!-- Info -->
           <div class="flex-1 space-y-4 pb-2 min-w-0">
              <div>
                <h2 class="text-4xl font-black uppercase tracking-tighter flex items-center gap-4 truncate">
                  {grid.profile.name || 'ANONYMOUS_ENTITY'}
                  {#if grid.profile.nip05}<div class="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]"></div>{/if}
                </h2>
                <span class="text-[11px] text-zinc-500 uppercase font-black tracking-widest mt-1 block">{grid.profile.nip05 || 'UNVERIFIED_UPLINK'}</span>
              </div>

              <p class="text-zinc-400 text-xs leading-relaxed max-w-xl font-medium italic line-clamp-3">
                {grid.profile.bio || 'No biography transmission detected in the decentralized grid layer.'}
              </p>
              
              <div class="flex gap-4 pt-2">
                 <button onclick={copyPubKey} class="bg-zinc-100 text-zinc-950 px-6 py-2 text-[10px] font-black uppercase hover:bg-white transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">Copy_Handshake_Key</button>
                 <button onclick={() => showEditModal = true} class="border-2 border-zinc-700 text-white px-6 py-2 text-[10px] font-black uppercase hover:border-white transition-all">Edit_Entity_Meta</button>
              </div>
           </div>

           <!-- Secondary Info (Desktop) -->
           <div class="hidden xl:flex flex-col gap-6 pb-2 shrink-0">
              {#if grid.profile.website}
                 <div class="text-right p-3 border-r-2 border-zinc-800">
                    <span class="text-[8px] font-black text-zinc-600 uppercase block mb-1">Web_Portal</span>
                    <a href={grid.profile.website} target="_blank" class="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">{grid.profile.website.replace('https://','').replace('http://','')}</a>
                 </div>
              {/if}
              {#if grid.profile.lud16}
                 <div class="text-right p-3 border-r-2 border-zinc-800">
                    <span class="text-[8px] font-black text-zinc-600 uppercase block mb-1">Lightning_Uplink</span>
                    <span class="text-[10px] font-bold text-orange-500/80">{grid.profile.lud16}</span>
                 </div>
              {/if}
           </div>
        </div>
        
        <!-- Decoration Bar -->
        <div class="h-1 w-full bg-zinc-900 mt-auto">
           <div class="h-full bg-green-500/20 w-1/3"></div>
        </div>
    </section>

    <!-- SECONDARY MODULES (Smaller - approx 40% height) -->
    <div class="flex-1 grid grid-cols-12 gap-4 min-h-0">
      
      <!-- Wallet -->
      <section class="col-span-4 bg-zinc-950 border-2 border-zinc-800 flex flex-col min-h-0">
         <header class="p-3 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center shrink-0">
            <span class="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Liquid_Liquidity</span>
            <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
         </header>
         <div class="p-4 flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
            <h3 class="text-2xl font-black tracking-tighter text-white">1,242.42 <span class="text-sm text-green-500/80">$GOYCO</span></h3>
            <p class="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">≈ 0.0521 BTC</p>
         </div>
         <footer class="p-2 bg-zinc-900/20 border-t border-zinc-900">
            <button class="w-full text-[7px] font-black uppercase tracking-widest hover:text-green-400 transition-colors">Treasury_Terminal -></button>
         </footer>
      </section>

      <!-- Nodes -->
      <section class="col-span-4 bg-zinc-950 border-2 border-zinc-800 flex flex-col min-h-0">
         <header class="p-3 border-b border-zinc-900 bg-zinc-900/30 shrink-0">
            <span class="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Infrastructure</span>
         </header>
         <div class="p-3 flex-1 space-y-2 overflow-y-auto custom-scrollbar min-h-0">
            {#each grid.relays.slice(0, 3) as relay}
              <div class="flex items-center justify-between p-2 border border-zinc-900 bg-black/20">
                <span class="text-[8px] font-black text-zinc-500 truncate mr-2">{relay.name}</span>
                <span class="text-[9px] font-black text-zinc-300 tabular-nums">{relay.latency.toFixed(0)}ms</span>
              </div>
            {/each}
         </div>
         <footer class="p-2 bg-zinc-900/20 border-t border-zinc-900">
            <button class="w-full text-[7px] font-black uppercase tracking-widest hover:text-green-400 transition-colors">Nodes_Orchestration -></button>
         </footer>
      </section>

      <!-- Logs -->
      <aside class="col-span-4 bg-black border-2 border-zinc-800 flex flex-col min-h-0 overflow-hidden">
         <header class="p-3 border-b border-zinc-900 bg-zinc-900/40 shrink-0">
            <span class="text-[8px] font-black text-white uppercase tracking-widest">Grid_Logs</span>
         </header>
         <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-h-0">
            {#each grid.logs as log}
              <button onclick={() => selectedLog = log} class="w-full text-left p-2 border border-zinc-900 hover:border-zinc-700 transition-all group flex justify-between items-center">
                  <span class="text-[8px] font-black text-zinc-500 uppercase truncate mr-2 group-hover:text-green-500">{log.action}</span>
                  <span class="text-[7px] text-zinc-800 tabular-nums shrink-0">{log.time}</span>
              </button>
            {/each}
         </div>
      </aside>

    </div>
  </div>

  <!-- OVERLAYS -->
  {#if selectedLog}<LogDetailModal log={selectedLog} onClose={() => selectedLog = null} />{/if}
  {#if showEditModal}<EditProfileModal onClose={() => showEditModal = false} />{/if}
  {#if toast.visible}
     <div transition:fade class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 text-[8px] font-black uppercase z-[1000]">{toast.message}</div>
  {/if}
</div>
