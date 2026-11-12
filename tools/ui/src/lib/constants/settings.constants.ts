import { DEFAULT_AGENTIC_CONFIG } from './agentic.constants';
import { CLI_FLAGS } from './cli-flags.constants';
import { COMPACTION } from './compaction.constants';
import { DEFAULT_MCP_CONFIG } from './mcp.constants';
import { SETTINGS_KEYS } from './settings-keys.constants';
import { TITLE_GENERATION } from './title-generation.constants';
import { FILE_GLOB_SEARCH_PICKERS } from './working-directory.constants';
import {
	Code,
	Database,
	Funnel,
	ListRestart,
	Monitor,
	Moon,
	PencilRuler,
	SlidersVertical
} from '@lucide/svelte';
import { SyncableParameterType } from '$lib/enums';
import { SettingsFieldType } from '$lib/enums/settings.enums';
import { ColorMode } from '$lib/enums/ui.enums';
import type {
	SettingsConfigValue,
	SettingsEntry,
	SettingsFieldConfig,
	SettingsSection,
	SettingsSectionEntry
} from '$lib/types';

/** Settings sections — slug is the routing identity, title is the display label. */
export const SETTINGS_SECTIONS = {
	AGENTIC: { slug: 'agentic', title: 'Agéntico' },
	DEVELOPER: { slug: 'developer', title: 'Desarrollador' },
	DISPLAY: { slug: 'display', title: 'Visualización' },
	GENERAL: { slug: 'general', title: 'General' },
	IMPORT_EXPORT: { slug: 'import-export', title: 'Importar/Exportar' },
	SAMPLING_PENALTIES: { slug: 'sampling-penalties', title: 'Muestreo y penalizaciones' },
	TOOLS: { slug: 'tools', title: 'Herramientas' }
} as const;

export const SETTINGS_SECTION_SLUGS = {
	AGENTIC: SETTINGS_SECTIONS.AGENTIC.slug,
	DEVELOPER: SETTINGS_SECTIONS.DEVELOPER.slug,
	DISPLAY: SETTINGS_SECTIONS.DISPLAY.slug,
	GENERAL: SETTINGS_SECTIONS.GENERAL.slug,
	IMPORT_EXPORT: SETTINGS_SECTIONS.IMPORT_EXPORT.slug,
	SAMPLING_PENALTIES: SETTINGS_SECTIONS.SAMPLING_PENALTIES.slug,
	TOOLS: SETTINGS_SECTIONS.TOOLS.slug
} as const;

export const SETTINGS_SECTION_TITLES = {
	AGENTIC: SETTINGS_SECTIONS.AGENTIC.title,
	DEVELOPER: SETTINGS_SECTIONS.DEVELOPER.title,
	DISPLAY: SETTINGS_SECTIONS.DISPLAY.title,
	GENERAL: SETTINGS_SECTIONS.GENERAL.title,
	IMPORT_EXPORT: SETTINGS_SECTIONS.IMPORT_EXPORT.title,
	SAMPLING_PENALTIES: SETTINGS_SECTIONS.SAMPLING_PENALTIES.title,
	TOOLS: SETTINGS_SECTIONS.TOOLS.title
} as const;

