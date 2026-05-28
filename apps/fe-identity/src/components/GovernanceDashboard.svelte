<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { grid } from '$lib/grid-state.svelte';
  import { applyAsGhostOperator, hasNostrExtension } from '@goy/nostr';

  let isLoading = $state(true);
  
  // Ghost Operator Form State
  let showApplyModal = $state(false);
  let isSubmitting = $state(false);
  let formDetails = $state({
    infrastructure: '',
    experience: '',
    nip05: ''
  });

  // Proposals State
  let proposals = $state([
    { 
      id: 'GP-42', 
      title: 'Decentralized Identity Indexing v2', 
      status: 'ACTIVE', 
      votes: { yes: 1240, no: 12 }, 
      endsIn: '48h 12m',
      desc: 'Implementation of the new NIP-05 cross-validation layer to enhance sovereign entity discovery.'
    },
    { 
      id: 'GP-41', 
      title: 'Liquid Network Bridge Fee Reduction', 
      status: 'EXECUTED', 
      votes: { yes: 890, no: 240 }, 
      endsIn: '0h 0m',
      desc: 'Proposal to reduce the automated peg-in fees for $GOYCO liquidity providers.'
    }
  ]);

  async function handleApply(e: Event) {
    e.preventDefault();
    if (!hasNostrExtension()) {
      alert('NOSTR_EXTENSION_REQUIRED: Please install Alby or similar.');
      return;
    }

    isSubmitting = true;
    try {
      // Create a proof of identity event (kind 27235 is standard for HTTP Auth)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nostr = (window as any).nostr;
      const event = await nostr.signEvent({
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['u', window.location.href]],
        content: 'Ghost Operator Application'
      });

      const result = await applyAsGhostOperator(event, formDetails);
      if (result.success) {
        grid.addLog('GHOST_OPERATOR_APPLICATION_TRANSMITTED');
        showApplyModal = false;
        alert('APPLICATION_TRANSMITTED: The Grid will review your infrastructure.');
      }
    } catch (e) {
      console.error(e);
      alert('TRANSMISSION_FAILED: Signature rejected or network error.');
    } finally {
      isSubmitting = false;
    }
  }

  onMount(() => {
    const activePubkey = sessionStorage.getItem('goy_pubkey');
    if (activePubkey) {
      grid.sync(activePubkey);
    }
    
    setTimeout(() => {
      isLoading = false;
    }, 600);
  });
</script>

