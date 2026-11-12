import { Compass, Eye, EyeOff, Heart, HeartOff, Trash2 } from '@lucide/svelte';
import { MODEL_DOWNLOAD_ICONS } from '$lib/constants';
import { ModelRowDownloadState } from '$lib/enums';
import { modelsStore, uiStore } from '$lib/stores';
import type { MenuAction } from '$lib/types';
import type { ModelOption } from '$lib/types/models';
import { repoOf } from '$lib/utils';

export function modelRowActions(
	option: ModelOption,
	favorite: boolean,
	isHidden: boolean,
	onDelete: (option: ModelOption) => void,
	/** Download state, when the row stands for a tracked download. */
	download?: ModelRowDownloadState | null
): MenuAction[] {
	// the details pane is keyed by repo, not by `<repo>:<quant>`; the entry exists only
	// while Discover is on
	const viewInDiscover = uiStore.isDiscoverEnabled
		? [
				{
					icon: Compass,
					label: 'Ver en Descubrir',
					onclick: () => uiStore.openModelsDiscover(repoOf(option.model)),
					separator: true
				}
			]
		: [];

	// a tracked download is paused, resumed or dropped: it is not loaded, hidden or
	// drafted. An in-flight row cancels, which stops the download and removes the
	// partial files; a paused one deletes, which removes the partials from disk
	if (download) {
		const isPaused = download === ModelRowDownloadState.PAUSED;

		return [
			{
				icon: isPaused ? MODEL_DOWNLOAD_ICONS.resume : MODEL_DOWNLOAD_ICONS.pause,
				label: isPaused ? 'Reanudar descarga' : 'Pausar descarga',
				onclick: () => void modelsStore.status.toggleDownload(option.model)
			},
			{
				icon: Trash2,
				label: isPaused ? 'Eliminar del disco' : 'Cancelar descarga',
				onclick: () => onDelete(option),
				separator: true,
				variant: 'destructive' as const
			},
			...viewInDiscover
		];
	}

	// a model the router did not take from its HF cache is not its own to delete
	const removeBlockedReason = modelsStore.removeBlockedReason(option.model);

	return [
		{
			icon: favorite ? HeartOff : Heart,
			label: favorite ? 'Quitar de favoritos' : 'Agregar a favoritos',
			onclick: () => modelsStore.toggleFavorite(option.model)
		},
		{
			disabled: removeBlockedReason !== null,
			icon: Trash2,
			label: 'Eliminar del disco',
			onclick: () => onDelete(option),
			separator: true,
			tooltip: removeBlockedReason ?? undefined,
			variant: 'destructive' as const
		},
		{
			icon: isHidden ? Eye : EyeOff,
			label: isHidden ? 'Mostrar modelo' : 'Ocultar modelo',
			onclick: () => modelsStore.toggleHidden(option.id),
			separator: true
		},
		...viewInDiscover
	];
}
