<script lang="ts">
	import { Loader2 } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		modelId: string | null;
		isLoading: boolean;
		onLoad: () => void;
	}

	let { isLoading, modelId, onLoad }: Props = $props();
</script>

{#if modelId !== null && !isLoading}
	<div class="flex flex-col gap-2 border-t border-border/50 pt-2 text-xs text-muted-foreground">
		<span>El tamaño de contexto disponible se ve solo cuando el modelo está cargado.</span>

		<Button class="self-start" onclick={onLoad} size="sm" variant="secondary">Cargar modelo</Button>
	</div>
{:else if isLoading}
	<div class="flex items-center gap-2 border-t border-border/50 pt-2 text-xs text-muted-foreground">
		<Loader2 class="h-3.5 w-3.5 animate-spin" />

		<span>Cargando modelo...</span>
	</div>
{/if}
