<script context="module" lang="ts">
  import ErrorUi from '../components/ErrorUi.svelte';
</script>

<script lang="ts">
  export let error: Error;
</script>

<ErrorUi {error} />
