<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer
  class="px-6 py-10 md:px-12 md:py-12 border-t-4 border-zinc-900 bg-zinc-950 font-mono transition-colors overflow-hidden"
>
  <div class="max-w-7xl mx-auto">
    <!-- Main Compact Content Row -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start mb-10">
      <!-- Brand Block (Column 1-4) -->
      <div class="lg:col-span-4 space-y-6">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-white flex items-center justify-center border-4 border-zinc-800 shrink-0"
          >
            <span class="text-zinc-950 font-black text-2xl tracking-tighter">G.</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em]"
              >Protocol_ID</span
            >
            <span class="text-sm font-black text-white uppercase tracking-tight"
              >The_Goy_Company</span
            >
          </div>
        </div>
        <p class="text-xs font-black uppercase text-zinc-400 tracking-tight leading-none italic">
          Built for privacy. Decentralized by nature.
        </p>
        <div class="flex gap-1">
          <div class="w-3 h-3 bg-[#0096d6]"></div>
          <div class="w-3 h-3 bg-[#e21b23]"></div>
          <div class="w-3 h-3 bg-[#009345]"></div>
          <div class="w-3 h-3 bg-[#ffcb05]"></div>
          <div class="w-3 h-3 bg-[#f97316]"></div>
          <div class="w-3 h-3 bg-[#8b5cf6]"></div>
          <div class="w-3 h-3 bg-[#06b6d4]"></div>
        </div>
      </div>

      <!-- Links Grid (Column 5-12) -->
      <div
        class="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8 border-l-0 lg:border-l lg:border-zinc-900 lg:pl-12"
      >
        <div class="space-y-4">
          <h4 class="text-[8px] font-black uppercase tracking-widest text-zinc-600">01_Res</h4>
          <ul class="space-y-4 text-[10px] font-bold text-zinc-500 uppercase">
            <li><a href="https://docs.goycompany.com" class="hover:text-white transition-colors">Docs</a></li>
            <li>
              <a href="https://github.com" class="hover:text-white transition-colors">Code</a>
            </li>
          </ul>
        </div>
        <div class="space-y-4">
          <h4 class="text-[8px] font-black uppercase tracking-widest text-zinc-600">02_Eco</h4>
          <ul class="space-y-4 text-[10px] font-bold text-zinc-500 uppercase">
            <li>
              <a href="https://id.goycompany.com" class="hover:text-white transition-colors">ID</a>
            </li>
            <li><a href="/services" class="hover:text-white transition-colors">Wallet</a></li>
            <li><a href="/services" class="hover:text-white transition-colors">Projects</a></li>
          </ul>
        </div>
        <div class="space-y-4">
          <h4 class="text-[8px] font-black uppercase tracking-widest text-zinc-600">03_Sup</h4>
          <ul class="space-y-4 text-[10px] font-bold text-zinc-500 uppercase">
            <li><a href="https://status.goycompany.com" class="hover:text-white transition-colors">Status</a></li>
          </ul>
        </div>
        <div class="space-y-4">
          <h4 class="text-[8px] font-black uppercase tracking-widest text-zinc-400">04_Leg</h4>
          <ul class="space-y-4 text-[10px] font-bold text-zinc-500 uppercase">
            <li><a href="/privacy" class="hover:text-white transition-colors">Privacy</a></li>
            <li><a href="/tos" class="hover:text-white transition-colors">Terms</a></li>
            <li><a href="/brand" class="hover:text-white transition-colors">Brand</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div
      class="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-zinc-900"
    >
      <div class="flex items-center gap-4">
        <span class="text-[10px] font-black text-zinc-600 uppercase">© {currentYear} Goy_Co.</span>
      </div>
      <div class="flex items-center gap-4 opacity-50">
        <span
          class="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic underline decoration-zinc-800 underline-offset-4"
          >Encrypted_AES-256</span
        >
        <div class="w-6 h-6 bg-white flex items-center justify-center shrink-0">
          <div class="w-4 h-4 bg-zinc-950"></div>
        </div>
      </div>
    </div>
  </div>
</footer>
