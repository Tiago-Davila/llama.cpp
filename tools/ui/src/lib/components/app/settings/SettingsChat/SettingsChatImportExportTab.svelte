<script lang="ts">
	import SettingsChatImportExportSection from './SettingsChatImportExportSection.svelte';
	import { Download, Trash2, Upload } from '@lucide/svelte';
	import {
		DialogConfirmation,
		DialogConversationSelection,
		DialogExportSettings
	} from '$lib/components/app';
	import SettingsGroup from '$lib/components/app/settings/SettingsGroup.svelte';
	import { ConversationSelectionMode, FileExtensionText, HtmlInputType } from '$lib/enums';
	import { ConversationTransferService } from '$lib/services';
	import { conversationsStore, groupsStore, settingsStore } from '$lib/stores';
	import { createMessageCountMap } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { toast } from 'svelte-sonner';

	let exportedConversations = $state<DatabaseConversation[]>([]);
	let importedConversations = $state<DatabaseConversation[]>([]);
	let showExportSummary = $state(false);
	let showImportSummary = $state(false);

	let showExportDialog = $state(false);
	let showImportDialog = $state(false);
	let availableConversations = $state<DatabaseConversation[]>([]);
	let messageCountMap = $state<Map<string, number>>(new Map());
	let fullImportData = $state<Array<{ conv: DatabaseConversation; messages: DatabaseMessage[] }>>(
		[]
	);

	// Delete functionality state
	let showDeleteDialog = $state(false);

	// Settings import/export state
	let showSettingsExportSummary = $state(false);
	let showSettingsImportSummary = $state(false);
	let showSettingsExportDialog = $state(false);
	let includeSensitiveData = $state(false);

	function handleSettingsExport() {
		showSettingsExportDialog = true;
		includeSensitiveData = false;
	}

	function handleSettingsExportConfirm() {
		showSettingsExportDialog = false;

		try {
			const data = settingsStore.exportSettings(includeSensitiveData);
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `llama_settings_${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			showSettingsExportSummary = true;
			showSettingsImportSummary = false;
			toast.success('Configuración exportada');
		} catch (err) {
			console.error('Failed to export settings:', err);
			toast.error('No se pudo exportar la configuración');
		}
	}

	function handleSettingsExportCancel() {
		showSettingsExportDialog = false;
	}

	function handleSettingsImport() {
		try {
			const input = document.createElement('input');

			input.type = HtmlInputType.FILE;
			input.accept = FileExtensionText.JSON;

			input.onchange = async (e) => {
				const file = (e.target as HTMLInputElement)?.files?.[0];

				if (!file) return;

				try {
					const text = await file.text();
					const data = JSON.parse(text);

					if (!data || typeof data !== 'object' || !data.config) {
						toast.error('Archivo de configuración inválido: falta la configuración');

						return;
					}

					settingsStore.importSettings(data);

					showSettingsImportSummary = true;
					showSettingsExportSummary = false;
					toast.success('Configuración importada');
				} catch (err) {
					console.error('Failed to import settings:', err);
					toast.error('No se pudo importar la configuración');
				}
			};

			input.click();
		} catch (err) {
			console.error('Failed to open file picker:', err);
			toast.error('No se pudo abrir el selector de archivos');
		}
	}

	async function handleExportClick() {
		try {
			const allConversations = conversationsStore.conversations;

			if (allConversations.length === 0) {
				toast.info('No hay conversaciones para exportar');

				return;
			}

			const conversationsWithMessages = await Promise.all(
				allConversations.map(async (conv: DatabaseConversation) => {
					const messages = await conversationsStore.getConversationMessages(conv.id);

					return { conv, messages };
				})
			);

			messageCountMap = createMessageCountMap(conversationsWithMessages);
			availableConversations = allConversations;
			showExportDialog = true;
		} catch (err) {
			console.error('Failed to load conversations:', err);
			alert('No se pudieron cargar las conversaciones');
		}
	}

	async function handleExportConfirm(selectedConversations: DatabaseConversation[]) {
		try {
			const allData = await conversationsStore.getConversationsForExport(
				selectedConversations.map((conv) => conv.id)
			);

			if (allData.length === 1) {
				ConversationTransferService.downloadConversationFile(allData[0]);
			} else {
				ConversationTransferService.downloadConversationsArchive(allData);
			}

			exportedConversations = selectedConversations;
			showExportSummary = true;
			showImportSummary = false;
			showExportDialog = false;
		} catch (err) {
			console.error('Export failed:', err);
			alert('No se pudieron exportar las conversaciones');
		}
	}

	async function handleImportClick() {
		try {
			const input = document.createElement('input');

			// No `accept` filter: iOS resolves each entry to a UTI and has none for
			// `.jsonl`, which greys out exported conversations in the file picker.
			// `parseImportFile` detects the format from the file contents instead.
			input.type = HtmlInputType.FILE;

			input.onchange = async (e) => {
				const file = (e.target as HTMLInputElement)?.files?.[0];

				if (!file) return;

				try {
					const importedData = await ConversationTransferService.parseImportFile(file);

					if (importedData.length === 0) {
						throw new Error('No se encontraron conversaciones en el archivo');
					}

					fullImportData = importedData;
					availableConversations = importedData.map((item) => item.conv);
					messageCountMap = createMessageCountMap(importedData);
					showImportDialog = true;
				} catch (err: unknown) {
					const message = err instanceof Error ? err.message : 'Error desconocido';

					console.error('Failed to parse file:', err);
					alert(`No se pudo leer el archivo: ${message}`);
				}
			};

			input.click();
		} catch (err) {
			console.error('Import failed:', err);
			alert('No se pudieron importar las conversaciones');
		}
	}

	async function handleImportConfirm(selectedConversations: DatabaseConversation[]) {
		try {
			const selectedIds = new Set(selectedConversations.map((c) => c.id));
			const selectedData = $state
				.snapshot(fullImportData)
				.filter((item) => selectedIds.has(item.conv.id));
			const { imported, skipped } = await conversationsStore.importConversationsData(selectedData);

			// an import can add the groups its chats were in
			await groupsStore.reload();

			// A conversation already in the database is left untouched, so the summary
			// lists what was written and the toast accounts for the rest.
			if (skipped.length > 0) {
				toast.info(
					`Se omitieron ${skipped.length} ${skipped.length === 1 ? 'conversación' : 'conversaciones'} que ya tenías`
				);
			}

			importedConversations = imported;
			showImportSummary = true;
			showExportSummary = false;
			showImportDialog = false;
		} catch (err) {
			console.error('Import failed:', err);
			alert('No se pudieron importar las conversaciones. Revisá el formato del archivo.');
		}
	}

	async function handleDeleteAllClick() {
		try {
			const allConversations = conversationsStore.conversations;

			if (allConversations.length === 0) {
				toast.info('No hay conversaciones para eliminar');

				return;
			}

			showDeleteDialog = true;
		} catch (err) {
			console.error('Failed to load conversations for deletion:', err);
			toast.error('No se pudieron cargar las conversaciones');
		}
	}

	async function handleDeleteAllConfirm() {
		try {
			await conversationsStore.deleteAll();

			showDeleteDialog = false;
		} catch (err) {
			console.error('Failed to delete conversations:', err);
		}
	}

	function handleDeleteAllCancel() {
		showDeleteDialog = false;
	}
</script>

<div in:fade={{ duration: 150 }} class="space-y-12">
	<SettingsGroup title="Conversaciones">
		<SettingsChatImportExportSection
			IconComponent={Download}
			buttonText="Export conversations"
			description="Descargá tus conversaciones como un ZIP de archivos JSONL. Incluye todos los mensajes, adjuntos e historial."
			onclick={handleExportClick}
			summary={{ items: exportedConversations, show: showExportSummary, verb: 'Exportadas' }}
			title="Exportar"
		/>

		<SettingsChatImportExportSection
			IconComponent={Upload}
			buttonText="Import conversations"
			description="Importá una o más conversaciones desde un ZIP o JSONL exportado. Se sumarán a tus conversaciones actuales."
			onclick={handleImportClick}
			summary={{ items: importedConversations, show: showImportSummary, verb: 'Importadas' }}
			title="Importar"
		/>

		<SettingsChatImportExportSection
			IconComponent={Trash2}
			buttonClass="text-destructive-foreground justify-start justify-self-start bg-destructive hover:bg-destructive/80 md:w-auto"
			buttonText="Eliminar todas las conversaciones"
			buttonVariant="destructive"
			description="Eliminar de forma permanente todas las conversaciones y sus mensajes. Esta acción no se puede deshacer. Si querés un respaldo, exportalas primero."
			onclick={handleDeleteAllClick}
			title="Eliminar todo"
			titleClass="text-destructive"
		/>
	</SettingsGroup>

	<SettingsGroup title="Configuración">
		<SettingsChatImportExportSection
			IconComponent={Download}
			buttonText="Export settings"
			description="Exportá tu configuración y preferencias como un archivo JSON."
			onclick={handleSettingsExport}
			summary={{ items: [], show: showSettingsExportSummary, verb: 'Exportadas' }}
			title="Exportar"
		/>

		<SettingsChatImportExportSection
			IconComponent={Upload}
			buttonText="Import settings"
			description="Importá la configuración desde un JSON exportado. Se combinará con tu configuración actual."
			onclick={handleSettingsImport}
			summary={{ items: [], show: showSettingsImportSummary, verb: 'Importadas' }}
			title="Importar"
		/>
	</SettingsGroup>
</div>

<DialogExportSettings
	bind:includeSensitiveData
	bind:open={showSettingsExportDialog}
	onCancel={handleSettingsExportCancel}
	onConfirm={handleSettingsExportConfirm}
/>

<DialogConversationSelection
	bind:open={showExportDialog}
	conversations={availableConversations}
	{messageCountMap}
	mode={ConversationSelectionMode.EXPORT}
	onCancel={() => (showExportDialog = false)}
	onConfirm={handleExportConfirm}
/>

<DialogConversationSelection
	bind:open={showImportDialog}
	conversations={availableConversations}
	{messageCountMap}
	mode={ConversationSelectionMode.IMPORT}
	onCancel={() => (showImportDialog = false)}
	onConfirm={handleImportConfirm}
/>

<DialogConfirmation
	bind:open={showDeleteDialog}
	cancelText="Cancelar"
	confirmText="Eliminar todo"
	description="¿Seguro que querés eliminar todas las conversaciones? Esta acción no se puede deshacer y borrará todas tus conversaciones y mensajes."
	icon={Trash2}
	onCancel={handleDeleteAllCancel}
	onConfirm={handleDeleteAllConfirm}
	title="Eliminar todas las conversaciones"
	variant="destructive"
/>
