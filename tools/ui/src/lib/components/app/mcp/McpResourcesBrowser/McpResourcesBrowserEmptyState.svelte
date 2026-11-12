<script lang="ts">
	interface Props {
		isLoading: boolean;
	}

	let { isLoading }: Props = $props();
</script>

<div class="py-4 text-center text-sm text-muted-foreground">
	{#if isLoading}
		Cargando recursos...
	{:else}
		No hay recursos disponibles
	{/if}
</div>
