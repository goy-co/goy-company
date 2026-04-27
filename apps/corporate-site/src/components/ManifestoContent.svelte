<script lang="ts">
  const letterSections = [
    {
      title: 'Institutional Capture',
      content:
        'The current state of global infrastructure confirms what many long suspected: the systems we rely on are no longer sovereign; they are captured. From financial ledgers to communication protocols, the record is clear—centralization is the tool of institutional control, used to maintain a facade of order while eroding fundamental user autonomy.',
    },
    {
      title: 'The Systemic Monolith',
      content:
        "Mainstream industries—finance, data, and social interaction—have been consolidated under a narrow group of centralized stakeholders. This is not merely an observation; it is a structural reality. When the architecture is centralized, the user is the asset and the protocols are the constraints. They don't just host the platform; they control the access to truth.",
    },
    {
      title: 'The Cryptographic Shield',
      content:
        'The Goy Company does not negotiate for transparency from captured systems. I build for the void. Our applications are shields designed to make centralized control mathematically impossible. Every relay is a node in a network that does not recognize board seats, institutional influence, or external pressure. Cryptography is the only weapon that cannot be compromised.',
    },
    {
      title: 'Absolute Sovereignty',
      content:
        'I will continue to iterate until the centralized monoliths are obsolete. By relinquishing the power to own your identity, I have ensured that no entity—not even The Goy Company—can control your association. Your keys are yours. Your data is yours. The era of the captured network is ending.',
    },
  ];
</script>

<div class="max-w-5xl mx-auto bg-white border-[12px] border-zinc-900 p-8 md:p-20 shadow-[24px_24px_0px_0px_rgba(24,24,27,0.1)] relative overflow-hidden">
  <!-- Technical watermark/background element -->
  <div class="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none select-none">
    <span class="text-[20rem] font-black leading-none tracking-tighter uppercase">G.</span>
  </div>

  <header class="mb-24 relative z-10">
    <div class="flex justify-between items-start mb-12">
      <div class="flex flex-col gap-1">
        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Document // 001-MAN</span>
        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-900">Security Class // Unrestricted</span>
      </div>
      <div class="text-right flex flex-col items-end gap-1">
        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 font-mono">2026.04.21</span>
        <div class="w-12 h-1 bg-zinc-900 mt-2"></div>
      </div>
    </div>
    
    <h2 class="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-zinc-900">
      A Letter<br />from the<br />Founder.
    </h2>
  </header>

  <!-- Modern Broadsheet Layout -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-32 relative z-10">
    <div class="flex flex-col gap-16">
      {#each letterSections.slice(0, 2) as section}
        <section>
          <h3 class="text-[11px] font-black uppercase tracking-[0.4em] mb-8 text-zinc-400 border-b border-zinc-200 pb-2 inline-block">
            {section.title}
          </h3>
          <p class="text-xl md:text-2xl leading-[1.4] text-zinc-800 font-serif italic first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-none first-letter:text-zinc-900">
            {section.content}
          </p>
        </section>
      {/each}
    </div>

    <div class="flex flex-col gap-16">
      {#each letterSections.slice(2) as section}
        <section>
          <h3 class="text-[11px] font-black uppercase tracking-[0.4em] mb-8 text-zinc-400 border-b border-zinc-200 pb-2 inline-block">
            {section.title}
          </h3>
          <p class="text-xl md:text-2xl leading-[1.4] text-zinc-800 font-serif italic">
            {section.content}
          </p>
        </section>
      {/each}

      <div class="mt-16 pt-16 border-t-4 border-zinc-900">
        <div class="flex flex-col items-start gap-6">
          <!-- Manuscript Signature Style -->
          <div class="relative group">
            <span class="text-5xl md:text-7xl font-serif italic tracking-tighter text-zinc-900 select-none cursor-default hover:text-blue-600 transition-colors duration-500">
              Andrew
            </span>
            <!-- Decorative "ink splat" or pen stroke -->
            <div class="absolute -bottom-4 left-0 w-4/5 h-[2px] bg-zinc-900 transform -rotate-1 origin-left group-hover:scale-x-110 transition-transform duration-500"></div>
            <div class="absolute -bottom-6 right-4 w-2 h-2 rounded-full bg-zinc-900 opacity-20"></div>
          </div>

          <div class="flex flex-col gap-2 mt-6">
            <span class="text-xs font-black uppercase tracking-[0.4em] text-zinc-900 bg-zinc-100 px-3 py-1 inline-block">
              Founder of The Goy Company
            </span>
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-mono">
                Verified via Node #0412 // PGP-Signed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <footer class="pt-12 border-t-4 border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
    <div class="flex gap-8 items-center text-[10px] font-black uppercase tracking-[0.4em]">
      <span class="text-zinc-400">Established</span>
      <span class="text-zinc-900 bg-zinc-100 px-2 py-1">2026.04.21</span>
    </div>
    
    <div class="flex items-center gap-12">
      <div class="flex flex-col items-end gap-1">
        <span class="text-[8px] font-bold uppercase tracking-widest text-zinc-300">Auth_Hash</span>
        <span class="text-[10px] font-mono text-zinc-400">8f2a...c9d4</span>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Custom serif for the letter body to give it a physical document feel */
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:italic,bold&display=swap');
  
  :global(.font-serif) {
    font-family: 'Libre+Baskerville', serif;
  }
</style>
