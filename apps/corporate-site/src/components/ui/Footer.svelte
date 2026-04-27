<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="px-6 py-12 md:px-12 md:py-24 border-t-8 border-zinc-900 bg-zinc-100 font-mono transition-colors">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
    <!-- Contact Column -->
    <div>
      <h4
        class="text-sm font-black uppercase tracking-widest mb-8 border-b-2 border-zinc-900 inline-block text-zinc-900"
      >
        Contact
      </h4>
      <p class="text-zinc-600 mb-2 hover:text-zinc-900 transition-colors cursor-pointer">contact@goy.co</p>
      <p class="text-zinc-600">Secure PGP / Nostr Enabled</p>
    </div>

    <!-- Legal Column -->
    <div>
      <h4
        class="text-sm font-black uppercase tracking-widest mb-8 border-b-2 border-zinc-900 inline-block text-zinc-900"
      >
        Legal
      </h4>
      <ul class="space-y-2">
        <li>
          <a href="/privacy" class="text-zinc-600 underline hover:text-zinc-900 transition-colors">Privacy Policy</a>
        </li>
        <li>
          <a href="/tos" class="text-zinc-600 underline hover:text-zinc-900 transition-colors">Terms of Service</a>
        </li>
        <li>
          <a href="/cookies" class="text-zinc-600 underline hover:text-zinc-900 transition-colors">Cookie Policy</a>
        </li>
        <li>
          <a href="/investors" class="text-zinc-600 underline hover:text-zinc-900 transition-colors">Investors</a>
        </li>
      </ul>
    </div>

    <!-- Infrastructure Column -->
    <div>
      <h4
        class="text-sm font-black uppercase tracking-widest mb-8 border-b-2 border-zinc-900 inline-block text-zinc-900"
      >
        Infrastructure
      </h4>
      <p class="text-zinc-600 mb-2">Network Node Cluster #0412</p>
      <p class="text-zinc-600">High-availability decentralized mesh.</p>
      <div class="mt-4 flex gap-2">
        <div class="w-4 h-4 bg-zinc-900"></div>
        <div class="w-4 h-4 bg-zinc-400"></div>
        <div class="w-4 h-4 bg-zinc-200"></div>
      </div>
    </div>

    <!-- Branding Column -->
    <div class="flex flex-col items-start md:items-end justify-start">
      <div class="w-16 h-16 bg-zinc-900 mb-8 flex items-center justify-center">
        <span class="text-white font-black text-2xl">G.</span>
      </div>
      <p class="text-xs font-black uppercase tracking-widest md:text-right text-zinc-900">
        Engineered for users.<br />Decentralized by architecture.<br />Neutral Jurisdictions.
      </p>
    </div>
  </div>

  <!-- Bottom Bar -->
  <div
    class="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm uppercase font-black text-zinc-500 gap-4 pt-8 border-t-2 border-zinc-900"
  >
    <span>© {currentYear} The Goy Company. All rights reserved.</span>
    <span class="flex items-center gap-2">
      <div class="w-2 h-2 bg-zinc-900 rounded-full animate-pulse"></div>
      Privacy by Default. Security by Design.
    </span>
  </div>
</footer>
