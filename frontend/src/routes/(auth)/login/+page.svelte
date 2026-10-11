<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<svelte:head><title>Sign in · Budget Planner</title></svelte:head>

<div class="auth-page">
  <div class="auth-card">
    <h1>Welcome back</h1>
    <p class="sub">Sign in to your budget planner.</p>

    {#if form?.error}
      <p class="form-error">{form.error}</p>
    {/if}

    <form method="POST" use:enhance>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" required value={form?.email ?? ''} />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required />
      </div>
      <button class="submit-btn" type="submit">Sign in</button>
    </form>

    <p class="auth-link">
      No account? <a href="/register">Create one</a>
    </p>
  </div>
</div>
