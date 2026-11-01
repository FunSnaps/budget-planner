<script lang="ts">
  import { state } from '$lib/application/stores/budgetStore';
  import type { Cat } from '$lib/domain/planner';
  import type { BudgetState, BudgetStateItem } from '$lib/domain/entities/Budget';
  import MoneyInput from './MoneyInput.svelte';

  export let cat: Cat;

  function updateItems(fn: (items: BudgetStateItem[]) => BudgetStateItem[]) {
    state.update((s) => ({ ...s, [cat.key]: fn(s[cat.key]) }) as BudgetState);
  }

  function addRow() {
    updateItems((items) => [...items, { label: '', amount: 0 }]);
  }

  function removeRow(index: number) {
    updateItems((items) => items.filter((_, i) => i !== index));
  }

  function setLabel(index: number, e: Event) {
    const label = (e.target as HTMLInputElement).value.slice(0, 80);
    updateItems((items) => items.map((it, i) => (i === index ? { ...it, label } : it)));
  }

  function setAmount(index: number, amount: number) {
    updateItems((items) => items.map((it, i) => (i === index ? { ...it, amount } : it)));
  }
</script>

<table class="ledger">
  <thead>
    <tr>
      <th>{cat.label}</th>
      <th class="amt-col amt-col-w">Monthly (£)</th>
      <th class="del-col del-col-w"></th>
    </tr>
  </thead>
  <tbody>
    {#each $state[cat.key] as item, i}
      <tr>
        <td>
          <input
            class="row-label-input"
            type="text"
            value={item.label}
            on:input={(e) => setLabel(i, e)}
            placeholder="Item name"
            aria-label="{cat.label} item name"
            maxlength="80"
          />
        </td>
        <td class="amt-col amt-col-w">
          <MoneyInput
            inputClass="row-amt-input"
            ariaLabel="{item.label || cat.label} monthly amount"
            value={item.amount}
            on:change={(e) => setAmount(i, e.detail)}
          />
        </td>
        <td class="del-col del-col-w">
          <button class="del-btn" type="button" on:click={() => removeRow(i)} aria-label="Remove {item.label || 'item'}">×</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
<button class="add-row-btn" type="button" on:click={addRow}>
  <span class="plus">+</span> Add {cat.label.toLowerCase()} item
</button>
