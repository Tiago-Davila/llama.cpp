<script lang="ts">
	import ChatFormConvertitodoUpload from '../ChatForm/ChatFormConvertitodoUpload.svelte';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { File as FileIcon, X } from '@lucide/svelte';
	import { ChatForm } from '$lib/components/app';
	import { Button } from '$lib/components/ui/button';
	import { SETTINGS_KEYS } from '$lib/constants';
	import { useDraftMessages } from '$lib/hooks/use-draft-messages.svelte';
	import {
		appendConvertitodoReferences,
		type ConvertitodoFileReference
	} from '$lib/services/convertitodo-files.service';
	import { deviceStore, mcpStore, settingsStore } from '$lib/stores';
	import type { MCPServerSettingsEntry } from '$lib/types';
	import { hapticTap } from '$lib/utils';
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		class?: string;
		disabled?: boolean;
		isLoading?: boolean;
		message?: string;
		onFileRemove?: (fileId: string) => void;
		onFileUpload?: (files: File[]) => void;
		onSend?: (message: string, files?: ChatUploadedFile[]) => Promise<boolean>;
		onStop?: () => void;
		onSystemPromptAdd?: (draft: { message: string; files: ChatUploadedFile[] }) => void;
		uploadedFiles?: ChatUploadedFile[];
	}

	let {
		class: className,
		disabled = false,
		isLoading = false,
		message = $bindable(''),
		onFileRemove,
		onFileUpload,
		onSend,
		onStop,
		onSystemPromptAdd,
		uploadedFiles = $bindable([])
	}: Props = $props();

	let chatFormRef: ChatForm | undefined = $state(undefined);
	let convertitodoUpload: ChatFormConvertitodoUpload | undefined = $state();
	let convertitodoFiles = $state<ConvertitodoFileReference[]>([]);
	let pinnedServer = $state<{ id: string; url: string }>();
	let isSending = $state(false);
	let composerVersion = 0;

	let formWrapperEl: HTMLDivElement | undefined = $state();
	let chatId = $derived(page.params.id as string | undefined);

	$effect(() => {
		if (!formWrapperEl) return;

		const formEl = formWrapperEl.querySelector('form') as HTMLElement | null;

		if (!formEl) return;

		const updateHeight = () => {
			const height = Math.round(formEl.getBoundingClientRect().height);

			document.documentElement.style.setProperty('--chat-form-height', `${height}px`);
		};

		updateHeight();

		const resizeObserver = new ResizeObserver(updateHeight);

		resizeObserver.observe(formEl);

		return () => {
			resizeObserver.disconnect();
			document.documentElement.style.removeProperty('--chat-form-height');
		};
	});
	let hasLoadingAttachments = $derived(uploadedFiles.some((f) => f.isLoading));
	let previousIsLoading = $derived(isLoading);

	const { clearDraft } = useDraftMessages({
		getChatId: () => chatId,
		getFiles: () => uploadedFiles,
		getMessage: () => message,
		setFiles: (f) => (uploadedFiles = f),
		setMessage: (m) => (message = m)
	});

	function handleFilesAdd(files: File[]) {
		onFileUpload?.(files);
	}

	function attachConvertitodoFile(file: ConvertitodoFileReference, server: MCPServerSettingsEntry) {
		pinnedServer = { id: server.id, url: server.url };
		if (!convertitodoFiles.some((existing) => existing.id === file.id)) {
			convertitodoFiles = [...convertitodoFiles, file];
		}
	}

	function removeConvertitodoFile(id: string) {
		convertitodoFiles = convertitodoFiles.filter((file) => file.id !== id);
		if (!convertitodoFiles.length) pinnedServer = undefined;
	}

	async function handleSubmit() {
		if (
			(!message.trim() && !uploadedFiles.length && !convertitodoFiles.length) ||
			disabled ||
			isSending ||
			hasLoadingAttachments
		) {
			return;
		}

		if (pinnedServer) {
			const server = mcpStore.getServerById(pinnedServer.id);
			if (!server?.enabled || server.url !== pinnedServer.url) {
				toast.error(
					'El servidor ConvertiTodo del adjunto cambió. Quitá los adjuntos y volvé a subirlos.'
				);
				return;
			}
		}

		if (!chatFormRef?.checkModelSelected()) return;

		// the message goes: a phone confirms it by feel. Before any await, so it still runs inside
		// the tap or keypress that sent it, which iOS needs to play the tick
		hapticTap();

		const messageToSend = message.trim();
		const filesToSend = [...uploadedFiles];
		const referencesToSend = [...convertitodoFiles];
		const serverForReferences = pinnedServer;
		const version = composerVersion;

		convertitodoUpload?.close();
		message = '';
		uploadedFiles = [];
		convertitodoFiles = [];
		pinnedServer = undefined;
		isSending = true;
		clearDraft();

		// called in the same task: the page still sees the form as it was sent (expanded or not)
		let success = false;
		try {
			success =
				(await onSend?.(
					appendConvertitodoReferences(messageToSend, referencesToSend),
					filesToSend
				)) ?? false;
		} finally {
			isSending = false;
			if (!success && version === composerVersion) {
				message = messageToSend;
				uploadedFiles = filesToSend;
				convertitodoFiles = referencesToSend;
				pinnedServer = serverForReferences;
				await tick();
				chatFormRef?.expandForMessage();
			}
		}
	}

	function handleSystemPromptClick() {
		onSystemPromptAdd?.({ files: uploadedFiles, message });
	}

	function handleUploadedFileRemove(fileId: string) {
		onFileRemove?.(fileId);
	}

	export function openWorkingDirectoryPicker() {
		chatFormRef?.openWorkingDirectoryPicker();
	}

	// Auto-focus must not steal focus already claimed elsewhere (e.g. the system
	// message editor opened just before a navigation)
	function focusFormUnlessCaptured() {
		const active = document.activeElement;

		if (active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement) return;

		chatFormRef?.focus();
	}

	onMount(() => {
		if (!deviceStore.isMobile) {
			setTimeout(focusFormUnlessCaptured, 100);
		}
	});

	beforeNavigate((navigation) => {
		if (navigation.from?.url.pathname !== navigation.to?.url.pathname) {
			convertitodoUpload?.close();
		}
	});

	afterNavigate((navigation) => {
		if (navigation?.from?.url.pathname !== navigation?.to?.url.pathname) {
			composerVersion++;
			convertitodoFiles = [];
			pinnedServer = undefined;
		}
		if (navigation?.from != null && !deviceStore.isMobile) {
			setTimeout(focusFormUnlessCaptured, 100);
		}
	});

	$effect(() => {
		if (previousIsLoading && !isLoading) {
			setTimeout(focusFormUnlessCaptured, 10);
		}

		previousIsLoading = isLoading;
	});
