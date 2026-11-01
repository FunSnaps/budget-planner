<script lang="ts">
  import { state } from '$lib/application/stores/budgetStore';
  import { fmt, annualFromMonthly, estimateTakeHome, monthlyFromAnnual } from '$lib/domain/planner';
  import MoneyInput from './MoneyInput.svelte';

  function onTakeHome(e: CustomEvent<number>) {
    state.update((s) => ({ ...s, takeHome: e.detail }));
  }

  function onSalary(e: CustomEvent<number>) {
    state.update((s) => ({ ...s, annualSalary: e.detail }));
  }

  function onBonus(e: CustomEvent<number>) {
    state.update((s) => ({ ...s, annualBonus: e.detail }));
  }

  function onRoleLabel(e: Event) {
    const roleLabel = (e.target as HTMLInputElement).value.slice(0, 80);
    state.update((s) => ({ ...s, roleLabel }));
  }

  function useEstimate() {
    state.update((s) => ({
      ...s,
      takeHome: Math.round(monthlyFromAnnual(estimateTakeHome(s.annualSalary))),
    }));
  }
</script>

<section class="card income" aria-labelledby="income-title">
  <div class="income-head">
    <h2 id="income-title" class="income-title">Monthly take-home</h2>
    <input
      class="income-role"
      placeholder="Label (optional)"
      aria-label="Budget label"
      value={$state.roleLabel}
      on:input={onRoleLabel}
      maxlength="80"
    />
  </div>

  <div class="income-main">
    <span class="income-cur">£</span>
    <MoneyInput
      inputClass="income-take-home"
      ariaLabel="Monthly take-home"
      value={$state.takeHome}
      on:change={onTakeHome}
    />
  </div>
  <p class="income-annual">
    {#if $state.takeHome > 0}
      <strong class="num">{fmt(annualFromMonthly($state.takeHome))}</strong> a year after tax
    {:else}
      Type your pay after tax to get started
    {/if}
  </p>

  <div class="income-extra">
    <div class="income-field">
      <span class="income-label">Annual salary</span>
      <span class="income-box">
        <span class="cur">£</span>
        <MoneyInput inputClass="income-input" ariaLabel="Annual salary (gross)" value={$state.annualSalary} on:change={onSalary} />
      </span>
    </div>
    <div class="income-field">
      <span class="income-label">Annual bonus</span>
      <span class="income-box">
        <span class="cur">£</span>
        <MoneyInput inputClass="income-input" ariaLabel="Annual bonus (gross)" value={$state.annualBonus} on:change={onBonus} />
      </span>
    </div>
  </div>

  {#if $state.annualSalary > 0}
    <button class="link-btn" type="button" on:click={useEstimate}>
      Use estimated take-home: {fmt(monthlyFromAnnual(estimateTakeHome($state.annualSalary)))} / mo
    </button>
  {/if}
</section>
