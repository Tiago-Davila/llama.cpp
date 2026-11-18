const FILE_TOOLS = new Set([
	'crear_pdf',
	'crear_docx',
	'editar_docx',
	'crear_xlsx',
	'editar_xlsx',
	'convertir'
]);

// Metadata del resultado MCP, fuera del texto del modelo y de la herramienta.
export interface ConvertitodoResultSource {
	isError: boolean;
	serverId: string;
	serverName?: string;
	serverUrl?: string;
}

export interface ConvertitodoGeneratedFile {
	id: string;
	nombre: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function extractConvertitodoFiles(
	source: ConvertitodoResultSource | undefined,
	toolName: string | undefined,
	payload: unknown
): ConvertitodoGeneratedFile[] {
	if (
		source?.serverName !== 'ConvertiTodo' ||
		source.isError !== false ||
		!source.serverId ||
		!source.serverUrl ||
		!toolName ||
		!FILE_TOOLS.has(toolName)
	) {
		return [];
	}

	if (typeof payload === 'string') {
		try {
			payload = JSON.parse(payload);
		} catch {
			return [];
		}
	}

	if (!isRecord(payload)) return [];

	const entries: unknown[] = Array.isArray(payload.archivos) ? payload.archivos : [payload];
	const files = new Map<string, ConvertitodoGeneratedFile>();

	for (const entry of entries) {
		if (!isRecord(entry)) continue;

		const { id, nombre, url } = entry;
		if (
			typeof id !== 'string' ||
			id.length < 16 ||
			id.length > 64 ||
			/[^A-Za-z0-9_-]/.test(id) ||
			url !== `/files/${id}` ||
			typeof nombre !== 'string' ||
			!nombre.trim() ||
			files.has(id)
		) {
			continue;
		}

		files.set(id, { id, nombre });
	}

	return [...files.values()];
}
