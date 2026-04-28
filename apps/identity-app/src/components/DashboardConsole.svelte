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
    // sync() will NOT trigger isLoading if already initialized in memory
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

<div class="flex flex-col gap-6 max-w-7xl w-full relative min-h-[600px]">
  <!-- 
    CRITICAL FIX: This loading screen ONLY appears if grid is not initialized.
    Since 'grid' is a persistent singleton across View Transitions, 
    this condition will be FALSE as soon as you navigate back to this route.
  -->
  {#if grid.isLoading && !grid.isInitialized}
    <div class="fixed inset-0 z-[5000] bg-zinc-950 flex flex-col items-center justify-center space-y-6" out:fade>
       <div class="w-12 h-12 border-2 border-zinc-800 border-t-white animate-spin"></div>
       <span class="text-[10px] font-black text-white uppercase tracking-[0.5em]">Syncing_With_Grid...</span>
       <p class="text-[9px] text-zinc-600 uppercase font-mono animate-pulse">Establishing secure handshake</p>
    </div>
  {/if}

  <!-- LOGOUT MODAL -->
  {#if showLogoutModal}
    <div 
      transition:fade={{ duration: 200 }}
      class="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <div 
        transition:fly={{ y: 20, duration: 400 }}
        class="bg-zinc-950 border-2 border-red-900/50 p-8 md:p-12 max-w-lg w-full font-mono relative overflow-hidden shadow-[24px_24px_0px_0px_rgba(0,0,0,0.5)]"
      >
        <header class="mb-8 relative z-10">
          <span class="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-4 block">Security_Protocol // Termination</span>
          <h3 class="text-3xl font-black text-white uppercase tracking-tighter">Terminate Session?</h3>
        </header>

        <p class="text-zinc-400 text-xs md:text-sm leading-relaxed mb-12 relative z-10 uppercase font-bold tracking-wider">
          Warning: Confirming termination will clear all local session artifacts. Secure uplink will be severed immediately.
        </p>

        <div class="flex flex-col md:flex-row gap-4 relative z-10">
           <button 
             onclick={handleLogout}
             class="flex-1 bg-red-600 text-white py-4 font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all shadow-[6px_6px_0px_0px_rgba(153,27,27,0.3)]"
           >
             Yes, Terminate Uplink
           </button>
           <button 
             onclick={() => showLogoutModal = false}
             class="flex-1 border-2 border-zinc-800 text-zinc-500 py-4 font-black uppercase tracking-widest text-[10px] hover:text-white"
           >
             Abort_Action
           </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- TOASTER -->
  {#if toast.visible}
    <div 
      transition:fly={{ y: 20, duration: 300 }}
      class="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] bg-zinc-100 text-zinc-950 px-6 py-3 border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-4"
    >
      <div class="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
      {toast.message}
    </div>
  {/if}

  <!-- HEADER: SYSTEM STATUS BAR -->
  <header class="bg-zinc-950 border-2 border-zinc-800 p-4 flex justify-between items-center font-mono">
    <div class="flex items-center gap-4">
      <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-white">System_Status // Uplink_Established</span>
    </div>
    <div class="flex items-center gap-8">
      <div class="hidden md:flex gap-6 text-[9px] font-black uppercase text-zinc-500">
        <span>Session_ID: {grid.profile.pubkey.slice(0, 8)}</span>
        <span>Nostr_Protocol: v1.0.0</span>
      </div>
      <button 
        onclick={() => showLogoutModal = true}
        class="text-[9px] font-black uppercase text-red-500 border border-red-900/50 px-3 py-1 hover:bg-red-500 hover:text-white transition-all tracking-widest"
      >
        [ Terminate Session ]
      </button>
    </div>
  </header>

  <!-- SOCIAL PROFILE HEADER -->
  <section class="bg-zinc-950 border-2 border-zinc-800 overflow-hidden relative group">
    <!-- Banner Area -->
    <div class="h-48 w-full bg-zinc-900 relative overflow-hidden">
      <!-- Technical Base Grid (Always there) -->
      <div class="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div class="w-full h-full" style="background-image: repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 20px);"></div>
      </div>

      {#if grid.profile.banner}
        <img 
          src={grid.profile.banner} 
          alt="Banner" 
          onload={() => bannerLoaded = true}
          class="absolute inset-0 w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700" 
          style="opacity: {bannerLoaded ? '0.5' : '0'}"
        />
      {/if}
      <div class="absolute bottom-0 right-0 p-4 text-[8rem] font-black text-white/5 leading-none tracking-tighter select-none uppercase">GOY_ID</div>
    </div>

    <div class="px-8 pb-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 mb-6 gap-6">
        <div class="w-32 h-32 bg-black border-4 border-zinc-950 relative z-10 overflow-hidden group/avatar">
          <!-- Always-visible Identicon (The Stable Base) -->
          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${grid.profile.pubkey}`} alt="Identicon" class="absolute inset-0 w-full h-full opacity-40 grayscale" />
          
          {#if grid.profile.avatar}
            <img 
              src={grid.profile.avatar} 
              alt="Avatar" 
              onload={() => avatarLoaded = true}
              class="absolute inset-0 w-full h-full object-cover grayscale contrast-125 shadow-2xl transition-opacity duration-500" 
              style="opacity: {avatarLoaded ? '1' : '0'}"
            />
          {/if}
        </div>

        <div class="flex gap-4 relative z-10">
          <button 
            onclick={copyPubKey}
            class="bg-zinc-100 text-zinc-950 px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
          >
            Copy Pubkey
          </button>
          <button 
            onclick={() => showEditModal = true}
            class="border-2 border-zinc-700 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:border-white transition-all"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <h2 class="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            {grid.profile.name || 'ANONYMOUS_ENTITY'}
            {#if grid.profile.nip05}
              <div class="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" title="Verified Sovereign (NIP-05)"></div>
            {/if}
          </h2>
          <span class="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1 block">
            {grid.profile.nip05 || 'UNVERIFIED_ANONYMOUS'}
          </span>
        </div>

        <p class="text-zinc-400 text-xs md:text-sm leading-relaxed max-w-2xl font-medium italic">
          {grid.profile.bio || 'No transmission broadcasted in the bio layer.'}
        </p>

        <div class="flex gap-8 pt-2">
          <div class="flex gap-2 items-baseline">
            <span class="text-lg font-black text-white tabular-nums">{grid.profile.following}</span>
            <span class="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Following</span>
          </div>
          <div class="flex gap-2 items-baseline">
            <span class="text-lg font-black text-white tabular-nums">{grid.profile.followers}</span>
            <span class="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Followers</span>
          </div>
          <div class="flex gap-2 items-baseline ml-auto">
             <span class="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Grid_Link:</span>
             <span class="text-[10px] font-black text-zinc-400 uppercase">SYNC_COMPLETE</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
    <main class="col-span-12 md:col-span-8 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        <div class="bg-zinc-950 border-2 border-zinc-800 flex flex-col group relative overflow-hidden">
          <!-- Background Decoration -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[60px] pointer-events-none"></div>
          
          <header class="p-6 border-b border-zinc-900 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Secure_Wallet // Liquid_Uplink</span>
            </div>
            <span class="text-[8px] font-black text-zinc-600 uppercase tabular-nums">ID: {grid.profile.pubkey.slice(0, 12)}</span>
          </header>
          
          <div class="p-8 space-y-8 flex-1">
            <!-- Main Balance -->
            <div>
              <span class="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Available_Liquidity</span>
              <div class="flex items-baseline gap-3">
                <h3 class="text-5xl font-black tracking-tighter text-white tabular-nums">
                  1,242.42
                </h3>
                <span class="text-xl font-black text-green-500/80 tracking-tighter">$GOYCO</span>
              </div>
              <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                ≈ 0.05218200 <span class="text-zinc-700">BTC</span>
              </p>
            </div>

            <!-- Vested / Locked Assets -->
            <div class="space-y-4 pt-4 border-t border-zinc-900">
              <div class="flex justify-between items-end">
                <div>
                  <span class="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Vesting_Schedule</span>
                  <span class="text-xs font-black text-white tabular-nums">4,500.00 <span class="text-zinc-500 text-[10px]">$GOYCO</span></span>
                </div>
                <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">72% Cleared</span>
              </div>
              <!-- Technical Progress Bar -->
              <div class="h-1.5 w-full bg-zinc-900 flex gap-0.5 p-0.5 border border-zinc-800">
                <div class="h-full bg-green-500/40 w-[72%]"></div>
                <div class="h-full bg-zinc-800 w-[28%]"></div>
              </div>
            </div>
          </div>

          <!-- Wallet Actions -->
          <footer class="p-2 border-t border-zinc-800 grid grid-cols-2 gap-2 bg-zinc-900/20">
            <button class="bg-zinc-800 hover:bg-zinc-700 text-white py-3 text-[9px] font-black uppercase tracking-widest transition-all border border-zinc-700 active:translate-y-0.5 active:shadow-none">
              [ Receive ]
            </button>
            <button class="bg-white hover:bg-zinc-200 text-zinc-950 py-3 text-[9px] font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-0.5 active:shadow-none">
              [ Transmit ]
            </button>
          </footer>
        </div>

        <div class="bg-zinc-950 border-2 border-zinc-800 p-8">
          <header class="mb-6">
            <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Network_Health // Global_Mesh</span>
          </header>

          <div class="space-y-4">
            {#each grid.relays as relay}
              <div class="flex justify-between items-center border-b border-zinc-900 pb-3 last:border-0">
                <div>
                  <span class="text-[10px] font-black text-white uppercase block">{relay.name}</span>
                  <span class="text-[8px] font-bold text-zinc-500 uppercase">{relay.status}</span>
                </div>
                <div class="text-right">
                  <span class="text-xl font-black text-white tabular-nums tracking-tighter">{relay.latency.toFixed(0)}ms</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </main>

    <aside class="col-span-12 md:col-span-4">
      <div class="bg-black border-2 border-zinc-800 p-6 font-mono h-full flex flex-col">
        <div class="flex-1 overflow-hidden">
          <div class="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2 flex justify-between items-center">
            <span>Transmission_Logs</span>
            <span class="text-[8px] animate-pulse text-green-900/60">LIVE_LINK</span>
          </div>
          <div class="text-[9px] space-y-2">
            {#if grid.logs.length === 0}
              <div class="text-zinc-700 italic animate-pulse mt-4">>>> MONITORING_INCOMING_TRANSMISSIONS...</div>
            {:else}
              {#each grid.logs as log (log.id)}
                <button 
                  onclick={() => selectedLog = log}
                  in:fly={{ x: -10, duration: 300 }} 
                  class="grid grid-cols-12 gap-2 group w-full text-left hover:bg-zinc-900/50 p-1 transition-colors"
                >
                   <span class="col-span-3 text-zinc-700">[{log.time}]</span>
                   <span class="col-span-7 text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">{log.action}</span>
                   <span class="col-span-2 text-right text-green-900/60">{log.status}</span>
                </button>
              {/each}
            {/if}
          </div>
        </div>
        
        <div class="mt-8 border-t border-zinc-900 pt-4 flex justify-between items-center">
           <span class="text-[8px] font-black text-zinc-700 uppercase">Uplink: Active // Local_Relay: SIM</span>
           <span class="text-[8px] font-black text-zinc-800 uppercase tabular-nums">Events: {grid.logs.length}</span>
        </div>
      </div>
    </aside>
  </div>

  {#if selectedLog}
    <LogDetailModal log={selectedLog} onClose={() => selectedLog = null} />
  {/if}

  {#if showEditModal}
    <EditProfileModal onClose={() => showEditModal = false} />
  {/if}
</div>
