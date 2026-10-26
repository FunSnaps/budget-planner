<script lang="ts">
  import { state } from '$lib/application/stores/budgetStore';
  import { fmt, annualFromMonthly } from '$lib/domain/planner';
  import { CATS } from '$lib/domain/planner';
  import { totals } from '$lib/application/stores/budgetStore';
  import MoneyInput from './MoneyInput.svelte';

  function onTakeHome(e: CustomEvent<number>) {
    state.update((s) => ({ ...s, takeHome: e.detail }));
  }

  function onRoleLabelInput(e: Event) {
    const val = (e.target as HTMLInputElement).value.slice(0, 80);
    state.update((s) => ({ ...s, roleLabel: val }));
  }

</script>

<div class="card hero">
  <input
    class="cap-input"
    placeholder="Role / label (optional)"
    value={$state.roleLabel}
    on:input={onRoleLabelInput}
    maxlength="80"
  />

  <p class="hero-label">Monthly take-home</p>
  <div class="hero-row">
    <div class="hero-input-wrap">
      <span class="cur">£</span>
      <MoneyInput
        inputClass="hero-take-home"
        ariaLabel="Monthly take-home"
        value={$state.takeHome}
        on:change={onTakeHome}
      />
    </div>
    {#if $state.takeHome > 0}
      <span class="hero-annual">
        <strong>{fmt(annualFromMonthly($state.takeHome))}</strong> / yr
      </span>
    {/if}
  </div>

  <div class="hero-split">
    {#each CATS as cat}
      <div class="hero-split-cell">
        <div class="k">
          <span class="dot" style="background:{cat.color}"></span>
          {cat.label} · {Math.round(cat.target * 100)}%
        </div>
        <div class="v num">{fmt($state.takeHome * cat.target)}</div>
        <div class="planned">{fmt($totals[cat.key])} planned</div>
      </div>
    {/each}
  </div>
</div>
