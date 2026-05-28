<script lang="ts">
  import { cn } from '$lib/utils';
  
  interface Props {
    currentPath?: string;
  }

  let { currentPath = '/dashboard' }: Props = $props();

  const navItems = [
    { label: 'Identity', path: '/dashboard', icon: 'ID', desc: 'Profile & Keys' },
    { label: 'Wealth', path: '/wealth', icon: 'W', desc: '$GOYCO & STO' },
    { label: 'Nodes', path: '/nodes', icon: 'N', desc: 'Relay Config' },
    { label: 'Governance', path: '/governance', icon: 'G', desc: 'Voting & Manifesto' }
  ];

  const isActive = (path: string) => currentPath === path;
</script>

<aside class="w-20 md:w-64 h-full bg-zinc-950 border-r-2 border-zinc-800 flex flex-col font-mono relative z-[200]">
  <!-- Logo Area -->
  <div class="p-6 mb-8 border-b-2 border-zinc-900 flex flex-col items-center md:items-start overflow-hidden">
    <span class="text-xl font-black text-white tracking-tighter leading-none">GOY<br/><span class="text-zinc-600">ID.</span></span>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 px-4 space-y-4">
    {#each navItems as item}
      <a 
        href={item.path}
        class={cn(
          "flex items-center gap-4 p-3 transition-all group overflow-hidden border border-transparent",
          isActive(item.path) 
            ? "bg-zinc-900 border-zinc-700 text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]" 
            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
        )}
      >
        <div class={cn(
          "w-8 h-8 flex items-center justify-center font-black text-xs border shrink-0",
          isActive(item.path) ? "border-white text-white" : "border-zinc-800 text-zinc-600 group-hover:border-zinc-600"
        )}>
          {item.icon}
        </div>
        <div class="hidden md:flex flex-col">
          <span class="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          <span class="text-[8px] uppercase text-zinc-600 group-hover:text-zinc-500">{item.desc}</span>
        </div>
      </a>
    {/each}
  </nav>

  <!-- Footer Info -->
  <div class="p-6 border-t-2 border-zinc-900 hidden md:block">
    <div class="flex items-center gap-2 mb-4">
       <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
       <span class="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Uplink: Active</span>
    </div>
    <div class="text-[8px] font-mono text-zinc-700 uppercase leading-tight">
      Goy_Terminal_V1.0<br/>
      Secure_Identity_Layer
    </div>
  </div>
</aside>
