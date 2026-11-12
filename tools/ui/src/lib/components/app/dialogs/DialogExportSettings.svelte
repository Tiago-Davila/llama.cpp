<script lang="ts">
	import { Shield, ShieldOff } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Label from '$lib/components/ui/label/label.svelte';

	let {
		includeSensitiveData = $bindable(false),
		onCancel,
		onConfirm,
		open = $bindable()
	}: {
		open: boolean;
		includeSensitiveData: boolean;
		onCancel: () => void;
		onConfirm: () => void;
	} = $props();

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen) {
			onCancel();
		}
	}
</script>

<AlertDialog.Root onOpenChange={handleOpenChange} {open}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title class="flex items-center gap-2">
				{#if includeSensitiveData}
					<ShieldOff class="h-5 w-5 text-destructive" />
				{:else}
					<Shield class="h-5 w-5 text-destructive" />
				{/if}
				Exportar configuración
			</AlertDialog.Title>

			<AlertDialog.Description>
				{#if includeSensitiveData}
					<p class="text-amber-500">
						Atención: esta exportación incluye datos sensibles como claves de API y encabezados de
						servidores MCP (por ej., tokens de autorización). No compartas este archivo con nadie
						de quien no confíes.
					</p>
				{:else}
					<p>
						Los datos sensibles (claves de API, encabezados de servidores MCP) no se incluyen en la
						exportación para proteger tus credenciales.
					</p>
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>

		<div class="flex items-center gap-2 py-2">
			<Checkbox bind:checked={includeSensitiveData} id="include-sensitive" />

			<Label
				class="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				for="include-sensitive"
			>
				{#if includeSensitiveData}
					<span class="text-destructive">Incluir datos sensibles (no recomendado)</span>
				{:else}
					<span>Incluir datos sensibles</span>
				{/if}
			</Label>
		</div>

		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={onCancel}>Cancelar</AlertDialog.Cancel>

			<AlertDialog.Action
				class="bg-destructive text-white hover:bg-destructive/80"
				onclick={onConfirm}
			>
				{#if includeSensitiveData}
					Exportar igual
				{:else}
					Exportar sin datos sensibles
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
