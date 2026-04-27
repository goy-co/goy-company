<script lang="ts">
  import { cn } from '$lib/utils';
  
  interface Props {
    currentPath?: string;
  }

  let { currentPath = '/' }: Props = $props();

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath === '';
    return currentPath.startsWith(path);
  };
</script>

<header
  class="flex justify-between items-end px-6 py-8 md:px-12 md:py-12 border-b-4 border-zinc-900 sticky top-0 bg-zinc-50 z-50 font-mono transition-colors"
>
  <div class="flex flex-col">
    <a href="/" class="hover:opacity-70 transition-opacity decoration-none">
      <h1 class="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none text-zinc-900">
        The Goy<br />Company.
      </h1>
    </a>
  </div>

  <div class="flex items-center gap-8">
    <div class="flex gap-6 md:gap-8 text-xs font-black uppercase tracking-widest items-center">
      <a
        href="/manifesto"
        class={cn(
          "px-2 py-1 transition-colors",
          isActive('/manifesto') ? "bg-zinc-900 text-zinc-50" : "text-zinc-900 hover:bg-zinc-900 hover:text-zinc-50"
        )}
        >Manifesto</a
      >
      <a 
        href="/relays" 
        class={cn(
          "px-2 py-1 transition-colors",
          isActive('/relays') ? "bg-zinc-900 text-zinc-50" : "text-zinc-900 hover:bg-zinc-900 hover:text-zinc-50"
        )}
        >Relays</a
      >
      <a
        href="/divisions"
        class={cn(
          "px-2 py-1 transition-colors",
          isActive('/divisions') ? "bg-zinc-900 text-zinc-50" : "text-zinc-900 hover:bg-zinc-900 hover:text-zinc-50"
        )}
        >Divisions</a
      >
      <a
        href="/investors"
        class={cn(
          "px-2 py-1 transition-colors",
          isActive('/investors') ? "bg-zinc-900 text-zinc-50" : "text-zinc-900 hover:bg-zinc-900 hover:text-zinc-50"
        )}
        >Investors</a
      >
      
      <a
        href="https://id.goycompany.com"
        target="_blank"
        rel="noopener noreferrer"
        class="bg-zinc-900 text-zinc-50 px-4 py-2 hover:bg-zinc-700 transition-colors shadow-[4px_4px_0px_0px_rgba(24,24,27,0.2)] ml-4"
        >ENTER THE GRID</a
      >
    </div>
  </div>
</header>
