<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { grid } from '$lib/grid-state.svelte';
  import { uploadAsset } from '@goy/nostr';

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();
  let isSaving = $state(false);
  let isUploadingAvatar = $state(false);
  let isUploadingBanner = $state(false);

  // Form State
  let form = $state({
    name: grid.profile.name,
    display_name: grid.profile.name,
    nip05: grid.profile.nip05,
    about: grid.profile.bio,
    picture: grid.profile.avatar,
    banner: grid.profile.banner
  });

  async function handleFileUpload(e: Event, target: 'picture' | 'banner') {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    if (target === 'picture') isUploadingAvatar = true;
    else isUploadingBanner = true;

    try {
      const result = await uploadAsset(input.files[0]);
      if (result.success) {
        form[target] = result.url;
        grid.addLog(`ASSET_UPLOAD_SUCCESS: ${target.toUpperCase()}`);
      }
    } catch (e) {
      alert('UPLOAD_ERROR: Grid storage rejected transmission.');
    } finally {
      isUploadingAvatar = false;
      isUploadingBanner = false;
    }
  }

  async function handleSave(e: Event) {
    e.preventDefault();
    isSaving = true;
    try {
      await grid.updateMetadata(form);
      onClose();
    } catch (e) {
      alert('TRANSMISSION_ERROR: Signature rejected.');
    } finally {
      isSaving = false;
    }
  }
</script>

<div 
  transition:fade={{ duration: 200 }}
  class="fixed inset-0 z-[4000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 font-mono pl-20 md:pl-64"
>
  <div 
    transition:fly={{ y: 20, duration: 400 }}
    class="bg-zinc-950 border-2 border-zinc-800 w-full max-w-2xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)]"
  >
    <header class="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
      <div>
        <span class="text-[9px] font-black text-green-500 uppercase tracking-[0.4em] block mb-1">Identity_Module // Edit_Metada</span>
        <h3 class="text-xl font-black text-white uppercase tracking-tighter">Modify Grid Persona</h3>
      </div>
      <button onclick={onClose} class="text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest border border-zinc-800 px-4 py-2 hover:bg-zinc-900">
        [ Cancel_X ]
      </button>
    </header>

    <form onsubmit={handleSave} class="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Display_Name</label>
          <input bind:value={form.name} type="text" class="w-full bg-black border border-zinc-800 p-3 text-xs text-white focus:border-green-500 outline-none" />
        </div>
        <div class="space-y-2">
          <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">NIP-05_Identifier</label>
          <input bind:value={form.nip05} type="text" class="w-full bg-black border border-zinc-800 p-3 text-xs text-white focus:border-green-500 outline-none" />
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Biography_Payload</label>
        <textarea bind:value={form.about} class="w-full bg-black border border-zinc-800 p-4 text-xs text-white focus:border-green-500 outline-none h-20 resize-none"></textarea>
      </div>

      <!-- Avatar Upload -->
      <div class="space-y-3">
        <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Avatar_Uplink</label>
        <div class="flex gap-4 items-center">
           <div class="w-16 h-16 bg-black border-2 border-zinc-800 overflow-hidden shrink-0">
              <img src={form.picture} alt="Preview" class="w-full h-full object-cover grayscale" />
           </div>
           <div class="flex-1 relative">
              <input 
                type="file" 
                accept="image/*" 
                onchange={(e) => handleFileUpload(e, 'picture')}
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div class={`w-full border-2 border-dashed border-zinc-800 p-4 text-center transition-colors ${isUploadingAvatar ? 'bg-green-500/10 border-green-500' : 'hover:border-zinc-500'}`}>
                 <span class="text-[9px] font-black text-zinc-500 uppercase">{isUploadingAvatar ? 'Transmitting_Bytes...' : 'Drop_Image_or_Click'}</span>
              </div>
           </div>
        </div>
      </div>

      <!-- Banner Upload -->
      <div class="space-y-3">
        <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Banner_Uplink</label>
        <div class="relative">
           <input 
             type="file" 
             accept="image/*" 
             onchange={(e) => handleFileUpload(e, 'banner')}
             class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
           />
           <div class={`w-full h-24 border-2 border-dashed border-zinc-800 flex items-center justify-center transition-colors ${isUploadingBanner ? 'bg-green-500/10 border-green-500' : 'hover:border-zinc-500'}`}>
              {#if form.banner}
                 <img src={form.banner} alt="Banner Preview" class="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" />
              {/if}
              <span class="text-[9px] font-black text-zinc-500 uppercase relative z-20">{isUploadingBanner ? 'Transmitting_Bytes...' : 'Upload_Banner_Assets'}</span>
           </div>
        </div>
      </div>

      <div class="pt-6 border-t border-zinc-900">
        <button 
          type="submit"
          disabled={isSaving || isUploadingAvatar || isUploadingBanner}
          class="w-full bg-white text-zinc-950 py-4 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-green-500 hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(34,197,94,0.1)] disabled:opacity-50"
        >
          {isSaving ? 'Signing_Metadata...' : '[ Confirm_Metadata_Broadcast ]'}
        </button>
      </div>
    </form>
  </div>
</div>