export const SETTINGS_REGISTRY: SettingsSectionEntry[] = [
	// General
	{
		icon: SlidersVertical,
		settings: [
			{
				defaultValue: ColorMode.DARK,
				help: 'Tema de color de la interfaz. FerroviasIA usa el tema corporativo oscuro.',
				key: SETTINGS_KEYS.THEME,
				label: 'Tema',
				options: [{ icon: Moon, label: 'Oscuro (corporativo)', value: ColorMode.DARK }],
				type: SettingsFieldType.SELECT
			},
			{
				defaultValue: '',
				help: `Configurá la clave de API si el servidor usa la opción <code> ${CLI_FLAGS.API_KEY} </code>.`,
				isPrivate: true,
				key: SETTINGS_KEYS.API_KEY,
				label: 'Clave de API',
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: '',
				help: 'Mensaje inicial que define cómo debe comportarse el modelo.',
				key: SETTINGS_KEYS.SYSTEM_MESSAGE,
				label: 'Mensaje del sistema',
				type: SettingsFieldType.TEXTAREA
			},
			{
				defaultValue: true,
				help: 'Mostrar el mensaje del sistema al principio de cada conversación.',
				key: SETTINGS_KEYS.SHOW_SYSTEM_MESSAGE,
				label: 'Mostrar mensaje del sistema',
				standaloneField: false,
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: 2500,
				help: 'Al pegar un texto largo, se convierte en un archivo. Este valor define a partir de qué longitud. 0 lo desactiva.',
				key: SETTINGS_KEYS.PASTE_LONG_TEXT_TO_FILE_LEN,
				label: 'Longitud para convertir texto pegado en archivo',
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: true,
				help: 'Enter envía el mensaje y Shift + Enter o Ctrl/Cmd + Enter agregan una línea. Si está desactivado, y siempre en pantallas táctiles, Enter agrega una línea y Ctrl/Cmd + Enter envía.',
				key: SETTINGS_KEYS.SEND_ON_ENTER,
				label: 'Enviar mensaje con Enter',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Muestra el markdown del cuadro de mensaje mientras escribís: cada línea, salvo la actual, se ve como quedará en la conversación. Si está desactivado, se muestra el texto markdown plano.',
				key: SETTINGS_KEYS.LIVE_MARKDOWN_PREVIEW,
				label: 'Vista previa de markdown en el cuadro de mensaje',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Mostrar el botón de micrófono en lugar del de enviar cuando el cuadro está vacío, en modelos que admiten audio.',
				key: SETTINGS_KEYS.AUTO_MIC_ON_EMPTY,
				label: 'Mostrar micrófono con el cuadro vacío',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Habilitar el botón "Continuar" en los mensajes del asistente, incluidos los modelos de razonamiento.',
				isExperimental: true,
				key: SETTINGS_KEYS.ENABLE_CONTINUE_GENERATION,
				label: 'Habilitar botón "Continuar"',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Muestra la opción Descubrir modelos en la barra lateral para buscar y descargar modelos GGUF de HuggingFace. Activa la API de Hugging Face Hub mientras está habilitada. Solo disponible en modo router.',
				key: SETTINGS_KEYS.ENABLE_DISCOVER_MODELS,
				label: 'Habilitar Descubrir modelos',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Obtiene datos de visualización de modelos (avatares, longitud de contexto, plantilla de chat) y todo el contenido de Descubrir modelos desde la API de Hugging Face Hub. Queda activo mientras Descubrir modelos esté habilitado; se puede activar solo para los datos de visualización.',
				key: SETTINGS_KEYS.USE_HUGGING_FACE_HUB,
				label: 'Usar la API de Hugging Face Hub',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Elegí cómo se generan los títulos de las conversaciones. La primera línea no vacía usa una regla rápida; la opción LLM usa un título generado por el modelo a partir del primer intercambio.',
				key: SETTINGS_KEYS.TITLE_GENERATION_USE_FIRST_LINE,
				label: 'Título de la conversación',
				radioOptions: [
					{
						key: SETTINGS_KEYS.TITLE_GENERATION_USE_FIRST_LINE,
						label: 'Usar la primera línea no vacía como título',
						value: 'firstLine'
					},
					{
						isExperimental: true,
						key: SETTINGS_KEYS.TITLE_GENERATION_USE_LLM,
						label: 'Generar título con el LLM',
						value: 'llm'
					}
				],
				type: SettingsFieldType.RADIO
			},
			{
				defaultValue: TITLE_GENERATION.DEFAULT_PROMPT,
				dependsOn: SETTINGS_KEYS.TITLE_GENERATION_USE_LLM,
				help: 'Plantilla opcional para el prompt de generación de títulos. Usá {{USER}} para el mensaje del usuario y {{ASSISTANT}} para el del asistente.',
				key: SETTINGS_KEYS.TITLE_GENERATION_PROMPT,
				label: 'Prompt de generación de títulos',
				type: SettingsFieldType.TEXTAREA
			},
			{
				defaultValue: false,
				help: 'Counterpart of the conversation title radio; stored and synced without a dedicated UI field.',
				key: SETTINGS_KEYS.TITLE_GENERATION_USE_LLM,
				label: 'Generar título con el LLM',
				standaloneField: false,
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: COMPACTION.DEFAULT_PROMPT,
				help: 'Instrucción opcional que se envía al modelo al compactar una conversación.',
				key: SETTINGS_KEYS.COMPACTION_PROMPT,
				label: 'Prompt de compactación',
				type: SettingsFieldType.TEXTAREA
			},
			{
				defaultValue: COMPACTION.DEFAULT_PRESERVED_STEPS,
				help: 'Últimos pasos que la compactación conserva tal cual después del resumen: un mensaje del usuario o un mensaje del asistente con sus resultados de herramientas.',
				isPositiveInteger: true,
				key: SETTINGS_KEYS.COMPACTION_PRESERVED_STEPS,
				label: 'Pasos conservados al compactar',
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: false,
				help: 'Al copiar un mensaje con adjuntos de texto, unirlos en un solo texto plano en lugar de un formato especial que se puede volver a pegar como adjuntos.',
				key: SETTINGS_KEYS.COPY_TEXT_ATTACHMENTS_AS_PLAIN_TEXT,
				label: 'Copiar adjuntos de texto como texto plano',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Procesar los PDF como imagen en lugar de texto. En modelos sin visión se usa texto automáticamente.',
				key: SETTINGS_KEYS.PDF_AS_IMAGE,
				label: 'Procesar PDF como imagen',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: 0,
				help: 'Las imágenes más grandes se redimensionan antes de enviarse al servidor. 0 lo desactiva.',
				key: SETTINGS_KEYS.MAX_IMAGE_RESOLUTION,
				label: 'Resolución máxima de imagen (megapíxeles)',
				type: SettingsFieldType.INPUT
			}
		],
		slug: SETTINGS_SECTION_SLUGS.GENERAL,
		title: SETTINGS_SECTION_TITLES.GENERAL
	},
	// Display
	{
		icon: Monitor,
		settings: [
			{
				defaultValue: true,
				help: 'Mostrar estadísticas de generación (tokens/segundo, cantidad de tokens, duración) debajo de cada mensaje del asistente.',
				key: SETTINGS_KEYS.SHOW_MESSAGE_STATS,
				label: 'Mostrar estadísticas de generación',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				dependsOn: SETTINGS_KEYS.SHOW_MESSAGE_STATS,
				help: 'Mostrar estadísticas por turno (tokens, duración) en las respuestas agénticas. Solo se ven si "Mostrar estadísticas de generación" está activo.',
				key: SETTINGS_KEYS.SHOW_AGENTIC_TURN_STATS,
				label: 'Mostrar estadísticas por turno agéntico',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Expandir el razonamiento por defecto mientras se generan los mensajes.',
				key: SETTINGS_KEYS.SHOW_THOUGHT_IN_PROGRESS,
				label: 'Mostrar razonamiento en curso',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Expandir los detalles de la llamada a herramienta mientras se genera y ejecuta, y contraerlos al recibir el resultado. Igual que "Mostrar razonamiento en curso". Las llamadas que expandas o contraigas a mano conservan tu elección.',
				key: SETTINGS_KEYS.SHOW_TOOL_CALL_IN_PROGRESS,
				label: 'Mostrar llamada a herramienta en curso',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Mantener expandidos los detalles de la llamada a herramienta al terminar. Tiene prioridad sobre "Mostrar llamada a herramienta en curso", que solo cubre la ejecución.',
				key: SETTINGS_KEYS.ALWAYS_SHOW_TOOL_CALL_CONTENT,
				label: 'Mostrar siempre el contenido de las herramientas',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Mostrar los mensajes del usuario con formato markdown. Desactivalo para ver el mensaje tal como se escribió; las menciones con @ se muestran igual.',
				key: SETTINGS_KEYS.RENDER_USER_CONTENT_AS_MARKDOWN,
				label: 'Mostrar mensajes del usuario como Markdown',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Mostrar el bloque de razonamiento como Markdown con formato en lugar de texto plano.',
				key: SETTINGS_KEYS.RENDER_THINKING_AS_MARKDOWN,
				label: 'Mostrar razonamiento como Markdown',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Mostrar siempre los bloques de código con su altura completa, sin límites.',
				key: SETTINGS_KEYS.FULL_HEIGHT_CODE_BLOCKS,
				label: 'Bloques de código a altura completa',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Evita que la vista siga el contenido nuevo mientras llegan los mensajes, para que controles vos la posición.',
				key: SETTINGS_KEYS.DISABLE_AUTO_SCROLL,
				label: 'Desactivar desplazamiento automático',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'En escritorio, mantener un mensaje de una línea en la misma fila que el botón +, el selector de modelo y el botón de enviar. Una segunda línea, o una demasiado larga, vuelve al formulario de dos filas.',
				key: SETTINGS_KEYS.SINGLE_ROW_CHAT_FORM,
				label: 'Formulario de una fila para mensajes cortos',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Mantener siempre visible la barra lateral en escritorio en lugar de ocultarla.',
				key: SETTINGS_KEYS.ALWAYS_SHOW_SIDEBAR_ON_DESKTOP,
				label: 'Mostrar siempre la barra lateral en escritorio',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Mostrar los chats abiertos como pestañas sobre la conversación, una por chat. Si está desactivado, se muestra un chat a la vez.',
				key: SETTINGS_KEYS.CONVERSATION_TABS,
				label: 'Pestañas de conversación',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Mostrar el identificador completo del modelo (por ej. "ggml-org/GLM-4.7-Flash-GGUF:Q8_0") en lugar del nombre con etiquetas.',
				key: SETTINGS_KEYS.SHOW_RAW_MODEL_NAMES,
				label: 'Mostrar nombres de modelo sin procesar',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Mostrar etiquetas de cuantización (por ej. Q8_0, Q4_K_M) junto a los nombres de modelo.',
				key: SETTINGS_KEYS.SHOW_MODEL_QUANTIZATION,
				label: 'Mostrar cuantización del modelo',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Mostrar etiquetas del modelo (por ej. "vision", "reasoning") junto a los nombres de modelo.',
				key: SETTINGS_KEYS.SHOW_MODEL_TAGS,
				label: 'Mostrar etiquetas del modelo',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Mostrar los íconos de modalidades y capacidades (visión, audio, razonamiento, herramientas) en el selector de modelos.',
				key: SETTINGS_KEYS.SHOW_MODEL_CAPABILITIES_IN_SELECTOR,
				label: 'Mostrar modalidades y capacidades en el selector de modelos',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Mostrar el nombre de la organización junto al nombre del modelo en el selector.',
				key: SETTINGS_KEYS.SHOW_MODEL_ORG_NAME,
				label: 'Mostrar organización en el selector de modelos',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Mostrar la organización también en el celular, donde el selector es angosto. Solo aplica si la organización está visible.',
				key: SETTINGS_KEYS.SHOW_MODEL_ORG_NAME_ON_MOBILE,
				label: 'Mostrar organización en el celular',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Mostrar la versión actual en la esquina inferior derecha.',
				key: SETTINGS_KEYS.SHOW_BUILD_VERSION,
				label: 'Mostrar información de versión',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Mostrar la ruta completa en las menciones con @ de archivos y carpetas en lugar de solo el nombre.',
				key: SETTINGS_KEYS.SHOW_FULL_PATH_IN_MENTIONS,
				label: 'Mostrar ruta completa en menciones',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: true,
				help: 'Agrupar los modelos por familia (por ej. "Qwen") en el selector y el administrador de modelos. Desactivalo para listar cada modelo por separado.',
				key: SETTINGS_KEYS.GROUP_MODELS_BY_FAMILY,
				label: 'Agrupar modelos por familia',
				type: SettingsFieldType.CHECKBOX
			}
		],
		slug: SETTINGS_SECTION_SLUGS.DISPLAY,
		title: SETTINGS_SECTION_TITLES.DISPLAY
	},
	// MCP Servers (non-UI config object)
	{
		icon: PencilRuler,
		settings: [
			{
				defaultValue: '[]',
				help: 'Configurar los servidores MCP como una lista JSON. Usá el formulario de la sección Cliente MCP para editarlos.',
				key: SETTINGS_KEYS.MCP_SERVERS,
				label: 'Servidores MCP',
				standaloneField: false,
				type: SettingsFieldType.INPUT
			}
		],
		slug: SETTINGS_SECTION_SLUGS.TOOLS,
		title: SETTINGS_SECTION_TITLES.TOOLS
	},
	// Tools
	{
		icon: ListRestart,
		settings: [
			{
				defaultValue: DEFAULT_AGENTIC_CONFIG.maxTurns,
				help: 'Cantidad máxima de ciclos de herramientas antes de detenerse (evita bucles infinitos).',
				isPositiveInteger: true,
				key: SETTINGS_KEYS.AGENTIC_MAX_TURNS,
				label: 'Turnos agénticos',
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: DEFAULT_MCP_CONFIG.requestTimeoutSeconds,
				help: 'Tiempo de espera de cada llamada a herramienta MCP.',
				isPositiveInteger: true,
				key: SETTINGS_KEYS.MCP_REQUEST_TIMEOUT_SECONDS,
				label: 'Tiempo de espera MCP (segundos)',
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: FILE_GLOB_SEARCH_PICKERS.DEFAULT_SEARCH_DEPTH,
				help: 'Cuántos niveles de carpetas por debajo del directorio de trabajo recorre la búsqueda de archivos con @. Valores altos encuentran archivos más profundos pero tardan más.',
				isPositiveInteger: true,
				key: SETTINGS_KEYS.MENTION_SEARCH_MAX_DEPTH,
				label: 'Profundidad de búsqueda de menciones',
				max: FILE_GLOB_SEARCH_PICKERS.MAX_SEARCH_DEPTH,
				min: 1,
				placeholder: `${FILE_GLOB_SEARCH_PICKERS.DEFAULT_SEARCH_DEPTH}`,
				type: SettingsFieldType.INPUT
			}
		],
		slug: SETTINGS_SECTION_SLUGS.AGENTIC,
		title: SETTINGS_SECTION_TITLES.AGENTIC
	},
	// Import/Export
	{
		icon: Database,
		settings: [],
		slug: SETTINGS_SECTION_SLUGS.IMPORT_EXPORT,
		title: SETTINGS_SECTION_TITLES.IMPORT_EXPORT
	},
	// Sampling
	{
		icon: Funnel,
		settings: [
			{
				defaultValue: undefined,
				help: 'Controla la aleatoriedad del texto generado modificando la distribución de probabilidad de los tokens. Más alto = más aleatorio, más bajo = más enfocado.',
				key: SETTINGS_KEYS.TEMPERATURE,
				label: 'Temperatura',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.TEMPERATURE
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'Complemento del muestreador de temperatura. Valor que se suma al rango de temperatura dinámica, que ajusta las probabilidades según la entropía de los tokens.',
				key: SETTINGS_KEYS.DYNATEMP_RANGE,
				label: 'Rango de temperatura dinámica',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.DYNATEMP_RANGE
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'Complemento del muestreador de temperatura. Suaviza la redistribución de probabilidad según el token más probable.',
				key: SETTINGS_KEYS.DYNATEMP_EXPONENT,
				label: 'Exponente de temperatura dinámica',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.DYNATEMP_EXPONENT
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'Conserva solo los k tokens más probables.',
				key: SETTINGS_KEYS.TOP_K,
				label: 'Top K',
				sync: { paramType: SyncableParameterType.NUMBER, serverKey: SETTINGS_KEYS.TOP_K },
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'Limita los tokens a los que juntos suman una probabilidad acumulada de al menos p',
				key: SETTINGS_KEYS.TOP_P,
				label: 'Top P',
				sync: { paramType: SyncableParameterType.NUMBER, serverKey: SETTINGS_KEYS.TOP_P },
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'Limita los tokens según la probabilidad mínima para ser considerados, relativa a la del token más probable.',
				key: SETTINGS_KEYS.MIN_P,
				label: 'Min P',
				sync: { paramType: SyncableParameterType.NUMBER, serverKey: SETTINGS_KEYS.MIN_P },
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'El muestreador XTC elimina los tokens más probables; este parámetro controla la probabilidad de hacerlo. 0 desactiva XTC.',
				key: SETTINGS_KEYS.XTC_PROBABILITY,
				label: 'Probabilidad XTC',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.XTC_PROBABILITY
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'El muestreador XTC elimina los tokens más probables; este parámetro define la probabilidad mínima para eliminar un token.',
				key: SETTINGS_KEYS.XTC_THRESHOLD,
				label: 'Umbral XTC',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.XTC_THRESHOLD
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'Ordena y limita los tokens según la diferencia entre log-probabilidad y entropía.',
				key: SETTINGS_KEYS.TYP_P,
				label: 'Typical P',
				sync: { paramType: SyncableParameterType.NUMBER, serverKey: SETTINGS_KEYS.TYP_P },
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'Cantidad máxima de tokens por respuesta. -1 = sin límite.',
				key: SETTINGS_KEYS.MAX_TOKENS,
				label: 'Tokens máximos',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.MAX_TOKENS
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: '',
				help: 'Orden en que se aplican los muestreadores, en forma simplificada. Por defecto es "top_k;typ_p;top_p;min_p;temperature": top_k->typ_p->top_p->min_p->temperature',
				key: SETTINGS_KEYS.SAMPLERS,
				label: 'Muestreadores',
				sync: { paramType: SyncableParameterType.STRING, serverKey: SETTINGS_KEYS.SAMPLERS },
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: false,
				help: 'Habilita los muestreadores en el backend. Los compatibles se ejecutan en el acelerador para muestrear más rápido.',
				key: SETTINGS_KEYS.BACKEND_SAMPLING,
				label: 'Muestreo en el backend',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: undefined,
				help: 'Últimos n tokens a considerar para penalizar la repetición',
				key: SETTINGS_KEYS.REPEAT_LAST_N,
				label: 'Repetición últimos N',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.REPEAT_LAST_N
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'Controla la repetición de secuencias de tokens en el texto generado',
				key: SETTINGS_KEYS.REPEAT_PENALTY,
				label: 'Penalización por repetición',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.REPEAT_PENALTY
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'Limita los tokens según si ya aparecen en la respuesta o no.',
				key: SETTINGS_KEYS.PRESENCE_PENALTY,
				label: 'Penalización por presencia',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.PRESENCE_PENALTY
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'Limita los tokens según cuántas veces aparecen en la respuesta.',
				key: SETTINGS_KEYS.FREQUENCY_PENALTY,
				label: 'Penalización por frecuencia',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.FREQUENCY_PENALTY
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'El muestreo DRY reduce la repetición incluso en contextos largos. Este parámetro define el multiplicador DRY.',
				key: SETTINGS_KEYS.DRY_MULTIPLIER,
				label: 'Multiplicador DRY',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.DRY_MULTIPLIER
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'El muestreo DRY reduce la repetición incluso en contextos largos. Este parámetro define el valor base DRY.',
				key: SETTINGS_KEYS.DRY_BASE,
				label: 'Base DRY',
				sync: { paramType: SyncableParameterType.NUMBER, serverKey: SETTINGS_KEYS.DRY_BASE },
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'El muestreo DRY reduce la repetición incluso en contextos largos. Este parámetro define la longitud permitida DRY.',
				key: SETTINGS_KEYS.DRY_ALLOWED_LENGTH,
				label: 'Longitud permitida DRY',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.DRY_ALLOWED_LENGTH
				},
				type: SettingsFieldType.INPUT
			},
			{
				defaultValue: undefined,
				help: 'El muestreo DRY reduce la repetición incluso en contextos largos. Este parámetro define la penalización DRY para los últimos n tokens.',
				key: SETTINGS_KEYS.DRY_PENALTY_LAST_N,
				label: 'Penalización DRY últimos N',
				sync: {
					paramType: SyncableParameterType.NUMBER,
					serverKey: SETTINGS_KEYS.DRY_PENALTY_LAST_N
				},
				type: SettingsFieldType.INPUT
			}
		],
		slug: SETTINGS_SECTION_SLUGS.SAMPLING_PENALTIES,
		title: SETTINGS_SECTION_TITLES.SAMPLING_PENALTIES
	},
	// Developer
	{
		icon: Code,
		settings: [
			{
				defaultValue: false,
				help: 'Después de cada respuesta, reenvía la conversación para precargar la caché KV del servidor. El siguiente turno es más rápido porque el prompt ya está codificado mientras leés.',
				key: SETTINGS_KEYS.PRE_ENCODE_CONVERSATION,
				label: 'Precargar caché KV después de responder',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Envía reasoning_format=none para que el servidor devuelva el razonamiento dentro del texto en lugar de un campo aparte.',
				key: SETTINGS_KEYS.DISABLE_REASONING_PARSING,
				label: 'Desactivar el análisis del razonamiento',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Quita el razonamiento de los mensajes anteriores antes de enviar. Si está desactivado, se reenvía en el campo reasoning_content para que el modelo vea su propio razonamiento entre turnos.',
				key: SETTINGS_KEYS.EXCLUDE_REASONING_FROM_CONTEXT,
				label: 'Excluir el razonamiento del contexto',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Mostrar un botón para ver los mensajes como texto plano en lugar de Markdown',
				key: SETTINGS_KEYS.SHOW_RAW_OUTPUT_SWITCH,
				label: 'Habilitar vista de texto sin formato',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: false,
				help: 'Precarga nerdamer en el entorno run_javascript para cálculo simbólico: simplificar, derivar, integrar, resolver y más.',
				key: SETTINGS_KEYS.SYMBOLIC_MATH_ENABLED,
				label: 'Matemática simbólica (nerdamer)',
				type: SettingsFieldType.CHECKBOX
			},
			{
				defaultValue: '',
				help: 'Parámetros JSON personalizados para enviar a la API. Debe ser JSON válido.',
				key: SETTINGS_KEYS.CUSTOM_JSON,
				label: 'JSON personalizado',
				type: SettingsFieldType.TEXTAREA
			},
			{
				defaultValue: '',
				help: 'CSS que se inyecta en la página. Se puede definir acá o desde el servidor con el campo customCss de --ui-config.',
				key: SETTINGS_KEYS.CUSTOM_CSS,
				label: 'CSS personalizado',
				type: SettingsFieldType.TEXTAREA
			}
		],
		slug: SETTINGS_SECTION_SLUGS.DEVELOPER,
		title: SETTINGS_SECTION_TITLES.DEVELOPER
	}
];

