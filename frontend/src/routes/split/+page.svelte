<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    split, result, MAX_PEOPLE,
    loadSplit, persistSplit, setBasis,
    addPerson, removePerson, updatePerson,
    addBill, removeBill, updateBill, resetSplit,
  } from '$lib/application/stores/splitStore';
  import { fmt, estimateTakeHome, monthlyFromAnnual } from '$lib/domain/planner';

  const COLORS = ['#0088a0', '#c98a00', '#0ca30c', '#8a4fd3', '#d33f6a', '#4f6bd3'];

  let unsubscribe: (() => void) | undefined;
  onMount(() => {
    loadSplit();
    unsubscribe = persistSplit();
  });
  onDestroy(() => unsubscribe?.());

  function str(e: Event): string {
    return (e.target as HTMLInputElement | HTMLSelectElement).value;
  }
  function num(e: Event): number {
    return parseFloat(str(e)) || 0;
  }

  function estimate(id: string, gross: number) {
    updatePerson(id, { takeHome: Math.round(monthlyFromAnnual(estimateTakeHome(gross))) });
  }

  function nameOf(id: string): string {
    return $split.people.find((p) => p.id === id)?.name || 'Unnamed';
  }

  $: people = $split.people;
  $: r = $result;
  $: hasBills = r.total > 0;
</script>

<svelte:head><title>Split bills · Budget Planner</title></svelte:head>

