<script lang="ts">
  import { state, totals } from '$lib/application/stores/budgetStore';
  import { fmt, sortByAmount } from '$lib/domain/planner';
  import type { SortDir } from '$lib/domain/planner';
  import type { BudgetState } from '$lib/domain/entities/Budget';
  import MoneyInput from './MoneyInput.svelte';
  import SortToggle from './SortToggle.svelte';

  $: items = $state.oneOff;
  $: subtotal = $totals.oneOff;

  function addItem() {
    state.update((s) => ({
      ...s,
      oneOff: [...s.oneOff, { label: '', amount: 0 }],
    }));
  }

  function sortItems(dir: SortDir) {
    state.update((s) => ({ ...s, oneOff: sortByAmount(s.oneOff, dir) }));
  }

  function removeItem(i: number) {
    state.update((s) => ({ ...s, oneOff: s.oneOff.filter((_, idx) => idx !== i) }));
  }

  function onLabel(i: number, e: Event) {
    const val = (e.target as HTMLInputElement).value.slice(0, 80);
    state.update((s) => {
      const next = [...s.oneOff];
      next[i] = { ...next[i], label: val };
      return { ...s, oneOff: next } as BudgetState;
    });
  }

  function onAmt(i: number, amount: number) {
    state.update((s) => {
      const next = [...s.oneOff];
      next[i] = { ...next[i], amount };
      return { ...s, oneOff: next } as BudgetState;
    });
  }
</script>

<div class="panel-pad">
  <div class="panel-head">
    <div>
      <h3>One-off costs</h3>
      <p class="cap">Annual or irregular expenses that aren't in your monthly budget</p>
    </div>
    <span class="panel-total num">{fmt(subtotal)}</span>
  </div>

  {#if items.length === 0}
    <p class="saves-empty">Nothing here yet. Think car tax, gifts, annual subscriptions.</p>
  {/if}
  <table class="mini-ledger">
    <tbody>
      {#each items as item, i}
        <tr>
          <td>
            <input class="row-label-input" type="text" value={item.label}
              on:input={(e) => onLabel(i, e)} placeholder="Item" aria-label="One-off item name" maxlength="80" />
          </td>
          <td class="amt-col">
            <MoneyInput inputClass="row-amt-input" ariaLabel="{item.label || 'One-off'} amount"
              value={item.amount} on:change={(e) => onAmt(i, e.detail)} />
          </td>
          <td class="del-col">
            <button class="del-btn" type="button" aria-label="Remove {item.label || 'item'}" on:click={() => removeItem(i)}>×</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="list-bar">
    <button class="mini-add-btn" type="button" on:click={addItem}>
      <span class="plus">+</span> Add item
    </button>
    <SortToggle count={items.length} on:sort={(e) => sortItems(e.detail)} />
  </div>

  {#if subtotal > 0}
    <p class="kv-note">
      Roughly <strong>{fmt(subtotal / 12)}</strong> a month to set aside
    </p>
  {/if}
</div>
