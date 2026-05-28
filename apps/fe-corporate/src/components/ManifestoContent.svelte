<script lang="ts">
  const manifestoSections = [
    {
      id: '01',
      title: 'The Great Deception',
      subtitle: 'The_New_Emperors_Clothes',
      content:
        'You wake up. Your phone lights up with notifications you didn’t ask for, algorithms that decide what you see, companies that know more about your desires than you do. You are not a customer. You are raw material. You are the cattle grazing in the walled gardens of Silicon Valley, milked at every scroll, every like, every impulsive purchase engineered to look like free choice. We have normalized this. We call it "convenience." We call it "free." We forget that when a product is free, the product is you.',
    },
    {
      id: '02',
      title: 'The Tragedy of the Digital Commons',
      subtitle: 'Digital_Feudalism',
      content:
        'Your identity is a lease. Your life story is a dataset. Your money is a promise from a bank that can freeze your account based on an algorithm. Your smart home obeys servers on another continent. Your health is a chart on an insurance company’s dashboard. This is not progress. This is feudalism with a graphic interface. And for years, we accepted it because it was easy.',
    },
    {
      id: '03',
      title: 'The Architecture of Indignation',
      subtitle: 'Technical_Warfare',
      content:
        'The Goy Company is not a startup. It is an elegant declaration of war. We are not building an app. We are building a parallel civilization — one where citizens do not ask permission to exist, where infrastructure is impossible to turn off, where freedom is not a regulated privilege but an inalienable technical property. We call it the Grid.',
    },
    {
      id: '04',
      title: 'The Pillars of Our World',
      subtitle: 'Core_Principles',
      points: [
        {
          label: 'Local-First, Cloud-Never',
          desc: 'Your digital life lives on your node — hardware you control, in your home, with your keys. The "cloud" is just an encrypted mirror, a ghost with no power.',
        },
        {
          label: 'Cryptography as Constitution',
          desc: 'We do not believe in 50-page terms of service written by lawyers. We believe in auditable open code. Our law is math. Our justice is verifiable.',
        },
        {
          label: 'Instant Settlement Economy',
          desc: 'We use the Lightning Network to move value at the speed of information. No middlemen. No 3% fees sustaining obsolete financial empires.',
        },
        {
          label: 'Brutalist Luxury',
          desc: 'Our design is raw and efficient. We sell the only thing money can no longer buy: silence, absolute privacy, and protected attention.',
        },
      ],
    },
    {
      id: '05',
      title: 'The Oath',
      subtitle: 'Technical_Integrity',
      content:
        'We do not mine your data. We do not sell your attention. We do not manipulate you to stay longer on the platform. We have no "growth engineers" — we have architects of freedom. If you hold your keys, you are sovereign. If the protocol signs, the truth is absolute. No CEO, no government, and no hacker can change this — without your key.',
    },
  ];
</script>

<div class="w-full font-mono bg-zinc-950 transition-colors">
  <!-- SECTION 01: HERO -->
  <section class="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20 md:mb-24"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-[1px] bg-white"></div>
          <span class="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600"
            >Vision</span
          >
        </div>
        <h2
          class="text-[clamp(2.5rem,7vw,7rem)] font-black uppercase tracking-tighter leading-[0.85] text-white"
        >
          The<br />Manifesto.
        </h2>
      </div>
      <div class="max-w-xs border-l border-zinc-900 pl-6 py-1">
        <p
          class="font-mono text-[10px] text-zinc-500 uppercase leading-relaxed font-bold tracking-tight"
        >
          Privacy is not a granted right; it is a technical property. A declaration of independence
          line by line, node by node.
        </p>
      </div>
    </div>

    <!-- Intro Statement -->
    <div class="border-t border-zinc-900 py-16 md:py-24">
      <h3
        class="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white max-w-4xl leading-tight"
      >
        We were not born to be users.<br />
        <span class="text-zinc-700 italic font-serif">We were born to be owners.</span>
      </h3>
    </div>
  </section>

  <!-- SECTION 02: THE TEXT -->
  <section class="border-t border-zinc-900 bg-zinc-900/10">
    <div class="max-w-7xl mx-auto">
      {#each manifestoSections as section}
        <div
          class="group relative border-b border-zinc-900 py-16 md:py-24 px-6 md:px-12 transition-all duration-500 hover:bg-white/[0.01]"
        >
          <!-- Accent Line -->
          <div
            class="absolute left-0 top-0 bottom-0 w-[1px] transition-all duration-500 opacity-20 group-hover:opacity-100 group-hover:w-1"
            style="background: white;"
          ></div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <!-- ID & Label -->
            <div class="md:col-span-4 flex items-start gap-8">
              <span
                class="font-mono text-3xl md:text-4xl font-black text-zinc-900 group-hover:text-white transition-all duration-500 leading-none italic"
              >
                {section.id}
              </span>
              <div class="flex flex-col">
                <span
                  class="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700 group-hover:text-zinc-500 mb-2 transition-colors"
                >
                  {section.subtitle}
                </span>
                <h4
                  class="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight"
                >
                  {section.title}
                </h4>
              </div>
            </div>

            <!-- Content -->
            <div class="md:col-span-8">
              {#if section.content}
                <p
                  class="text-xl md:text-2xl text-zinc-500 leading-tight tracking-tight uppercase font-bold group-hover:text-zinc-300 transition-colors duration-500"
                >
                  {section.content}
                </p>
              {:else if section.points}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {#each section.points as point}
                    <div class="space-y-4">
                      <span
                        class="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 border-b border-zinc-900 pb-2 block w-fit"
                        >{point.label}</span
                      >
                      <p class="text-sm text-zinc-500 font-bold leading-relaxed uppercase">
                        {point.desc}
                      </p>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- SECTION 03: SIGNATURE -->
  <section
    class="py-32 md:py-48 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center"
  >
    <div class="space-y-12">
      <div class="relative group inline-block">
        <span
          class="text-6xl md:text-9xl font-serif italic tracking-tighter text-white select-none cursor-default"
        >
          Andrew
        </span>
        <div
          class="absolute -bottom-6 left-0 w-4/5 h-[2px] bg-white transform -rotate-1 origin-left opacity-30 group-hover:opacity-100 transition-opacity duration-500"
        ></div>
      </div>

      <div class="flex flex-col items-center gap-4">
        <span
          class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 px-4 py-1 border border-zinc-900"
          >Founder // The Goy Company</span
        >
      </div>

      <p class="mt-20 text-[10px] font-black text-zinc-800 uppercase italic tracking-widest">
        "Freedom is not given. It is taken. Line by line, key by key, node by node."
      </p>
    </div>
  </section>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:italic&display=swap');

  .font-serif {
    font-family: 'Libre+Baskerville', serif;
    letter-spacing: -0.02em;
  }
</style>
