<script lang="ts">
  import { downloadData } from '$lib/download-data';
  import { fade, fly } from 'svelte/transition';

  let hoveredArtifact = $state<string | null>(null);
  let copyStatus = $state<'idle' | 'copied'>('idle');

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    copyStatus = 'copied';
    setTimeout(() => (copyStatus = 'idle'), 2000);
  }
</script>

<div
  class="w-full font-mono bg-zinc-950 text-white selection:bg-white selection:text-zinc-950 pb-32"
>
  <!-- SECTION 01: HERO / DISTRIBUTION HEADER -->
  <section class="pt-32 pb-24 md:pt-48 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20">
      <div class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-[1px] bg-white"></div>
          <span class="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600"
            >Distribution_Hub</span
          >
        </div>
        <h2
          class="text-[clamp(2.5rem,7vw,7rem)] font-black uppercase tracking-tighter leading-[0.85] text-white"
        >
          Download.
        </h2>
      </div>
      <div class="max-w-xs border-l border-zinc-900 pl-6 py-2">
        <p
          class="font-mono text-[10px] text-zinc-500 uppercase leading-relaxed font-bold tracking-tight"
        >
          Establish your uplink to the mesh. Deploy the infrastructure core via automated
          provisioning or download the unified hub for personal sovereignty.
        </p>
      </div>
    </div>
  </section>

  <!-- SECTION 02: THE ARTIFACT LEDGER -->
  <section class="max-w-7xl mx-auto px-6 md:px-12 space-y-32">
    {#each downloadData as pkg}
      <div class="group">
        <!-- Package Header -->
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 border-b border-zinc-900 pb-10"
        >
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span
                class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 group-hover:text-white transition-colors"
                >{pkg.category}</span
              >
              <div class="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-white"></div>
            </div>
            <h3
              class="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none"
            >
              {pkg.name}
            </h3>
          </div>
          <div class="max-w-md">
            <p
              class="text-xs text-zinc-500 uppercase font-bold leading-relaxed group-hover:text-zinc-300 transition-colors"
            >
              {pkg.description}
            </p>
          </div>
        </div>

        {#if pkg.installCommand}
          <!-- Install Command (One-Click Section) -->
          <div class="relative bg-zinc-900/20 border border-zinc-900 p-8 md:p-12 overflow-hidden">
            <!-- Technical Decal -->
            <div class="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <span class="text-[40px] font-black tracking-tighter uppercase leading-none italic"
                >Sovereign_Install</span
              >
            </div>

            <div class="relative z-10 space-y-8">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600"
                  >Universal_Uplink_Script</span
                >
                <span class="text-[7px] font-black uppercase text-zinc-800 italic"
                  >Auth_Status: Verified</span
                >
              </div>

              <div class="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div
                  class="flex-1 bg-zinc-950 border border-zinc-800 p-6 font-mono text-sm text-white relative group/cmd"
                >
                  <code class="break-all md:break-normal">{pkg.installCommand}</code>
                </div>
                <button
                  onclick={() => pkg.installCommand && copyToClipboard(pkg.installCommand)}
                  class="bg-white text-zinc-950 px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] active:translate-x-1 active:translate-y-1 active:shadow-none min-w-[180px]"
                >
                  {copyStatus === 'copied' ? '[ COPIED_ ]' : '[ COPY_COMMAND ]'}
                </button>
              </div>

              <p class="text-[9px] text-zinc-700 uppercase font-bold max-w-2xl">
                Run this command as root on any clean Linux/Unix environment. The script will
                automatically provision the Goy OS kernel, configure relay nodes, and establish
                encrypted mesh connectivity.
              </p>
            </div>
          </div>
        {:else if pkg.artifacts}
          <!-- Artifact Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-zinc-900">
                  <th
                    class="py-6 pr-6 text-[8px] font-black uppercase tracking-widest text-zinc-700"
                    >Platform_Architecture</th
                  >
                  <th
                    class="py-6 px-6 text-[8px] font-black uppercase tracking-widest text-zinc-700"
                    >Version</th
                  >
                  <th
                    class="py-6 px-6 text-[8px] font-black uppercase tracking-widest text-zinc-700"
                    >Size</th
                  >
                  <th
                    class="py-6 px-6 text-[8px] font-black uppercase tracking-widest text-zinc-700"
                    >Checksum_SHA256</th
                  >
                  <th
                    class="py-6 pr-8 text-right text-[8px] font-black uppercase tracking-widest text-zinc-700"
                    >Uplink</th
                  >
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-900/50">
                {#each pkg.artifacts as artifact}
                  <tr class="group/row hover:bg-white/[0.02] transition-colors">
                    <td class="py-8 pr-6">
                      <span
                        class="text-base font-black uppercase tracking-tight text-zinc-400 group-hover/row:text-white transition-colors"
                      >
                        {artifact.platform}
                      </span>
                    </td>
                    <td class="py-8 px-6">
                      <span
                        class="text-[10px] font-bold text-zinc-600 uppercase group-hover/row:text-zinc-400"
                        >{artifact.version}</span
                      >
                    </td>
                    <td class="py-8 px-6">
                      <span
                        class="text-[10px] font-bold text-zinc-600 uppercase group-hover/row:text-zinc-400"
                        >{artifact.size}</span
                      >
                    </td>
                    <td class="py-8 px-6">
                      <code
                        class="text-[8px] font-mono text-zinc-800 group-hover/row:text-zinc-600 transition-colors bg-zinc-900/30 px-3 py-1.5"
                      >
                        {artifact.checksum}
                      </code>
                    </td>
                    <td class="py-8 pr-8 text-right">
                      <a
                        href={artifact.link}
                        class="inline-block border border-zinc-800 group-hover/row:border-white px-10 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover/row:text-white transition-all hover:bg-white hover:text-zinc-950"
                      >
                        [ DOWNLOAD ]
                      </a>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {/each}
  </section>

  <!-- SECTION 03: VERIFICATION INFO -->
  <section class="py-32 md:py-48 px-6 md:px-12 max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-16 items-start border-t border-zinc-900 pt-24">
      <div class="md:col-span-7 space-y-10">
        <h3
          class="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[0.9]"
        >
          Verify before <br />
          <span class="text-zinc-800 italic font-serif">Execution.</span>
        </h3>
        <p class="text-sm text-zinc-500 uppercase font-bold leading-relaxed max-w-xl">
          Security is not a feature; it is a process. Always verify the checksum of your downloaded
          artifacts against our public ledger. We sign all releases with our master PGP key.
        </p>
      </div>
      <div class="md:col-span-5 flex flex-col gap-8">
        <div class="p-8 border border-zinc-900 bg-zinc-900/10 space-y-4">
          <span class="text-[8px] font-black uppercase tracking-widest text-zinc-700"
            >PGP_Public_Key</span
          >
          <code class="block text-[7px] text-zinc-600 leading-tight break-all font-mono opacity-50">
            -----BEGIN PGP PUBLIC KEY BLOCK-----<br />
            mQINBGP2h...[REDACTED]...G7h8A=<br />
            -----END PGP PUBLIC KEY BLOCK-----
          </code>
          <button
            class="text-[9px] font-black uppercase tracking-[0.3em] text-white hover:underline underline-offset-8 transition-all"
          >
            [ COPY_MASTER_KEY ]
          </button>
        </div>
        <div class="flex items-center gap-4 text-zinc-800">
          <div class="w-2 h-2 rounded-full bg-zinc-800"></div>
          <span class="text-[8px] font-black uppercase tracking-widest"
            >Protocol_Security_Audit: v2.4_PASS</span
          >
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:italic&display=swap');

  .font-serif {
    font-family: 'Libre+Baskerville', serif;
    letter-spacing: -0.02em;
  }

  table {
    border-spacing: 0;
  }

  th {
    font-weight: 900;
  }
</style>
