<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { grid } from '$lib/grid-state.svelte';

  let step = $state(1);
  let isSaving = $state(false);
  
  // Local form state
  let profileForm = $state({
    display_name: '',
    name: '',
    bio: ''
  });

  onMount(async () => {
    const activePubkey = sessionStorage.getItem('goy_pubkey');
    if (!activePubkey) {
      window.location.href = '/';
      return;
    }
    // Force a fresh sync for the new identity
    await grid.sync(activePubkey, true);
  });

  async function completeOnboarding() {
    isSaving = true;
    try {
      // Safety: ensure we have the correct pubkey from session
      const activePubkey = sessionStorage.getItem('goy_pubkey');
      if (!activePubkey) throw new Error('SESSION_EXPIRED');

      // Anchor the initial profile data
      await grid.updateMetadata({
        display_name: profileForm.display_name,
        name: profileForm.name,
        about: profileForm.bio,
        pubkey: activePubkey // Explicitly pass to avoid state confusion
      });
      
      // Redirect to dashboard after successful sync
      window.location.href = '/dashboard';
    } catch (e) {
      console.error('Onboarding sync failed:', e);
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="max-w-2xl w-full bg-zinc-950 border-2 border-zinc-800 p-12 shadow-[24px_28px_0px_0px_rgba(0,0,0,0.4)] font-mono relative overflow-hidden">
  <div class="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

  {#if step === 1}
    <div in:fade={{ duration: 400 }} class="space-y-8 relative z-10">
      <header class="border-b border-zinc-800 pb-6">
        <span class="text-[10px] font-black text-green-500 uppercase tracking-[0.5em] block mb-2">Protocol_Initialization</span>
        <h1 class="text-4xl font-black text-white uppercase tracking-tighter">Define Your Persona</h1>
      </header>

      <p class="text-xs text-zinc-500 leading-relaxed uppercase">
        Welcome to the Grid. Before uplink is fully established, you must define your digital footprint. This metadata will be anchored to your sovereign identity.
      </p>

      <div class="space-y-6 pt-4">
        <div class="space-y-2">
          <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Display_Name</label>
          <input 
            bind:value={profileForm.display_name} 
            type="text" 
            placeholder="E.G. ARCHITECT_ZERO"
            class="w-full bg-black border-2 border-zinc-800 p-4 text-white focus:border-white outline-none transition-all" 
          />
        </div>

        <div class="space-y-2">
          <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Username (@)</label>
          <input 
            bind:value={profileForm.name} 
            type="text" 
            placeholder="E.G. architect0"
            class="w-full bg-black border-2 border-zinc-800 p-4 text-white focus:border-white outline-none transition-all" 
          />
        </div>

        <div class="space-y-2">
          <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Identity_Bio</label>
          <textarea 
            bind:value={profileForm.bio} 
            placeholder="DEFINE YOUR SECTOR AND PURPOSE..."
            class="w-full bg-black border-2 border-zinc-800 p-4 text-white focus:border-white outline-none h-24 resize-none transition-all"
          ></textarea>
        </div>
      </div>

      <button 
        onclick={() => step = 2}
        disabled={!profileForm.display_name || !profileForm.name}
        class="w-full bg-white text-zinc-950 py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-zinc-200 transition-all disabled:opacity-30"
      >
        Continue_Initialization
      </button>
    </div>

  {:else if step === 2}
    <div in:fade={{ duration: 400 }} class="space-y-8 relative z-10 text-center py-8">
      <div class="w-20 h-20 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin mx-auto"></div>
      
      <div class="space-y-4">
        <h2 class="text-2xl font-black text-white uppercase tracking-tighter">Anchoring Identity</h2>
        <p class="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
          Synchronizing metadata with the decentralized grid and anchoring local records in the central vault. This action is irreversible.
        </p>
      </div>

      <div class="pt-8 flex flex-col gap-4">
        <button 
          onclick={completeOnboarding}
          disabled={isSaving}
          class="w-full bg-green-600 text-white py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-green-500 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        >
          {isSaving ? 'Uplinking...' : 'Confirm_Final_Uplink'}
        </button>
        <button 
          onclick={() => step = 1}
          disabled={isSaving}
          class="text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors"
        >
          Back_To_Parameters
        </button>
      </div>
    </div>
  {/if}

  <footer class="mt-12 pt-6 border-t border-zinc-900 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-zinc-700">
    <span>System_Uplink // Phase_02</span>
    <span>Awaiting_Consensus</span>
  </footer>
</div>
