<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { DialogConfirmation } from '$lib/components/app';

	interface Props {
		open: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let { onCancel, onConfirm, open = $bindable() }: Props = $props();
</script>

<DialogConfirmation
	bind:open
	cancelText="Cancelar"
	confirmText="Eliminar"
	description="¿Seguro que querés eliminar esta conversación? Esta acción no se puede deshacer y borrará todos sus mensajes."
	icon={Trash2}
	{onCancel}
	{onConfirm}
	title="Eliminar conversación"
	variant="destructive"
/>
