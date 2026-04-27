<script lang="ts">
  import { onMount } from 'svelte';

  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });
</script>

<header class="relative px-6 py-14 md:px-12 md:py-20 lg:py-24 overflow-hidden bg-white transition-colors duration-300">
  <!-- Minimalist Technical Pattern (Replaces Blurry Blobs) -->
  <div class="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none select-none">
    <div class="absolute inset-0" style="background-image: radial-gradient(#18181b 1px, transparent 1px); background-size: 40px 40px;"></div>
  </div>

  <div class="relative z-10">
    <h1
      class="text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.85] tracking-tighter mb-12 uppercase break-words text-zinc-900 transition-colors duration-300"
    >
      TOTAL<br />SOVEREIGNTY.<br />
      <span class="text-zinc-400">ZERO DATA CAPTURE.</span>
    </h1>

    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-8 border-l-8 border-zinc-900 pl-6 md:pl-12 max-w-5xl transition-colors duration-300"
    >
      <p class="text-xl md:text-3xl leading-tight font-bold tracking-tight text-zinc-900">
        A suite of services built on decentralized architecture, where your keys are yours and privacy is the
        foundation.
      </p>
      <div class="flex flex-col justify-between">
        <p class="text-lg md:text-xl leading-relaxed text-zinc-600 mb-8 transition-colors duration-300">
          Zero trackers. Absolute transparency. We build tools that respect user integrity by design, ensuring decentralized control of identity.
        </p>
        <div class="flex gap-4">
          <a
            href="/manifesto"
            class="bg-zinc-900 text-zinc-50 px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-zinc-700 transition-all shadow-[8px_8px_0px_0px_rgba(24,24,27,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 inline-block"
          >
            Read Manifesto
          </a>
          <a
            href="/relays"
            class="border-2 border-zinc-900 px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-zinc-50 transition-all inline-block text-zinc-900"
          >
            Audit Node
          </a>
        </div>
      </div>
    </div>
  </div>
</header>

<style>
  h1 {
    font-size: clamp(3.5rem, 15vw, 10rem);
  }
</style>
