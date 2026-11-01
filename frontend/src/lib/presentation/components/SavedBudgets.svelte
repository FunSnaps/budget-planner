<script lang="ts">
  import { state, saves, isSaving } from '$lib/application/stores/budgetStore';
  import { toasts } from '$lib/application/stores/toastStore';
  import { shareBudget } from '$lib/application/use-cases/shareBudget';
  import type { IBudgetService } from '$lib/domain/ports/IBudgetService';
  import type { Budget } from '$lib/domain/entities/Budget';

  export let service: IBudgetService;

  const NAME_MAX = 60;

  let saveName = '';
  let deletingId: string | null = null;
  let editingId: string | null = null;
  let editName = '';

  function formatDate(iso: string | undefined): string {
    const d = new Date(iso ?? '');
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /** Blank names are fine: the snapshot is called after the day it was taken. */
  function defaultName(): string {
    return `Snapshot ${formatDate(new Date().toISOString())}`;
  }

  async function saveNamed() {
    const name = saveName.trim().slice(0, NAME_MAX) || defaultName();
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

  function startRename(budget: Budget) {
    editingId = budget.id;
    editName = budget.name ?? '';
  }

  function cancelRename() {
    editingId = null;
  }

  async function commitRename(budget: Budget) {
    if (editingId !== budget.id) return;
    const name = editName.trim().slice(0, NAME_MAX);
    editingId = null;
    if (!name || name === budget.name) return;

    const prev = [...$saves];
    saves.update((list) => list.map((b) => (b.id === budget.id ? { ...b, name } : b)));
    try {
      await service.updateSave(budget.id, { name });
      toasts.show(`Renamed to "${name}"`);
    } catch {
      saves.set(prev);
      toasts.show('Failed to rename. Please try again.');
    }
  }

  function onRenameKey(e: KeyboardEvent, budget: Budget) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename(budget);
    } else if (e.key === 'Escape') {
      cancelRename();
    }
  }

  function focusAndSelect(node: HTMLInputElement) {
    node.focus();
    node.select();
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
</script>

<div class="panel-pad">
  <div class="panel-head">
    <div>
      <h3>Snapshots</h3>
      <p class="cap">Save the current budget under any name, to compare or revisit later</p>
    </div>
  </div>

  <div class="save-row">
    <input
      class="save-name-input"
      type="text"
      placeholder="Name this snapshot (optional)" aria-label="Snapshot name"
      bind:value={saveName}
      maxlength={NAME_MAX}
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
        {@const date = formatDate(budget.createdAt)}
        <div class="save-item">
          <div class="save-item-main">
            {#if editingId === budget.id}
              <input
                class="save-rename-input"
                type="text"
                aria-label="Rename {budget.name}"
                maxlength={NAME_MAX}
                bind:value={editName}
                use:focusAndSelect
                on:keydown={(e) => onRenameKey(e, budget)}
                on:blur={() => commitRename(budget)}
              />
            {:else}
              <div class="save-item-name" title={budget.name ?? ''}>{budget.name}</div>
            {/if}
            {#if date}<div class="save-item-meta">Saved {date}</div>{/if}
          </div>
          <div class="save-item-actions">
            <button class="ghost-btn" on:click={() => loadSave(budget)}>Load</button>
            <button
              class="ghost-btn"
              on:mousedown={(e) => editingId === budget.id && e.preventDefault()}
              on:click={() => (editingId === budget.id ? commitRename(budget) : startRename(budget))}
            >{editingId === budget.id ? 'Done' : 'Rename'}</button>
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

<style>
  .save-rename-input {
    width: 100%; min-width: 0; background: var(--surface); color: var(--ink);
    border: 1px solid var(--accent); border-radius: 3px; padding: 3px 7px;
    font: 600 13.5px "IBM Plex Sans", sans-serif;
  }
  .save-rename-input:focus { outline: none; box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 25%, transparent); }
</style>
