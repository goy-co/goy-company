<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from "svelte/transition";;
  import { grid } from '$lib/grid-state.svelte';

  // Wealth Specific State
  let isLoading = $state(true);
  let portfolio = $state({
    totalBtc: 0.12450000,
    goycoBalance: 1242.42,
    stakedAmount: 4500.00,
    marketCap: '24.2M',
    yield: '12.4%'
  });

  let assets = $state([
    { id: 'goyco', name: 'GoyCO Token', ticker: '$GOYCO', balance: 1242.42, valueBtc: 0.052182, status: 'LIQUID', color: 'text-green-500' },
    { id: 'lbtc', name: 'Liquid Bitcoin', ticker: 'L-BTC', balance: 0.072318, valueBtc: 0.072318, status: 'NATIVE', color: 'text-orange-500' },
    { id: 'sto', name: 'Company Equity', ticker: 'GOY-STO', balance: 4500.00, valueBtc: 0.189000, status: 'VESTING', color: 'text-blue-500' }
  ]);

  let history = $state([
    { id: 1, type: 'INCOMING', asset: '$GOYCO', amount: '+240.00', time: '2026-04-27 14:20', status: 'CONFIRMED' },
    { id: 2, type: 'STO_REWARD', asset: '$GOYCO', amount: '+12.42', time: '2026-04-26 00:00', status: 'SETTLED' },
    { id: 3, type: 'OUTGOING', asset: 'L-BTC', amount: '-0.0012', time: '2026-04-25 18:45', status: 'CONFIRMED' }
  ]);

  onMount(() => {
    // Initial sync context
    const activePubkey = sessionStorage.getItem('goy_pubkey');
    if (activePubkey) {
      grid.sync(activePubkey);
    }
    
    // Simulate loading for technical impact
    setTimeout(() => {
      isLoading = false;
    }, 800);
  });
</script>

