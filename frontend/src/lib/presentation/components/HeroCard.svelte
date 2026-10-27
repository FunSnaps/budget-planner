<script lang="ts">
  import { state } from '$lib/application/stores/budgetStore';
  import { fmt, annualFromMonthly } from '$lib/domain/planner';
  import { CATS } from '$lib/domain/planner';
  import { totals } from '$lib/application/stores/budgetStore';
  import MoneyInput from './MoneyInput.svelte';
  import { estimateTakeHome, monthlyFromAnnual } from '$lib/domain/planner';

  function onTakeHome(e: CustomEvent<number>) {
    state.update((s) => ({ ...s, takeHome: e.detail }));
  }

  function onSalary(e: CustomEvent<number>) {
    state.update((s) => ({ ...s, annualSalary: e.detail }));
  }

  function onBonus(e: CustomEvent<number>) {
    state.update((s) => ({ ...s, annualBonus: e.detail }));
  }

  function useEstimate() {
    state.update((s) => ({
      ...s,
      takeHome: Math.round(monthlyFromAnnual(estimateTakeHome(s.annualSalary))),
    }));
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

  <div class="hero-extra">
    <div>
      <div class="hero-extra-label">Annual salary (gross)</div>
      <div class="hero-extra-field">
        <span class="cur">£</span>
        <MoneyInput
          inputClass="hero-extra-input"
          ariaLabel="Annual salary"
          value={$state.annualSalary}
          on:change={onSalary}
        />
      </div>
      {#if $state.annualSalary > 0}
        <button class="link-btn" type="button" on:click={useEstimate}>
          Use estimated take-home: {fmt(monthlyFromAnnual(estimateTakeHome($state.annualSalary)))} / mo
        </button>
      {/if}
    </div>
    <div>
      <div class="hero-extra-label">Annual bonus (gross, optional)</div>
      <div class="hero-extra-field">
        <span class="cur">£</span>
        <MoneyInput
          inputClass="hero-extra-input"
          ariaLabel="Annual bonus"
          value={$state.annualBonus}
          on:change={onBonus}
        />
      </div>
    </div>
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
