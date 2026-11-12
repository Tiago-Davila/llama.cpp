import { FILE_TYPE_ICONS } from '$lib/constants';
import { AttachmentAction, AttachmentItemEnabledWhen, AttachmentMenuItemId } from '$lib/enums';
import type { AttachmentMenuItem } from '$lib/types';

/**
 * File attachment menu items shown in both the desktop dropdown and mobile sheet.
 * The "Tools" submenu is handled separately by each component.
 */
export const ATTACHMENT_FILE_ITEMS: AttachmentMenuItem[] = [
	{
		action: AttachmentAction.FILE_UPLOAD,
		class: 'images-button',
		disabledTooltip: 'Procesar imágenes requiere un modelo con visión',
		enabledWhen: AttachmentItemEnabledWhen.HAS_VISION_MODALITY,
		icon: FILE_TYPE_ICONS.image,
		id: AttachmentMenuItemId.IMAGES,
		label: 'Imágenes'
	},
	{
		action: AttachmentAction.FILE_UPLOAD,
		class: 'audio-button',
		disabledTooltip: 'Procesar audio requiere un modelo con audio',
		enabledWhen: AttachmentItemEnabledWhen.HAS_AUDIO_MODALITY,
		icon: FILE_TYPE_ICONS.audio,
		id: AttachmentMenuItemId.AUDIO,
		label: 'Archivos de audio'
	},
	{
		action: AttachmentAction.FILE_UPLOAD,
		class: 'video-button',
		disabledTooltip: 'Procesar video requiere un modelo con video',
		enabledWhen: AttachmentItemEnabledWhen.HAS_VIDEO_MODALITY,
		icon: FILE_TYPE_ICONS.video,
		id: AttachmentMenuItemId.VIDEO,
		label: 'Archivos de video'
	},
	{
		action: AttachmentAction.FILE_UPLOAD,
		enabledWhen: AttachmentItemEnabledWhen.ALWAYS,
		icon: FILE_TYPE_ICONS.text,
		id: AttachmentMenuItemId.TEXT,
		label: 'Archivos de texto'
	},
	{
		action: AttachmentAction.FILE_UPLOAD,
		disabledTooltip: 'Los PDF se convierten a texto. Los PDF escaneados pueden no funcionar bien.',
		enabledWhen: AttachmentItemEnabledWhen.ALWAYS,
		hasEnabledTooltip: true,
		icon: FILE_TYPE_ICONS.pdf,
		id: AttachmentMenuItemId.PDF,
		label: 'Archivos PDF'
	}
];

export const ATTACHMENT_TOOLTIP_TEXT = 'Add files, prompts, tools or MCP Servers';

/** Text shared by the add menu's two surfaces: the desktop dropdown and the mobile drawer. */
export const ATTACHMENT_MENU_TEXT = {
	ADD_FILES: 'Agregar archivos',
	ADD_TO_CHAT: 'Agregar al chat',
	DESCRIPTION: 'Agregá archivos, un mensaje del sistema o elegí las herramientas que puede usar el modelo',
	SYSTEM_MESSAGE: 'Mensaje del sistema',
	TOOLS: 'Tools'
} as const;

/** Modality labels behind the file-upload row's enabled-when flags, both surfaces. */
export const ATTACHMENT_MODALITY_TEXT: Record<AttachmentItemEnabledWhen, string> = {
	[AttachmentItemEnabledWhen.ALWAYS]: '',
	[AttachmentItemEnabledWhen.HAS_AUDIO_MODALITY]: 'Audio',
	[AttachmentItemEnabledWhen.HAS_VIDEO_MODALITY]: 'Video',
	[AttachmentItemEnabledWhen.HAS_VISION_MODALITY]: 'Vision'
};
