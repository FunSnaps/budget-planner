<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="auth-page">
  <div class="auth-card" style="text-align:center">
    <h1>{$page.status}</h1>
    <p class="sub">{$page.error?.message ?? 'Something went wrong.'}</p>
    <a href="/" class="ghost-btn" style="display:inline-block;margin-top:16px">Go home</a>
  </div>
</div>
