<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { state } from '$lib/application/stores/budgetStore';
  import {
    couple, loadCouple, persistCouple, setPartnerName, setPartnerIncome, setShared, setCustomTotal,
    setLineAmount, resetLineAmounts, removeLine, restoreLines,
  } from '$lib/application/stores/coupleStore';
  import { SHARED_CATS, computeCouple, sharedCosts, sharedTotal } from '$lib/domain/couple';
  import { fmt } from '$lib/domain/planner';
  import MoneyInput from './MoneyInput.svelte';

  const YOU = '#0088a0';
  const THEM = '#c98a00';

  let unsubscribe: (() => void) | undefined;
  onMount(() => {
    loadCouple();
    unsubscribe = persistCouple();
  });
  onDestroy(() => unsubscribe?.());

  $: partner = $couple.partnerName.trim() || 'Partner';
  $: costs = sharedCosts($state, $couple.shared, $couple.amounts, $couple.removed);
  $: removedCount = $couple.removed.length;
  $: hasTypedAmounts = Object.keys($couple.amounts).length > 0;
  $: custom = $couple.customTotal;
  $: lineTotal = sharedTotal(costs);
  $: r = computeCouple($state.takeHome, $couple.partnerIncome, costs, custom);

  // Per-line shares: the engine only sees the shared lines, so walk both lists in step.
  // A custom total replaces the lines, so none of them take part.
  $: rows = (() => {
    let next = 0;
    return costs.map((c) => {
      if (!c.shared || custom !== null) return { ...c, active: false, you: 0, them: 0 };
      const [you, them] = r.shares[next++];
      return { ...c, active: true, you, them };
    });
  })();

  function onLineAmount(key: string, current: number, e: CustomEvent<number>) {
    // A blur that re-sends the figure already showing is not an edit
    if (e.detail !== current) setLineAmount(key, e.detail);
  }

  function onTotal(e: CustomEvent<number>) {
    // Ignore a blur that re-sends the figure already showing from the budget lines
    if (custom === null && e.detail === lineTotal) return;
    setCustomTotal(e.detail);
  }

  $: youPct = r.fractions[0] * 100;
  $: themPct = r.fractions[1] * 100;
  $: needsIncomes = $state.takeHome <= 0 || $couple.partnerIncome <= 0;
  $: diffYou = r.owed[0] - r.equalOwed[0];
</script>

