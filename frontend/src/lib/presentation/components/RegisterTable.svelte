<script lang="ts">
  import { state, totals } from '$lib/application/stores/budgetStore';
  import { fmt } from '$lib/domain/planner';
  import type { BudgetState } from '$lib/domain/entities/Budget';
  import type { Cat } from '$lib/domain/planner';

  export let cat: Cat;

  $: items = $state[cat.key];
  $: subtotal = $totals[cat.key];
  $: isCollapsed = false;

  function addRow() {
    state.update((s) => ({
      ...s,
      [cat.key]: [...s[cat.key], { label: '', amount: 0 }],
    }));
    isCollapsed = false;
  }

  function removeRow(index: number) {
    state.update((s) => ({
      ...s,
      [cat.key]: s[cat.key].filter((_, i) => i !== index),
    }));
  }

  function onLabelInput(index: number, e: Event) {
    const val = (e.target as HTMLInputElement).value.slice(0, 80);
    state.update((s) => {
      const next = [...s[cat.key]];
      next[index] = { ...next[index], label: val };
      return { ...s, [cat.key]: next } as BudgetState;
    });
  }

  function onAmountInput(index: number, e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    state.update((s) => {
      const next = [...s[cat.key]];
      next[index] = { ...next[index], amount: val };
      return { ...s, [cat.key]: next } as BudgetState;
    });
  }

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }
</script>

<div class="register" class:is-collapsed={isCollapsed}>
  <div
    class="register-head"
    role="button"
    tabindex="0"
    on:click={toggleCollapse}
    on:keydown={(e) => e.key === 'Enter' && toggleCollapse()}
  >
    <h3>
      <span class="cat-dot" style="background:{cat.color}"></span>
      {cat.label}
    </h3>
    <div class="register-head-right">
      <span class="subtotal num">{fmt(subtotal)}</span>
      <span class="collapse-toggle"><span class="chev">▾</span></span>
    </div>
  </div>

  <div class="register-body">
    <table class="ledger">
      <thead>
        <tr>
          <th>Item</th>
          <th class="amt-col amt-col-w">Monthly (£)</th>
          <th class="del-col del-col-w"></th>
        </tr>
      </thead>
      <tbody>
        {#each items as item, i}
          <tr>
            <td>
              <input
                class="row-label-input"
                type="text"
                value={item.label}
                on:input={(e) => onLabelInput(i, e)}
                placeholder="Item name"
                maxlength="80"
              />
            </td>
            <td class="amt-col">
              <input
                class="row-amt-input"
                type="number"
                min="0"
                step="1"
                value={item.amount || ''}
                on:input={(e) => onAmountInput(i, e)}
                placeholder="0"
              />
            </td>
            <td class="del-col">
              <button class="del-btn" type="button" on:click={() => removeRow(i)} aria-label="Remove row">
                ×
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button class="add-row-btn" type="button" on:click={addRow}>
      <span class="plus">+</span> Add item
    </button>
  </div>
</div>
