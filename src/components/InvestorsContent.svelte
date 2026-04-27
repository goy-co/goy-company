<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  let price = $state(0.42069);
  let change = $state(12.4);
  let isTerminalOpen = $state(false);
  let terminalLines = $state<string[]>([]);
  let showFinalUI = $state(false);

  const bootSequence = [
    "[OK] ESTABLISHING ENCRYPTED LINK TO LIQUID_PEER...",
    "[OK] VALIDATING ASSET_ID: 8f2a...c9d4...",
    "[OK] ACCESS GRANTED. WELCOME, BITCOIN_HODLER."
  ];

  function openTerminal() {
    isTerminalOpen = true;
    terminalLines = [];
    showFinalUI = false;
    
    // Simulate staggered boot sequence
    bootSequence.forEach((line, i) => {
      setTimeout(() => {
        terminalLines = [...terminalLines, line];
        if (i === bootSequence.length - 1) {
          setTimeout(() => { showFinalUI = true; }, 800);
        }
      }, i * 600);
    });
  }

  function closeTerminal() {
    isTerminalOpen = false;
  }

  $effect(() => {
    if (isTerminalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.documentElement.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.documentElement.classList.remove('modal-open');
    };
  });

  $effect(() => {
    const interval = setInterval(() => {
      const jitter = (Math.random() * 0.001) - 0.0005;
      price = Math.max(0.4, price + jitter);
      change = change + (Math.random() * 0.2 - 0.1);
    }, 3000);
    return () => clearInterval(interval);
  });
</script>