</script>

<div bind:this={formWrapperEl} class="chat-screen-form-wrapper">
	<ChatForm
		bind:this={chatFormRef}
		bind:uploadedFiles
		bind:value={message}
		class="mx-auto max-w-3xl {className}"
		{disabled}
		expandable
		hasConvertitodoAttachments={convertitodoFiles.length > 0}
		{isLoading}
		onConvertitodoUpload={isSending ? undefined : () => convertitodoUpload?.show()}
		onFilesAdd={handleFilesAdd}
		{onStop}
		onSubmit={handleSubmit}
		onSystemPromptClick={handleSystemPromptClick}
		onUploadedFileRemove={handleUploadedFileRemove}
		singleRow={settingsStore.config[SETTINGS_KEYS.SINGLE_ROW_CHAT_FORM] !== false}
	>
		{#snippet convertitodoAttachments()}
			{#if convertitodoFiles.length > 0}
				<ul aria-label="Adjuntos de ConvertiTodo" class="flex flex-wrap gap-2 px-4 pt-3">
					{#each convertitodoFiles as file (file.id)}
						<li class="flex min-w-0 items-center gap-2 rounded-md border pl-2 text-sm">
							<FileIcon aria-hidden="true" class="size-4 shrink-0" />
							<span class="truncate" title={file.nombre}>{file.nombre} · ConvertiTodo</span>
							<Button
								aria-label={`Quitar ${file.nombre}`}
								onclick={() => removeConvertitodoFile(file.id)}
								size="sm"
								variant="ghost"
							>
								<X />
							</Button>
						</li>
					{/each}
				</ul>
			{/if}
		{/snippet}
	</ChatForm>
</div>

<ChatFormConvertitodoUpload
	bind:this={convertitodoUpload}
	disabled={disabled || isSending}
	onAttach={attachConvertitodoFile}
	{pinnedServer}
/>
