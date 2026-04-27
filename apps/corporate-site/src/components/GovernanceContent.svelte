<script lang="ts">
  import { fade, fly } from 'svelte/transition';

  interface Proposal {
    id: string;
    title: string;
    status: 'ACTIVE' | 'PASSED' | 'FAILED';
    yesVotes: number;
    noVotes: number;
    description: string;
    expiresIn: string;
  }

  let showAll = $state(false);
  let selectedProposal = $state<Proposal | null>(null);
  let isVoting = $state(false);
  let votingLines = $state<string[]>([]);
  let votingStep = $state<'validating' | 'ready' | 'success'>('validating');

  let proposals = $state<Proposal[]>([
    {
      id: '084',
      title: 'Implement Physical Hardware Hardening',
      status: 'ACTIVE',
      yesVotes: 64,
      noVotes: 12,
      description: 'Upgrade primary relay nodes with tamper-evident physical shielding and PGP-layer hardware security modules (HSM) for enhanced key isolation.',
      expiresIn: '48H 12M'
    },
    {
      id: '083',
      title: 'Mandatory Protocol-Wide Key Rotation v4.2',
      status: 'ACTIVE',
      yesVotes: 89,
      noVotes: 2,
      description: 'Scheduled execution of a protocol-wide master key rotation to ensure the continued integrity of the decentralized mesh network.',
      expiresIn: '12H 04M'
    },
    {
      id: '082',
      title: 'Transition to Pure P2P Asset Propagation',
      status: 'PASSED',
      yesVotes: 98,
      noVotes: 1,
      description: 'Finalize the decommissioning of all centralized static asset delivery dependencies in favor of native mesh-based propagation.',
      expiresIn: 'EXPIRED'
    },
    {
      id: '081',
      title: 'Initialize "GoyDrive" Storage Architecture',
      status: 'PASSED',
      yesVotes: 92,
      noVotes: 4,
      description: 'Provisioning for the technical architecture of a distributed, encrypted storage system integrated with the Nostr event model.',
      expiresIn: 'EXPIRED'
    },
    {
      id: '080',
      title: 'Expand Mesh Capacity (Sector 0400)',
      status: 'FAILED',
      yesVotes: 12,
      noVotes: 78,
      description: 'Proposed expansion of the relay network into extreme latitude research zones. Rejected due to signal latency exceeding protocol stability thresholds.',
      expiresIn: 'EXPIRED'
    },
    {
      id: '079',
      title: 'Automated Node Operator Sustenance v1',
      status: 'PASSED',
      yesVotes: 76,
      noVotes: 14,
      description: 'Implementation of a smart-contract governed distribution model to reward long-term node infrastructure contributors.',
      expiresIn: 'EXPIRED'
    }
  ]);

  let recommendedProposals = $derived(proposals.slice(0, 2));

  function startVoting(proposal: Proposal) {
    selectedProposal = proposal;
    isVoting = true;
    votingStep = 'validating';
    votingLines = ["[INIT] ACCESSING GOVERNANCE_RECORDS...", "[OK] IDENTIFYING STAKEHOLDER_KEY...", "[OK] CALCULATING VOTING_WEIGHT: 4,200 GOYCO"];
    
    setTimeout(() => {
      votingStep = 'ready';
    }, 1800);
  }

  function submitVote(type: 'yes' | 'no') {
    if (!selectedProposal) return;
    votingStep = 'validating';
    votingLines = ["[SEND] BROADCASTING VOTE_EVENT...", "[OK] RELAY_ZURICH ACKNOWLEDGED.", "[OK] RELAY_MADRID ACKNOWLEDGED.", "[OK] CONSENSUS REACHED."];
    
    setTimeout(() => {
      castVote(selectedProposal!.id, type);
      votingStep = 'success';
    }, 2000);
  }

  function castVote(id: string, type: 'yes' | 'no') {
    const p = proposals.find(p => p.id === id);
    if (p && p.status === 'ACTIVE') {
      if (type === 'yes') p.yesVotes += 1;
      else p.noVotes += 1;
    }
  }
</script>

