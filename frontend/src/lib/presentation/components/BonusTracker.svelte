<script lang="ts">
  import { state, totals } from '$lib/application/stores/budgetStore';
  import { fmt, sum } from '$lib/domain/planner';
  import type { BudgetState } from '$lib/domain/entities/Budget';

  $: bonusItems = $state.bonus;
  $: bonusTotal = $totals.bonus;

  let applyAmounts = { applyNeeds: 0, applyWants: 0, applySavings: 0 };

  $: applied = applyAmounts.applyNeeds + applyAmounts.applyWants + applyAmounts.applySavings;
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

  function onBonusAmt(i: number, e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    state.update((s) => {
      const next = [...s.bonus];
      next[i] = { ...next[i], amount: val };
      return { ...s, bonus: next } as BudgetState;
    });
  }

  function applyBonus() {
    state.update((s) => {
      const addIfNonZero = (items: typeof s.needs, amt: number) =>
        amt > 0 ? [...items, { label: 'Bonus applied', amount: amt }] : items;
      return {
        ...s,
        needs:   addIfNonZero(s.needs,   applyAmounts.applyNeeds),
        wants:   addIfNonZero(s.wants,   applyAmounts.applyWants),
        savings: addIfNonZero(s.savings, applyAmounts.applySavings),
      } as BudgetState;
    });
    applyAmounts = { applyNeeds: 0, applyWants: 0, applySavings: 0 };
  }
</script>

<div class="card is-collapsible" class:is-collapsed={bonusItems.length === 0}>
  <div
    class="card-head-row"
    role="button"
    tabindex="0"
    on:click={() => {}}
    on:keydown={() => {}}
  >
    <div>
      <h3>Bonus / windfall</h3>
      <p class="cap">Log receipts and split across categories</p>
    </div>
    <div class="card-head-right">
      <span class="card-head-total num">{fmt(bonusTotal)}</span>
      <span class="collapse-toggle"><span class="chev">▾</span></span>
    </div>
  </div>

  <div class="card-body">
    <div class="card-subtotal">
      <span>Total bonus / windfall</span>
      <span class="v num">{fmt(bonusTotal)}</span>
    </div>

    <table class="mini-ledger">
      <tbody>
        {#each bonusItems as item, i}
          <tr>
            <td>
              <input class="row-label-input" type="text" value={item.label}
                on:input={(e) => onBonusLabel(i, e)} maxlength="80" />
            </td>
            <td class="amt-col">
              <input class="row-amt-input" type="number" min="0" step="1"
                value={item.amount || ''} on:input={(e) => onBonusAmt(i, e)} placeholder="0" />
            </td>
            <td class="del-col">
              <button class="del-btn" type="button" on:click={() => removeBonusItem(i)}>×</button>
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
        {#each [['Needs', '#0088a0', 'applyNeeds'], ['Wants', '#c98a00', 'applyWants'], ['Savings', '#0ca30c', 'applySavings']] as [label, color, bindKey]}
          <div class="apply-field">
            <label>
              <span class="dot" style="background:{color}"></span>
              {label}
            </label>
            <div class="amt-field">
              <span class="cur">£</span>
              <input class="mini-input" type="number" min="0" step="1"
                bind:value={applyAmounts[bindKey as keyof typeof applyAmounts]}
                placeholder="0" />
            </div>
          </div>
        {/each}

        <div class="apply-remaining" class:is-unallocated={remaining < 0}>
          {remaining >= 0 ? fmt(remaining) : `−${fmt(Math.abs(remaining))}`} remaining
        </div>

        <button class="apply-btn" type="button" on:click={applyBonus} disabled={applied <= 0}>
          Apply
        </button>
      </div>
    {/if}
  </div>
</div>
