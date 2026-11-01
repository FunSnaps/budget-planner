<script lang="ts">
  import {
    state, totals, unallocated, gaugeStatuses, compositionSegments,
  } from '$lib/application/stores/budgetStore';
  import { CATS, fmt } from '$lib/domain/planner';

  $: th = $state.takeHome;
  $: over = th > 0 && $unallocated < -0.5;
  $: onTrack = th > 0 && !over && $totals.savings >= th * 0.15;
  $: gapPct = th ? Math.max(0, ($unallocated / th) * 100) : 100;
  $: hasAny = $compositionSegments.some((s) => s.widthPct > 0);
</script>

<section class="card overview" aria-labelledby="overview-title">
  <div class="ov-top">
    <h2 id="overview-title" class="ov-title">Where it goes</h2>
    <span class="ov-status" class:is-critical={over} class:is-good={onTrack} aria-live="polite">
      {#if th <= 0}
        Add your take-home
      {:else if over}
        {fmt(Math.abs($unallocated))} over budget
      {:else}
        {fmt($unallocated)} left to allocate{onTrack ? ' · saving 15%+' : ''}
      {/if}
    </span>
  </div>

  <div class="stack-bar" role="img" aria-label="Allocation of take-home">
    {#if !hasAny}
      <div class="stack-empty">Enter amounts to see your breakdown</div>
    {:else}
      {#each $compositionSegments as seg}
        {#if seg.widthPct > 0}
          <div
            class="stack-seg"
            style="width:{seg.widthPct}%;background:{seg.color}"
            title="{seg.label}: {fmt(seg.amount)}"
          >
            {#if seg.widthPct > 9}{seg.widthPct.toFixed(0)}%{/if}
          </div>
        {/if}
      {/each}
      {#if gapPct > 0.5}
        <div class="stack-seg is-gap" style="width:{gapPct}%" title="Unallocated: {fmt($unallocated)}"></div>
      {/if}
    {/if}
  </div>

  <div class="ov-rows">
    {#each CATS as cat}
      {@const actual = $totals[cat.key]}
      {@const target = th * cat.target}
      {@const variance = actual - target}
      {@const fill = th ? Math.min((actual / th) * 100, 100) : 0}
      <div class="ov-row">
        <div class="ov-line">
          <span class="ov-name">
            <span class="cat-dot" style="background:{cat.color}"></span>
            {cat.label}
            <span class="ov-pct">{Math.round(cat.target * 100)}%</span>
          </span>
          <span class="pill {$gaugeStatuses[cat.key]}">{$gaugeStatuses[cat.key]}</span>
        </div>
        <div class="ov-line">
          <span class="ov-actual num">{fmt(actual)}</span>
          <span class="ov-target">
            of <span class="num">{fmt(target)}</span>
            {#if th > 0 && Math.abs(variance) >= 0.005}
              · <span class="num" class:is-over={variance > 0}>{fmt(Math.abs(variance))}</span>
              {variance > 0 ? 'over' : 'under'}
            {/if}
          </span>
        </div>
        <div class="bar-track ov-bar">
          <div class="bar-fill" style="width:{fill}%;background:{cat.color}"></div>
          <div class="bar-tick" style="left:{cat.target * 100}%"></div>
        </div>
      </div>
    {/each}
  </div>
</section>