<div class="panel-pad">
  <div class="panel-head">
    <div>
      <h3>Proportional income split</h3>
      <p class="cap">Each of you pays the same share of the bills, in proportion to take-home pay</p>
    </div>
  </div>

  <div class="incomes">
    <div class="inc">
      <span class="inc-label"><span class="dot" style="background:{YOU}"></span>You</span>
      <span class="inc-box">
        <span class="cur">£</span>
        <span class="num inc-fixed">{$state.takeHome > 0 ? $state.takeHome.toLocaleString('en-GB', { maximumFractionDigits: 2 }) : '0'}</span>
        <span class="inc-hint">/ mo, from your budget</span>
      </span>
    </div>
    <div class="inc">
      <span class="inc-label">
        <span class="dot" style="background:{THEM}"></span>
        <input
          class="partner-name" type="text" maxlength="40" aria-label="Partner name"
          value={$couple.partnerName} on:input={(e) => setPartnerName(e.currentTarget.value)}
        />
      </span>
      <span class="inc-box inc-edit">
        <span class="cur">£</span>
        <MoneyInput inputClass="mini-input" ariaLabel="{partner} monthly take-home"
          value={$couple.partnerIncome} on:change={(e) => setPartnerIncome(e.detail)} />
        <span class="inc-hint">/ mo take-home</span>
      </span>
    </div>
  </div>

  <div class="bar" aria-hidden="true">
    <div style="flex:{Math.max(r.fractions[0], 0.0001)};background:{YOU}"></div>
    <div style="flex:{Math.max(r.fractions[1], 0.0001)};background:{THEM}"></div>
  </div>
  <div class="legend">
    <span>You <strong class="num">{youPct.toFixed(1)}%</strong></span>
    <span>{partner} <strong class="num">{themPct.toFixed(1)}%</strong></span>
  </div>
  {#if needsIncomes}
    <p class="kv-note">
      {$state.takeHome <= 0 ? 'Add your take-home on the left' : `Add ${partner}'s take-home above`}.
      Until both are in, the costs are split equally.
    </p>
  {/if}

  <div class="total-row">
    <span class="inc-label">Amount to split</span>
    <span class="inc-box inc-edit">
      <span class="cur">£</span>
      <MoneyInput inputClass="mini-input" ariaLabel="Amount to split per month"
        value={custom ?? lineTotal} on:change={onTotal} />
      <span class="inc-hint">/ mo</span>
    </span>
    {#if custom !== null}
      <button class="ghost-btn compact" type="button" on:click={() => setCustomTotal(null)}>
        Use budget lines{lineTotal > 0 ? ` (${fmt(lineTotal)})` : ''}
      </button>
    {:else}
      <span class="inc-hint">from the ticked lines below. Type a figure to use your own.</span>
    {/if}
  </div>

  {#if r.total > 0}
    <div class="results">
      <div class="result">
        <div class="k"><span class="dot" style="background:{YOU}"></span>You pay</div>
        <div class="v num">{fmt(r.owed[0])}</div>
        <div class="note">
          {#if Math.abs(diffYou) < 0.005}same as 50/50{:else}{fmt(Math.abs(diffYou))} {diffYou > 0 ? 'more' : 'less'} than 50/50{/if}
        </div>
      </div>
      <div class="result">
        <div class="k"><span class="dot" style="background:{THEM}"></span>{partner} pays</div>
        <div class="v num">{fmt(r.owed[1])}</div>
        <div class="note">
          {#if Math.abs(diffYou) < 0.005}same as 50/50{:else}{fmt(Math.abs(diffYou))} {diffYou > 0 ? 'less' : 'more'} than 50/50{/if}
        </div>
      </div>
    </div>
  {/if}

  {#if costs.length === 0 && removedCount === 0}
    {#if custom === null}
      <p class="saves-empty">Add amounts to your budget lines and they appear here to share.</p>
    {/if}
  {:else}
    <div class="list-head">
      <h4 class="list-title">Which costs are shared?</h4>
      <span class="list-actions">
        {#if removedCount > 0}
          <button class="ghost-btn compact" type="button" on:click={restoreLines}>
            Restore removed ({removedCount})
          </button>
        {/if}
        {#if hasTypedAmounts}
          <button class="ghost-btn compact" type="button" on:click={resetLineAmounts}>
            Reset amounts to budget
          </button>
        {/if}
      </span>
    </div>
    {#if custom !== null}
      <p class="kv-note list-note">Your own total is in use, so the budget lines below are set aside.</p>
    {/if}
    {#if costs.length === 0}
      <p class="saves-empty">Every line is removed. Restore them to split by line.</p>
    {:else}
    <table class="shares" class:muted={custom !== null}>
      <thead>
        <tr>
          <th class="chk"></th><th></th><th class="r">Total</th><th class="r">You</th><th class="r">{partner}</th>
          <th class="del"></th>
        </tr>
      </thead>
      {#each SHARED_CATS as cat}
        {@const group = rows.filter((c) => c.cat === cat.key)}
        {#if group.length}
          <tbody>
            <tr class="group"><th colspan="6">{cat.label}</th></tr>
            {#each group as c (c.key)}
              <tr class:off={!c.shared}>
                <td class="chk">
                  <input
                    type="checkbox" checked={c.shared} aria-label="Share {c.label}"
                    on:change={(e) => setShared(c.key, e.currentTarget.checked)}
                  />
                </td>
                <td class="lbl">{c.label}</td>
                <td class="r amt">
                  <MoneyInput inputClass="row-amt-input" ariaLabel="{c.label} monthly amount"
                    value={c.amount} on:change={(e) => onLineAmount(c.key, c.amount, e)} />
                </td>
                <td class="r num">{c.active ? fmt(c.you) : '·'}</td>
                <td class="r num">{c.active ? fmt(c.them) : '·'}</td>
                <td class="del">
                  <button class="del-btn" type="button" aria-label="Remove {c.label} from the split"
                    title="Remove from this calculator (your budget keeps it)"
                    on:click={() => removeLine(c.key)}>×</button>
                </td>
              </tr>
            {/each}
          </tbody>
        {/if}
      {/each}
      <tfoot>
        <tr>
          <td></td><td>Shared lines total</td>
          <td class="r num">{fmt(lineTotal)}</td>
          <td class="r num">{custom === null ? fmt(r.owed[0]) : '·'}</td>
          <td class="r num">{custom === null ? fmt(r.owed[1]) : '·'}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
    {/if}
  {/if}

  <p class="kv-note">
    Type an amount on any line to see the split, or remove a line with ×. This is a calculator, so your budget stays as it is.
    Needs are shared by default. Tick any other line to share it.
    For gross pay, more people, or bills paid from different accounts, use
    <a href="/split">Split bills</a>.
  </p>
</div>

<style>
  .incomes { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .inc { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .inc-label { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--ink-soft); font-weight: 600; }
  .dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; flex: none; }
  .inc-box {
    display: flex; align-items: baseline; gap: 4px; padding: 4px 0;
    border-bottom: 1.5px solid var(--line-strong); min-width: 0;
  }
  .inc-edit:focus-within { border-bottom-color: var(--accent); }
  .inc-box .cur { color: var(--ink-faint); font-size: 14px; }
  .inc-fixed { font-size: 17px; font-weight: 600; color: var(--ink); }
  .inc-box :global(.mini-input) { flex: 0 1 110px; min-width: 0; width: 110px; text-align: left; border-bottom: none; font-size: 17px; font-weight: 600; }
  .inc-hint { color: var(--ink-faint); font-size: 11.5px; white-space: nowrap; }
  .partner-name {
    min-width: 0; width: 100%; background: transparent; border: none; border-bottom: 1px solid transparent;
    color: var(--ink-soft); font: 600 12.5px "IBM Plex Sans", sans-serif; padding: 0 2px;
  }
  .partner-name:hover { border-bottom-color: var(--line-strong); }
  .partner-name:focus { outline: none; border-bottom-color: var(--accent); }

  .bar { display: flex; height: 12px; border-radius: 3px; overflow: hidden; margin-top: 14px; gap: 2px; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 8px; font-size: 13px; color: var(--ink-soft); }

  .results { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
  .result { background: var(--surface-2); border-radius: 5px; padding: 11px 14px; }
  .result .k { font-size: 12.5px; color: var(--ink-soft); display: flex; align-items: center; gap: 6px; }
  .result .v { font-size: 22px; font-weight: 600; margin-top: 3px; }
  .result .note { font-size: 11.5px; color: var(--ink-faint); margin-top: 2px; }

  .total-row { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px 14px; margin-top: 16px; }
  .total-row .inc-box { width: 150px; flex: none; }
  .total-row .ghost-btn { align-self: center; }

  .list-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 18px 0 4px; }
  .list-title { font-size: 13px; margin: 0; }
  .list-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .list-note { margin: 0 0 4px; }
  .shares.muted { opacity: .55; }
  .shares { width: 100%; border-collapse: collapse; font-size: 13px; }
  .shares th {
    text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em;
    color: var(--ink-faint); font-weight: 600; padding: 6px 6px; border-bottom: 1px solid var(--line);
  }
  .shares .group th { padding-top: 12px; border-bottom: none; color: var(--ink-soft); }
  .shares td { padding: 6px 6px; border-bottom: 1px solid var(--line); }
  .shares .r { text-align: right; }
  .shares .chk { width: 26px; padding-left: 0; }
  .shares .del { width: 24px; padding-right: 0; text-align: right; }
  .shares .amt { width: 120px; padding-top: 3px; padding-bottom: 3px; }
  .shares .amt :global(.row-amt-input) { width: 100%; }
  .shares .lbl { max-width: 0; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .shares tr.off td:not(.chk) { color: var(--ink-faint); }
  .shares tfoot td { font-weight: 600; border-bottom: none; border-top: 1px solid var(--line-strong); }
  .shares input[type='checkbox'] { accent-color: var(--accent); cursor: pointer; }
  a { color: var(--accent); }

  @media (max-width: 560px) {
    .incomes, .results { grid-template-columns: 1fr; }
  }
</style>
