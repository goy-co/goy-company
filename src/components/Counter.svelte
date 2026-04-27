<script lang="ts">
  import * as Button from '$components/ui/button';
  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>

<div class="flex flex-col items-center gap-4">
  <Button.Root onclick={increment} size="lg">
    Count is {count}
  </Button.Root>
</div>
