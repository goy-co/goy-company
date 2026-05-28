<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import {
    generateIdentity,
    getPublicKeyFromExtension,
    getPublicKeyFromSecret,
    hasNostrExtension,
  } from '@goy/nostr';
  import { authClient } from '$lib/auth-client';

  let status = $state('IDLE'); // IDLE, GENERATING, READY, SYNCING, TRADITIONAL
  let authMode = $state('SIGNIN'); // SIGNIN, SIGNUP
  let entropyText = $state('');
  let generatedKeys = $state<{ privkey: string; pubkey: string } | null>(null);
  let showImport = $state(false);
  let nsecInput = $state('');
  let extensionError = $state<string | null>(null);

  // Traditional Auth State
  let email = $state('');
  let password = $state('');
  let name = $state('');
  let isLoading = $state(false);
  let authError = $state<string | null>(null);
  let npubCopied = $state(false);
  let nsecCopied = $state(false);

  const terminalLines = [
    '>>> GRID_BOOT: OK',
    '>>> INITIALIZING SECURE_ACCESS_LAYER...',
    '>>> HYBRID_IDENTITY_MATRIX: LOADED',
    '>>> AWAITING SECTOR_CHOICE...',
  ];

  async function generate() {
    status = 'GENERATING';
    for (let i = 0; i < 20; i++) {
      entropyText += Math.random().toString(36).substring(2, 15);
      if (entropyText.length > 100) entropyText = entropyText.slice(-100);
      await new Promise((r) => setTimeout(r, 50));
    }
    generatedKeys = generateIdentity();
    status = 'READY';
  }

  async function handleTraditionalAuth(e: Event) {
    e.preventDefault();
    isLoading = true;
    authError = null;
    try {
      const { data, error } = await (authMode === 'SIGNUP'
        ? authClient.signUp.email({ email, password, name })
        : authClient.signIn.email({ email, password }));

      if (error) throw error;

      // IMMEDIATE TRANSITION: Avoid flicker back to IDLE
      status = 'SYNCING';
      showImport = false;

      // CLEANUP & PROVISIONING
      sessionStorage.clear();

      const userId = data.user.id;
      sessionStorage.setItem('goy_session_type', 'TRADITIONAL');
      sessionStorage.setItem('goy_user_id', userId);
      sessionStorage.setItem('goy_pubkey', userId);

      console.log('Grid Uplink Authorized (UUID):', userId);

      const targetPath = authMode === 'SIGNUP' ? '/onboarding' : '/dashboard';
      setTimeout(() => {
        window.location.href = targetPath;
      }, 1500);
    } catch (e: unknown) {
      console.error('Auth Error Details:', e);
      if (e && typeof e === 'object' && 'message' in e) {
        authError = (e as any).statusText || (e as any).message || 'AUTH_PROTOCOL_FAILURE';
        if ((e as any).body?.message) authError = (e as any).body.message;
      } else {
        authError = 'AUTH_PROTOCOL_FAILURE';
      }
      status = 'TRADITIONAL';
    } finally {
      isLoading = false;
    }
  }

  async function connectNsec() {
    extensionError = null;
    if (!nsecInput.trim()) return;

    try {
      const pubkey = getPublicKeyFromSecret(nsecInput.trim());

      status = 'SYNCING';
      showImport = false;

      sessionStorage.clear(); // PURGE PREVIOUS SESSION
      sessionStorage.setItem('goy_pubkey', pubkey);
      sessionStorage.setItem('goy_privkey', nsecInput.trim());
      sessionStorage.setItem('goy_session_type', 'SOVEREIGN_NSEC');
      setTimeout(() => (window.location.href = '/dashboard'), 1500);
    } catch (_e) {
      extensionError = 'INVALID_SECRET_KEY';
    }
  }

  async function connectExtension() {
    extensionError = null;
    try {
      const pubkey = await getPublicKeyFromExtension();
      // Start syncing BEFORE closing the import view to avoid layout jumps
      status = 'SYNCING';
      showImport = false;

      sessionStorage.clear(); // PURGE PREVIOUS SESSION
      sessionStorage.setItem('goy_pubkey', pubkey);
      sessionStorage.setItem('goy_session_type', 'SOVEREIGN_EXT');
      setTimeout(() => (window.location.href = '/dashboard'), 1500);
    } catch (e: unknown) {
      extensionError = e instanceof Error ? e.message : String(e);
    }
  }
  function copyToClipboard(text: string, type: 'NPUB' | 'NSEC') {
    navigator.clipboard.writeText(text);
    if (type === 'NPUB') {
      npubCopied = true;
      setTimeout(() => (npubCopied = false), 2000);
    } else {
      nsecCopied = true;
      setTimeout(() => (nsecCopied = false), 2000);
    }
  }

  function downloadManifest() {
    if (!generatedKeys) return;

    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const manifest = `
################################################################################
#                                                                              #
#   ______ __             ______               ______                          #
#  /_  __// /_   ___     / ____/____   __  __ / ____/____   ____ ___   ____    #
#   / /  / __ \\ / _ \\   / / __ / __ \\ / / / // /     / __ \\ / __ \`__ \\ / __ \\  #
#  / /  / / / //  __/  / /_/ // /_/ // /_/ // /___  / /_/ // / / / / // /_/ /  #
# /_/  /_/ /_/ \\___/   \\____/ \\____/ \\__, / \\____/  \\____//_/ /_/ /_// .___/   #
#                                   /____/                          /_/        #
#                                                                              #
################################################################################
#                   SOVEREIGN IDENTITY MANIFEST // GOY GRID                    #
################################################################################

IDENTIFIER: ${generatedKeys.pubkey}
SECRET_KEY: ${generatedKeys.privkey}

GENERATED_AT: ${timestamp}
PROTOCOL: NOSTR_SOVEREIGN_V1

################################################################################
#  WARNING: YOUR SECRET KEY (NSEC) IS THE ONLY WAY TO ACCESS YOUR IDENTITY.    #
#  IF LOST, IT CANNOT BE RECOVERED. IF SHARED, YOUR IDENTITY IS COMPROMISED.   #
#  STORE THIS FILE IN A SECURE, OFFLINE LOCATION.                              #
################################################################################
`;

    const blob = new Blob([manifest], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GOY_IDENTITY_MANIFEST_${generatedKeys.pubkey.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div
  class="max-w-5xl w-full bg-zinc-950 text-zinc-100 p-8 border-2 border-zinc-800 shadow-[24px_28px_0px_0px_rgba(0,0,0,0.4)] font-mono relative overflow-hidden min-h-[500px] flex flex-col"
>
  <div
    class="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"
  ></div>

  {#if status === 'SYNCING'}
    <div class="flex-1 flex flex-col items-center justify-center space-y-8 py-12" in:fade>
      <div
        class="w-16 h-16 border-4 border-zinc-800 border-t-white rounded-full animate-spin"
      ></div>
      <div class="space-y-2 text-center">
        <span class="text-[10px] font-black text-white uppercase tracking-[0.5em] block"
          >Syncing_With_Grid</span
        >
        <p class="text-[9px] text-zinc-600 uppercase animate-pulse">
          Establishing secure session context...
        </p>
      </div>
    </div>
  {:else}
    <header class="mb-12 border-b border-zinc-800 pb-6 flex justify-between items-start shrink-0">
      <div>
        <h1 class="text-4xl font-black uppercase tracking-tighter text-white">Entering the Grid</h1>
        <p class="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-2">
          Matrix_Entry // Protocol_V1.1_Hybrid
        </p>
      </div>
      <div class="text-right">
        <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse inline-block mb-1"></div>
        <span class="text-[9px] font-black block text-red-500 uppercase">Handshake_Pending</span>
      </div>
    </header>

    <div class="flex-1">
      {#if status === 'IDLE' && !showImport}
        <div class="space-y-12">
          <div class="space-y-4">
            {#each terminalLines as line, i}
              <div in:fly={{ y: 5, delay: i * 150 }} class="text-xs text-zinc-400">
                <span class="text-zinc-600 mr-2">>>></span>
                {line}
              </div>
            {/each}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Option 1: Conventional -->
            <button
              onclick={() => (status = 'TRADITIONAL')}
              class="bg-zinc-900 border-2 border-zinc-800 p-8 text-left hover:border-zinc-100 transition-all group relative overflow-hidden"
            >
              <span
                class="text-xl font-black uppercase tracking-tighter block mb-2 text-zinc-400 group-hover:text-white transition-colors"
                >Portal Access</span
              >
              <span
                class="text-[9px] uppercase font-bold text-zinc-600 block leading-tight group-hover:text-zinc-400"
                >Entry via Email/Password. Managed by central vault.</span
              >
            </button>

            <!-- Option 2: Pure Sovereign -->
            <button
              onclick={generate}
              class="bg-zinc-100 text-zinc-950 p-8 text-left hover:bg-white transition-all group"
            >
              <span class="text-xl font-black uppercase tracking-tighter block mb-2"
                >Initialize Entity</span
              >
              <span class="text-[9px] uppercase font-bold text-zinc-600 block leading-tight"
                >Generate a new sovereign keypair. Total independence.</span
              >
            </button>

            <!-- Option 3: Import -->
            <button
              onclick={() => (showImport = true)}
              class="border-2 border-zinc-800 p-8 text-left hover:border-zinc-100 transition-all group"
            >
              <span
                class="text-xl font-black uppercase tracking-tighter block mb-2 text-zinc-400 group-hover:text-white transition-colors"
                >Sync Access</span
              >
              <span
                class="text-[9px] uppercase font-bold text-zinc-600 block leading-tight group-hover:text-zinc-400"
                >Uplink via existing Nostr extension or secret key.</span
              >
            </button>
          </div>
        </div>
      {:else if status === 'TRADITIONAL'}
        <div class="max-w-lg mx-auto space-y-8 py-4" in:fade>
          <header class="flex justify-between items-end border-b border-zinc-900 pb-4">
            <h3 class="text-2xl font-black uppercase tracking-tighter">
              {authMode === 'SIGNIN' ? 'Login' : 'Provisioning'}
            </h3>
            <button
              onclick={() => (authMode = authMode === 'SIGNIN' ? 'SIGNUP' : 'SIGNIN')}
              class="text-[9px] font-black text-zinc-500 hover:text-white transition-colors uppercase underline"
            >
              {authMode === 'SIGNIN' ? 'Switch to Provisioning' : 'Switch to Login'}
            </button>
          </header>

          <form onsubmit={(e) => handleTraditionalAuth(e)} class="space-y-6">
            {#if authMode === 'SIGNUP'}
              <div class="space-y-2">
                <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest"
                  >Entity_Alias</label
                >
                <input
                  bind:value={name}
                  type="text"
                  placeholder="DISPLAY_NAME"
                  class="w-full bg-black border-2 border-zinc-800 p-4 text-white focus:border-white outline-none"
                  required
                />
              </div>
            {/if}
            <div class="space-y-2">
              <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest"
                >Email_Address</label
              >
              <input
                bind:value={email}
                type="email"
                placeholder="ENTITY@DOMAIN.COM"
                class="w-full bg-black border-2 border-zinc-800 p-4 text-white focus:border-white outline-none"
                required
              />
            </div>
            <div class="space-y-2">
              <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest"
                >Secure_Password</label
              >
              <input
                bind:value={password}
                type="password"
                placeholder="••••••••"
                class="w-full bg-black border-2 border-zinc-800 p-4 text-white focus:border-white outline-none"
                required
              />
            </div>

            {#if authError}
              <div
                class="p-4 bg-red-950/20 border border-red-900 text-[10px] text-red-500 font-black uppercase animate-pulse"
              >
                [!] ERROR: {authError}
              </div>
            {/if}

            <div class="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                class="flex-1 bg-zinc-100 text-zinc-950 py-4 font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Authorize_Uplink'}
              </button>
              <button
                type="button"
                onclick={() => (status = 'IDLE')}
                class="px-8 border-2 border-zinc-800 text-zinc-500 py-4 font-black uppercase tracking-widest text-xs hover:text-white transition-all"
              >
                Abort
              </button>
            </div>
          </form>
        </div>
      {:else if status === 'READY'}
        <div in:fade class="w-full max-w-2xl mx-auto space-y-12 py-4">
          <div class="p-8 border-2 border-green-900/30 bg-green-900/10">
            <span
              class="text-[10px] font-black text-green-500 uppercase tracking-[0.5em] block mb-4"
              >Sovereign_Keys_Generated</span
            >
            <h3 class="text-3xl font-black text-white uppercase tracking-tighter mb-8">
              Independence manifest.
            </h3>

            <div class="space-y-6 text-left">
              <button 
                class="w-full text-left space-y-2 group"
                onclick={() => copyToClipboard(generatedKeys?.pubkey || '', 'NPUB')}
              >
                <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer flex justify-between">
                  Public_Key (NPUB)
                  <span class="opacity-0 group-hover:opacity-100 font-black text-green-500">
                    {npubCopied ? '[ COPIED_TO_GRID ]' : '[ Click_To_Copy ]'}
                  </span>
                </label>
                <div class="bg-black border border-zinc-800 p-4 text-[10px] break-all text-zinc-300 font-mono group-hover:border-zinc-100 transition-all">{generatedKeys?.pubkey}</div>
              </button>

              <button 
                class="w-full text-left space-y-2 group"
                onclick={() => copyToClipboard(generatedKeys?.privkey || '', 'NSEC')}
              >
                <label class="text-[9px] font-black text-red-500/50 uppercase tracking-widest group-hover:text-red-500 transition-colors cursor-pointer flex justify-between">
                  Secret_Key (NSEC) - NEVER_SHARE
                  <span class="opacity-0 group-hover:opacity-100 font-black text-green-500">
                    {nsecCopied ? '[ COPIED_TO_GRID ]' : '[ Click_To_Copy ]'}
                  </span>
                </label>
                <div class="bg-black border border-zinc-800 p-4 text-[10px] break-all text-zinc-300 font-mono blur-sm hover:blur-none transition-all group-hover:border-red-900">{generatedKeys?.privkey}</div>
              </button>
            </div>

            <div class="mt-10 pt-6 border-t border-green-900/20">
              <button
                onclick={downloadManifest}
                class="flex items-center gap-3 text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-widest transition-all"
              >
                <span class="text-green-500">>></span> Download_Identity_Manifest (.txt)
              </button>
            </div>
          </div>

          <button
            class="w-full bg-white text-zinc-950 py-6 font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)]"
            onclick={() => {
              sessionStorage.clear();
              sessionStorage.setItem('goy_pubkey', generatedKeys?.pubkey || '');
              sessionStorage.setItem('goy_privkey', generatedKeys?.privkey || '');
              sessionStorage.setItem('goy_session_type', 'SOVEREIGN_NSEC');              window.location.href = '/onboarding';
            }}
          >
            Access The Grid
          </button>
        </div>
      {/if}

      {#if showImport}
        <div in:fade class="max-w-lg mx-auto py-4 space-y-8">
          <header class="border-b border-zinc-800 pb-4">
            <h3 class="text-2xl font-black uppercase tracking-tighter text-white">Grid Sync</h3>
          </header>

          <div class="space-y-6">
            {#if hasNostrExtension()}
              <button
                onclick={connectExtension}
                class="w-full border-2 border-zinc-800 p-6 flex items-center justify-between hover:border-zinc-100 transition-all group"
              >
                <span class="text-sm font-black uppercase text-zinc-400 group-hover:text-white"
                  >Nostr Extension</span
                >
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </button>
            {/if}

            <div class="space-y-4">
              <label class="text-[9px] font-black text-zinc-600 uppercase tracking-widest block"
                >Direct NSEC Uplink</label
              >
              <input
                type="password"
                bind:value={nsecInput}
                placeholder="nsec1..."
                class="w-full bg-black border-2 border-zinc-800 p-6 text-white focus:border-white outline-none font-mono"
              />
              {#if extensionError}<p
                  class="text-[10px] text-red-500 uppercase font-black tracking-widest animate-pulse"
                >
                  [!] {extensionError}
                </p>{/if}
            </div>

            <div class="flex gap-4 pt-4">
              <button
                onclick={connectNsec}
                class="flex-1 bg-zinc-100 text-zinc-950 py-4 font-black uppercase tracking-widest text-xs hover:bg-white transition-all"
                >Connect</button
              >
              <button
                onclick={() => (showImport = false)}
                class="px-8 border-2 border-zinc-800 text-zinc-500 py-4 font-black uppercase tracking-widest text-xs hover:text-white transition-all"
                >Back</button
              >
            </div>
          </div>
        </div>
      {/if}
    </div>

    <footer class="mt-auto pt-6 border-t border-zinc-900 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-zinc-700 shrink-0">
      <span>Goy_Grid_Interface // Hybrid_Sovereignty</span>
      <span>No_Unauthorized_Data_Capture</span>
    </footer>
    {/if}
    </div>

<style>
  @keyframes progress-fast {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  .animate-progress-fast {
    animation: progress-fast 1s infinite linear;
  }
</style>