<div class="flex flex-col gap-8 max-w-7xl w-full relative min-h-[600px] font-mono">
  {#if isLoading}
    <div class="fixed inset-0 z-[5000] bg-zinc-950 flex flex-col items-center justify-center space-y-6" out:fade>
       <div class="w-12 h-12 border-2 border-zinc-800 border-t-white animate-spin"></div>
       <span class="text-[10px] font-black text-white uppercase tracking-[0.5em]">Accessing_Vault...</span>
    </div>
  {/if}

  <!-- Header Section -->
  <header class="bg-zinc-950 border-2 border-zinc-800 p-8 relative overflow-hidden group">
    <div class="absolute top-0 right-0 p-4 text-[6rem] font-black text-white/5 leading-none tracking-tighter select-none uppercase">WEALTH</div>
    
    <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div>
        <span class="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-4 block">Financial_Layer // Total_Equity</span>
        <div class="flex items-baseline gap-4">
          <h1 class="text-6xl font-black text-white tracking-tighter tabular-nums">
            {portfolio.totalBtc.toFixed(8)}
          </h1>
          <span class="text-2xl font-black text-zinc-600">BTC</span>
        </div>
        <p class="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">
          ≈ {(portfolio.totalBtc * 65000).toLocaleString()} USD_STABLE // GRID_MARKET_PRICE
        </p>
      </div>

      <div class="flex gap-4">
        <div class="bg-zinc-900 border border-zinc-800 p-4">
          <span class="text-[8px] font-black text-zinc-600 uppercase block mb-1">Grid_Market_Cap</span>
          <span class="text-lg font-black text-white tabular-nums">{portfolio.marketCap}</span>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 p-4">
          <span class="text-[8px] font-black text-zinc-600 uppercase block mb-1">Staking_APY</span>
          <span class="text-lg font-black text-green-500 tabular-nums">{portfolio.yield}</span>
        </div>
      </div>
    </div>
  </header>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <!-- Assets Table -->
    <main class="lg:col-span-8 space-y-8">
      <section class="bg-zinc-950 border-2 border-zinc-800 overflow-hidden">
        <header class="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
          <span class="text-[10px] font-black text-white uppercase tracking-widest">Distributed_Asset_Inventory</span>
          <span class="text-[8px] font-bold text-zinc-600 uppercase">3 Active_Protocols</span>
        </header>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[9px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900">
                <th class="p-6">Asset_Identity</th>
                <th class="p-6">Balance</th>
                <th class="p-6">BTC_Valuation</th>
                <th class="p-6 text-right">Uplink</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              {#each assets as asset (asset.symbol)}
                <tr class="border-b border-zinc-900/50 hover:bg-zinc-900/20 transition-colors group">
                  <td class="p-6">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-8 bg-zinc-800 group-hover:bg-white transition-colors"></div>
                      <div>
                        <span class="font-black text-white block uppercase">{asset.name}</span>
                        <span class="text-[10px] font-bold text-zinc-500">{asset.ticker}</span>
                      </div>
                    </div>
                  </td>
                  <td class="p-6 tabular-nums font-bold text-zinc-300">
                    {asset.balance.toLocaleString()}
                  </td>
                  <td class="p-6 tabular-nums font-bold text-zinc-500">
                    {asset.valueBtc.toFixed(6)}
                  </td>
                  <td class="p-6 text-right">
                    <span class={`text-[9px] font-black px-2 py-1 border border-zinc-800 ${asset.color}`}>
                      {asset.status}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <!-- STO Detail & Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section class="bg-zinc-950 border-2 border-zinc-800 p-8 relative group overflow-hidden">
          <div class="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-50"></div>
          <header class="mb-6">
             <span class="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] block mb-2">Protocol // STO_Offering</span>
             <h3 class="text-2xl font-black text-white uppercase tracking-tighter">Security Token Offering</h3>
          </header>
          <p class="text-xs text-zinc-400 leading-relaxed mb-8">
            Ownership in The Goy Company is represented via GOY-STO tokens on the Liquid Network. Fully regulated, peer-to-peer, and sovereign.
          </p>
          <div class="space-y-4">
             <button class="w-full border-2 border-zinc-800 text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-zinc-950 transition-all">
               View Prospecuts_PDF
             </button>
             <button class="w-full bg-blue-600 text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[6px_6px_0px_0px_rgba(37,99,235,0.2)]">
               Purchase Equity
             </button>
          </div>
        </section>

        <section class="bg-zinc-950 border-2 border-zinc-800 p-8 flex flex-col justify-between">
           <header class="mb-6">
             <span class="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] block mb-2">Gateway // Bridge_Assets</span>
             <h3 class="text-2xl font-black text-white uppercase tracking-tighter">Mainchain Bridge</h3>
          </header>
          <div class="bg-zinc-900/50 border border-zinc-800 p-4 mb-6">
             <div class="flex justify-between items-center mb-2">
               <span class="text-[9px] font-black text-zinc-600 uppercase">BTC Inbound Address</span>
               <span class="text-[8px] text-green-500">PEGS_ACTIVE</span>
             </div>
             <code class="text-[10px] text-zinc-400 break-all bg-black p-2 block border border-zinc-800">
               bc1qgoy...vault...infrastructure
             </code>
          </div>
          <button class="w-full border-2 border-orange-900/50 text-orange-500 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">
            Initiate Peg-In
          </button>
        </section>
      </div>
    </main>

    <!-- Side History -->
    <aside class="lg:col-span-4 space-y-8">
      <section class="bg-black border-2 border-zinc-800 p-6 flex flex-col h-full">
        <header class="mb-6 border-b border-zinc-900 pb-4">
           <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Transmission_History</span>
        </header>
        
        <div class="space-y-6 flex-1">
          {#each history as item (item.id)}
            <div class="group">
              <div class="flex justify-between items-start mb-1">
                <span class={`text-[9px] font-black ${item.type === 'OUTGOING' ? 'text-red-500' : 'text-green-500'}`}>
                  {item.type}
                </span>
                <span class="text-[8px] text-zinc-700">{item.time}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs font-black text-zinc-300 uppercase tracking-tighter">{item.asset}</span>
                <span class="text-sm font-black text-white tabular-nums tracking-tighter">{item.amount}</span>
              </div>
              <div class="mt-2 flex items-center gap-2">
                 <div class="w-1 h-1 bg-green-500 rounded-full"></div>
                 <span class="text-[8px] font-bold text-zinc-600 uppercase">{item.status}</span>
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-8 pt-6 border-t border-zinc-900">
           <button class="w-full text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:text-zinc-400 transition-colors">
             [ Export_CSV_Data ]
           </button>
        </div>
      </section>

      <section class="bg-zinc-950 border-2 border-zinc-800 p-6 font-mono">
         <div class="flex items-center gap-3 mb-4">
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span class="text-[10px] font-black text-white uppercase tracking-widest">Network_Intelligence</span>
         </div>
         <div class="space-y-2 text-[9px] text-zinc-500 uppercase leading-relaxed">
            <p>> BLOCK_HEIGHT: 841,242</p>
            <p>> LIQUID_FEES: 0.11 SAT/VB</p>
            <p>> MEMPOOL_CLEARANCE: NOMINAL</p>
            <p class="text-zinc-700 mt-4 italic">Watching the tape...</p>
         </div>
      </section>
    </aside>
  </div>
</div>
