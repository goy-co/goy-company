<script lang="ts">
  import { onMount } from 'svelte';

  let mounted = $state(false);
  let copied = $state(false);
  const installCmd = 'curl -sSL https://get.goy.co | bash';

  // OS Detection
  let detectedOS = $state('Desktop');
  let osLabel = $state('App');

  function copyToClipboard() {
    navigator.clipboard.writeText(installCmd);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  onMount(() => {
    mounted = true;

    // OS Detection
    const ua = navigator.userAgent;
    const isMac = /Macintosh|MacIntel|MacPPC|Mac68K|Mac/i.test(ua);
    const isWin = /Win32|Win64|Windows|WinCE/i.test(ua);

    if (isMac) {
      detectedOS = 'macOS';
      osLabel = 'macOS';
    } else if (isWin) {
      detectedOS = 'Windows';
      osLabel = 'Windows';
    } else {
      detectedOS = 'Linux';
      osLabel = 'Linux';
    }
  });
</script>

<header
  class="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-12 lg:px-24 bg-zinc-950 overflow-hidden"
>
  <!-- Background Grid -->
  <div class="absolute inset-0 pointer-events-none select-none opacity-40">
    <!-- Static Grid Lines -->
    <div
      class="absolute inset-0 opacity-[0.1]"
      style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 100px 100px;"
    ></div>
  </div>

  <div class="relative z-10 max-w-7xl w-full mx-auto">
    <!-- Top Meta Info -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 animate-fade-in"
      style="--delay: 0.1s"
    >
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-3 group select-none">
          <span class="text-4xl md:text-5xl font-black text-white leading-none">גּוֹי</span>
          <div class="h-8 w-[1px] bg-zinc-800"></div>
          <div class="flex flex-col">
            <span class="font-mono text-xs font-bold uppercase tracking-widest text-white">
              goy <span class="phonetic text-zinc-500 lowercase font-normal"
                >/&#609;&#596;&#618;/</span
              >
            </span>
            <span class="font-mono text-[10px] text-zinc-500 uppercase tracking-tighter"
              >n. nation, people, collective mass.</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Main Title -->
    <h1
      class="text-[clamp(3rem,12vw,12rem)] font-black leading-[0.8] tracking-tighter uppercase text-white mb-16 animate-fade-in"
      style="--delay: 0.3s"
    >
      <span class="glitch inline-block" data-text="Privacy">Privacy</span><br />
      <span class="glitch inline-block text-zinc-600" data-text="by design.">by design.</span>
    </h1>

    <!-- Bottom Grid -->
    <div
      class="grid grid-cols-1 md:grid-cols-12 gap-12 items-end animate-fade-in"
      style="--delay: 0.5s"
    >
      <div class="md:col-span-8 lg:col-span-8">
        <p
          class="text-xl md:text-2xl font-medium leading-tight tracking-tight text-zinc-300 mb-10 max-w-2xl"
        >
          Reclaim your digital existence, secure your legacy, and <span class="text-white"
            >take back control</span
          > of your privacy.
        </p>

        <div class="flex flex-col md:flex-row gap-6 items-stretch">
          <!-- Terminal Install Block -->
          <div class="group relative grow max-w-md">
            <div
              class="relative bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4 h-full overflow-hidden p-1 pr-3 group-hover:border-zinc-700 transition-colors"
            >
              <div
                class="flex items-center gap-4 px-3 py-1 grow overflow-hidden text-zinc-400 font-mono"
              >
                <code class="text-[10px] whitespace-nowrap overflow-hidden tracking-tight">
                  <span class="text-zinc-600 select-none">$</span>
                  {installCmd}
                </code>
              </div>
              <button
                onclick={copyToClipboard}
                class="shrink-0 border border-zinc-700 hover:border-white text-white px-3 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 min-w-[70px] bg-transparent"
              >
                {copied ? 'Done' : 'Copy'}
              </button>
            </div>
            <p
              class="mt-3 font-mono text-[8px] text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2"
            >
              <span class="w-1 h-[1px] bg-zinc-800"></span>
              Binary_V1.3 (Server)
            </p>
          </div>

          <!-- Download Goy Hub Button -->
          <div class="group relative">
            <a
              href="/download"
              class="relative bg-white text-zinc-950 px-5 py-1.5 flex items-center justify-between gap-6 border border-white transition-all h-full min-w-[220px] hover:bg-zinc-200"
            >
              <div class="flex flex-col justify-center">
                <span
                  class="text-[7px] font-black uppercase tracking-[0.2em] leading-none mb-1 opacity-50"
                  >Desktop_App</span
                >
                <span class="text-[12px] font-black uppercase tracking-tight leading-none"
                  >Goy Hub for {osLabel}</span
                >
              </div>
              <div
                class="w-6 h-6 border border-zinc-950 flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 1V9M5 9L1 5M5 9L9 5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="square"
                  />
                </svg>
              </div>
            </a>
            <p
              class="mt-3 font-mono text-[8px] text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2"
            >
              <span class="w-1 h-[1px] bg-zinc-800"></span>
              Binary_v2.4 (Client)
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>

<style>
  /* Custom tight tracking for the main heading */
  h1 {
    letter-spacing: -0.05em;
  }

  /* Stealth Glitch Effect */
  .glitch {
    position: relative;
    display: inline-block;
  }

  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
    visibility: hidden;
  }

  .glitch::before {
    color: inherit;
    opacity: 0.5;
    animation: glitch-anim-1 15s infinite linear alternate-reverse;
  }

  .glitch::after {
    color: inherit;
    opacity: 0.3;
    animation: glitch-anim-2 20s infinite linear alternate-reverse;
  }

  @keyframes glitch-anim-1 {
    0%,
    94% {
      clip-path: inset(0 0 0 0);
      transform: translate(0);
      visibility: hidden;
    }
    95% {
      clip-path: inset(20% 0 50% 0);
      transform: translate(-3px, 0);
      visibility: visible;
    }
    96% {
      clip-path: inset(40% 0 10% 0);
      transform: translate(3px, 0);
      visibility: visible;
    }
    97% {
      clip-path: inset(10% 0 70% 0);
      transform: translate(-1px, 0);
      visibility: visible;
    }
    98% {
      clip-path: inset(80% 0 5% 0);
      transform: translate(1px, 0);
      visibility: visible;
    }
    99%,
    100% {
      clip-path: inset(0 0 0 0);
      transform: translate(0);
      visibility: hidden;
    }
  }

  @keyframes glitch-anim-2 {
    0%,
    92% {
      clip-path: inset(0 0 0 0);
      transform: translate(0);
      visibility: hidden;
    }
    93% {
      clip-path: inset(15% 0 55% 0);
      transform: translate(2px, 0);
      visibility: visible;
    }
    94% {
      clip-path: inset(45% 0 15% 0);
      transform: translate(-2px, 0);
      visibility: visible;
    }
    95% {
      clip-path: inset(5% 0 75% 0);
      transform: translate(1px, 0);
      visibility: visible;
    }
    96% {
      clip-path: inset(85% 0 2% 0);
      transform: translate(-1px, 0);
      visibility: visible;
    }
    97%,
    100% {
      clip-path: inset(0 0 0 0);
      transform: translate(0);
      visibility: hidden;
    }
  }

  .phonetic {
    font-family:
      'JetBrains Mono Variable', 'DejaVu Sans', 'Arial Unicode MS', 'Lucida Sans Unicode',
      sans-serif;
  }

  .animate-fade-in {
    opacity: 0;
    transform: translateY(10px);
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: var(--delay, 0s);
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-fade-in {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .animate-pulse {
      animation: none;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
