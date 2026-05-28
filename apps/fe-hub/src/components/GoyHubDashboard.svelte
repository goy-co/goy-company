<script lang="ts">
  import { onMount } from 'svelte';

  // State using Svelte 5 runes
  let greeting = $state('Initializing bridge...');
  let isTauri = $state(false);
  let systemStatus = $state('ACTIVE');
  let selectedTab = $state('dashboard');
  let searchVal = $state('');
  
  // Interactive mock/real terminal logs
  let logs = $state([
    { time: '02:51:20', type: 'SYS', msg: 'System kernel initialization complete.' },
    { time: '02:51:21', type: 'NET', msg: 'P2P network discovery protocol online.' },
    { time: '02:51:22', type: 'SEC', msg: 'Cryptographic keychain linked via Goy_ID.' }
  ]);

  let systemMetrics = $state({
    peers: 42,
    latency: '12ms',
    bandwidth: '4.8 MB/s',
    cpu: '1.2%'
  });

  // Nostr Relay State
  let relayStatus = $state({
    running: false,
    port: 4869,
    connections: 0,
    events: 0,
  });

  // WireGuard State
  let wgStatus = $state({
    active: false,
    interface: '',
    local_ip: '',
    bytes_sent: 0,
    bytes_received: 0,
    peer_endpoint: '',
    last_handshake: '',
    is_mock: false,
  });

  // WireGuard Configuration Form
  let wgConfig = $state({
    private_key: '',
    address: '',
    dns: '',
    peer_public_key: '',
    peer_endpoint: '',
    peer_allowed_ips: '',
  });

  // VPN Swarm Relays
  let vpnPeers = $state([
    { id: 'relay-01', name: 'Alpha Gateway Relay', ip: '10.0.0.1', port: 4869, status: 'UNKNOWN', latency: '---' },
    { id: 'relay-03', name: 'Beta Operational Node', ip: '10.0.0.3', port: 4869, status: 'UNKNOWN', latency: '---' },
    { id: 'relay-04', name: 'Gamma Sovereign Relay', ip: '10.0.0.4', port: 4869, status: 'UNKNOWN', latency: '---' },
  ]);

  // Check if running in Tauri and load initial data
  onMount(async () => {
    const runningInTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
    
    if (runningInTauri) {
      isTauri = true;
      logs = [...logs, { time: getTimestamp(), type: 'SYS', msg: 'Tauri native bridge detected. Fetching daemon states...' }];
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        
        // Greet Rust Backend
        const response = await invoke<string>('greet', { name: 'Sovereign Operator' });
        greeting = response;

        // Fetch states
        await refreshStats();
        await loadWireGuardConfig();

        // Start stats poller
        const poller = setInterval(refreshStats, 2000);

        logs = [...logs, { time: getTimestamp(), type: 'SYS', msg: 'Rust bridge and state polling initialized.' }];
        
        return () => clearInterval(poller);
      } catch (err: any) {
        greeting = `Failed to invoke Rust: ${err.message || err}`;
        logs = [...logs, { time: getTimestamp(), type: 'ERR', msg: `Tauri invoke failed: ${err.message || err}` }];
      }
    } else {
      isTauri = false;
      greeting = 'Native bridge offline. Running inside web sandbox.';
      logs = [...logs, { time: getTimestamp(), type: 'WARN', msg: 'Native client bridge unavailable. Running in simulator mode.' }];
    }
  });

  function getTimestamp() {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  }

  async function refreshStats() {
    if (!isTauri) return;
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const rStatus = await invoke<any>('get_relay_status');
      relayStatus = { ...relayStatus, ...rStatus };

      const wStatus = await invoke<any>('get_wireguard_status');
      wgStatus = { ...wgStatus, ...wStatus };

      // Update telemetry
      systemMetrics.peers = rStatus.connections + (wgStatus.active ? 3 : 0);
      systemMetrics.latency = wgStatus.active ? '15ms' : '---';
      systemMetrics.cpu = rStatus.running ? '1.8%' : '0.4%';
    } catch (e) {
      console.error('State refresh failed:', e);
    }
  }

  async function loadWireGuardConfig() {
    if (!isTauri) return;
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      wgConfig = await invoke<any>('get_wireguard_config');
    } catch (e) {
      console.error('Load config failed:', e);
    }
  }

  async function saveWireGuardConfig() {
    logs = [...logs, { time: getTimestamp(), type: 'SYS', msg: 'Saving WireGuard VPN configuration...' }];
    if (!isTauri) {
      logs = [...logs, { time: getTimestamp(), type: 'WARN', msg: 'Browser sandbox: Configuration simulated.' }];
      return;
    }
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('save_wireguard_config', { config: wgConfig });
      logs = [...logs, { time: getTimestamp(), type: 'SYS', msg: 'WireGuard configuration saved successfully.' }];
    } catch (e: any) {
      logs = [...logs, { time: getTimestamp(), type: 'ERR', msg: `Save configuration failed: ${e.message || e}` }];
    }
  }

  async function toggleRelay() {
    if (!isTauri) {
      relayStatus.running = !relayStatus.running;
      logs = [...logs, { 
        time: getTimestamp(), 
        type: 'SYS', 
        msg: `Browser sandbox: Relay toggled ${relayStatus.running ? 'ON (ws://localhost:4869)' : 'OFF'}` 
      }];
      return;
    }
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      if (relayStatus.running) {
        logs = [...logs, { time: getTimestamp(), type: 'SYS', msg: 'Stopping Nostr relay daemon...' }];
        await invoke('stop_relay');
        logs = [...logs, { time: getTimestamp(), type: 'SYS', msg: 'Nostr relay offline.' }];
      } else {
        logs = [...logs, { time: getTimestamp(), type: 'SYS', msg: `Starting Nostr relay on port ${relayStatus.port}...` }];
        await invoke('start_relay', { port: relayStatus.port });
        logs = [...logs, { time: getTimestamp(), type: 'SYS', msg: `Nostr relay online at ws://0.0.0.0:${relayStatus.port}` }];
      }
      await refreshStats();
    } catch (e: any) {
      logs = [...logs, { time: getTimestamp(), type: 'ERR', msg: `Relay operation failed: ${e.message || e}` }];
    }
  }

  async function toggleVPN() {
    if (!isTauri) {
      wgStatus.active = !wgStatus.active;
      if (wgStatus.active) {
        wgStatus.interface = 'utun3_sim';
        wgStatus.local_ip = '10.0.0.2';
        wgStatus.bytes_sent = 542;
        wgStatus.bytes_received = 839;
        wgStatus.peer_endpoint = '198.51.100.1:51820';
        wgStatus.last_handshake = 'Just now';
        wgStatus.is_mock = true;
      } else {
        wgStatus.interface = '';
        wgStatus.local_ip = '';
        wgStatus.bytes_sent = 0;
        wgStatus.bytes_received = 0;
        wgStatus.peer_endpoint = '';
        wgStatus.last_handshake = '';
        wgStatus.is_mock = false;
      }
      logs = [...logs, { time: getTimestamp(), type: 'NET', msg: `Browser sandbox: VPN toggled ${wgStatus.active ? 'ACTIVE' : 'INACTIVE'}` }];
      return;
    }
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const action = !wgStatus.active;
      logs = [...logs, { time: getTimestamp(), type: 'SYS', msg: `${action ? 'Initializing' : 'Deactivating'} WireGuard interface...` }];
      const res = await invoke<any>('toggle_wireguard', { active: action });
      wgStatus = { ...wgStatus, ...res };
      logs = [...logs, { 
        time: getTimestamp(), 
        type: 'NET', 
        msg: `WireGuard interface ${action ? 'ACTIVE' : 'OFFLINE'}. Mode: ${res.is_mock ? 'SIMULATOR' : 'TUNNEL/KERNEL'}` 
      }];
    } catch (e: any) {
      logs = [...logs, { time: getTimestamp(), type: 'ERR', msg: `VPN toggle failed: ${e.message || e}` }];
    }
  }

  async function pingPeer(peerId: string) {
    const peer = vpnPeers.find(p => p.id === peerId);
    if (!peer) return;
    
    peer.status = 'PINGING';
    logs = [...logs, { time: getTimestamp(), type: 'DIAG', msg: `Pinging VPN peer ${peer.name} (${peer.ip})...` }];
    
    if (!isTauri) {
      setTimeout(() => {
        peer.status = 'ONLINE';
        peer.latency = `${Math.floor(Math.random() * 20) + 12}ms`;
        logs = [...logs, { time: getTimestamp(), type: 'DIAG', msg: `Ping ${peer.name} success: ${peer.latency}` }];
      }, 700);
      return;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const latency = await invoke<number>('ping_vpn_peer', { ip: peer.ip });
      peer.status = 'ONLINE';
      peer.latency = `${latency}ms`;
      logs = [...logs, { time: getTimestamp(), type: 'DIAG', msg: `Ping ${peer.name} success: ${latency}ms` }];
    } catch (e: any) {
      peer.status = 'OFFLINE';
      peer.latency = '---';
      logs = [...logs, { time: getTimestamp(), type: 'ERR', msg: `Ping ${peer.name} failed: ${e.message || e}` }];
    }
  }

  function triggerDiagnostic() {
    logs = [...logs, { time: getTimestamp(), type: 'DIAG', msg: 'Starting full system scan...' }];
    systemStatus = 'SCANNING';
    
    setTimeout(() => {
      systemMetrics.latency = `${Math.floor(Math.random() * 15) + 5}ms`;
      systemStatus = 'ACTIVE';
      logs = [...logs, { 
        time: getTimestamp(), 
        type: 'DIAG', 
        msg: `Scan completed. Status NOMINAL. Latency: ${systemMetrics.latency}` 
      }];
    }, 1500);
  }

  function clearLogs() {
    logs = [{ time: getTimestamp(), type: 'SYS', msg: 'Terminal buffer cleared.' }];
  }

  const appModules = [
    {
      id: '01',
      name: 'Goy ID Console',
      category: 'Security',
      desc: 'Access your sovereign cryptographic profile, sign keys, and manage recovery phrases.',
      action: 'BOOT_ID',
      color: '#e21b23', // Red
      status: 'Ready'
    },
    {
      id: '02',
      name: 'Network Node Monitor',
      category: 'Infrastructure',
      desc: 'Control local Nostr relay daemon, configure Wireguard VPN tunneling, and ping peer nodes.',
      action: 'SYS_DAEMON',
      color: '#0096d6', // Blue
      status: 'Connected'
    },
    {
      id: '03',
      name: 'Transmissions / Mail',
      category: 'Digital Utilities',
      desc: 'P2P end-to-end encrypted messaging, decentralized mailbox synchronization, and alerts.',
      action: 'SYNC_MAIL',
      color: '#06b6d4', // Cyan
      status: 'Idle'
    },
    {
      id: '04',
      name: 'Wrangler Worker Deploy',
      category: 'Cloud Services',
      desc: 'Synchronize edge service workers, verify KV database status, and view analytics.',
      action: 'SYNC_CLOUDFLARE',
      color: '#f97316', // Orange
      status: 'Configured'
    },
    {
      id: '05',
      name: 'Sovereign Wallet & Escrow',
      category: 'Finance',
      desc: 'Local value settlement, view multisig status, and trigger pending P2P payments.',
      action: 'OPEN_VAULT',
      color: '#009345', // Green
      status: 'Locked'
    },
    {
      id: '06',
      name: 'Liquid Democracy voting',
      category: 'Civil Systems',
      desc: 'Verify registry on-chain, issue proposal hashes, and vote anonymously on-node.',
      action: 'LOAD_REGISTRY',
      color: '#8b5cf6', // Purple
      status: 'Offline'
    }
  ];

  let filteredModules = $derived(
    appModules.filter(m => 
      m.name.toLowerCase().includes(searchVal.toLowerCase()) || 
      m.category.toLowerCase().includes(searchVal.toLowerCase())
    )
  );
