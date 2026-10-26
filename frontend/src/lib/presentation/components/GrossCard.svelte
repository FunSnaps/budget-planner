<script lang="ts">
  import { state } from '$lib/application/stores/budgetStore';
  import { fmt, estimateTakeHome, monthlyFromAnnual } from '$lib/domain/planner';
  import MoneyInput from './MoneyInput.svelte';

  function onSalary(e: CustomEvent<number>) {
    state.update((s) => ({ ...s, annualSalary: e.detail }));
  }

  function onBonus(e: CustomEvent<number>) {
    state.update((s) => ({ ...s, annualBonus: e.detail }));
  }

  function fillFromSalary() {
    state.update((s) => ({
      ...s,
      takeHome: Math.round(monthlyFromAnnual(estimateTakeHome(s.annualSalary))),
    }));
  }
</script>

<div class="card is-quiet is-collapsible" class:is-collapsed={!$state.annualSalary}>
  <div
    class="card-head-row"
    role="button"
    tabindex="0"
    on:click={() => {}}
    on:keydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
  >
    <div>
      <h3>Gross reference</h3>
      <p class="cap">Optional: estimate take-home from salary</p>
    </div>
    <div class="card-head-right">
      <span class="collapse-toggle"><span class="chev">▾</span></span>
    </div>
  </div>

  <div class="card-body">
    <div class="income-block">
      <div class="income-block-title">Base salary</div>
      <div class="stat-row">
        <div class="stat-cell">
          <div class="stat-label">Annual gross</div>
          <div class="stat-value-input">
            <span class="cur">£</span>
            <MoneyInput inputClass="stat-input" ariaLabel="Annual gross salary"
              value={$state.annualSalary} on:change={onSalary} />
          </div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">Est. monthly take-home</div>
          <div class="stat-value-input">
            <span style="font-family:'IBM Plex Mono',monospace;font-size:16px;font-weight:600;color:var(--ink)">
              {$state.annualSalary ? fmt(monthlyFromAnnual(estimateTakeHome($state.annualSalary))) : '-'}
            </span>
          </div>
        </div>
      </div>
      {#if $state.annualSalary}
        <div style="margin-top:10px">
          <button class="ghost-btn" on:click={fillFromSalary}>
            Use estimated take-home ↑
          </button>
        </div>
      {/if}
    </div>

    <div class="income-block income-row-secondary">
      <div class="income-block-title">Annual bonus</div>
      <div class="stat-row">
        <div class="stat-cell">
          <div class="stat-label">Gross bonus</div>
          <div class="stat-value-input">
            <span class="cur">£</span>
            <MoneyInput inputClass="stat-input" ariaLabel="Gross bonus"
              value={$state.annualBonus} on:change={onBonus} />
          </div>
        </div>
      </div>
    </div>

    <p class="quiet-note">Estimates use 2024/25 UK income tax + NI rates. No pension deductions included.</p>
  </div>
</div>
