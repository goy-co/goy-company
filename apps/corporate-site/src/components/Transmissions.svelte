<script lang="ts">
  interface Update {
    id: number;
    date: string;
    message: string;
  }

  interface Props {
    updates: Update[];
  }

  let { updates }: Props = $props();
</script>

<div class="transmissions font-mono text-xs">
  {#if updates.length > 0}
    {#each updates as update (update.id)}
      <div class="flex gap-4 border-b border-zinc-200 py-2">
        <span class="text-zinc-400">{update.date}</span>
        <span class="text-zinc-900 uppercase font-black">{update.message}</span>
      </div>
    {/each}
  {:else}
    <div class="py-4 text-zinc-400 italic">
      [!] NO ACTIVE TRANSMISSIONS
    </div>
  {/if}
</div>
