<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  interface Tab {
    id: string;
    label: string;
    color?: string;
    meta?: string;
    /** A separator is drawn wherever the group changes */
    group?: string;
  }

  export let tabs: Tab[];
  export let active: string;
  export let label = 'Sections';

  const dispatch = createEventDispatcher<{ select: string }>();
  let buttons: HTMLButtonElement[] = [];

  function onKeydown(e: KeyboardEvent, i: number) {
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    dispatch('select', tabs[next].id);
    buttons[next]?.focus();
  }
</script>

<div class="tabs" role="tablist" aria-label={label}>
  {#each tabs as t, i (t.id)}
    {#if i > 0 && t.group !== tabs[i - 1].group}
      <span class="tab-sep" role="presentation"></span>
    {/if}
    <button
      bind:this={buttons[i]}
      class="tab"
      class:is-active={active === t.id}
      role="tab"
      type="button"
      id="tab-{t.id}"
      aria-selected={active === t.id}
      aria-controls="panel-{t.id}"
      tabindex={active === t.id ? 0 : -1}
      on:click={() => dispatch('select', t.id)}
      on:keydown={(e) => onKeydown(e, i)}
    >
      {#if t.color}<span class="tab-dot" style="background:{t.color}"></span>{/if}
      <span class="tab-label">{t.label}</span>
      {#if t.meta}<span class="tab-meta num">{t.meta}</span>{/if}
    </button>
  {/each}
</div>
