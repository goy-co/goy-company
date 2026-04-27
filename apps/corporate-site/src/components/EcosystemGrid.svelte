<script lang="ts">
  import EcosystemCard from './ui/EcosystemCard.svelte';
</script>

<section class="border-t-8 border-zinc-900 transition-colors">
  <header class="px-6 py-16 md:px-12 bg-white transition-colors">
    <div class="max-w-4xl">
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 block">Subsystems // Modular_Architecture</span>
      <h2 class="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8 text-zinc-900">Ecosystem</h2>
      <p class="text-sm md:text-base leading-relaxed text-zinc-600 uppercase font-bold tracking-widest max-w-2xl">
        A decentralized cluster of protocols and applications engineered for absolute autonomy. Each sector operates as a modular unit within the Goy Company technical framework.
      </p>
    </div>
  </header>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t-8 border-zinc-900 transition-colors">
    <EcosystemCard 
      id="01" 
      title="GoySocial" 
      description="Decentralized identity and social graphs built for absolute user sovereignty."
      appsCount={3}
      color="var(--eco-blue)"
    />
    <EcosystemCard 
      id="02" 
      title="GoyPay" 
      description="High-velocity Bitcoin settlement and confidential asset management."
      appsCount={2}
      color="var(--eco-green)"
    />
    <EcosystemCard 
      id="03" 
      title="GoyOps" 
      description="Resilient node orchestration and encrypted key management systems."
      appsCount={2}
      color="var(--eco-orange)"
    />
    <EcosystemCard 
      id="04" 
      title="GoyFlix" 
      description="Distributed media propagation and uncensorable event streaming."
      appsCount={1}
      color="var(--eco-purple)"
    />
  </div>
</section>
