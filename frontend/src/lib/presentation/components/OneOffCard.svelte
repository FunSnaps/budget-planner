<script lang="ts">
  import { state, totals } from '$lib/application/stores/budgetStore';
  import { fmt } from '$lib/domain/planner';
  import type { BudgetState } from '$lib/domain/entities/Budget';

  $: items = $state.oneOff;
  $: subtotal = $totals.oneOff;

  function addItem() {
    state.update((s) => ({
      ...s,
      oneOff: [...s.oneOff, { label: '', amount: 0 }],
    }));
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

  function onAmt(i: number, e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value) || 0;
    state.update((s) => {
      const next = [...s.oneOff];
      next[i] = { ...next[i], amount: val };
      return { ...s, oneOff: next } as BudgetState;
    });
  }
</script>

<div class="card is-collapsible" class:is-collapsed={items.length === 0}>
  <div
    class="card-head-row"
    role="button"
    tabindex="0"
    on:click={() => {}}
    on:keydown={() => {}}
  >
    <div>
      <h3>One-off costs</h3>
      <p class="cap">Annual / irregular expenses not in monthly budget</p>
    </div>
    <div class="card-head-right">
      <span class="card-head-total num">{fmt(subtotal)}</span>
      <span class="collapse-toggle"><span class="chev">▾</span></span>
    </div>
  </div>

  <div class="card-body">
    <table class="mini-ledger">
      <tbody>
        {#each items as item, i}
          <tr>
            <td>
              <input class="row-label-input" type="text" value={item.label}
                on:input={(e) => onLabel(i, e)} placeholder="Item" maxlength="80" />
            </td>
            <td class="amt-col">
              <input class="row-amt-input" type="number" min="0" step="1"
                value={item.amount || ''} on:input={(e) => onAmt(i, e)} placeholder="0" />
            </td>
            <td class="del-col">
              <button class="del-btn" type="button" on:click={() => removeItem(i)}>×</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button class="mini-add-btn" type="button" on:click={addItem}>
      <span class="plus">+</span> Add item
    </button>

    {#if subtotal > 0}
      <p class="kv-note">
        {fmt(subtotal)} / yr · roughly <strong>{fmt(subtotal / 12)}</strong> per month to set aside
      </p>
    {/if}
  </div>
</div>
