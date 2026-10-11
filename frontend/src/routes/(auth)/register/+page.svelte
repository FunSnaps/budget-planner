<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<svelte:head><title>Create account · Budget Planner</title></svelte:head>

<div class="auth-page">
  <div class="auth-card">
    <h1>Create account</h1>
    <p class="sub">Start planning your 50/30/20 budget.</p>

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
        <input id="password" name="password" type="password" autocomplete="new-password" required minlength="8" />
      </div>
      <button class="submit-btn" type="submit">Create account</button>
    </form>

    <p class="auth-link">
      Already have an account? <a href="/login">Sign in</a>
    </p>
  </div>
</div>
