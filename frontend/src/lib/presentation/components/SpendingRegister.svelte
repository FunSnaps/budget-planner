<script lang="ts">
  import { state, totals, allocated, unallocated } from '$lib/application/stores/budgetStore';
  import { CATS, fmt } from '$lib/domain/planner';
  import type { Cat } from '$lib/domain/planner';
  import type { BudgetState, BudgetStateItem } from '$lib/domain/entities/Budget';
  import MoneyInput from './MoneyInput.svelte';

  type Key = Cat['key'];

  let collapsed: Record<string, boolean> = {};

  function toggle(key: Key) {
    collapsed = { ...collapsed, [key]: !collapsed[key] };
  }

  function updateItems(key: Key, fn: (items: BudgetStateItem[]) => BudgetStateItem[]) {
    state.update((s) => ({ ...s, [key]: fn(s[key]) }) as BudgetState);
  }

  function addRow(key: Key) {
    collapsed = { ...collapsed, [key]: false };
    updateItems(key, (items) => [...items, { label: '', amount: 0 }]);
  }

  function removeRow(key: Key, index: number) {
    updateItems(key, (items) => items.filter((_, i) => i !== index));
  }

  function setLabel(key: Key, index: number, e: Event) {
    const label = (e.target as HTMLInputElement).value.slice(0, 80);
    updateItems(key, (items) => items.map((it, i) => (i === index ? { ...it, label } : it)));
  }

  function setAmount(key: Key, index: number, amount: number) {
    updateItems(key, (items) => items.map((it, i) => (i === index ? { ...it, amount } : it)));
  }
</script>

<div class="register">
  <div class="register-head static">
    <h3>Monthly budget</h3>
    <div class="register-head-right">
      <span class="subtotal num">{fmt($allocated)}</span>
      <span class="of">of {fmt($state.takeHome)}</span>
    </div>
  </div>

  {#each CATS as cat}
    <section class="group" class:is-collapsed={collapsed[cat.key]}>
      <button
        class="group-head"
        type="button"
        aria-expanded={!collapsed[cat.key]}
        on:click={() => toggle(cat.key)}
      >
        <span class="group-title">
          <span class="cat-dot" style="background:{cat.color}"></span>
          {cat.label}
          <span class="group-target">{Math.round(cat.target * 100)}% · {fmt($state.takeHome * cat.target)}</span>
        </span>
        <span class="group-right">
          <span class="subtotal num">{fmt($totals[cat.key])}</span>
          <span class="collapse-toggle"><span class="chev">▾</span></span>
        </span>
      </button>

      <div class="group-body">
        <table class="ledger">
          <tbody>
            {#each $state[cat.key] as item, i}
              <tr>
                <td>
                  <input
                    class="row-label-input"
                    type="text"
                    value={item.label}
                    on:input={(e) => setLabel(cat.key, i, e)}
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
                    on:change={(e) => setAmount(cat.key, i, e.detail)}
                  />
                </td>
                <td class="del-col del-col-w">
                  <button class="del-btn" type="button" on:click={() => removeRow(cat.key, i)} aria-label="Remove {item.label || 'item'}">×</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        <button class="add-row-btn" type="button" on:click={() => addRow(cat.key)}>
          <span class="plus">+</span> Add {cat.label.toLowerCase()} item
        </button>
      </div>
    </section>
  {/each}

  <div class="register-foot" class:is-over={$unallocated < -0.5}>
    {#if $state.takeHome <= 0}
      Enter your monthly take-home above to see how the budget compares.
    {:else if $unallocated < -0.5}
      {fmt(Math.abs($unallocated))} over your take-home
    {:else}
      {fmt($unallocated)} left to allocate
    {/if}
  </div>
</div>
