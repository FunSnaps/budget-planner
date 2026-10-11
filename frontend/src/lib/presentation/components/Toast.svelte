<script lang="ts">
  import { toasts } from '$lib/application/stores/toastStore';
</script>

<div class="toast-stack" aria-live="polite" aria-atomic="false">
  {#each $toasts as toast (toast.id)}
    <div class="toast" role="status">
      <span style="flex:1">{toast.message}</span>
      {#if toast.undoFn}
        <button
          class="undo-btn"
          type="button"
          on:click={() => { toast.undoFn?.(); toasts.dismiss(toast.id); }}
        >
          Undo
        </button>
      {/if}
    </div>
  {/each}
</div>
