<script lang="ts">
  import { page } from '$app/stores';
  import { isSaving } from '$lib/application/stores/budgetStore';

  export let active: 'budget' | 'split';
  export let showSaveStatus = false;

  $: email = $page.data.user?.email ?? null;

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }
</script>

<header class="app-header">
  <a class="brand" href="/" aria-label="Budget Planner home">
    <span class="brand-mark" aria-hidden="true">
      <span style="flex:5;background:#0088a0"></span>
      <span style="flex:3;background:#c98a00"></span>
      <span style="flex:2;background:#0ca30c"></span>
    </span>
    <span class="brand-name">Budget Planner</span>
  </a>

  <nav class="nav" aria-label="Main">
    <a href="/" class:is-active={active === 'budget'} aria-current={active === 'budget' ? 'page' : undefined}>Budget</a>
    <a href="/split" class:is-active={active === 'split'} aria-current={active === 'split' ? 'page' : undefined}>Split bills</a>
  </nav>

  <div class="header-right">
    {#if showSaveStatus}
      <span class="save-status" class:is-saving={$isSaving} aria-live="polite">
        <span class="save-dot"></span>{$isSaving ? 'Saving…' : 'All changes saved'}
      </span>
    {/if}
    {#if email}
      <span class="user-email" title={email}>{email}</span>
      <button class="ghost-btn compact" type="button" on:click={logout}>Sign out</button>
    {/if}
  </div>
</header>
