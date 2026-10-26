<script lang="ts">
  import { state, totals, gaugeStatuses } from '$lib/application/stores/budgetStore';
  import { CATS, fmt } from '$lib/domain/planner';

  $: th = $state.takeHome;
</script>

<div class="gauges">
  {#each CATS as cat}
    {@const actual = $totals[cat.key]}
    {@const status = $gaugeStatuses[cat.key]}
    {@const targetAmt = th * cat.target}
    {@const fillPct = th ? Math.min((actual / th) * 100, 100) : 0}
    {@const tickPct = cat.target * 100}
    {@const variance = actual - targetAmt}

    <div class="gauge-card">
      <div class="gauge-head">
        <h3>{cat.label}</h3>
        <span class="pill {status}">{status}</span>
      </div>

      <div class="gauge-figures">
        <div class="actual num">{fmt(actual)}</div>
        <div class="target">{(cat.target * 100).toFixed(0)}% target · {fmt(targetAmt)}</div>
      </div>

      <div class="bar-track">
        <div
          class="bar-fill"
          style="width:{fillPct}%;background:{cat.color}"
        ></div>
        <div
          class="bar-tick"
          style="left:{tickPct}%"
          data-label="{tickPct.toFixed(0)}%"
        ></div>
      </div>

      <div class="gauge-variance">
        {#if variance > 0}
          <strong class="num">{fmt(variance)}</strong> over target
        {:else if variance < 0}
          <strong class="num">{fmt(Math.abs(variance))}</strong> under target
        {:else}
          On target
        {/if}
      </div>
    </div>
  {/each}
</div>