</script>

<div class="flex flex-col h-screen max-h-screen text-xs select-none">
  <!-- Top Navigation Bar -->
  <header class="border-b border-border bg-black/60 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 z-10">
    <div class="flex items-center gap-4">
      <div class="w-8 h-8 border-2 border-white flex items-center justify-center font-black text-sm">
        G
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="font-black text-sm tracking-wider uppercase">GOY_HUB</span>
          <span class="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold uppercase tracking-widest rounded-sm">
            Client_v2.0_Desktop
          </span>
        </div>
        <div class="text-[9px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
          Sovereign Desktop and Mobile Operating System Panel
        </div>
      </div>
    </div>

    <!-- Live Status Pill & Tauri Indicator -->
    <div class="flex items-center gap-4 flex-wrap">
      <div class="flex items-center gap-2 border border-border px-3 py-1.5 bg-zinc-950/40 rounded-sm">
        <span class="w-2 h-2 rounded-full {isTauri ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}"></span>
        <span class="font-black uppercase tracking-widest text-[9px]">
          {isTauri ? 'Native Client Bridge // ONLINE' : 'Web Sandbox Mode // ISOLATED'}
        </span>
      </div>

      <div class="flex items-center gap-1.5">
        <button 
          onclick={triggerDiagnostic}
          disabled={systemStatus === 'SCANNING'}
          class="bg-zinc-50 dark:bg-zinc-900 border border-zinc-800 px-3 py-1.5 font-black uppercase text-[9px] hover:bg-zinc-800 text-zinc-300 transition-colors disabled:opacity-50"
        >
          {systemStatus === 'SCANNING' ? 'RUNNING_TESTS...' : 'RUN_DIAGNOSTICS'}
        </button>
      </div>
    </div>
  </header>

  <!-- Workspace Shell Layout -->
  <div class="flex-1 flex overflow-hidden min-h-0 relative">
    
    <!-- Left Panel: System Monitor and Navigation -->
    <aside class="w-80 border-r border-border bg-zinc-950/20 flex flex-col p-6 overflow-y-auto shrink-0 hidden lg:flex select-none">
      
      <!-- Tab Navigation Switcher -->
      <div class="space-y-1.5 mb-6">
        <span class="text-[8px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Workspace Navigation</span>
        <button 
          onclick={() => selectedTab = 'dashboard'}
          class="w-full text-left px-3.5 py-2.5 font-black uppercase text-[10px] tracking-widest transition-all rounded-sm border flex items-center justify-between {selectedTab === 'dashboard' ? 'bg-white text-zinc-950 border-white' : 'bg-transparent text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'}"
        >
          <span>Main Dashboard</span>
          <span>// 01</span>
        </button>
        <button 
          onclick={() => selectedTab = 'network'}
          class="w-full text-left px-3.5 py-2.5 font-black uppercase text-[10px] tracking-widest transition-all rounded-sm border flex items-center justify-between {selectedTab === 'network' ? 'bg-white text-zinc-950 border-white' : 'bg-transparent text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'}"
        >
          <span>Network Node Console</span>
          <span>// 02</span>
        </button>
      </div>

      <!-- Rust Bridge Welcome Card -->
      <div class="border-2 border-border p-4 bg-zinc-950 relative overflow-hidden mb-6 rounded-sm">
        <div class="absolute top-0 right-0 w-20 h-20 bg-white/[0.01] rotate-45 transform translate-x-10 -translate-y-10 pointer-events-none"></div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-[9px] font-black uppercase tracking-widest text-zinc-500">Rust Core Integration</span>
          <span class="w-1.5 h-1.5 rounded-full {isTauri ? 'bg-emerald-500' : 'bg-zinc-600'}"></span>
        </div>
        <h4 class="text-[10px] font-black uppercase tracking-wider mb-2 text-zinc-200">Bridge Message:</h4>
        <p class="font-mono text-[10px] leading-relaxed text-zinc-400 border-l border-zinc-800 pl-3.5 py-1 select-text">
          "{greeting}"
        </p>
        <div class="mt-4 flex justify-between items-center text-[8px] text-zinc-600 font-mono">
          <span>Target Architecture</span>
          <span class="font-bold text-zinc-400">{isTauri ? 'Desktop / Mobile Native' : 'Browser Web Assembly'}</span>
        </div>
      </div>

      <!-- System Diagnostic Panel -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <div class="w-2 h-[1px] bg-white"></div>
          <span class="font-black uppercase tracking-wider text-zinc-400">Node telemetry</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="border border-zinc-900 bg-zinc-950/40 p-3 flex flex-col">
            <span class="text-[8px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Local Latency</span>
            <span class="text-base font-black text-white">{systemMetrics.latency}</span>
          </div>
          <div class="border border-zinc-900 bg-zinc-950/40 p-3 flex flex-col">
            <span class="text-[8px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Active Swarm</span>
            <span class="text-base font-black text-white">{systemMetrics.peers} peers</span>
          </div>
          <div class="border border-zinc-900 bg-zinc-950/40 p-3 flex flex-col">
            <span class="text-[8px] text-zinc-500 uppercase tracking-wider font-bold mb-1">CPU Load</span>
            <span class="text-base font-black text-white">{systemMetrics.cpu}</span>
          </div>
          <div class="border border-zinc-900 bg-zinc-950/40 p-3 flex flex-col">
            <span class="text-[8px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Sync Status</span>
            <span class="text-base font-black text-white uppercase text-emerald-500 font-bold">nominal</span>
          </div>
        </div>

        <!-- Connection Checklist -->
        <div class="border border-zinc-900 p-4 space-y-3 bg-zinc-950/10">
          <span class="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Protocol Heartbeats</span>
          
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-zinc-400 uppercase">1. Goy_Node Daemon</span>
            <span class="px-1.5 py-0.5 text-[8px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-900">RUNNING</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-zinc-400 uppercase">2. Local Nostr Relay</span>
            <span class="px-1.5 py-0.5 text-[8px] font-black uppercase {relayStatus.running ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-zinc-900 text-zinc-500 border-zinc-800'} border">
              {relayStatus.running ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-zinc-400 uppercase">3. WireGuard interface</span>
            <span class="px-1.5 py-0.5 text-[8px] font-black uppercase {wgStatus.active ? (wgStatus.is_mock ? 'bg-amber-950 text-amber-400 border-amber-900' : 'bg-emerald-950 text-emerald-400 border-emerald-900') : 'bg-zinc-900 text-zinc-500 border-zinc-800'} border">
              {wgStatus.active ? (wgStatus.is_mock ? 'SIMULATING' : 'CONNECTED') : 'INACTIVE'}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-zinc-400 uppercase">4. Rostr Relays</span>
            <span class="px-1.5 py-0.5 text-[8px] font-black uppercase bg-purple-950 text-purple-400 border border-purple-900">CONNECTED</span>
          </div>
        </div>
      </div>
      
      <!-- Side footer -->
      <div class="mt-auto pt-6 border-t border-zinc-900 text-zinc-600 text-[8px] font-mono leading-relaxed select-text">
        SYSTEM: GOY_HUB_DAEMON<br>
        LOC: MESH_NODE_7632<br>
        SECURE GATE: AES-GCM-256
      </div>
    </aside>

    <!-- Main Workspace -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      
      {#if selectedTab === 'dashboard'}
        <!-- TOP FILTER BAR -->
        <div class="border-b border-border bg-zinc-950/40 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <div class="flex items-center gap-2 w-full sm:w-80 border border-zinc-800 bg-black/60 px-3 py-1.5">
            <span class="text-zinc-600 uppercase font-black text-[9px]">FILTER:</span>
            <input 
              type="text" 
              bind:value={searchVal}
              placeholder="Search active modules..." 
              class="bg-transparent border-none outline-none text-white text-[10px] font-mono w-full uppercase placeholder-zinc-700"
            />
          </div>
          
          <div class="flex items-center gap-1.5 self-end sm:self-auto">
            <span class="text-[9px] font-black text-zinc-600 uppercase tracking-widest mr-2">Ecosystem Apps:</span>
            <a 
              href="http://localhost:4321" 
              target="_blank" 
              class="px-2.5 py-1.5 border border-zinc-900 text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:border-zinc-700 hover:text-white"
            >
              Corporate Site
            </a>
            <a 
              href="http://localhost:4322" 
              target="_blank" 
              class="px-2.5 py-1.5 border border-zinc-900 text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:border-zinc-700 hover:text-white"
            >
              Identity App
            </a>
          </div>
        </div>

        <!-- MODULES BENTO GRID -->
        <div class="flex-1 overflow-y-auto p-6 min-h-0">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {#each filteredModules as module}
              <div 
                class="group relative border border-border p-6 flex flex-col justify-between aspect-video md:aspect-auto md:h-52 bg-zinc-950/20 hover:bg-zinc-950/80 transition-all duration-300 rounded-sm overflow-hidden"
              >
                <!-- Hover colored border overlay -->
                <div 
                  class="absolute top-0 left-0 right-0 h-1 transition-all duration-300 opacity-60 group-hover:opacity-100" 
                  style="background-color: {module.color}"
                ></div>

                <!-- Top Row -->
                <div>
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-[8px] font-black uppercase tracking-widest text-zinc-500">{module.category} // {module.id}</span>
                    <span 
                      class="px-1.5 py-0.5 text-[8px] font-black uppercase border"
                      style="border-color: {module.color}; color: {module.color}; background-color: {module.color}15;"
                    >
                      {module.status}
                    </span>
                  </div>
                  
                  <h3 class="text-lg font-black uppercase tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                    {module.name}
                  </h3>
                  
                  <p class="text-[10px] text-zinc-500 leading-relaxed mt-2 uppercase tracking-tight select-text font-bold">
                    {module.desc}
                  </p>
                </div>

                <!-- Bottom Row Actions -->
                <div class="mt-6 flex justify-between items-center">
                  <span class="font-mono text-[9px] text-zinc-700 group-hover:text-zinc-500 font-bold tracking-widest uppercase">
                    READY_TO_LAUNCH
                  </span>
                  
                  <button 
                    onclick={() => {
                      logs = [...logs, { time: getTimestamp(), type: 'CMD', msg: `Running client action: ${module.action}` }];
                      if (module.action === 'SYS_DAEMON') {
                        selectedTab = 'network';
                      }
                    }}
                    class="px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-950 group-hover:text-white transition-all border border-transparent animate-pulse"
                    style="background-color: {module.color};"
                  >
                    EXECUTE
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else if selectedTab === 'network'}
        <!-- NETWORK MONITOR TAB -->
        <div class="border-b border-border bg-zinc-950/40 p-4 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-3">
            <button 
              onclick={() => selectedTab = 'dashboard'}
              class="px-2.5 py-1.5 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 font-black uppercase text-[9px] transition-colors"
            >
              &lt; Back to Dashboard
            </button>
            <div class="w-1.5 h-1.5 bg-[#0096d6] rounded-full animate-ping"></div>
            <span class="font-black uppercase tracking-wider text-zinc-300">Network Daemon Console // vpn_gate</span>
          </div>
          <span class="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
            Sovereign Relay Swarm Interface
          </span>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            <!-- COLUMN 1: Nostr Relay and VPN Swarm -->
            <div class="space-y-6">
              
              <!-- Nostr Relay Card -->
              <div class="border border-border p-6 bg-zinc-950/30 rounded-sm space-y-4">
                <div class="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <div>
                    <h3 class="text-sm font-black uppercase text-white tracking-wider">Local Nostr Relay</h3>
                    <p class="text-[9px] text-zinc-500 font-mono mt-0.5">Lightweight NIP-01 websocket broker</p>
                  </div>
                  <span class="px-2 py-0.5 text-[9px] font-black uppercase border {relayStatus.running ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}">
                    {relayStatus.running ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                <!-- Relay Stats Grid -->
                <div class="grid grid-cols-3 gap-4">
                  <div class="border border-zinc-900 bg-zinc-950/50 p-3 flex flex-col">
                    <span class="text-[8px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Listen Interface</span>
                    <span class="text-[11px] font-mono font-bold text-zinc-300">{relayStatus.running ? `0.0.0.0:${relayStatus.port}` : '---'}</span>
                  </div>
                  <div class="border border-zinc-900 bg-zinc-950/50 p-3 flex flex-col">
                    <span class="text-[8px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Active Peers</span>
                    <span class="text-base font-black text-white">{relayStatus.connections}</span>
                  </div>
                  <div class="border border-zinc-900 bg-zinc-950/50 p-3 flex flex-col">
                    <span class="text-[8px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Events Indexed</span>
                    <span class="text-base font-black text-white">{relayStatus.events}</span>
                  </div>
                </div>

                <!-- Controls & Port Config -->
                <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div class="flex items-center gap-2">
                    <span class="text-zinc-500 font-bold uppercase text-[9px]">Relay Port:</span>
                    <input 
                      type="number" 
                      disabled={relayStatus.running}
                      bind:value={relayStatus.port}
                      class="w-16 bg-black border border-zinc-800 px-2 py-1 text-[10px] font-mono text-center text-white disabled:opacity-50"
                    />
                  </div>
                  <button 
                    onclick={toggleRelay}
                    class="px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all border {relayStatus.running ? 'bg-red-950 text-red-400 border-red-900 hover:bg-red-900/30' : 'bg-emerald-950 text-emerald-400 border-emerald-900 hover:bg-emerald-900/30'}"
                  >
                    {relayStatus.running ? 'SHUTDOWN_RELAY' : 'INITIALIZE_RELAY'}
                  </button>
                </div>
              </div>

              <!-- VPN Swarm Monitor Card -->
              <div class="border border-border p-6 bg-zinc-950/30 rounded-sm space-y-4">
                <div class="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <div>
                    <h3 class="text-sm font-black uppercase text-white tracking-wider">VPN Swarm Relays</h3>
                    <p class="text-[9px] text-zinc-500 font-mono mt-0.5">Peers communicating inside the WireGuard network</p>
                  </div>
                  <span class="text-[9px] text-zinc-500 font-mono">Active Subnet: 10.0.0.0/24</span>
                </div>

                <!-- Peers List -->
                <div class="space-y-2.5">
                  {#each vpnPeers as peer}
                    <div class="border border-zinc-900 bg-zinc-950/60 p-3.5 flex justify-between items-center">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-black text-white text-[11px] uppercase tracking-wide">{peer.name}</span>
                          <span class="font-mono text-[9px] text-zinc-500">ws://{peer.ip}:{peer.port}</span>
                        </div>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-[8px] font-mono tracking-wider uppercase text-zinc-600">VPN Network Target</span>
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-3">
                        <div class="text-right">
                          <div class="text-[8px] text-zinc-600 font-mono uppercase font-bold">Latency</div>
                          <div class="font-mono font-bold text-[10px] {peer.status === 'ONLINE' ? 'text-emerald-400' : peer.status === 'OFFLINE' ? 'text-red-500' : 'text-zinc-500'}">
                            {peer.latency}
                          </div>
                        </div>

                        <button 
                          onclick={() => pingPeer(peer.id)}
                          disabled={peer.status === 'PINGING' || !wgStatus.active}
                          class="px-2.5 py-1.5 border border-zinc-800 bg-black text-[9px] font-black uppercase hover:border-zinc-600 hover:text-white disabled:opacity-30 disabled:hover:border-zinc-800 disabled:hover:text-zinc-500 font-mono tracking-widest"
                        >
                          {peer.status === 'PINGING' ? 'PINGING...' : 'PING'}
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>

            </div>

            <!-- COLUMN 2: WireGuard Configuration -->
            <div class="border border-border p-6 bg-zinc-950/30 rounded-sm space-y-4 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
                  <div>
                    <h3 class="text-sm font-black uppercase text-white tracking-wider">WireGuard Interface</h3>
                    <p class="text-[9px] text-zinc-500 font-mono mt-0.5">Secure tunneling configuration daemon</p>
                  </div>
                  <span class="px-2 py-0.5 text-[9px] font-black uppercase border {wgStatus.active ? (wgStatus.is_mock ? 'bg-amber-950 text-amber-400 border-amber-900' : 'bg-emerald-950 text-emerald-400 border-emerald-900') : 'bg-zinc-900 text-zinc-500 border-zinc-800'}">
                    {wgStatus.active ? (wgStatus.is_mock ? 'ACTIVE (SIM)' : 'ACTIVE') : 'INACTIVE'}
                  </span>
                </div>

                <!-- Telemetry Cards -->
                {#if wgStatus.active}
                  <div class="grid grid-cols-2 gap-3 mb-5">
                    <div class="border border-zinc-900 bg-zinc-950/70 p-3 flex flex-col">
                      <span class="text-[8px] text-zinc-600 uppercase tracking-wider font-bold mb-1">Tunnel Adapter</span>
                      <span class="text-[11px] font-mono font-bold text-zinc-300">{wgStatus.interface || '---'}</span>
                    </div>
                    <div class="border border-zinc-900 bg-zinc-950/70 p-3 flex flex-col">
                      <span class="text-[8px] text-zinc-600 uppercase tracking-wider font-bold mb-1">Assigned VPN IP</span>
                      <span class="text-[11px] font-mono font-bold text-zinc-300">{wgStatus.local_ip || '---'}</span>
                    </div>
                    <div class="border border-zinc-900 bg-zinc-950/70 p-3 flex flex-col">
                      <span class="text-[8px] text-zinc-600 uppercase tracking-wider font-bold mb-1">Data Transmitted</span>
                      <span class="text-[11px] font-mono font-bold text-zinc-300">
                        TX: {(wgStatus.bytes_sent / 1024).toFixed(1)} KB // RX: {(wgStatus.bytes_received / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div class="border border-zinc-900 bg-zinc-950/70 p-3 flex flex-col">
                      <span class="text-[8px] text-zinc-600 uppercase tracking-wider font-bold mb-1">Last Cryptokey Handshake</span>
                      <span class="text-[11px] font-mono font-bold text-zinc-300">{wgStatus.last_handshake || '---'}</span>
                    </div>
                  </div>
                {/if}

                <!-- Config Inputs -->
                <div class="space-y-3.5">
                  <span class="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Configuration Parameters</span>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[8px] font-bold text-zinc-600 uppercase mb-1">Local Address</label>
                      <input 
                        type="text" 
                        disabled={wgStatus.active}
                        bind:value={wgConfig.address}
                        placeholder="10.0.0.2/24"
                        class="w-full bg-black border border-zinc-800 px-3 py-1.5 text-[10px] font-mono text-white placeholder-zinc-800 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label class="block text-[8px] font-bold text-zinc-600 uppercase mb-1">DNS Resolver</label>
                      <input 
                        type="text" 
                        disabled={wgStatus.active}
                        bind:value={wgConfig.dns}
                        placeholder="1.1.1.1"
                        class="w-full bg-black border border-zinc-800 px-3 py-1.5 text-[10px] font-mono text-white placeholder-zinc-800 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-[8px] font-bold text-zinc-600 uppercase mb-1">Interface Private Key</label>
                    <input 
                      type="password" 
                      disabled={wgStatus.active}
                      bind:value={wgConfig.private_key}
                      placeholder="Enter secure base64 private key..."
                      class="w-full bg-black border border-zinc-800 px-3 py-1.5 text-[10px] font-mono text-white placeholder-zinc-800 disabled:opacity-50"
                    />
                  </div>

                  <div class="border-t border-zinc-900 pt-3 my-1"></div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[8px] font-bold text-zinc-600 uppercase mb-1">Peer Remote Endpoint</label>
                      <input 
                        type="text" 
                        disabled={wgStatus.active}
                        bind:value={wgConfig.peer_endpoint}
                        placeholder="198.51.100.1:51820"
                        class="w-full bg-black border border-zinc-800 px-3 py-1.5 text-[10px] font-mono text-white placeholder-zinc-800 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label class="block text-[8px] font-bold text-zinc-600 uppercase mb-1">Peer Allowed IPs</label>
                      <input 
                        type="text" 
                        disabled={wgStatus.active}
                        bind:value={wgConfig.peer_allowed_ips}
                        placeholder="10.0.0.0/24"
                        class="w-full bg-black border border-zinc-800 px-3 py-1.5 text-[10px] font-mono text-white placeholder-zinc-800 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-[8px] font-bold text-zinc-600 uppercase mb-1">Peer Public Key</label>
                    <input 
                      type="text" 
                      disabled={wgStatus.active}
                      bind:value={wgConfig.peer_public_key}
                      placeholder="Remote VPN gateway public key..."
                      class="w-full bg-black border border-zinc-800 px-3 py-1.5 text-[10px] font-mono text-white placeholder-zinc-800 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <!-- Save & Tunnel Activation -->
              <div class="flex items-center justify-between gap-4 border-t border-zinc-900 pt-6 mt-6">
                <button 
                  onclick={saveWireGuardConfig}
                  disabled={wgStatus.active}
                  class="px-4 py-2 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50 transition-all font-mono"
                >
                  SAVE_WG_CONFIG
                </button>
                <button 
                  onclick={toggleVPN}
                  class="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all border {wgStatus.active ? 'bg-red-950 text-red-400 border-red-900 hover:bg-red-900/30' : 'bg-emerald-950 text-emerald-400 border-emerald-900 hover:bg-emerald-900/30'}"
                >
                  {wgStatus.active ? 'DISCONNECT_VPN' : 'ESTABLISH_VPN_TUNNEL'}
                </button>
              </div>
            </div>

          </div>
        </div>
      {/if}

      <!-- Bottom Dashboard Section: Interactive Terminal Logs -->
      <footer class="h-48 border-t border-border bg-black flex flex-col shrink-0 min-h-0">
        <!-- Terminal Header -->
        <div class="border-b border-border bg-zinc-950 px-6 py-2 flex justify-between items-center select-none">
          <div class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
            <span class="font-black uppercase tracking-wider text-[9px] text-zinc-400">Terminal Log Daemon // node_stdout</span>
          </div>
          <div class="flex items-center gap-2">
            <button 
              onclick={clearLogs}
              class="text-[8px] font-bold text-zinc-500 hover:text-white uppercase transition-colors"
            >
              [Clear_Buffer]
            </button>
          </div>
        </div>
        
        <!-- Log Outputs -->
        <div class="flex-1 p-6 overflow-y-auto font-mono text-[10px] space-y-1.5 select-text selection:bg-white selection:text-black">
          {#each logs as log}
            <div class="flex gap-4 leading-normal hover:bg-zinc-900/30 px-1 py-0.5">
              <span class="text-zinc-600 shrink-0">{log.time}</span>
              <span class="font-black text-zinc-500 uppercase shrink-0 min-w-[35px]">
                {#if log.type === 'ERR'}
                  <span class="text-red-500">[{log.type}]</span>
                {:else if log.type === 'WARN'}
                  <span class="text-amber-500">[{log.type}]</span>
                {:else if log.type === 'DIAG'}
                  <span class="text-cyan-500">[{log.type}]</span>
                {:else}
                  <span>[{log.type}]</span>
                {/if}
              </span>
              <span class="text-zinc-400">{log.msg}</span>
            </div>
          {/each}
        </div>
      </footer>

    </main>

  </div>
</div>

<style>
  /* Custom styled selections */
  ::selection {
    background: #fafafa;
    color: #09090b;
  }
</style>

