<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SortDir } from '$lib/domain/planner';

  /** Sorting needs at least two rows to mean anything */
  export let count = 0;

  const dispatch = createEventDispatcher<{ sort: SortDir }>();
  let dir: SortDir | null = null;

  function toggle() {
    dir = dir === 'desc' ? 'asc' : 'desc';
    dispatch('sort', dir);
  }

  $: hint = dir === 'desc' ? 'highest first' : dir === 'asc' ? 'lowest first' : 'click to sort';
</script>

<button
  class="sort-btn"
  type="button"
  disabled={count < 2}
  title="Sort by price ({hint})"
  aria-label="Sort by price, {hint}"
  on:click={toggle}
>
  Sort by price
  {#if dir}<span class="sort-arrow" aria-hidden="true">{dir === 'desc' ? '↓' : '↑'}</span>{/if}
</button>

<style>
  .sort-btn {
    background: none; border: none; padding: 6px 2px; cursor: pointer; white-space: nowrap;
    color: var(--ink-faint); font: 600 12px "IBM Plex Sans", sans-serif;
  }
  .sort-btn:hover:not(:disabled) { color: var(--accent); }
  .sort-btn:disabled { opacity: .4; cursor: not-allowed; }
  .sort-arrow { margin-left: 2px; color: var(--accent); }
</style>
