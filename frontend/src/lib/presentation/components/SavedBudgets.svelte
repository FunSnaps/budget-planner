<script lang="ts">
  import { state, saves, isSaving } from '$lib/application/stores/budgetStore';
  import { toasts } from '$lib/application/stores/toastStore';
  import { shareBudget } from '$lib/application/use-cases/shareBudget';
  import type { IBudgetService } from '$lib/domain/ports/IBudgetService';
  import type { Budget } from '$lib/domain/entities/Budget';

  export let service: IBudgetService;

  let saveName = '';
  let isFlagged = false;
  let deletingId: string | null = null;

  async function saveNamed() {
    const name = saveName.trim().slice(0, 60);
    if (!name) { isFlagged = true; return; }
    isFlagged = false;
    try {
      const saved = await service.createSave(name, $state);
      saves.update((s) => [saved, ...s]);
      saveName = '';
      toasts.show(`Saved "${name}"`);
    } catch {
      toasts.show('Failed to save. Please try again.');
    }
  }

  async function loadSave(budget: Budget) {
    const prev = $state;
    state.set(budget.state);
    toasts.show(`Loaded "${budget.name}"`, () => state.set(prev));
  }

  async function deleteSave(budget: Budget) {
    if (deletingId !== budget.id) {
      deletingId = budget.id;
      setTimeout(() => { if (deletingId === budget.id) deletingId = null; }, 3000);
      return;
    }
    deletingId = null;
    const prev = [...$saves];
    saves.update((s) => s.filter((b) => b.id !== budget.id));
    try {
      await service.deleteSave(budget.id);
      toasts.show(`Deleted "${budget.name}"`, () => saves.set(prev));
    } catch {
      saves.set(prev);
      toasts.show('Failed to delete. Please try again.');
    }
  }

  async function share(budget: Budget) {
    await shareBudget(service, budget.id, 'view');
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<div class="panel-pad">
  <div class="panel-head">
    <div>
      <h3>Snapshots</h3>
      <p class="cap">Save the current budget to compare or revisit later</p>
    </div>
  </div>

  <div class="save-row">
    <input
      class="save-name-input"
      class:is-flagged={isFlagged}
      type="text"
      placeholder="Snapshot name…" aria-label="Snapshot name"
      bind:value={saveName}
      maxlength="60"
      on:keydown={(e) => e.key === 'Enter' && saveNamed()}
    />
    <button class="ghost-btn" on:click={saveNamed} disabled={$isSaving}>
      Save snapshot
    </button>
  </div>

  <div class="saves-list">
    {#if $saves.length === 0}
      <p class="saves-empty">No snapshots yet.</p>
    {:else}
      {#each $saves as budget (budget.id)}
        <div class="save-item">
          <div class="save-item-main">
            <div class="save-item-name">{budget.name}</div>
            <div class="save-item-meta">Saved {formatDate(budget.updatedAt)}</div>
          </div>
          <div class="save-item-actions">
            <button class="ghost-btn" on:click={() => loadSave(budget)}>Load</button>
            <button class="ghost-btn" on:click={() => share(budget)}>Share</button>
            <button
              class="ghost-btn danger"
              class:is-armed={deletingId === budget.id}
              on:click={() => deleteSave(budget)}
            >
              {deletingId === budget.id ? 'Confirm' : 'Delete'}
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