function getAllSettings(): SettingsEntry[] {
	const result: SettingsEntry[] = [];

	for (const section of SETTINGS_REGISTRY) {
		result.push(...section.settings);
	}

	return result;
}

/** Flat config object stored in localStorage. */
export const SETTING_CONFIG_DEFAULT: Record<string, SettingsConfigValue> = Object.fromEntries(
	getAllSettings().map((s) => [s.key, s.defaultValue])
) as Record<string, SettingsConfigValue>;

/** Help text for every setting (including non-UI). */
export const SETTING_CONFIG_INFO: Record<string, string> = Object.fromEntries(
	getAllSettings().map((s) => [s.key, s.help])
) as Record<string, string>;

/** Sidebar sections + field configs (as consumed by UI). */
function toSettingsSection(section: SettingsSectionEntry): SettingsSection {
	return {
		fields: section.settings
			.filter((s) => s.standaloneField !== false)
			.map((s) => ({
				dependsOn: s.dependsOn,
				help: s.help,
				isExperimental: s.isExperimental,
				isPositiveInteger: s.isPositiveInteger,
				isPrivate: s.isPrivate,
				key: s.key,
				label: s.label,
				max: s.max,
				min: s.min,
				options: s.options as SettingsFieldConfig['options'],
				placeholder: s.placeholder,
				radioOptions: s.radioOptions,
				type: s.type
			})),
		icon: section.icon,
		slug: section.slug,
		title: section.title
	};
}

/** Sidebar sections in custom display order (the registry array order). */
export const SETTINGS_CHAT_SECTIONS: SettingsSection[] = SETTINGS_REGISTRY.map(toSettingsSection);

/** INPUT-type settings whose value is a number. */
export const NUMERIC_FIELDS = getAllSettings()
	.filter((s) => s.type === SettingsFieldType.INPUT && typeof s.defaultValue !== 'string')
	.map((s) => s.key) as readonly string[];

/** Numeric fields clamped to >= 1 and rounded. */
export const POSITIVE_INTEGER_FIELDS = getAllSettings()
	.filter((s) => s.isPositiveInteger)
	.map((s) => s.key) as readonly string[];
