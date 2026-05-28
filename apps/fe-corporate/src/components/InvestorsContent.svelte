<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  let price = $state(0.42069);
  let change = $state(12.4);
  let supply = $state(19542000);
  let valuation = $derived(price * supply);

  let isTerminalOpen = $state(false);
  let terminalLines = $state<string[]>([]);
  let showFinalUI = $state(false);

  const bootSequence = [
    '[OK] ESTABLISHING ENCRYPTED LINK TO LIQUID_PEER...',
    '[OK] VALIDATING ASSET_ID: 8f2a...c9d4...',
    '[OK] ACCESS GRANTED. WELCOME, BITCOIN_HODLER.',
  ];

  function openTerminal() {
    isTerminalOpen = true;
    terminalLines = [];
    showFinalUI = false;

    bootSequence.forEach((line, i) => {
      setTimeout(() => {
        terminalLines = [...terminalLines, line];
        if (i === bootSequence.length - 1) {
          setTimeout(() => {
            showFinalUI = true;
          }, 800);
        }
      }, i * 600);
    });
  }

  function closeTerminal() {
    isTerminalOpen = false;
  }

  $effect(() => {
    const interval = setInterval(() => {
      const jitter = Math.random() * 0.001 - 0.0005;
      price = Math.max(0.4, price + jitter);
      change = change + (Math.random() * 0.2 - 0.1);

      // Simulated dynamic issuance/supply
      const supplyJitter = Math.floor(Math.random() * 100) - 30;
      supply = Math.max(10000000, supply + supplyJitter);
    }, 3000);
    return () => clearInterval(interval);
  });
</script>

<div
  class="w-full font-mono bg-zinc-950 transition-colors selection:bg-white selection:text-zinc-950"
