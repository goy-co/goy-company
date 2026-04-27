<script lang="ts">
  import { onMount } from 'svelte';
  import createGlobe from 'cobe';

  let canvas: HTMLCanvasElement;
  let phi = 0;

  const relays = [
    { url: 'WSS://RELAY.GOY.CO', status: 'ONLINE', latency: '12ms', color: 'bg-zinc-900' },
    { url: 'WSS://NOS.LOL', status: 'ONLINE', latency: '45ms', color: 'bg-zinc-500' },
    { url: 'WSS://RELAY.DAMUS.IO', status: 'SYNCING', latency: '82ms', color: 'bg-zinc-300' },
    { url: 'WSS://RELAY.SNORT.SOCIAL', status: 'ONLINE', latency: '38ms', color: 'bg-zinc-400' },
  ];

  onMount(() => {
    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [0.1, 0.1, 0.1],
      glowColor: [1, 1, 1],
      markers: [
        { location: [37.7595, -122.4367], size: 0.05 },
        { location: [40.7128, -74.006], size: 0.05 },
        { location: [51.5074, -0.1278], size: 0.05 },
        { location: [35.6895, 139.6917], size: 0.05 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
      },
    });

    return () => {
      globe.destroy();
    };
  });
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh] items-center gap-12 lg:gap-24">
  <!-- Left Column: Metrics -->
  <div class="flex flex-col gap-12 order-2 lg:order-1">
    <header class="mb-8">
      <h2
        class="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 border-l-4 border-zinc-900 pl-4"
      >
        Network Status // Global
      </h2>
      <div class="flex items-baseline gap-4">
        <span class="text-6xl md:text-8xl font-black uppercase tracking-tighter">99.9</span>
        <span class="text-2xl font-bold uppercase text-zinc-400">Uptime</span>
      </div>
    </header>

    <div class="space-y-12">
      {#each relays as relay}
        <div class="group border-b-2 border-zinc-100 pb-8 last:border-0">
          <div class="flex justify-between items-end mb-4">
            <h3
              class="text-xl md:text-2xl font-black tracking-tighter uppercase break-all max-w-[70%]"
            >
              {relay.url}
            </h3>
            <span
              class="text-4xl md:text-5xl font-black tracking-tighter opacity-10 group-hover:opacity-100 transition-opacity"
            >
              {relay.latency}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full {relay.color} animate-pulse"></div>
            <span class="text-xs font-black uppercase tracking-widest">{relay.status}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Right Column: Globe -->
  <div
    class="flex items-center justify-center order-1 lg:order-2 relative aspect-square overflow-hidden bg-zinc-900/5 rounded-full"
  >
    <canvas
      bind:this={canvas}
      style="width: 600px; height: 600px; max-width: 100%; aspect-ratio: 1;"
    ></canvas>

    <div
      class="absolute inset-0 pointer-events-none border-[12px] border-zinc-50 rounded-full"
    ></div>
    <div
      class="absolute inset-8 pointer-events-none border-2 border-zinc-900/10 rounded-full border-dashed"
    ></div>
  </div>
</div>

<style>
  canvas {
    filter: grayscale(1) contrast(1.2);
  }
</style>