<div class="page">
  <header class="masthead">
    <p class="eyebrow">Shared finances</p>
    <h1>Split bills by income</h1>
    <p class="sub">
      Everyone pays the same share of their income towards shared bills, instead of a flat 50/50.
      <a href="/" class="back">← Back to budget</a>
    </p>
  </header>

  <div class="card">
    <div class="head-row">
      <div>
        <h3>Who's splitting</h3>
        <p class="cap">Split in proportion to…</p>
      </div>
      <div class="seg" role="group" aria-label="Income basis">
        <button type="button" class:on={$split.basis === 'takeHome'} on:click={() => setBasis('takeHome')}>
          Take-home
        </button>
        <button type="button" class:on={$split.basis === 'gross'} on:click={() => setBasis('gross')}>
          Gross salary
        </button>
      </div>
    </div>

    <div class="people">
      {#each people as p, i (p.id)}
        <div class="person">
          <span class="swatch" style="background:{COLORS[i % COLORS.length]}"></span>
          <input
            class="name-input" type="text" maxlength="40" placeholder="Name"
            value={p.name} on:input={(e) => updatePerson(p.id, { name: str(e) })}
          />
          <label class="money" class:dim={$split.basis !== 'gross'}>
            <span class="lbl">Gross / yr</span>
            <span class="field"><span class="cur">£</span>
              <input class="mini-input" type="number" min="0" step="100"
                value={p.gross || ''} placeholder="0"
                on:input={(e) => updatePerson(p.id, { gross: num(e) })} />
            </span>
          </label>
          <label class="money" class:dim={$split.basis !== 'takeHome'}>
            <span class="lbl">Take-home / mo</span>
            <span class="field"><span class="cur">£</span>
              <input class="mini-input" type="number" min="0" step="10"
                value={p.takeHome || ''} placeholder="0"
                on:input={(e) => updatePerson(p.id, { takeHome: num(e) })} />
            </span>
          </label>
          <button
            class="ghost-btn tiny" type="button"
            disabled={!p.gross} title="Estimate monthly take-home from gross (UK 2024/25)"
            on:click={() => estimate(p.id, p.gross)}
          >Estimate</button>
          <button
            class="del-btn" type="button" aria-label="Remove {p.name || 'person'}"
            disabled={people.length <= 2} on:click={() => removePerson(p.id)}
          >×</button>
        </div>
      {/each}
    </div>

    {#if people.length < MAX_PEOPLE}
      <button class="mini-add-btn" type="button" on:click={addPerson}>
        <span class="plus">+</span> Add person
      </button>
    {/if}

    <div class="bar" aria-hidden="true">
      {#each people as p, i}
        <div style="flex:{Math.max(r.fractions[i], 0.0001)};background:{COLORS[i % COLORS.length]}"></div>
      {/each}
    </div>
    <div class="legend">
      {#each people as p, i}
        <span>
          <span class="dot" style="background:{COLORS[i % COLORS.length]}"></span>
          {p.name || 'Unnamed'} <strong class="num">{(r.fractions[i] * 100).toFixed(1)}%</strong>
        </span>
      {/each}
    </div>
    {#if r.usedEqualFallback}
      <p class="kv-note">Enter incomes above — until then the bills are split equally.</p>
    {/if}
  </div>

  <div class="card">
    <h3>Shared bills</h3>
    <p class="cap">Monthly amounts, and who pays each one out of their own account</p>

    <table class="mini-ledger">
      <tbody>
        {#each $split.bills as b (b.id)}
          <tr>
            <td>
              <input class="row-label-input" type="text" maxlength="80" placeholder="Bill"
                value={b.label} on:input={(e) => updateBill(b.id, { label: str(e) })} />
            </td>
            <td class="paid-col">
              <select class="paid-select" aria-label="Paid by"
                value={b.paidBy} on:change={(e) => updateBill(b.id, { paidBy: str(e) })}>
                {#each people as p}
                  <option value={p.id} selected={p.id === b.paidBy}>{p.name || 'Unnamed'} pays</option>
                {/each}
              </select>
            </td>
            <td class="amt-col">
              <input class="row-amt-input" type="number" min="0" step="1" placeholder="0"
                value={b.amount || ''} on:input={(e) => updateBill(b.id, { amount: num(e) })} />
            </td>
            <td class="del-col">
              <button class="del-btn" type="button" aria-label="Remove bill" on:click={() => removeBill(b.id)}>×</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button class="mini-add-btn" type="button" on:click={addBill}>
      <span class="plus">+</span> Add bill
    </button>

    <div class="card-subtotal" style="margin-top:12px">
      <span>Total per month</span>
      <span class="v num">{fmt(r.total)}</span>
    </div>
  </div>

  {#if hasBills}
    <div class="card">
      <h3>Who pays what</h3>
      <p class="cap">Each person's share of the monthly total</p>

      <div class="results">
        {#each people as p, i}
          {@const diff = r.owed[i] - r.equalOwed[i]}
          <div class="result">
            <div class="k"><span class="dot" style="background:{COLORS[i % COLORS.length]}"></span>{p.name || 'Unnamed'}</div>
            <div class="v num">{fmt(r.owed[i])}</div>
            <div class="note">
              {#if Math.abs(diff) < 0.005}
                same as an equal split
              {:else}
                {fmt(Math.abs(diff))} {diff > 0 ? 'more' : 'less'} than 50/50
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <div class="settle">
        <h4>Settle up</h4>
        {#if r.transfers.length === 0}
          <p class="good">All square — everyone is already paying their share.</p>
        {:else}
          <ul>
            {#each r.transfers as t}
              <li>
                <strong>{nameOf(t.from)}</strong> pays <strong>{nameOf(t.to)}</strong>
                <span class="num amt">{fmt(t.amount)}</span> / month
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="table-wrap">
        <table class="breakdown">
          <thead>
            <tr>
              <th>Bill</th>
              {#each people as p}<th class="r">{p.name || 'Unnamed'}</th>{/each}
              <th class="r">Total</th>
            </tr>
          </thead>
          <tbody>
            {#each $split.bills as b, bi (b.id)}
              {#if b.amount > 0}
                <tr>
                  <td>{b.label || 'Untitled'}</td>
                  {#each people as p, pi}<td class="r num">{fmt(r.shares[bi][pi])}</td>{/each}
                  <td class="r num">{fmt(b.amount)}</td>
                </tr>
              {/if}
            {/each}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              {#each people as p, pi}<td class="r num">{fmt(r.owed[pi])}</td>{/each}
              <td class="r num">{fmt(r.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  {/if}

  <div class="footer-row">
    <p class="kv-note">Saved in this browser only.</p>
    <button class="ghost-btn danger" type="button" on:click={resetSplit}>Reset</button>
  </div>
</div>

<style>
  .back { margin-left: 10px; color: var(--accent); text-decoration: none; white-space: nowrap; }
  .back:hover { text-decoration: underline; }

  .head-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; flex-wrap: wrap; }
  .head-row .cap { margin-bottom: 0; }

  .seg { display: inline-flex; border: 1px solid var(--line-strong); border-radius: 4px; overflow: hidden; }
  .seg button {
    background: var(--surface); color: var(--ink-soft); border: none; padding: 7px 14px;
    font: 600 12.5px "IBM Plex Sans", sans-serif; cursor: pointer;
  }
  .seg button + button { border-left: 1px solid var(--line-strong); }
  .seg button.on { background: var(--accent); color: var(--accent-ink); }

  .people { display: flex; flex-direction: column; margin-top: 14px; }
  .person {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    padding: 10px 0; border-bottom: 1px solid var(--line);
  }
  .person:last-child { border-bottom: none; }
  .swatch { width: 10px; height: 28px; border-radius: 2.5px; flex: none; }
  .name-input {
    flex: 1 1 120px; min-width: 100px; background: transparent; border: none;
    border-bottom: 1px solid transparent; color: var(--ink); font: 600 15px "IBM Plex Sans", sans-serif; padding: 4px 2px;
  }
  .name-input:hover { border-bottom-color: var(--line-strong); }
  .name-input:focus { outline: none; border-bottom-color: var(--accent); }

  .money { display: flex; flex-direction: column; gap: 2px; }
  .money.dim { opacity: .55; }
  .money .lbl { font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-faint); font-weight: 600; }
  .money .field { display: flex; align-items: baseline; gap: 3px; }
  .money .cur { color: var(--ink-faint); font-size: 13px; }
  .tiny { padding: 4px 9px; font-size: 11.5px; }
  .tiny:disabled, .del-btn:disabled { opacity: .35; cursor: not-allowed; }

  .bar { display: flex; height: 12px; border-radius: 3px; overflow: hidden; margin-top: 16px; gap: 2px; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 9px; font-size: 13px; color: var(--ink-soft); }
  .dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; margin-right: 5px; }

  .paid-col { width: 150px; padding-right: 10px; }
  .paid-select {
    width: 100%; background: var(--surface-2); color: var(--ink-soft); border: 1px solid var(--line);
    border-radius: 3px; padding: 4px 6px; font: 12.5px "IBM Plex Sans", sans-serif;
  }

  .results { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
  .result { background: var(--surface-2); border-radius: 5px; padding: 12px 14px; }
  .result .k { font-size: 12.5px; color: var(--ink-soft); display: flex; align-items: center; }
  .result .v { font-size: 22px; font-weight: 600; margin-top: 4px; }
  .result .note { font-size: 11.5px; color: var(--ink-faint); margin-top: 3px; }

  .settle { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--line); }
  .settle h4 { font-size: 13px; margin-bottom: 8px; }
  .settle ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
  .settle .amt { font-weight: 600; margin: 0 4px; }
  .settle .good { color: var(--good); font-size: 13.5px; }

  .table-wrap { overflow-x: auto; margin-top: 18px; }
  .breakdown { width: 100%; border-collapse: collapse; font-size: 13px; }
  .breakdown th {
    text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em;
    color: var(--ink-faint); font-weight: 600; padding: 6px 8px; border-bottom: 1px solid var(--line);
  }
  .breakdown td { padding: 7px 8px; border-bottom: 1px solid var(--line); }
  .breakdown .r { text-align: right; }
  .breakdown tfoot td { font-weight: 600; border-bottom: none; border-top: 1px solid var(--line-strong); }

  .footer-row { display: flex; justify-content: space-between; align-items: center; }
  .footer-row .kv-note { margin-top: 0; }
</style>