<div class="flex flex-col gap-8 max-w-7xl w-full relative min-h-[600px] font-mono">
  {#if isLoading}
    <div class="fixed inset-0 z-[5000] bg-zinc-950 flex flex-col items-center justify-center space-y-6" out:fade>
       <div class="w-12 h-12 border-2 border-zinc-800 border-t-white animate-spin"></div>
       <span class="text-[10px] font-black text-white uppercase tracking-[0.5em]">Verifying_Manifesto_Integrity...</span>
    </div>
  {/if}

  <!-- Apply Modal -->
  {#if showApplyModal}
    <div transition:fade class="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
       <div transition:fly={{ y: 20 }} class="bg-zinc-950 border-2 border-green-900/50 p-8 max-w-xl w-full shadow-[32px_32px_0px_0px_rgba(0,0,0,0.5)]">
          <header class="mb-8">
             <span class="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] block mb-2">Protocol_Intake // v1.0</span>
             <h3 class="text-3xl font-black text-white uppercase tracking-tighter">Apply as Ghost Operator</h3>
          </header>

          <form onsubmit={handleApply} class="space-y-6">
             <div class="space-y-2">
                <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Infrastructure_Details</label>
                <textarea 
                  bind:value={formDetails.infrastructure}
                  required
                  placeholder="Specs: CPU, RAM, Region..." 
                  class="w-full bg-black border border-zinc-800 p-4 text-[11px] text-white focus:border-green-500 outline-none h-24"
                ></textarea>
             </div>
             <div class="space-y-2">
                <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Experience_Level</label>
                <select 
                  bind:value={formDetails.experience}
                  class="w-full bg-black border border-zinc-800 p-4 text-[11px] text-white focus:border-green-500 outline-none appearance-none"
                >
                   <option value="JUNIOR">LEVEL_1: NODE_MAINTAINER</option>
                   <option value="MID">LEVEL_2: INFRASTRUCTURE_ARCHITECT</option>
                   <option value="SENIOR">LEVEL_3: GHOST_ENGINEER</option>
                </select>
             </div>
             <div class="space-y-2">
                <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Contact_NIP05 (Optional)</label>
                <input 
                  bind:value={formDetails.nip05}
                  type="text" 
                  placeholder="operator@domain.com" 
                  class="w-full bg-black border border-zinc-800 p-4 text-[11px] text-white focus:border-green-500 outline-none"
                />
             </div>

             <div class="flex gap-4 pt-4">
                <button 
                  type="button"
                  onclick={() => showApplyModal = false}
                  class="flex-1 border-2 border-zinc-800 text-zinc-500 py-4 text-[10px] font-black uppercase tracking-widest hover:text-white"
                >
                   Abort_Application
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  class="flex-1 bg-green-600 text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 shadow-[6px_6px_0px_0px_rgba(34,197,94,0.2)] disabled:opacity-50"
                >
                   {isSubmitting ? 'Transmitting...' : 'Sign & Submit'}
                </button>
             </div>
          </form>
       </div>
    </div>
  {/if}

  <!-- Header Section -->
  <header class="bg-zinc-950 border-2 border-zinc-800 p-8 relative overflow-hidden group">
    <div class="absolute top-0 right-0 p-4 text-[6rem] font-black text-white/5 leading-none tracking-tighter select-none uppercase">GOVERN</div>
    
    <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div>
        <span class="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-4 block">Consensus_Layer // DAO_Orchestration</span>
        <h1 class="text-5xl font-black text-white tracking-tighter uppercase">Governance_Center</h1>
        <p class="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">
          Voter Weight: {grid.profile.following > 10 ? 'STRATEGIC' : 'OBSERVER'} // Reputation: {grid.profile.followers > 100 ? 'HIGH' : 'NEUTRAL'}
        </p>
      </div>

      <button 
        onclick={() => showApplyModal = true}
        class="bg-white text-zinc-950 px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
      >
        Become_Ghost_Operator
      </button>
    </div>
  </header>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <main class="lg:col-span-8 space-y-8">
      <!-- Active Proposals -->
      <section class="bg-zinc-950 border-2 border-zinc-800 overflow-hidden">
        <header class="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
          <span class="text-[10px] font-black text-white uppercase tracking-widest">Active_Governance_Proposals</span>
          <span class="text-[8px] font-bold text-green-500 uppercase animate-pulse">LATEST_SYNC: {new Date().toLocaleTimeString()}</span>
        </header>

        <div class="divide-y divide-zinc-900">
          {#each proposals as proposal (proposal.id)}
            <div class="p-8 group hover:bg-zinc-900/10 transition-all">
              <div class="flex justify-between items-start mb-4">
                 <div>
                    <span class="text-[9px] font-black text-zinc-600 block mb-1">ID: {proposal.id}</span>
                    <h4 class="text-xl font-black text-white uppercase tracking-tighter group-hover:text-green-400 transition-colors">{proposal.title}</h4>
                 </div>
                 <span class={`text-[9px] font-black px-3 py-1 border border-zinc-800 ${proposal.status === 'ACTIVE' ? 'text-green-500 border-green-900/30' : 'text-zinc-600'}`}>
                   {proposal.status}
                 </span>
              </div>
              
              <p class="text-xs text-zinc-400 leading-relaxed mb-8 max-w-2xl">
                {proposal.desc}
              </p>

              <div class="flex flex-col md:flex-row gap-8 items-end md:items-center">
                 <div class="flex-1 w-full space-y-3">
                    <div class="flex justify-between text-[9px] font-black uppercase text-zinc-600">
                       <span>Yes: {proposal.votes.yes}</span>
                       <span>No: {proposal.votes.no}</span>
                    </div>
                    <div class="h-1.5 w-full bg-zinc-900 flex gap-0.5 border border-zinc-800">
                       <div class="h-full bg-green-500/40" style="width: {(proposal.votes.yes / (proposal.votes.yes + proposal.votes.no) * 100)}%"></div>
                    </div>
                 </div>
                 <div class="flex gap-4 w-full md:w-auto">
                    <button class="flex-1 md:w-24 border border-zinc-800 text-white py-3 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-zinc-950 transition-all">
                      [ Vote_No ]
                    </button>
                    <button class="flex-1 md:w-24 bg-zinc-800 text-white py-3 text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all">
                      [ Vote_Yes ]
                    </button>
                 </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    </main>

    <!-- Side Intelligence: Manifesto -->
    <aside class="lg:col-span-4 space-y-8">
       <section class="bg-black border-2 border-zinc-800 p-8 flex flex-col h-full relative overflow-hidden group">
          <div class="absolute -bottom-4 -left-4 opacity-5 pointer-events-none select-none text-[8rem] font-black text-white leading-none">M</div>
          
          <header class="mb-8 border-b border-zinc-900 pb-6 relative z-10">
             <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Foundational_Document</span>
             <h3 class="text-2xl font-black text-white uppercase tracking-tighter">The_Manifesto</h3>
          </header>
          
          <div class="space-y-6 text-[10px] text-zinc-400 leading-relaxed uppercase font-medium relative z-10">
             <p>1. Privacy is a technical fundamental, not a request.</p>
             <p>2. Sovereign Identity resides in the key, not the database.</p>
             <p>3. Transparency of code is the baseline for trust.</p>
             <p>4. Infrastructure must be decentralized by architecture, not by promise.</p>
          </div>

          <div class="mt-12 relative z-10">
             <button class="w-full border-2 border-zinc-800 text-white py-4 text-[10px] font-black uppercase tracking-widest hover:border-green-500 transition-all">
               Read Full Protocol
             </button>
          </div>
       </section>

       <section class="bg-zinc-950 border-2 border-zinc-800 p-6 font-mono">
          <div class="flex items-center gap-3 mb-4">
             <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
             <span class="text-[10px] font-black text-white uppercase tracking-widest">Governance_Stats</span>
          </div>
          <div class="space-y-3 text-[9px] text-zinc-500 uppercase">
             <div class="flex justify-between border-b border-zinc-900 pb-2">
                <span>Active Voters</span>
                <span class="text-white">1,402 ENTITIES</span>
             </div>
             <div class="flex justify-between border-b border-zinc-900 pb-2">
                <span>DAO Assets</span>
                <span class="text-white">12.8M $GOYCO</span>
             </div>
             <div class="flex justify-between">
                <span>Quorum Status</span>
                <span class="text-green-500">REACHED</span>
             </div>
          </div>
       </section>
    </aside>
  </div>
</div>

