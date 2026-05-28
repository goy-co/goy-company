<script lang="ts">
  const layers = [
    {
      id: '01',
      title: 'Infrastructure',
      tagline: 'The_Foundation',
      description:
        'The technical base: physical nodes, mesh network relays, and sovereign OS kernel.',
      modules: [
        'Goy_Node',
        'Goy_Swarm',
        'Goy_Relay',
        'Goy_OS',
        'Goy_Connect',
        'Goy_Intelligence',
        'Goy_Cloud',
        'Goy_API',
      ],
      color: '#0096d6', // Blue
    },
    {
      id: '02',
      title: 'Finance & ID',
      tagline: 'The_Core',
      description:
        'The protocol heartbeat: cryptographic identity, value settlement, and reputation engines.',
      modules: ['Goy_ID', 'Goy_Wallet', 'Goy_Pay', 'Goy_Escrow', 'Goy_Score', 'Key_Recovery'],
      color: '#e21b23', // Red
    },
    {
      id: '03',
      title: 'Productivity',
      tagline: 'Work_&_Efficiency',
      description:
        'Tools for sovereign collaboration, talent markets, and decentralized engineering.',
      modules: [
        'Goy_Projects',
        'Goy_Talent',
        'Goy_Academy',
        'Goy_Engineering',
        'Goy_CRM',
        'Goy_Business',
      ],
      color: '#009345', // Green
    },
    {
      id: '04',
      title: 'Physical Assets',
      tagline: 'Space_&_Logistics',
      description:
        'Sovereign automation for physical space: energy markets, real estate, and maps.',
      modules: ['Goy_Home', 'Goy_Estate', 'Goy_Energy', 'Goy_Logistics', 'Goy_Maps'],
      color: '#ffcb05', // Yellow
    },
    {
      id: '05',
      title: 'Safety & Law',
      tagline: 'Health_&_Protection',
      description:
        'Well-being and security: sovereign health records, P2P insurance, and digital law.',
      modules: ['Goy_Health', 'Goy_Insurance', 'Goy_Legal', 'Goy_Rescue'],
      color: '#f97316', // Orange
    },
    {
      id: '06',
      title: 'Society',
      tagline: 'Civil_Infrastructure',
      description: 'Autonomous civil systems: liquid democracy, verified news, and P2P markets.',
      modules: [
        'Goy_Social',
        'Goy_News',
        'Goy_Vote',
        'Goy_Democracy',
        'Goy_Ticket',
        'Goy_Market',
        'Goy_Ads',
      ],
      color: '#8b5cf6', // Purple
    },
    {
      id: '07',
      title: 'Digital Utilities',
      tagline: 'Daily_Tools',
      description:
        'The interface of daily life: encrypted chat, private drive, and synchronous mail.',
      modules: ['Goy_Chat', 'Goy_Drive', 'Goy_Meet', 'Goy_Cal', 'Goy_Stream', 'Goy_Mail'],
      color: '#06b6d4', // Cyan
    },
  ];
</script>

<section class="bg-zinc-950 py-20 md:py-24 border-t-4 border-zinc-900">
  <div class="max-w-7xl mx-auto px-6 md:px-12">
    <!-- Section Header -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-16 md:mb-20"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-[1px] bg-white"></div>
          <span class="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600"
            >System_Map</span
          >
        </div>
        <h2
          class="text-[clamp(2.5rem,7vw,7rem)] font-black uppercase tracking-tighter leading-[0.85] text-white"
        >
          The Goy<br />Grid.
        </h2>
      </div>
      <div class="max-w-xs border-l border-zinc-900 pl-6 py-1">
        <p
          class="font-mono text-[10px] text-zinc-500 uppercase leading-relaxed font-bold tracking-tight"
        >
          A decentralized infrastructure for absolute privacy. The Goy Grid connects your physical
          node to a global network of trust.
        </p>
      </div>
    </div>

    <!-- The Stack Grid -->
    <div class="border-t border-zinc-900">
      {#each layers as layer}
        <div
          class="group relative border-b border-zinc-900 py-8 md:py-10 transition-all duration-500 hover:bg-white/[0.01]"
        >
          <!-- Accent Line -->
          <div
            class="absolute left-0 top-0 bottom-0 w-[1px] transition-all duration-500 opacity-20 group-hover:opacity-100 group-hover:w-1"
            style="background-color: {layer.color};"
          ></div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center px-4 md:px-6">
            <!-- ID & Label -->
            <div class="md:col-span-3 flex items-center gap-6">
              <span
                class="font-mono text-2xl md:text-3xl font-black text-zinc-900 group-hover:text-white transition-all duration-500 leading-none"
              >
                {layer.id}
              </span>
              <div class="flex flex-col">
                <span
                  class="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700 group-hover:text-zinc-500 mb-1.5 transition-colors"
                >
                  {layer.tagline}
                </span>
                <h3 class="text-xl md:text-xl font-black uppercase tracking-tight text-white">
                  {layer.title}
                </h3>
              </div>
            </div>

            <!-- Description -->
            <div class="md:col-span-5">
              <p
                class="font-mono text-[11px] md:text-xs text-zinc-500 leading-relaxed max-w-sm group-hover:text-zinc-300 transition-colors duration-500"
              >
                {layer.description}
              </p>
            </div>

            <!-- Modules -->
            <div class="md:col-span-4 flex flex-col md:items-end gap-2.5">
              <span class="font-mono text-[7px] uppercase tracking-[0.3em] text-zinc-700"
                >Includes_Services:</span
              >
              <div class="flex flex-wrap md:justify-end gap-1.5">
                {#each layer.modules as module}
                  <span
                    class="px-2 py-1 bg-zinc-900/50 border border-zinc-800 text-[8px] font-black text-zinc-600 uppercase tracking-tighter group-hover:border-zinc-700 group-hover:text-zinc-400 transition-all"
                  >
                    {module}
                  </span>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Technical Footer -->
    <div class="mt-12 flex justify-between items-center opacity-10">
      <div class="flex gap-2">
        <div class="w-1 h-1 bg-white"></div>
        <div class="w-1 h-1 bg-white"></div>
        <div class="w-1 h-1 bg-white"></div>
      </div>
    </div>
  </div>
</section>
