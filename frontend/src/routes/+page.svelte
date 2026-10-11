<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { state } from '$lib/application/stores/budgetStore';
  import { initStores } from '$lib/application/stores/budgetStore';
  import { autoSaveBudget, cancelAutoSave } from '$lib/application/use-cases/autoSaveBudget';
  import { migrateLegacyData } from '$lib/application/use-cases/migrateLegacyData';
  import { BudgetApiService } from '$lib/infrastructure/api/BudgetApiService';
  import { CATS } from '$lib/domain/planner';

  import HeroCard from '$lib/presentation/components/HeroCard.svelte';
  import GrossCard from '$lib/presentation/components/GrossCard.svelte';
  import Gauges from '$lib/presentation/components/Gauges.svelte';
  import RegisterTable from '$lib/presentation/components/RegisterTable.svelte';
  import CompositionBar from '$lib/presentation/components/CompositionBar.svelte';
  import FlagBanner from '$lib/presentation/components/FlagBanner.svelte';
  import BonusTracker from '$lib/presentation/components/BonusTracker.svelte';
  import OneOffCard from '$lib/presentation/components/OneOffCard.svelte';
  import SavedBudgets from '$lib/presentation/components/SavedBudgets.svelte';

  import type { PageData } from './$types';

  export let data: PageData;

  const service = new BudgetApiService();
  const scheduleAutoSave = autoSaveBudget(service);

  let migrated = false;

  onMount(async () => {
    if (data.activeBudget) {
      initStores(data.activeBudget, data.saves ?? []);
    }

    migrated = await migrateLegacyData(service);
  });

  onDestroy(() => {
    cancelAutoSave();
  });

  // Auto-save whenever state changes (skip initial hydration tick)
  let firstRun = true;
  $: if (!firstRun) {
    scheduleAutoSave($state);
  } else {
    firstRun = false;
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }
</script>

<svelte:head><title>Budget Planner</title></svelte:head>

<div class="page">
  <header class="masthead">
    <p class="eyebrow">50 / 30 / 20 Budget Planner</p>
    <h1>Your budget</h1>
    {#if data.user}
      <p class="sub">
        {data.user.email} ·
        <button
          class="ghost-btn"
          style="padding:2px 8px;font-size:12px"
          on:click={logout}
        >Sign out</button>
      </p>
    {/if}
    {#if migrated}
      <p class="sub" style="color:var(--good)">
        Your local budget data has been migrated to the cloud.
      </p>
    {/if}
  </header>

  <HeroCard />
  <GrossCard />

  <Gauges />
  <CompositionBar />
  <FlagBanner />

  <div class="registers">
    {#each CATS as cat}
      <RegisterTable {cat} />
    {/each}
  </div>

  <OneOffCard />
  <BonusTracker />
  <SavedBudgets {service} />
</div>
