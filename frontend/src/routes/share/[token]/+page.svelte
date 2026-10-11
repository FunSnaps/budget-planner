<script lang="ts">
  import type { PageData } from './$types';
  import { fmt, sum, CATS, statusFor } from '$lib/domain/planner';

  export let data: PageData;

  $: budget = data.shared.budget;
  $: s = budget.state;
  $: permission = data.shared.permission;

  $: totals = {
    needs:   sum(s.needs),
    wants:   sum(s.wants),
    savings: sum(s.savings),
  };
</script>

<svelte:head><title>Shared Budget · Budget Planner</title></svelte:head>

<div class="page">
  <header class="masthead">
    <p class="eyebrow">50 / 30 / 20 Budget Planner</p>
    <h1>{s.roleLabel || 'Shared Budget'}</h1>
    <p class="sub">
      Shared in <strong>{permission}</strong> mode.
      {#if data.shared.expiresAt}
        Expires {new Date(data.shared.expiresAt).toLocaleDateString('en-GB')}.
      {/if}
    </p>
  </header>

  <div class="card hero">
    <p class="hero-label">Monthly take-home</p>
    <div class="hero-row">
      <div class="hero-input-wrap">
        <span class="cur">£</span>
        <span class="hero-take-home num">{s.takeHome.toLocaleString('en-GB')}</span>
      </div>
      {#if s.annualSalary}
        <span class="hero-annual">
          <strong>{fmt(s.annualSalary)}</strong> gross / yr
        </span>
      {/if}
    </div>

    <div class="hero-split">
      {#each CATS as cat}
        <div class="hero-split-cell">
          <div class="k">
            <span class="dot" style="background:{cat.color}"></span>
            {cat.label}
          </div>
          <div class="v num">{fmt(totals[cat.key])}</div>
        </div>
      {/each}
    </div>
  </div>

  {#each CATS as cat}
    {@const items = s[cat.key]}
    {#if items.length}
      <div class="card">
        <div class="card-head-row">
          <div>
            <h3>{cat.label}</h3>
            <p class="cap">{(cat.target * 100).toFixed(0)}% target · {fmt(totals[cat.key])} spent</p>
          </div>
        </div>
        <div class="card-body">
          <table class="ledger">
            <thead>
              <tr>
                <th>Item</th>
                <th class="amt-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {#each items as item}
                <tr>
                  <td>{item.label}</td>
                  <td class="amt-col num">{fmt(item.amount)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/each}

  <p style="font-size:12px;color:var(--ink-faint);text-align:center">
    <a href="/register">Create your own budget →</a>
  </p>
</div>
