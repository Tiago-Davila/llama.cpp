<script lang="ts">
	import type { ConvertitodoGeneratedFile } from './parsers/convertitodo-files';
	import { Download, File, Loader2 } from '@lucide/svelte';
	import { onDestroy } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { downloadConvertitodoFile } from '$lib/services/convertitodo-files.service';
	import type { MCPServerConfig } from '$lib/types/mcp';

	interface Props {
		file: ConvertitodoGeneratedFile;
		server: MCPServerConfig;
	}

	let { file, server }: Props = $props();
	let downloading = $state(false);
	let failed = $state(false);
	let controller: AbortController | undefined;

	onDestroy(() => controller?.abort());

	async function download() {
		if (downloading) return;

		const { id, nombre } = file;
		controller = new AbortController();
		const { signal } = controller;
		downloading = true;
		failed = false;

		try {
			const blob = await downloadConvertitodoFile(server, id, signal);
			if (signal.aborted) return;

			const link = document.createElement('a');
			const objectUrl = URL.createObjectURL(blob);

			try {
				link.href = objectUrl;
				link.download = nombre;
				document.body.append(link);
				link.click();
			} finally {
				link.remove();
				setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
			}
		} catch {
			if (!signal.aborted) failed = true;
		} finally {
			controller = undefined;
			downloading = false;
		}
	}
</script>

<div class="rounded-lg border bg-card p-3 text-card-foreground">
	<div class="flex items-center gap-2">
		<File aria-hidden="true" class="size-4 shrink-0 text-muted-foreground" />
		<bdi class="min-w-0 flex-1 text-sm break-all">{file.nombre}</bdi>
		<Button
			aria-busy={downloading}
			aria-label={`Descargar ${file.nombre}`}
			disabled={downloading}
			onclick={download}
			size="sm"
			type="button"
			variant="outline"
		>
			{#if downloading}
				<Loader2 aria-hidden="true" class="size-4 animate-spin" />
				Descargando...
			{:else}
				<Download aria-hidden="true" class="size-4" />
				Descargar
			{/if}
		</Button>
	</div>
	{#if failed}
		<p class="mt-2 text-sm text-destructive" role="alert">No se pudo descargar el archivo.</p>
	{/if}
</div>