>
  <!-- SECTION 01: HERO / PRICE BOARD + TERMINAL ACCESS -->
  <section class="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20 md:mb-24"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-[1px] bg-white"></div>
          <span class="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600"
            >Stakeholders</span
          >
        </div>
        <h2
          class="text-[clamp(2.5rem,7vw,7rem)] font-black uppercase tracking-tighter leading-[0.85] text-white"
        >
          Investor<br />Relations.
        </h2>
      </div>
      <div class="max-w-xs border-l border-zinc-900 pl-6 py-1">
        <p
          class="font-mono text-[10px] text-zinc-500 uppercase leading-relaxed font-bold tracking-tight"
        >
          High-fidelity capital structure built on Bitcoin Layer-2. Equity as a technical property,
          secured by Liquid.
        </p>
      </div>
    </div>

    <!-- Live Price Grid with Terminal CTA -->
    <div class="border-t border-zinc-900">
      <div
        class="grid grid-cols-1 md:grid-cols-12 items-center border-b border-zinc-900 py-12 md:py-16 gap-12"
      >
        <div class="md:col-span-3">
          <span class="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 block mb-4"
            >Market_Ticker</span
          >
          <h3
            class="text-6xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none"
          >
            $GOYCO
          </h3>
        </div>
        <div class="md:col-span-3 flex flex-col">
          <span class="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 block mb-4"
            >Valuation_USD</span
          >
          <div class="flex flex-col gap-2">
            <div class="flex items-baseline gap-4 leading-none">
              <span class="text-4xl md:text-5xl font-black text-white tabular-nums"
                >${price.toFixed(5)}</span
              >
              <span class="text-green-500 font-bold text-sm uppercase tracking-tighter"
                >+{change.toFixed(1)}%</span
              >
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[8px] font-black text-zinc-600 uppercase tracking-widest"
                >Market_Cap:</span
              >
              <span class="text-[11px] font-black text-zinc-400 tabular-nums"
                >${(valuation / 1000000).toFixed(2)}M</span
              >
            </div>
          </div>
        </div>
        <div class="md:col-span-6 flex flex-col md:items-end gap-6">
          <button
            onclick={openTerminal}
            class="bg-white text-zinc-950 px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            [ ENTER_TRADING_TERMINAL ]
          </button>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-[9px] font-black uppercase text-zinc-600 tracking-widest"
              >Liquid_Network_Operational</span
            >
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 02: TECHNICAL METADATA -->
  <section class="bg-zinc-900/30 border-y border-zinc-900">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4">
      {#each [{ label: 'Total_Supply', value: supply.toLocaleString() }, { label: 'Market_Cap', value: `$${(valuation / 1000000).toFixed(2)}M` }, { label: 'Issuance_Type', value: 'Confidential' }, { label: 'Settlement', value: 'Liquid (BTC)' }] as item, i}
        <div class="p-10 border-zinc-900 {i !== 3 ? 'md:border-r' : ''} border-b md:border-b-0">
          <span class="text-[8px] font-black uppercase tracking-widest text-zinc-600 block mb-4"
            >{item.label}</span
          >
          <span
            class="text-xl md:text-2xl font-black text-white uppercase tracking-tight tabular-nums"
            >{item.value}</span
          >
        </div>
      {/each}
    </div>
  </section>

  <!-- SECTION 03: PHILOSOPHY -->
  <section class="py-24 md:py-32 border-b border-zinc-900">
    <div class="max-w-7xl mx-auto px-6 md:px-12">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-16">
        <div class="md:col-span-5">
          <span class="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-8 block"
            >02_Strategic_Foundations</span
          >
          <h3
            class="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white"
          >
            Bypassing the<br />Gatekeepers.
          </h3>
        </div>
        <div
          class="md:col-span-7 space-y-10 text-zinc-500 font-mono text-xs md:text-sm leading-relaxed uppercase tracking-tight"
        >
          <p>
            We chose the Liquid Network because equity shouldn't rely on experimental foundations.
            By issuing $GOYCO as a security token on a Bitcoin Layer-2, we inherit the security of
            the world's most robust monetary network.
          </p>
          <div class="border-l border-zinc-800 pl-8">
            <p class="text-white font-bold mb-6">
              The Goy Company is funded by users who understand the value of Confidential Assets and
              rapid, finalized settlement.
            </p>
            <p>
              $GOYCO represents direct, verifiable equity. No VCs. No centralized instability. Just
              Bitcoin-backed sovereignty for the stakeholders.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- THE FULL-SCREEN TERMINAL OVERLAY -->
  {#if isTerminalOpen}
    <div
      transition:fade={{ duration: 300 }}
      class="fixed inset-0 z-[600] bg-zinc-950 text-white flex flex-col p-6 md:p-12 font-mono overflow-hidden"
    >
      <!-- Terminal Header -->
      <div class="flex justify-between items-center border-b border-zinc-900 pb-8 mb-16">
        <div class="flex flex-col">
          <span class="text-[10px] font-black uppercase tracking-widest text-zinc-600"
            >GoyCo_Terminal // Session_Liquid_8f2a</span
          >
          <h3 class="text-2xl md:text-3xl font-black uppercase tracking-tighter mt-1 text-white">
            Liquid_STO_Access
          </h3>
        </div>
        <button
          onclick={closeTerminal}
          class="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border border-zinc-800 px-4 py-2"
        >
          [ TERMINATE_SESSION ]
        </button>
      </div>

      <!-- Terminal Output -->
      <div class="flex-1 flex flex-col items-center overflow-hidden px-6 md:px-12">
        <div class="w-full flex flex-col items-start space-y-3 mb-16 min-h-[120px]">
          {#each terminalLines as line}
            <div transition:fly={{ y: 10, duration: 200 }} class="text-[11px] md:text-xs text-left">
              <span class="text-zinc-800 mr-3">>>></span> <span class="text-zinc-400">{line}</span>
            </div>
          {/each}
        </div>

        {#if showFinalUI}
          <div
            in:fade={{ delay: 400 }}
            class="p-10 border border-zinc-900 bg-zinc-900/20 max-w-2xl w-full mx-auto"
          >
            <div class="flex justify-between items-center mb-10 border-b border-zinc-900 pb-6">
              <h3 class="text-xl font-black uppercase tracking-tighter text-white">
                Atomic_Swap_V1.0
              </h3>
              <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                <span class="text-[8px] text-green-500 font-bold uppercase tracking-widest"
                  >Liquid_Secure</span
                >
              </div>
            </div>

            <div class="space-y-8">
              <div class="flex flex-col gap-3">
                <label class="text-[8px] font-black uppercase text-zinc-600 tracking-[0.3em]"
                  >Acquisition_Amount [L-BTC]</label
                >
                <input
                  type="text"
                  placeholder="0.00000000"
                  class="bg-zinc-950 border border-zinc-800 p-4 text-2xl font-black text-white focus:outline-none focus:border-zinc-500 transition-colors tabular-nums"
                />
              </div>

              <div class="flex flex-col gap-3">
                <label class="text-[8px] font-black uppercase text-zinc-600 tracking-[0.3em]"
                  >Equity_Recieved [$GOYCO]</label
                >
                <div
                  class="bg-zinc-900/50 border border-zinc-900 p-4 text-2xl font-black text-zinc-700 tabular-nums"
                >
                  0.00
                </div>
              </div>

              <button
                class="w-full bg-white text-zinc-950 py-5 font-black uppercase tracking-[0.3em] text-[11px] hover:bg-zinc-200 transition-colors mt-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                Broadcast_Atomic_Swap
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer Info -->
      <footer
        class="mt-auto pt-8 border-t border-zinc-900 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-zinc-800"
      >
        <span>Goy_Company // Bitcoin_L2_Infrastructure</span>
        <div class="flex gap-4">
          <span>Uplink_Sync: OK</span>
          <span class="text-zinc-700">Peer_Status: Authenticated</span>
        </div>
      </footer>
    </div>
  {/if}
</div>
