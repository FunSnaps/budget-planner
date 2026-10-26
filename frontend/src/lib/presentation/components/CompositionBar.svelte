<script lang="ts">
  import { state, compositionSegments, unallocated } from '$lib/application/stores/budgetStore';
  import { fmt } from '$lib/domain/planner';

  $: gapPct = $state.takeHome
    ? Math.max(0, ($unallocated / $state.takeHome) * 100)
    : 100;
  $: hasAny = $compositionSegments.some((s) => s.widthPct > 0);
</script>

<div class="card composition-card">
  <h3>Allocation</h3>
  <p class="cap">How your take-home is divided</p>

  <div class="stack-bar">
    {#if !hasAny}
      <div class="stack-empty">Enter figures above to see your breakdown</div>
    {:else}
      {#each $compositionSegments as seg}
        {#if seg.widthPct > 0}
          <div
            class="stack-seg"
            style="width:{seg.widthPct}%;background:{seg.color}"
            title="{seg.label}: {fmt(seg.amount)}"
          >
            {#if seg.widthPct > 8}{seg.widthPct.toFixed(0)}%{/if}
          </div>
        {/if}
      {/each}
      {#if gapPct > 0.5}
        <div class="stack-seg is-gap" style="width:{gapPct}%" title="Unallocated: {fmt($unallocated)}">
          {#if gapPct > 8}{gapPct.toFixed(0)}%{/if}
        </div>
      {/if}
    {/if}
  </div>

  <div class="legend">
    {#each $compositionSegments as seg}
      <div class="legend-item">
        <span class="legend-swatch" style="background:{seg.color}"></span>
        {seg.label}
        <span class="v">{fmt(seg.amount)}</span>
      </div>
    {/each}
    {#if gapPct > 0.5}
      <div class="legend-item">
        <span class="legend-swatch is-gap"></span>
        Unallocated
        <span class="v">{fmt($unallocated)}</span>
      </div>
    {/if}
  </div>

  {#if $unallocated < -0.5}
    <p class="kv-note" style="color:var(--critical)">
      You've allocated <strong>{fmt(Math.abs($unallocated))}</strong> more than your take-home.
    </p>
  {:else if $unallocated > 0.5}
    <p class="kv-note">
      <strong>{fmt($unallocated)}</strong> unallocated. Add it to Savings or Wants.
    </p>
  {/if}
</div>
