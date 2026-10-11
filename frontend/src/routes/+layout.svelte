<script lang="ts">
  import '../app.css';
  import type { LayoutData } from './$types';
  import Toast from '$lib/presentation/components/Toast.svelte';

  export let data: LayoutData;
</script>

<slot />
<Toast />
