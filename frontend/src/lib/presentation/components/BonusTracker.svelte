<script lang="ts">
  import { state, totals } from '$lib/application/stores/budgetStore';
  import { fmt } from '$lib/domain/planner';
  import type { BudgetState } from '$lib/domain/entities/Budget';
  import MoneyInput from './MoneyInput.svelte';

  $: bonusItems = $state.bonus;
  $: bonusTotal = $totals.bonus;

  let applyNeeds = 0;
  let applyWants = 0;
  let applySavings = 0;

  $: applied = applyNeeds + applyWants + applySavings;
  $: remaining = bonusTotal - applied;

  function addBonusItem() {
    state.update((s) => ({
      ...s,
      bonus: [...s.bonus, { label: 'Bonus receipt', amount: 0 }],
    }));
  }

  function removeBonusItem(i: number) {
    state.update((s) => ({
      ...s,
      bonus: s.bonus.filter((_, idx) => idx !== i),
    }));
  }

  function onBonusLabel(i: number, e: Event) {
    const val = (e.target as HTMLInputElement).value.slice(0, 80);
    state.update((s) => {
      const next = [...s.bonus];
      next[i] = { ...next[i], label: val };
      return { ...s, bonus: next } as BudgetState;
    });
  }

  function onBonusAmt(i: number, amount: number) {
    state.update((s) => {
      const next = [...s.bonus];
      next[i] = { ...next[i], amount };
      return { ...s, bonus: next } as BudgetState;
    });
  }

  function applyBonus() {
    state.update((s) => {
      const addIfNonZero = (items: typeof s.needs, amt: number) =>
        amt > 0 ? [...items, { label: 'Bonus applied', amount: amt }] : items;
      return {
        ...s,
        needs:   addIfNonZero(s.needs,   applyNeeds),
        wants:   addIfNonZero(s.wants,   applyWants),
        savings: addIfNonZero(s.savings, applySavings),
      } as BudgetState;
    });
    applyNeeds = 0; applyWants = 0; applySavings = 0;
  }

  function onApply(which: 'needs' | 'wants' | 'savings', e: CustomEvent<number>) {
    if (which === 'needs') applyNeeds = e.detail;
    else if (which === 'wants') applyWants = e.detail;
    else applySavings = e.detail;
  }
</script>

<div class="panel-pad">
  <div class="panel-head">
    <div>
      <h3>Bonus / windfall</h3>
      <p class="cap">Log what you receive, then split it across your categories</p>
    </div>
    <span class="panel-total num">{fmt(bonusTotal)}</span>
  </div>

  {#if bonusItems.length === 0}
    <p class="saves-empty">No bonus logged yet.</p>
  {/if}
  <table class="mini-ledger">
    <tbody>
      {#each bonusItems as item, i}
        <tr>
          <td>
            <input class="row-label-input" type="text" value={item.label}
              on:input={(e) => onBonusLabel(i, e)} aria-label="Bonus receipt name" maxlength="80" />
          </td>
          <td class="amt-col">
            <MoneyInput inputClass="row-amt-input" ariaLabel="{item.label || 'Bonus'} amount"
              value={item.amount} on:change={(e) => onBonusAmt(i, e.detail)} />
          </td>
          <td class="del-col">
            <button class="del-btn" type="button" aria-label="Remove {item.label || 'receipt'}" on:click={() => removeBonusItem(i)}>×</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <button class="mini-add-btn" type="button" on:click={addBonusItem}>
    <span class="plus">+</span> Add receipt
  </button>

  {#if bonusTotal > 0}
    <div class="bonus-apply-bar">
      <div class="apply-field">
        <span class="apply-label"><span class="dot" style="background:#0088a0"></span>Needs</span>
        <div class="amt-field">
          <span class="cur">£</span>
          <MoneyInput inputClass="mini-input" ariaLabel="Apply to needs" value={applyNeeds} on:change={(e) => onApply('needs', e)} />
        </div>
      </div>
      <div class="apply-field">
        <span class="apply-label"><span class="dot" style="background:#c98a00"></span>Wants</span>
        <div class="amt-field">
          <span class="cur">£</span>
          <MoneyInput inputClass="mini-input" ariaLabel="Apply to wants" value={applyWants} on:change={(e) => onApply('wants', e)} />
        </div>
      </div>
      <div class="apply-field">
        <span class="apply-label"><span class="dot" style="background:#0ca30c"></span>Savings</span>
        <div class="amt-field">
          <span class="cur">£</span>
          <MoneyInput inputClass="mini-input" ariaLabel="Apply to savings" value={applySavings} on:change={(e) => onApply('savings', e)} />
        </div>
      </div>

      <div class="apply-remaining" class:is-unallocated={remaining < 0}>
        {remaining >= 0 ? fmt(remaining) : `−${fmt(Math.abs(remaining))}`} remaining
      </div>

      <button class="apply-btn" type="button" on:click={applyBonus} disabled={applied <= 0}>
        Apply
      </button>
    </div>
  {/if}
</div>
