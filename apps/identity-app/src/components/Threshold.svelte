<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { generateIdentity, getPublicKeyFromExtension, hasNostrExtension } from '@goy/nostr';

  let status = $state('IDLE'); // IDLE, GENERATING, READY, SYNCING
  let entropyText = $state('');
  let generatedKeys = $state<{ privkey: string; pubkey: string } | null>(null);
  let showImport = $state(false);
  let extensionError = $state<string | null>(null);
  let nsecInput = $state('');

  const terminalLines = [
    ">>> GRID_BOOT: OK",
    ">>> INITIALIZING SECURE_ACCESS_LAYER...",
    ">>> ZERO_KNOWLEDGE_HANDSHAKE: ACTIVE",
    ">>> HARVESTING GRID_ENTROPY..."
  ];

  async function generate() {
    status = 'GENERATING';
    
    // Simulate entropy collection
    for (let i = 0; i < 20; i++) {
      entropyText += Math.random().toString(36).substring(2, 15);
      if (entropyText.length > 100) entropyText = entropyText.slice(-100);
      await new Promise(r => setTimeout(r, 50));
    }

    generatedKeys = generateIdentity();
    status = 'READY';
  }

  function importKey() {
    showImport = true;
    extensionError = null;
  }

  async function connectExtension() {
    extensionError = null;
    try {
      const pubkey = await getPublicKeyFromExtension();
      // Store in session storage for the demo
      sessionStorage.setItem('goy_pubkey', pubkey);
      status = 'SYNCING';
      
      // Artificial delay for "Syncing" feel
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (e: any) {
      extensionError = e.message;
    }
  }

  async function handleNsecSubmit() {
    if (!nsecInput.startsWith('nsec')) {
      extensionError = "INVALID_NSEC_FORMAT";
      return;
    }
    
    // In a real app, we would derive pubkey from nsec here
    // For this prototype, we'll simulate the successful link
    status = 'SYNCING';
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  }
</script>

<div class="max-w-4xl w-full bg-zinc-950 text-zinc-100 p-8 border-2 border-zinc-800 shadow-[20px_24px_0px_0px_rgba(0,0,0,0.3)] font-mono relative overflow-hidden">
  <!-- Scanline effect overlay -->
  <div class="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

  <header class="mb-12 border-b border-zinc-800 pb-6 flex justify-between items-start">
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tighter text-white">Entering the Grid</h1>
      <p class="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-2">GoyID // Grid_Access_Protocol_V1.0</p>
    </div>
    <div class="text-right">
      <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse inline-block mb-1"></div>
      <span class="text-[9px] font-black block text-red-500 uppercase">Awaiting_Authentication</span>
    </div>
  </header>

  {#if status === 'SYNCING'}
    <div class="py-24 flex flex-col items-center justify-center space-y-8" in:fade>
      <div class="w-16 h-16 border-4 border-zinc-800 border-t-white rounded-full animate-spin"></div>
      <div class="space-y-2 text-center">
        <span class="text-[10px] font-black text-white uppercase tracking-[0.5em] block">Syncing_Identity</span>
        <p class="text-[9px] text-zinc-500 uppercase">Establishing secure relay handshake...</p>
      </div>
    </div>
  {:else if status === 'IDLE' && !showImport}
    <div class="space-y-12">
      <div class="space-y-4">
        {#each terminalLines as line, i}
          <div in:fly={{ y: 5, delay: i * 200 }} class="text-xs text-zinc-400">
            <span class="text-zinc-600 mr-2">>>></span> {line}
          </div>
        {/each}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button 
          onclick={generate}
          class="bg-zinc-100 text-zinc-950 p-8 text-left hover:bg-white transition-all group relative overflow-hidden"
        >
          <span class="text-2xl font-black uppercase tracking-tighter block mb-2">Initialize Entity</span>
          <span class="text-[9px] uppercase font-bold text-zinc-500 block leading-tight">Manifest a new cryptographic seed within the grid. Pure entropy.</span>
          <div class="absolute bottom-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
            <span class="text-4xl font-black">+</span>
          </div>
        </button>

        <button 
          onclick={importKey}
          class="border-2 border-zinc-800 p-8 text-left hover:border-zinc-500 transition-all group"
        >
          <span class="text-2xl font-black uppercase tracking-tighter block mb-2">Sync Access</span>
          <span class="text-[9px] uppercase font-bold text-zinc-500 block leading-tight">Link existing association via NSEC or Provider. Grid continuity.</span>
        </button>
      </div>

      <!-- Zero Knowledge Warning -->
      <div class="bg-zinc-900/50 border-l-4 border-zinc-100 p-6 mt-12">
        <h4 class="text-[10px] font-black uppercase tracking-widest text-zinc-100 mb-2">Sovereignty Protocol</h4>
        <p class="text-[11px] text-zinc-400 uppercase leading-relaxed font-bold tracking-wider">
          "We do not store your keys. If you lose them, The Goy Company cannot help you. You are free, and freedom is heavy."
        </p>
      </div>
    </div>
  {:else}
    <!-- Generating / Ready States -->
    <div class="space-y-8 py-12 flex flex-col items-center justify-center text-center">
      {#if status === 'GENERATING'}
        <div class="w-full max-w-lg">
          <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-8 text-left">Harvesting_Entropy...</span>
          <div class="break-all text-[8px] text-zinc-400 opacity-40 font-mono text-left line-clamp-4 h-12 mb-8">
            {entropyText}
          </div>
          <div class="w-full bg-zinc-900 h-1 overflow-hidden">
            <div class="h-full bg-white animate-progress-fast"></div>
          </div>
        </div>
      {:else if status === 'READY'}
        <div in:fade class="w-full max-w-2xl space-y-12">
          <div class="p-8 border-2 border-green-900/30 bg-green-900/10">
            <span class="text-[10px] font-black text-green-500 uppercase tracking-[0.5em] block mb-4">Grid_Link_Established</span>
            <h3 class="text-3xl font-black text-white uppercase tracking-tighter mb-8">You are sovereign.</h3>
            
            <div class="space-y-6 text-left">
              <div class="space-y-2">
                <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Public_Key (NPUB)</label>
                <div class="bg-black border border-zinc-800 p-4 text-[10px] break-all text-zinc-300 font-mono">
                  {generatedKeys?.pubkey}
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="text-[9px] font-black text-red-500/50 uppercase tracking-widest">Secret_Key (NSEC) - NEVER_SHARE</label>
                <div class="bg-black border border-zinc-800 p-4 text-[10px] break-all text-zinc-300 font-mono blur-sm hover:blur-none transition-all duration-300">
                  {generatedKeys?.privkey}
                </div>
              </div>
            </div>
          </div>

          <button 
            class="w-full bg-white text-zinc-950 py-6 font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
            onclick={() => {
              sessionStorage.setItem('goy_pubkey', generatedKeys?.pubkey || '');
              window.location.href = '/dashboard';
            }}
          >
            Access The Grid
          </button>
        </div>
      {/if}

      {#if showImport}
        <div in:fade class="w-full max-w-lg space-y-8 text-left">
          <div class="space-y-4">
            <h3 class="text-xl font-black text-white uppercase tracking-tighter">Access Protocol</h3>
            <p class="text-[10px] text-zinc-500 uppercase leading-relaxed">Choose your method of entry. All processing occurs strictly on your machine.</p>
          </div>

          <div class="space-y-6">
            <!-- Extension Option -->
            {#if hasNostrExtension()}
              <button 
                onclick={connectExtension}
                class="w-full border-2 border-zinc-800 p-6 flex items-center justify-between hover:bg-zinc-900 transition-all group"
              >
                <div class="text-left">
                  <span class="text-sm font-black uppercase block text-white group-hover:text-green-500 transition-colors">Nostr Extension</span>
                  <span class="text-[9px] text-zinc-500 uppercase">Sync via browser provider</span>
                </div>
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </button>
            {:else}
              <div class="w-full border-2 border-zinc-800/50 p-6 flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                <div class="text-left">
                  <span class="text-sm font-black uppercase block text-zinc-500">No Provider Found</span>
                  <span class="text-[9px] text-zinc-600 uppercase italic">Install a Nostr extension to enable</span>
                </div>
                <div class="w-2 h-2 bg-zinc-800 rounded-full"></div>
              </div>
            {/if}

            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t border-zinc-800"></span>
              </div>
              <div class="relative flex justify-center text-[8px] uppercase font-black text-zinc-600">
                <span class="bg-zinc-950 px-2 italic">OR USE_NSEC_LINK</span>
              </div>
            </div>
            
            <div class="space-y-4">
              <input 
                bind:value={nsecInput}
                type="password" 
                placeholder="nsec1..." 
                class="w-full bg-black border-2 border-zinc-800 p-6 text-white focus:border-white outline-none transition-colors font-mono"
              />
              {#if extensionError}
                <p class="text-[10px] text-red-500 uppercase font-black tracking-widest animate-pulse">[!] {extensionError}</p>
              {/if}
            </div>
          </div>

          <div class="flex gap-4 pt-8">
             <button 
               onclick={handleNsecSubmit}
               class="flex-1 bg-zinc-100 text-zinc-950 py-4 font-black uppercase tracking-widest text-xs hover:bg-white transition-all">Submit</button>
             <button 
               onclick={() => showImport = false}
               class="px-8 border-2 border-zinc-800 text-zinc-500 py-4 font-black uppercase tracking-widest text-xs hover:text-white hover:border-zinc-500 transition-all"
             >Back</button>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <footer class="mt-20 pt-6 border-t border-zinc-900 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600">
    <span>Goy_Grid_Interface // Local_Provisioning</span>
    <span>No_Data_Harvested // Verified</span>
  </footer>
</div>

<style>
  @keyframes progress-fast {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-progress-fast {
    animation: progress-fast 1s infinite linear;
  }
</style>