<div class="max-w-6xl mx-auto border-4 border-zinc-900 bg-white font-mono text-zinc-900 mb-24 overflow-hidden relative transition-colors">
  <!-- HEADER: THE PRICE BOARD -->
  <header class="border-b-4 border-zinc-900 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-zinc-50 transition-colors">
    <div>
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2 block">Ticker // Security_Equity</span>
      <h1 class="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none">$GOYCO</h1>
    </div>
    <div class="text-right">
      <div class="flex items-baseline justify-end gap-4 mb-2">
        <span class="text-4xl md:text-6xl font-black tabular-nums">${price.toFixed(5)}</span>
        <span class="text-green-600 font-bold text-sm uppercase">+{change.toFixed(1)}%</span>
      </div>
      <p class="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live_Price // Updated_Liquid_Node</p>
    </div>
  </header>

  <!-- TECHNICAL METADATA GRID -->
  <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b-4 border-zinc-900">
    <div class="p-8 border-b-2 md:border-b-0 md:border-r-2 border-zinc-100 transition-colors">
      <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-4">Total Supply</span>
      <span class="text-2xl font-black tabular-nums text-zinc-900">21,000,000</span>
    </div>
    <div class="p-8 border-b-2 md:border-b-0 md:border-r-2 border-zinc-100 transition-colors">
      <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-4">Market Cap</span>
      <span class="text-2xl font-black tabular-nums text-zinc-900">$8.83M</span>
    </div>
    <div class="p-8 border-b-2 lg:border-b-0 lg:border-r-2 border-zinc-100 transition-colors">
      <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-4">Issuance</span>
      <span class="text-2xl font-black uppercase text-zinc-900">Confidential</span>
    </div>
    <div class="p-8">
      <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-4">Network</span>
      <span class="text-2xl font-black uppercase text-zinc-900">Liquid (BTC L2)</span>
    </div>
  </section>

  <!-- ASSET ID STRIP -->
  <div class="bg-zinc-900 text-white p-4 flex flex-col md:flex-row justify-between items-center px-8 gap-4 transition-colors">
    <span class="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Liquid_Asset_ID // VERIFIED_SECURITY</span>
    <div class="flex items-center gap-4">
      <span class="text-[10px] font-mono opacity-80 break-all">8f2a74c6d4e5f9a214290fb8f2a74c6d4e5f9a214290fb8f2a74c6d4e5f9a214</span>
      <button class="bg-zinc-700 hover:bg-zinc-600 text-[9px] px-2 py-1 font-black uppercase tracking-widest transition-colors">Copy</button>
    </div>
  </div>

  <!-- EQUITY MANIFESTO -->
  <section class="p-8 md:p-16 border-b-4 border-zinc-900">
    <div class="max-w-3xl">
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-8 block">Foundational // Philosophy</span>
      <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-12 text-zinc-900">Bypassing the Gatekeepers.</h2>
      
      <div class="space-y-8 text-zinc-600 uppercase text-xs font-bold leading-relaxed tracking-widest">
        <p>
          We chose the Liquid Network because equity shouldn't rely on experimental foundations. By issuing $GOYCO as a security token on a Bitcoin Layer-2, we inherit the security of the world's most robust monetary network.
        </p>
        <p>
          The Goy Company is funded by users who understand the value of **Confidential Assets** and rapid, finalized settlement. $GOYCO represents direct, verifiable equity.
        </p>
        <p class="text-zinc-900">
          No VCs. No Ethereum-style instability. Just Bitcoin-backed sovereignty for the stakeholders.
        </p>
      </div>
    </div>
  </section>

  <!-- ACQUISITION TUTORIAL -->
  <section class="p-8 md:p-16 bg-zinc-50 transition-colors">
    <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-12 block">Onboarding // STO_Process</span>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="border-l-4 border-zinc-900 pl-6">
        <span class="text-3xl font-black block mb-4 text-zinc-900">01</span>
        <h4 class="text-sm font-black uppercase mb-2 text-zinc-900">Liquid Wallet</h4>
        <p class="text-[10px] text-zinc-500 uppercase leading-loose">Install Marina or Blockstream Green. Establish your Liquid identity.</p>
      </div>
      <div class="border-l-4 border-zinc-900 pl-6">
        <span class="text-3xl font-black block mb-4 text-zinc-900">02</span>
        <h4 class="text-sm font-black uppercase mb-2 text-zinc-900">Acquire L-BTC</h4>
        <p class="text-[10px] text-zinc-500 uppercase leading-loose">Peg-in BTC or swap on SideSwap to obtain Liquid-native Bitcoin.</p>
      </div>
      <div class="border-l-4 border-zinc-900 pl-6">
        <span class="text-3xl font-black block mb-4 text-zinc-900">03</span>
        <h4 class="text-sm font-black uppercase mb-2 text-zinc-900">Issue Equity</h4>
        <p class="text-[10px] text-zinc-500 uppercase leading-loose">Use our terminal to execute a trustless atomic swap for $GOYCO shares.</p>
      </div>
    </div>

    <div class="mt-16 flex justify-center">
      <button 
        onclick={openTerminal}
        class="bg-zinc-900 text-white px-12 py-6 text-sm font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-[12px_12px_0px_0px_rgba(39,39,42,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
        Access Trading Terminal
      </button>
    </div>
  </section>

  <!-- THE FULL-SCREEN TERMINAL OVERLAY -->
  {#if isTerminalOpen}
    <div 
      transition:fade={{ duration: 300 }}
      class="fixed inset-0 z-[600] bg-zinc-950 text-white flex flex-col p-6 md:p-12 font-mono overflow-hidden"
    >
      <!-- Terminal Header -->
      <div class="flex justify-between items-center border-b border-zinc-800 pb-6 mb-12">
        <div class="flex flex-col">
          <span class="text-[10px] font-black uppercase tracking-widest opacity-60">GoyCo_Terminal // Session_Liquid_8f2a</span>
          <h3 class="text-xl md:text-2xl font-black uppercase tracking-tighter mt-1">Liquid_STO_Access</h3>
        </div>
        <button 
          onclick={closeTerminal}
          class="text-xs font-black uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          [ TERMINATE_SESSION ]
        </button>
      </div>

      <!-- Boot Text / Terminal Output (No Scroll - Fixed Top-Left Start) -->
      <div class="flex-1 flex flex-col items-center overflow-hidden px-6 md:px-12 pt-4 md:pt-8">
        <!-- Logs stay aligned to the top-left -->
        <div class="w-full flex flex-col items-start space-y-2 mb-12 min-h-[100px]">
          {#each terminalLines as line}
            <div transition:fly={{ y: 10, duration: 200 }} class="text-xs md:text-sm text-left">
              <span class="text-zinc-600 mr-2">>>></span> {line}
            </div>
          {/each}
        </div>

        <!-- Interface box fades in below -->
        {#if showFinalUI}
          <div in:fade={{ delay: 400 }} class="p-8 border-2 border-zinc-800 bg-zinc-900/50 max-w-2xl w-full mx-auto">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-xl font-black uppercase tracking-tighter text-zinc-100">Atomic_Swap_V1.0</h3>
              <span class="text-[10px] text-green-500 font-bold uppercase animate-pulse">Connection: Liquid_Secure</span>
            </div>
            
            <div class="space-y-6">
              <div class="flex flex-col gap-2">
                <label class="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Acquisition_Amount [L-BTC]</label>
                <input type="text" placeholder="0.00000000" class="bg-black border border-zinc-700 p-4 text-xl font-black text-white focus:outline-none focus:border-white transition-colors" />
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Equity_Recieved [$GOYCO]</label>
                <div class="bg-zinc-800/50 border border-zinc-700 p-4 text-xl font-black text-zinc-400">0.00</div>
              </div>

              <button class="w-full bg-white text-black py-4 font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors mt-4">
                Broadcast_Atomic_Swap
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer Info -->
      <footer class="mt-auto pt-8 border-t border-zinc-800 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
        <span>Goy_Company // Bitcoin_L2_Infrastructure</span>
        <span>Peer_Status: Authenticated</span>
      </footer>
    </div>
  {/if}
</div>
