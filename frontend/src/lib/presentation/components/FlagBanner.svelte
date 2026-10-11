<script lang="ts">
  import { state, totals, unallocated } from '$lib/application/stores/budgetStore';
  import { fmt } from '$lib/domain/planner';

  $: overBudget = $unallocated < -0.5 && $state.takeHome > 0;
  $: onTrack = $state.takeHome > 0 && !overBudget && $totals.savings >= $state.takeHome * 0.15;
  $: show = overBudget || onTrack;
</script>

{#if show}
  <div class="flag-banner" class:state-critical={overBudget} class:state-good={onTrack}>
    <div class="icon">{overBudget ? '!' : '✓'}</div>
    <div>
      {#if overBudget}
        <h3>Over budget by {fmt(Math.abs($unallocated))}</h3>
        <p>Your total allocations exceed your take-home. Reduce spending in one or more categories.</p>
      {:else}
        <h3>Looking good!</h3>
        <p>You're saving at least 15% of your take-home. Keep it up.</p>
      {/if}
    </div>
  </div>
{/if}
