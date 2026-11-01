<script lang="ts">
  import { state, totals, saves, gaugeStatuses } from '$lib/application/stores/budgetStore';
  import { CATS, fmt, fmtWhole } from '$lib/domain/planner';
  import type { IBudgetService } from '$lib/domain/ports/IBudgetService';
  import TabBar from './TabBar.svelte';
  import CategoryList from './CategoryList.svelte';
  import OneOffCard from './OneOffCard.svelte';
  import BonusTracker from './BonusTracker.svelte';
  import SavedBudgets from './SavedBudgets.svelte';

  export let service: IBudgetService;

  let active = 'needs';

  $: tabs = [
    ...CATS.map((c) => ({
      id: c.key as string,
      label: c.label,
      color: c.color,
      meta: fmtWhole($totals[c.key]),
      group: 'budget',
    })),
    { id: 'oneOff', label: 'One-offs', meta: $totals.oneOff > 0 ? fmtWhole($totals.oneOff) : '', group: 'extras' },
    { id: 'bonus', label: 'Bonus', meta: $totals.bonus > 0 ? fmtWhole($totals.bonus) : '', group: 'extras' },
    { id: 'saves', label: 'Snapshots', meta: $saves.length ? String($saves.length) : '', group: 'extras' },
  ];

  $: activeCat = CATS.find((c) => c.key === active);
  $: catTarget = activeCat ? $state.takeHome * activeCat.target : 0;
  $: catActual = activeCat ? $totals[activeCat.key] : 0;
  $: catVariance = catActual - catTarget;
</script>

<section class="card panel" aria-label="Budget details">
  <TabBar {tabs} {active} label="Budget sections" on:select={(e) => (active = e.detail)} />

  <div class="panel-body" role="tabpanel" id="panel-{active}" aria-labelledby="tab-{active}">
    {#if activeCat}
      <CategoryList cat={activeCat} />
    {:else if active === 'oneOff'}
      <OneOffCard />
    {:else if active === 'bonus'}
      <BonusTracker />
    {:else}
      <SavedBudgets {service} />
    {/if}
  </div>

  {#if activeCat}
    <div class="panel-foot">
      <span class="pf-main">
        <span class="cat-dot" style="background:{activeCat.color}"></span>
        <strong>{activeCat.label} total</strong>
        <span class="num pf-amount">{fmt(catActual)}</span>
        {#if $state.takeHome > 0}
          <span class="pf-of">of <span class="num">{fmt(catTarget)}</span> target</span>
        {/if}
      </span>
      <span class="pf-end">
        {#if $state.takeHome > 0 && Math.abs(catVariance) >= 0.005}
          <span class="pf-var" class:is-over={catVariance > 0}>
            <span class="num">{fmt(Math.abs(catVariance))}</span> {catVariance > 0 ? 'over' : 'under'} target
          </span>
        {:else if $state.takeHome <= 0}
          <span class="pf-of">Add your take-home to see targets</span>
        {/if}
        <span class="pill {$gaugeStatuses[activeCat.key]}">{$gaugeStatuses[activeCat.key]}</span>
      </span>
    </div>
  {/if}
</section>
