<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { state, initStores } from '$lib/application/stores/budgetStore';
  import { toasts } from '$lib/application/stores/toastStore';
  import { autoSaveBudget, cancelAutoSave } from '$lib/application/use-cases/autoSaveBudget';
  import { migrateLegacyData } from '$lib/application/use-cases/migrateLegacyData';
  import { BudgetApiService } from '$lib/infrastructure/api/BudgetApiService';

  import AppHeader from '$lib/presentation/components/AppHeader.svelte';
  import IncomeCard from '$lib/presentation/components/IncomeCard.svelte';
  import Overview from '$lib/presentation/components/Overview.svelte';
  import BudgetPanel from '$lib/presentation/components/BudgetPanel.svelte';

  import type { PageData } from './$types';

  export let data: PageData;

  const service = new BudgetApiService();
  const scheduleAutoSave = autoSaveBudget(service);

  onMount(async () => {
    if (data.activeBudget) {
      initStores(data.activeBudget, data.saves ?? []);
    }

    if (await migrateLegacyData(service)) {
      toasts.show('Your local budget data has been moved to your account.');
    }
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
</script>

<svelte:head><title>Budget Planner</title></svelte:head>

<div class="app">
  <AppHeader active="budget" showSaveStatus />

  <main class="app-main">
    <div class="col col-side">
      <IncomeCard />
      <Overview />
    </div>
    <div class="col col-content">
      <BudgetPanel {service} />
    </div>
  </main>
</div>