<div class="max-w-6xl mx-auto font-mono text-zinc-900 dark:text-zinc-50 mb-24 transition-colors">
  <!-- THE VOTING OVERLAY -->
  {#if isVoting && selectedProposal}
    <div 
      transition:fade={{ duration: 300 }}
      class="fixed inset-0 z-[600] bg-zinc-950 text-white flex flex-col p-6 md:p-12 font-mono overflow-hidden"
    >
      <!-- Overlay Header -->
      <div class="flex justify-between items-center border-b border-zinc-800 pb-6 mb-12">
        <div class="flex flex-col">
          <span class="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Voting_Session // PROPOSAL_{selectedProposal.id}</span>
          <h3 class="text-xl md:text-2xl font-black uppercase tracking-tighter mt-1">{selectedProposal.title}</h3>
        </div>
        <button 
          onclick={() => isVoting = false}
          class="text-xs font-black uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          [ ABORT_VOTE ]
        </button>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center">
        {#if votingStep === 'validating'}
          <div class="space-y-4 max-w-xl w-full">
            {#each votingLines as line}
              <div in:fly={{ y: 10, duration: 300 }} class="text-xs md:text-sm">
                <span class="text-zinc-600 mr-2">>>></span> {line}
              </div>
            {/each}
          </div>
        {:else if votingStep === 'ready'}
          <div in:fade class="max-w-2xl w-full bg-zinc-900 border-2 border-zinc-800 p-8 md:p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.3)]">
            <header class="mb-12">
              <span class="text-[10px] font-black uppercase tracking-widest text-green-500 mb-2 block">Status: Validated</span>
              <h4 class="text-2xl font-black uppercase tracking-tighter">Confirm Decision</h4>
              <p class="text-[10px] text-zinc-500 uppercase mt-4 leading-relaxed">Your current stake grants you 4,200 units of voting weight. This action is irreversible once broadcasted to the mesh.</p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onclick={() => submitVote('yes')}
                class="bg-white text-black p-6 font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex flex-col items-center gap-2 group"
              >
                <span>VOTE_IN_FAVOR</span>
                <span class="text-[9px] opacity-40 group-hover:opacity-100">CONFIRM_YES</span>
              </button>
              <button 
                onclick={() => submitVote('no')}
                class="border-2 border-zinc-800 text-white p-6 font-black uppercase tracking-widest hover:bg-red-600 transition-all flex flex-col items-center gap-2 group"
              >
                <span>VOTE_AGAINST</span>
                <span class="text-[9px] opacity-40 group-hover:opacity-100">CONFIRM_NO</span>
              </button>
            </div>
          </div>
        {:else if votingStep === 'success'}
          <div in:fly={{ y: 20 }} class="text-center space-y-8">
            <div class="text-6xl md:text-9xl font-black uppercase tracking-tighter text-green-600">VOTE_RECORDED</div>
            <p class="text-sm font-black uppercase tracking-[0.4em] text-zinc-400">Transaction // 8f2a...c9d4_SECURE</p>
            <button 
              onclick={() => isVoting = false}
              class="mt-12 bg-white text-black px-12 py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-colors"
            >
              RETURN_TO_DASHBOARD
            </button>
          </div>
        {/if}
      </div>

      <footer class="mt-auto pt-8 border-t border-zinc-800 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
        <span>Consensus_Layer: Protocol_v4.2</span>
        <span>Secure // Encrypted</span>
      </footer>
    </div>
  {/if}

  <!-- INTRODUCTION -->
  <section class="mb-16 max-w-3xl">
    <h2 class="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 mb-6 block border-l-4 border-zinc-900 dark:border-zinc-50 pl-4 transition-colors">Introduction // DAO_Protocols</h2>
    <p class="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 uppercase font-bold tracking-widest mb-8">
      $GOYCO is more than equity; it is a vote in the future of decentralized privacy. The Governance dashboard allows all stakeholders to propose, debate, and execute protocol-level changes without centralized oversight. 
    </p>
    <div class="flex gap-4">
      <div class="w-12 h-1 bg-zinc-900 dark:bg-zinc-50 transition-colors"></div>
      <div class="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 transition-colors"></div>
    </div>
  </section>

  <!-- Stats Bar -->
  <div class="grid grid-cols-1 md:grid-cols-3 border-4 border-zinc-900 dark:border-zinc-50 mb-16 bg-white dark:bg-zinc-950 shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] dark:shadow-[12px_12px_0px_0px_rgba(250,250,250,0.1)] transition-colors">
    <div class="p-6 border-b-4 md:border-b-0 md:border-r-4 border-zinc-900 dark:border-zinc-50 transition-colors">
      <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2">Governance Participation</span>
      <span class="text-3xl font-black tabular-nums">74.2%</span>
    </div>
    <div class="p-6 border-b-4 md:border-b-0 md:border-r-4 border-zinc-900 dark:border-zinc-50 transition-colors">
      <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2">Total Staked Equity</span>
      <span class="text-3xl font-black tabular-nums">15.4M GOYCO</span>
    </div>
    <div class="p-6">
      <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block mb-2">DAO_Status</span>
      <span class="text-3xl font-black uppercase text-green-600 dark:text-green-400 transition-colors">Autonomous</span>
    </div>
  </div>

  <!-- RECOMMENDED PROPOSALS SECTION -->
  <div class="mb-24">
    <div class="flex justify-between items-end mb-12 border-b-2 border-zinc-100 dark:border-zinc-800 pb-6 transition-colors">
      <h2 class="text-2xl md:text-4xl font-black uppercase tracking-tighter">Recommended Proposals</h2>
      <span class="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-[0.3em]">Priority // 02</span>
    </div>

    <div class="space-y-12">
      {#each recommendedProposals as proposal (proposal.id)}
        <div class="bg-white dark:bg-zinc-950 border-4 border-zinc-900 dark:border-zinc-50 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] dark:shadow-[8px_8px_0px_0px_rgba(250,250,250,0.1)] p-8 md:p-12 transition-colors">
          <!-- Status Stamp -->
          <div class="absolute top-4 right-4 rotate-12 pointer-events-none select-none opacity-40 dark:opacity-60">
            <div class="border-4 border-zinc-900 dark:border-zinc-50 px-4 py-2 text-2xl font-black uppercase tracking-tighter">{proposal.status}</div>
          </div>

          <header class="mb-8 max-w-2xl">
            <span class="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 block mb-2">Proposal // {proposal.id}</span>
            <h3 class="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">{proposal.title}</h3>
          </header>

          <p class="text-sm text-zinc-600 dark:text-zinc-400 uppercase font-bold leading-relaxed tracking-widest mb-12 max-w-3xl">{proposal.description}</p>

          <div class="flex justify-between items-end">
             <div class="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Time Remaining: {proposal.expiresIn}</div>
             <button 
               onclick={() => startVoting(proposal)}
               class="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors">VOTE_INTERFACE_V2.4</button>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- ALL PROPOSALS EXPANDABLE GRID -->
  <section class="border-t-4 border-zinc-900 dark:border-zinc-50 pt-16 transition-colors">
    <div class="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
      <button 
        onclick={() => showAll = !showAll}
        class="bg-white dark:bg-zinc-950 border-4 border-zinc-900 dark:border-zinc-50 px-12 py-6 text-sm font-black uppercase tracking-[0.4em] hover:bg-zinc-900 dark:hover:bg-zinc-50 hover:text-white dark:hover:text-zinc-900 transition-all shadow-[12px_12px_0px_0px_rgba(24,24,27,0.1)] dark:shadow-[12px_12px_0px_0px_rgba(250,250,250,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1"
      >
        {showAll ? 'HIDE_ALL_PROPOSALS' : 'VIEW_ALL_PROPOSALS'}
      </button>
      <div class="flex flex-col items-end gap-1 opacity-40">
        <span class="text-[9px] font-bold uppercase tracking-widest">Historical_Record_Index</span>
        <span class="text-[9px] font-mono">Total_Proposals: {proposals.length}</span>
      </div>
    </div>

    {#if showAll}
      <div in:fade={{ duration: 400 }} class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each proposals as proposal (proposal.id)}
          <div 
            class="bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between hover:border-zinc-900 dark:hover:border-zinc-50 transition-colors group"
            class:opacity-50={proposal.status !== 'ACTIVE'}
          >
            <div>
              <div class="flex justify-between items-start mb-4">
                <span class="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">#{proposal.id}</span>
                <span 
                  class="text-[8px] font-black px-2 py-1 uppercase tracking-widest"
                  class:bg-zinc-900={proposal.status === 'ACTIVE'}
                  class:dark:bg-zinc-50={proposal.status === 'ACTIVE'}
                  class:text-white={proposal.status === 'ACTIVE'}
                  class:dark:text-zinc-900={proposal.status === 'ACTIVE'}
                  class:bg-zinc-100={proposal.status !== 'ACTIVE'}
                  class:dark:bg-zinc-900={proposal.status !== 'ACTIVE'}
                  class:text-zinc-400={proposal.status !== 'ACTIVE'}
                  class:dark:text-zinc-600={proposal.status !== 'ACTIVE'}
                >
                  {proposal.status}
                </span>
              </div>
              <h4 class="text-sm font-black uppercase tracking-tight mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                {proposal.title}
              </h4>
            </div>
            
            <div class="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 transition-colors">
               <div class="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                 <span>Vote_Weight</span>
                 <span class="text-zinc-900 dark:text-zinc-50">{proposal.yesVotes + proposal.noVotes}%</span>
               </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
