<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { HealthCheckStatus } from '$lib/enums';
	import {
		getConvertitodoFileServer,
		uploadConvertitodoFile,
		type ConvertitodoFileReference
	} from '$lib/services/convertitodo-files.service';
	import { mcpStore } from '$lib/stores';
	import type { MCPServerSettingsEntry } from '$lib/types';
	import { onDestroy } from 'svelte';

	interface Props {
		disabled: boolean;
		onAttach: (reference: ConvertitodoFileReference, server: MCPServerSettingsEntry) => void;
		pinnedServer?: { id: string; url: string };
	}

	let { disabled, onAttach, pinnedServer }: Props = $props();
	let open = $state(false);
	let serverId = $state('');
	let file = $state<File>();
	let upload = $state<AbortController>();
	let error = $state('');

	let servers = $derived(
		mcpStore.getServers().filter((server) => {
			if (!server.enabled) return false;
			if (pinnedServer && (server.id !== pinnedServer.id || server.url !== pinnedServer.url))
				return false;

			const health = mcpStore.getHealthCheckState(server.id);
			const info =
				mcpStore.getExistingConnection(server.id)?.serverInfo ??
				(health.status === HealthCheckStatus.SUCCESS ? health.serverInfo : undefined);

			return info?.name === 'ConvertiTodo';
		})
	);
	let selectedServer = $derived(servers.find((server) => server.id === serverId));

	export function show() {
		if (!disabled) open = true;
	}

	export function close() {
		upload?.abort();
		upload = undefined;
		open = false;
		serverId = '';
		file = undefined;
		error = '';
	}

	onDestroy(close);

	async function attach() {
		const server = selectedServer;
		if (!server || !file || upload || disabled) return;

		const controller = new AbortController();
		upload = controller;
		error = '';

		try {
			const reference = await uploadConvertitodoFile(
				getConvertitodoFileServer(server),
				file,
				controller.signal
			);
			if (controller.signal.aborted) return;
			const current = selectedServer;
			if (
				disabled ||
				!current ||
				current.id !== server.id ||
				current.url !== server.url ||
				current.headers !== server.headers ||
				current.useProxy !== server.useProxy
			) {
				error = 'Cambió la configuración del adjunto. Volvé a seleccionar el servidor.';
				return;
			}
			onAttach(reference, server);
			close();
		} catch (cause) {
			if (!controller.signal.aborted) {
				error = cause instanceof Error ? cause.message : 'No se pudo subir el archivo.';
			}
		} finally {
			if (upload === controller) upload = undefined;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={(value) => !value && close()}>
	<Dialog.Content class="flex flex-col md:w-md">
		<Dialog.Header>
			<Dialog.Title>Adjuntar a ConvertiTodo</Dialog.Title>
			<Dialog.Description>
				El archivo se sube al servidor MCP que elijas. El mensaje solo incluye su ID y su nombre.
			</Dialog.Description>
		</Dialog.Header>

		{#if servers.length > 0}
			<label class="grid gap-1 text-sm">
				Servidor MCP de destino
				<select
					bind:value={serverId}
					class="min-w-0 rounded-md border bg-background p-2"
					disabled={!!upload}
				>
					<option value="">Seleccioná un servidor</option>
					{#each servers as server (server.id)}
						<option value={server.id}>{mcpStore.getServerLabel(server)} ({server.url})</option>
					{/each}
				</select>
			</label>
			<label class="grid gap-1 text-sm">
				Archivo
				<input
					class="w-full rounded-md border p-2"
					disabled={!selectedServer || !!upload}
					onchange={(event) => {
						file = event.currentTarget.files?.[0];
						error = '';
					}}
					type="file"
				/>
			</label>
		{:else}
			<p class="text-sm text-muted-foreground">
				No hay un servidor ConvertiTodo disponible. Agregalo, habilitalo y verificá la conexión en
				Servidores MCP.
			</p>
		{/if}
		{#if error}<p class="text-sm text-destructive" role="alert">{error}</p>{/if}
		{#if upload}<p class="text-sm" role="status">Subiendo a ConvertiTodo...</p>{/if}

		<Dialog.Footer>
			<Button onclick={close} variant="outline">Cancelar</Button>
			<Button disabled={disabled || !selectedServer || !file || !!upload} onclick={attach}>
				Subir archivo
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
