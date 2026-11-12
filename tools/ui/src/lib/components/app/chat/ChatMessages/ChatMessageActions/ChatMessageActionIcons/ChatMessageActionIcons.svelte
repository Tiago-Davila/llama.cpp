<script lang="ts">
	import { ArrowRight, Copy, Edit, GitBranch, RefreshCw, Trash2 } from '@lucide/svelte';
	import {
		ActionIcon,
		ChatMessageActionIconsBranchingControls,
		DialogConfirmation
	} from '$lib/components/app';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { getChatMessageActionsContext, getChatMessageEditContext } from '$lib/contexts';
	import { conversationsStore } from '$lib/stores';
	import { untrack } from 'svelte';

	interface Props {
		justify: 'start' | 'end';
		actionsPosition: 'left' | 'right';
		onRegenerate?: () => void;
		onContinue?: () => void;
		showRawOutputSwitch?: boolean;
		rawOutputEnabled?: boolean;
		onRawOutputToggle?: (enabled: boolean) => void;
	}

	let {
		actionsPosition,
		justify,
		onContinue,
		onRawOutputToggle,
		onRegenerate,
		rawOutputEnabled = false,
		showRawOutputSwitch = false
	}: Props = $props();

	const messageActions = getChatMessageActionsContext();
	const editCtx = getChatMessageEditContext();

	let forkName = $state('');
	let forkIncludeAttachments = $state(true);

	function handleConfirmDelete() {
		messageActions.confirmDelete();
		messageActions.setShowDeleteDialog(false);
	}

	// fills the fork form each time the dialog opens, from the icon or the
	// message's context menu
	$effect(() => {
		if (!messageActions.showForkDialog) return;

		untrack(() => {
			forkName = `Copia de ${conversationsStore.activeConversation?.name ?? 'Conversación'}`;
			forkIncludeAttachments = true;
		});
	});

	function handleConfirmFork() {
		messageActions.forkConversation?.({
			includeAttachments: forkIncludeAttachments,
			name: forkName.trim()
		});
		messageActions.setShowForkDialog(false);
	}
</script>

<div class="relative {justify === 'start' ? 'mt-2' : ''} flex h-6 items-center justify-between">
	<div
		class="{actionsPosition === 'left'
			? 'left-0'
			: 'right-0'} flex items-center gap-2 opacity-100 transition-opacity"
	>
		{#if messageActions.siblingInfo && messageActions.siblingInfo.totalSiblings > 1}
			<ChatMessageActionIconsBranchingControls />
		{/if}

		<div
			class="pointer-events-auto inset-0 flex items-center gap-1 opacity-100 transition-all duration-150"
		>
			<ActionIcon icon={Copy} onclick={messageActions.copy} tooltip="Copiar" />

			<ActionIcon icon={Edit} onclick={editCtx.startEdit} tooltip="Editar" />

			{#if onRegenerate}
				<ActionIcon icon={RefreshCw} onclick={() => onRegenerate()} tooltip="Regenerar" />
			{/if}

			{#if onContinue}
				<ActionIcon icon={ArrowRight} onclick={onContinue} tooltip="Continuar" />
			{/if}

			{#if messageActions.forkConversation}
				<ActionIcon
					icon={GitBranch}
					onclick={() => messageActions.setShowForkDialog(true)}
					tooltip="Bifurcar conversación"
				/>
			{/if}

			<ActionIcon icon={Trash2} onclick={messageActions.requestDelete} tooltip="Eliminar" />
		</div>
	</div>

	{#if showRawOutputSwitch}
		<div class="flex items-center gap-2">
			<span class="text-xs text-muted-foreground">Ver texto sin formato</span>

			<Switch
				checked={rawOutputEnabled}
				onCheckedChange={(checked) => onRawOutputToggle?.(checked)}
			/>
		</div>
	{/if}
</div>

<DialogConfirmation
	cancelText="Cancelar"
	confirmText={messageActions.deletionInfo && messageActions.deletionInfo.totalCount > 1
		? `Eliminar ${messageActions.deletionInfo.totalCount} mensajes`
		: 'Eliminar'}
	description={messageActions.deletionInfo && messageActions.deletionInfo.totalCount > 1
		? `Se eliminarán ${messageActions.deletionInfo.totalCount} mensajes: ${messageActions.deletionInfo.userMessages} del usuario y ${messageActions.deletionInfo.assistantMessages} del asistente. Todos los mensajes de esta rama y sus respuestas se borrarán de forma permanente. Esta acción no se puede deshacer.`
		: '¿Seguro que querés eliminar este mensaje? Esta acción no se puede deshacer.'}
	icon={Trash2}
	onCancel={() => messageActions.setShowDeleteDialog(false)}
	onConfirm={handleConfirmDelete}
	open={messageActions.showDeleteDialog}
	title="Eliminar mensaje"
	variant="destructive"
/>

<DialogConfirmation
	cancelText="Cancelar"
	confirmText="Bifurcar"
	description="Crear una conversación nueva a partir de este mensaje."
	icon={GitBranch}
	onCancel={() => messageActions.setShowForkDialog(false)}
	onConfirm={handleConfirmFork}
	open={messageActions.showForkDialog}
	title="Bifurcar conversación"
>
	<div class="flex flex-col gap-4 py-2">
		<div class="flex flex-col gap-2">
			<Label for="fork-name">Título</Label>

			<Input
				bind:value={forkName}
				class="text-foreground"
				id="fork-name"
				placeholder="Nombre de la nueva conversación"
				type="text"
			/>
		</div>

		<div class="flex items-center gap-2">
			<Checkbox
				checked={forkIncludeAttachments}
				id="fork-attachments"
				onCheckedChange={(checked) => {
					forkIncludeAttachments = checked === true;
				}}
			/>

			<Label class="cursor-pointer text-sm font-normal" for="fork-attachments">
				Incluir todos los adjuntos
			</Label>
		</div>
	</div>
</DialogConfirmation>
