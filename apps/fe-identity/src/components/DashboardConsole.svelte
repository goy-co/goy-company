<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { grid } from '$lib/grid-state.svelte';
  import { toNpub } from '@goy/nostr';
  import LogDetailModal from './ui/LogDetailModal.svelte';
  import EditProfileModal from './ui/EditProfileModal.svelte';

  // UI Local States
  let showLogoutModal = $state(false);
  let showEditModal = $state(false);
  let showExportModal = $state(false);
  let selectedLog = $state<{ id: string; time: string; action: string; status: string; raw?: any } | null>(null);
  let toast = $state<{ message: string; visible: boolean }>({ message: '', visible: false });
  let toastTimeout: ReturnType<typeof setTimeout> | undefined;

  function showToast(message: string) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.message = message;
    toast.visible = true;
    toastTimeout = setTimeout(() => {
      toast.visible = false;
    }, 3000);
  }

  onMount(() => {
    let activePubkey = sessionStorage.getItem('goy_pubkey');
    if (!activePubkey) {
      window.location.href = '/';
      return;
    }

    // AUTO-REPAIR: If the ID contains 'GUEST_', it's an old-format session. 
    if (activePubkey.startsWith('GUEST_')) {
       console.warn('Obsolete Session Format Detected. Repairing...');
       const realId = sessionStorage.getItem('goy_user_id');
       if (realId) {
          activePubkey = realId;
          sessionStorage.setItem('goy_pubkey', realId);
       }
    }

    grid.sync(activePubkey);
  });

  function copyPubKey() {
    const npub = toNpub(grid.profile.pubkey);
    navigator.clipboard.writeText(npub);
    showToast('PUBLIC_KEY_COPIED_TO_GRID');
  }

  function handleLogout() {
    sessionStorage.clear();
    grid.cleanup();
    window.location.href = '/';
  }

  let isExporting = $state(false);
  let exportKeys = $state<{ privkey: string; pubkey: string } | null>(null);

  async function handleExportConfirm() {
    isExporting = true;
    try {
      const host = window.location.hostname === 'localhost' ? 'http://localhost:8787' : 'https://be-api.goycompany.workers.dev';
      const userId = sessionStorage.getItem('goy_user_id');
      
      const res = await fetch(`${host}/api/migrate-to-nostr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error || 'Migration failed');
      }
      
      const data = await res.json();
      exportKeys = data.keys;
      
      showToast('SOVEREIGN_MIGRATION_SUCCESSFUL');
      
      // Switch session locally without reloading immediately to show keys
      sessionStorage.setItem('goy_pubkey', data.keys.pubkey);
      sessionStorage.setItem('goy_session_type', 'SOVEREIGN');
      sessionStorage.removeItem('goy_user_id');
      grid.cleanup();
      
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Unknown error';
      showToast(`MIGRATION_FAILED: ${message}`);
      showExportModal = false;
    } finally {
      isExporting = false;
    }
  }

  function completeMigration() {
    window.location.reload();
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
        <span class="text-[8px] font-black uppercase tracking-widest text-green-500">Grid_Uplink_Active</span>
      </div>
      <span class="text-[9px] text-zinc-600 font-bold tabular-nums uppercase border-l border-zinc-900 pl-4">{grid.profile.pubkey.slice(0, 24)}...</span>
    </div>
    <button onclick={() => showLogoutModal = true} class="text-red-900 hover:text-red-500 transition-colors text-[8px] font-black uppercase border border-red-900/20 px-3 py-1">[ Terminate_Session ]</button>
  </header>

  <!-- MAIN FLEX CONTENT -->
  <div class="flex-1 flex flex-col gap-4 min-h-0">
    
    <!-- PRIMARY IDENTITY MODULE -->
    <section class="flex-[1.8] bg-zinc-950 border-2 border-zinc-800 relative overflow-hidden group min-h-0 flex flex-col">
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
              <img src={grid.profile.avatar} alt="" class="w-full h-full object-cover grayscale" />
           </div>

           <!-- Info -->
           <div class="flex-1 space-y-4 pb-2 min-w-0">
              <div>
                <h2 class="text-4xl font-black uppercase tracking-tighter flex items-center min-w-0">
                  <span class="truncate">{grid.profile.name || 'ANONYMOUS_ENTITY'}</span>
                  {#if grid.profile.verified}
                    <div class="ml-4 shrink-0 flex items-center gap-1.5 px-2 py-1 border border-green-500/10 bg-green-500/5 text-green-500/80 font-black text-[9px] uppercase tracking-widest">
                      <span>[</span>
                      <span class="text-green-500">Verified</span>
                      <div class="w-2 h-2 bg-zinc-950 border border-green-500/40 overflow-hidden relative translate-y-[0.5px]">
                        <div class="absolute inset-x-0 h-[1px] bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)] animate-scanline"></div>
                      </div>
                      <span>]</span>
                    </div>
                  {/if}
                </h2>
                <span class="text-[11px] text-zinc-500 uppercase font-black tracking-widest mt-1 block">{grid.profile.nip05 || 'UNVERIFIED_UPLINK'}</span>
              </div>

              <p class="text-zinc-400 text-xs leading-relaxed max-w-xl font-medium italic line-clamp-2">
                {grid.profile.bio || 'No biography transmission detected in the decentralized grid layer.'}
              </p>
              
              <div class="flex gap-4 pt-2">
                 {#if grid.sessionType === 'TRADITIONAL'}
                   <button onclick={() => showExportModal = true} class="bg-zinc-100 text-zinc-950 px-6 py-2 text-[10px] font-black uppercase hover:bg-white transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">Export_to_Nostr</button>
                 {:else}
                   <button onclick={copyPubKey} class="bg-zinc-100 text-zinc-950 px-6 py-2 text-[10px] font-black uppercase hover:bg-white transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">Copy_Key</button>
                 {/if}
                 <button onclick={() => showEditModal = true} class="border-2 border-zinc-700 text-white px-6 py-2 text-[10px] font-black uppercase hover:border-white transition-all">Edit_Profile</button>
              </div>
           </div>

           <!-- Details (Desktop) -->
           <div class="hidden xl:flex flex-col gap-4 pb-2 shrink-0">
              {#if grid.profile.website}
                 <div class="text-right">
                    <span class="text-[7px] font-black text-zinc-600 uppercase block">Portal</span>
                    <span class="text-[9px] font-bold text-zinc-400">{grid.profile.website.replace('https://','').replace('http://','')}</span>
                 </div>
              {/if}
              {#if grid.profile.lud16}
                 <div class="text-right">
                    <span class="text-[7px] font-black text-zinc-600 uppercase block">Lightning</span>
                    <span class="text-[10px] font-bold text-zinc-400">{grid.profile.lud16}</span>
                 </div>
              {/if}
           </div>
        </div>
        
        <div class="h-1 w-full bg-zinc-900 mt-auto">
           <div class="h-full bg-green-500/20 w-1/4"></div>
        </div>
    </section>

    <!-- SECONDARY MODULES -->
    <div class="flex-1 grid grid-cols-12 gap-4 min-h-0">
      
      <!-- Wallet Module -->
      <section class="col-span-4 bg-zinc-950 border-2 border-zinc-800 flex flex-col min-h-0 relative group">
         <header class="p-2.5 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center shrink-0 z-10">
            <span class="text-[8px] font-black text-white uppercase tracking-widest">Liquid_Wealth</span>
            <div class="flex gap-2 items-center">
               <span class="text-[7px] font-bold text-green-500/80">+12.4% YTD</span>
               <div class="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            </div>
         </header>
         
         <div class="flex-1 flex flex-col relative min-h-0">
            <!-- Ambient Background Chart -->
            <div class="absolute top-0 left-0 right-0 h-32 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
               <svg class="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                  <defs>
                     <linearGradient id="wealthBgGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#22c55e" stop-opacity="0.8" />
                        <stop offset="100%" stop-color="#000" stop-opacity="0" />
                     </linearGradient>
                  </defs>
                  <path d="M0,60 L0,50 C20,48 40,55 60,40 C80,30 100,52 120,35 C140,20 160,30 180,15 L200,10 L200,60 Z" fill="url(#wealthBgGradient)" />
                  <path d="M0,50 C20,48 40,55 60,40 C80,30 100,52 120,35 C140,20 160,30 180,15 L200,10" fill="none" stroke="#22c55e" stroke-width="0.5" />
               </svg>
            </div>

            <!-- Content Overlay -->
            <div class="relative z-10 p-3 flex-1 flex flex-col justify-end min-h-0">
               <div class="flex justify-between items-end mb-2">
                  <div>
                     <span class="text-[7px] font-black text-zinc-600 uppercase block mb-0.5">Total_Equity</span>
                     <h3 class="text-2xl font-black tracking-tighter text-white tabular-nums leading-none">
                        1,242.42 <span class="text-[9px] text-green-500/60 tracking-normal ml-0.5">$GOYCO</span>
                     </h3>
                  </div>
                  <div class="text-right">
                     <span class="text-[8px] font-bold text-zinc-500 uppercase tabular-nums">≈ 0.052 BTC</span>
                  </div>
               </div>
               
               <div class="flex gap-2 mb-1">
                  <button class="flex-1 bg-zinc-100 text-zinc-950 py-1.5 text-[7px] font-black uppercase hover:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">Send</button>
                  <button class="flex-1 border border-zinc-800 text-white py-1.5 text-[7px] font-black uppercase hover:border-zinc-700 transition-all">Receive</button>
               </div>
            </div>
         </div>
      </section>

      <!-- Nodes Module -->
      <section class="col-span-4 bg-zinc-950 border-2 border-zinc-800 flex flex-col min-h-0">
         <header class="p-2.5 border-b border-zinc-900 bg-zinc-900/30 shrink-0 flex justify-between items-center">
            <span class="text-[8px] font-black text-white uppercase tracking-widest">Grid_Nodes</span>
            {#if grid.sessionType === 'TRADITIONAL'}
              <span class="text-[7px] font-black text-orange-500 uppercase">Passive_Mode</span>
            {/if}
         </header>
         
         <div class="p-3 flex-1 flex flex-col min-h-0 justify-center">
            {#if grid.sessionType !== 'TRADITIONAL'}
              <div class="space-y-1.5 overflow-hidden flex-1 flex flex-col justify-center">
                {#each grid.relays.slice(0, 3) as relay (relay.name)}
                  <div class="flex items-center justify-between p-1.5 border border-zinc-900 bg-black/20">
                    <span class="text-[8px] font-black text-zinc-500 uppercase truncate mr-2">{relay.name}</span>
                    <span class="text-[8px] font-black text-green-500/80 tabular-nums">{relay.latency.toFixed(0)}ms</span>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                 <div class="w-full space-y-2">
                    <div class="h-0.5 w-full bg-zinc-900 overflow-hidden relative">
                       <div class="absolute inset-0 bg-orange-500/40 animate-progress-fast"></div>
                    </div>
                    <span class="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Managed_Uplink</span>
                 </div>
                 <p class="text-[6px] text-zinc-600 uppercase font-bold leading-tight max-w-[150px]">
                   Utilizing Goy Company infrastructure. Direct node control restricted.
                 </p>
              </div>
            {/if}
         </div>
         
         <footer class="p-2 bg-zinc-900/20 border-t border-zinc-900 shrink-0 flex items-center justify-center">
            {#if grid.sessionType !== 'TRADITIONAL'}
               <button class="w-full text-[7px] font-black uppercase text-zinc-500 hover:text-white transition-colors tracking-widest text-center leading-none">Nodes_Center -></button>
            {:else}
               <button onclick={() => showExportModal = true} class="w-full text-[7px] font-black uppercase text-zinc-600 hover:text-white transition-colors tracking-widest text-center underline leading-none">Upgrade_Sovereignty -></button>
            {/if}
         </footer>
      </section>

      <!-- Governance Module -->
      <aside class="col-span-4 bg-zinc-950 border-2 border-zinc-800 flex flex-col min-h-0 overflow-hidden relative">
         <header class="p-2.5 border-b border-zinc-900 bg-zinc-900/30 shrink-0 flex justify-between items-center">
            <span class="text-[8px] font-black text-white uppercase tracking-widest">Governance_Terminal</span>
            <span class="text-[7px] font-black text-green-500 animate-pulse">LIVE</span>
         </header>
         
         <div class="flex-1 p-3 space-y-2.5 min-h-0 flex flex-col justify-center">
            <!-- Active Proposal 1 -->
            <div class="space-y-1 group cursor-pointer">
               <div class="flex justify-between items-start">
                  <span class="text-[8px] font-black text-zinc-100 uppercase leading-none group-hover:text-green-500 transition-colors">GP-1617: Protocol</span>
                  <span class="text-[7px] font-bold text-zinc-600 tabular-nums">24h</span>
               </div>
               <div class="h-1 w-full bg-zinc-900 overflow-hidden">
                  <div class="h-full bg-green-500 w-[68%]"></div>
               </div>
               <div class="flex justify-between text-[6px] font-black uppercase tracking-tighter text-zinc-500">
                  <span>Consensus: 68%</span>
                  <span>Goal: 75%</span>
               </div>
            </div>

            <!-- Active Proposal 2 -->
            <div class="space-y-1 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
               <div class="flex justify-between items-start">
                  <span class="text-[8px] font-black text-zinc-100 uppercase leading-none">GP-1618: Fees</span>
                  <span class="text-[7px] font-bold text-zinc-600 tabular-nums">3d</span>
               </div>
               <div class="h-1 w-full bg-zinc-900 overflow-hidden">
                  <div class="h-full bg-green-500 w-[42%]"></div>
               </div>
               <div class="flex justify-between text-[6px] font-black uppercase tracking-tighter text-zinc-500">
                  <span>Consensus: 42%</span>
                  <span>Goal: 75%</span>
               </div>
            </div>

            <!-- Voting Power Block -->
            <div class="p-1.5 bg-zinc-900/30 border border-zinc-800 flex justify-between items-center mt-1">
               <span class="text-[7px] font-black text-zinc-600 uppercase">Power</span>
               <span class="text-[9px] font-black text-white tabular-nums">42,069 <span class="text-[7px] text-zinc-600">$GOYCO</span></span>
            </div>
         </div>

         <footer class="p-2 bg-zinc-900/20 border-t border-zinc-900 shrink-0 flex items-center justify-center">
            <button class="w-full text-[7px] font-black uppercase text-zinc-500 hover:text-white transition-colors tracking-widest text-center leading-none">Open_Vault -></button>
         </footer>
      </aside>
    </div>
  </div>

  <!-- OVERLAYS -->
  {#if selectedLog}<LogDetailModal log={selectedLog} onClose={() => selectedLog = null} />{/if}
  {#if showEditModal}<EditProfileModal onClose={() => showEditModal = false} />{/if}
  
  <!-- LOGOUT CONFIRMATION MODAL -->
  {#if showLogoutModal}
    <div transition:fade={{ duration: 150 }} class="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
      <div transition:fly={{ y: 10, duration: 300 }} class="bg-zinc-950 border-2 border-red-900 p-8 max-w-lg w-full font-mono shadow-[20px_20px_0px_0px_rgba(153,27,27,0.1)]">
        <header class="mb-6">
          <span class="text-[9px] font-black text-red-500 uppercase tracking-[0.4em] mb-2 block">Security_Protocol // Alert</span>
          <h3 class="text-2xl font-black text-white uppercase tracking-tighter">Terminate Grid Uplink?</h3>
        </header>
        <p class="text-zinc-500 text-[10px] leading-relaxed mb-10 uppercase font-bold tracking-wider">
          All session artifacts will be cleared. Connection to sovereign relays will be severed.
        </p>
        <div class="flex gap-4">
           <button onclick={handleLogout} class="flex-1 bg-red-600 text-white py-3 font-black uppercase tracking-widest text-[9px] hover:bg-red-500 transition-all">Terminate</button>
           <button onclick={() => showLogoutModal = false} class="flex-1 border-2 border-zinc-800 text-zinc-500 py-3 font-black uppercase tracking-widest text-[9px] hover:text-white transition-all">Abort</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- EXPORT TO NOSTR MODAL -->
  {#if showExportModal}
    <div transition:fade={{ duration: 150 }} class="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
      <div transition:fly={{ y: 10, duration: 300 }} class="bg-zinc-950 border-2 border-white p-8 max-w-lg w-full font-mono shadow-[20px_20px_0px_0px_rgba(255,255,255,0.05)]">
        
        {#if isExporting}
           <div class="flex flex-col items-center justify-center py-12 space-y-6">
             <div class="w-12 h-12 border-2 border-zinc-800 border-t-white animate-spin"></div>
             <span class="text-[10px] font-black text-white uppercase tracking-[0.5em] block">Executing_Migration...</span>
             <p class="text-[8px] text-zinc-500 uppercase text-center leading-loose">Generating entropy.<br/>Broadcasting identity to decentralized relays.<br/>Purging central vault records.</p>
           </div>
           
        {:else if exportKeys}
           <header class="mb-6">
             <span class="text-[9px] font-black text-green-500 uppercase tracking-[0.4em] mb-2 block">Migration_Complete // Sovereign</span>
             <h3 class="text-2xl font-black text-white uppercase tracking-tighter">Keys Generated</h3>
           </header>
           <div class="space-y-6 text-left mb-8">
             <div class="space-y-2">
               <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Public_Key (NPUB)</label>
               <div class="bg-black border border-zinc-800 p-4 text-[10px] break-all text-zinc-300 font-mono">{exportKeys.pubkey}</div>
             </div>
             <div class="space-y-2">
               <label class="text-[9px] font-black text-red-500/50 uppercase tracking-widest">Secret_Key (NSEC) - SAVE THIS NOW</label>
               <div class="bg-black border border-zinc-800 p-4 text-[10px] break-all text-zinc-300 font-mono blur-sm hover:blur-none transition-all">{exportKeys.privkey}</div>
             </div>
           </div>
           <button onclick={completeMigration} class="w-full bg-white text-zinc-950 py-3 font-black uppercase tracking-widest text-[9px] hover:bg-zinc-200 transition-all">Acknowledge_&_Reboot</button>
           
        {:else}
           <header class="mb-6">
             <span class="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2 block">Identity_Migration // Warning</span>
             <h3 class="text-2xl font-black text-white uppercase tracking-tighter">Transition to Sovereign?</h3>
           </header>
           <div class="space-y-4 mb-10">
             <p class="text-zinc-400 text-[10px] leading-relaxed uppercase font-bold tracking-wider">
               This action will sever the link with the Goy Company central vault. 
             </p>
             <div class="p-4 border border-zinc-800 bg-zinc-900/50">
               <span class="text-[8px] font-black text-red-500 uppercase block mb-1">Critical Implications:</span>
               <ul class="text-[8px] text-zinc-500 space-y-1 list-disc pl-4 uppercase font-bold">
                 <li>Central management of credentials will be terminated.</li>
                 <li>Identity will reside exclusively on decentralized relays.</li>
                 <li>Account recovery via email will become impossible.</li>
                 <li>You become 100% responsible for your secret keys.</li>
               </ul>
             </div>
           </div>
           <div class="flex gap-4">
              <button onclick={handleExportConfirm} class="flex-1 bg-white text-zinc-950 py-3 font-black uppercase tracking-widest text-[9px] hover:bg-zinc-200 transition-all">Initiate_Sovereignty</button>
              <button onclick={() => showExportModal = false} class="flex-1 border-2 border-zinc-800 text-zinc-500 py-3 font-black uppercase tracking-widest text-[9px] hover:text-white transition-all">Abort_Migration</button>
           </div>
        {/if}
        
      </div>
    </div>
  {/if}

  {#if toast.visible}
     <div transition:fade class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-950 px-4 py-1 text-[8px] font-black uppercase z-[1000] border-2 border-white">{toast.message}</div>
  {/if}
</div>
