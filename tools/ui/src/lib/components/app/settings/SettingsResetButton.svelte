<script lang="ts">
	import { RotateCcw } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { settingsStore } from '$lib/stores';

	interface Props {
		onReset?: () => void;
	}

	let { onReset }: Props = $props();

	let showResetDialog = $state(false);

	function handleResetClick() {
		showResetDialog = true;
	}

	function handleConfirmReset() {
		settingsStore.forceSyncWithServerDefaults();
		onReset?.();

		showResetDialog = false;
	}
</script>

{#if settingsStore.hasCustomSettings}
	<Button onclick={handleResetClick} variant="outline">
		<RotateCcw class="h-3 w-3" />

		Restablecer valor por defecto
	</Button>
{/if}

<AlertDialog.Root bind:open={showResetDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Restablecer configuración</AlertDialog.Title>

			<AlertDialog.Description>
				¿Seguro que querés restablecer toda la configuración? Los parámetros vuelven a los valores
				del endpoint /props del servidor y se borran tus ajustes personalizados.
			</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancelar</AlertDialog.Cancel>

			<AlertDialog.Action onclick={handleConfirmReset}>Restablecer</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
