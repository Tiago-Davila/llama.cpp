<script lang="ts">
	import { ConversationSelection } from '$lib/components/app';
	import * as Dialog from '$lib/components/ui/dialog';

	interface Props {
		conversations: DatabaseConversation[];
		messageCountMap?: Map<string, number>;
		mode: 'export' | 'import';
		onCancel: () => void;
		onConfirm: (selectedConversations: DatabaseConversation[]) => void;
		open?: boolean;
	}

	let {
		conversations,
		messageCountMap = new Map(),
		mode,
		onCancel,
		onConfirm,
		open = $bindable(false)
	}: Props = $props();

	let conversationSelectionRef: ConversationSelection | undefined = $state();

	let previousOpen = $state(false);

	$effect(() => {
		if (open && !previousOpen && conversationSelectionRef) {
			conversationSelectionRef.reset();
		} else if (!open && previousOpen) {
			onCancel();
		}

		previousOpen = open;
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="z-1000000" />

		<Dialog.Content class="z-1000001 max-w-2xl">
			<Dialog.Header>
				<Dialog.Title>
					Seleccionar conversaciones para {mode === 'export' ? 'exportar' : 'importar'}
				</Dialog.Title>

				<Dialog.Description>
					{#if mode === 'export'}
						Elegí qué conversaciones exportar. Se descargarán como un archivo JSON.
					{:else}
						Elegí qué conversaciones importar. Se sumarán a tus conversaciones actuales.
					{/if}
				</Dialog.Description>
			</Dialog.Header>

			<ConversationSelection
				bind:this={conversationSelectionRef}
				{conversations}
				isOpen={open}
				{messageCountMap}
				{mode}
				{onCancel}
				{onConfirm}
			/>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
