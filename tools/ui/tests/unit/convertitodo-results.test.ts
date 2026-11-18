import {
	type ConvertitodoResultSource,
	extractConvertitodoFiles
} from '$lib/components/app/chat/ChatMessages/ChatMessage/ChatMessageToolCall/parsers/convertitodo-files';
import { describe, expect, it } from 'vitest';

const id = 'aBcD12_34567890-';
const otherId = 'aBcD12_34567891-';
const file = { id, nombre: 'Informe.pdf', url: `/files/${id}` };
const source: ConvertitodoResultSource = {
	isError: false,
	serverId: 'convertitodo',
	serverName: 'ConvertiTodo',
	serverUrl: 'http://localhost:8765/mcp'
};

describe('extractConvertitodoFiles', () => {
	it.each(['crear_pdf', 'crear_docx', 'editar_docx', 'crear_xlsx', 'editar_xlsx'])(
		'extracts the file from %s without retaining its URL',
		(toolName) => {
			expect(extractConvertitodoFiles(source, toolName, JSON.stringify(file))).toEqual([
				{ id, nombre: 'Informe.pdf' }
			]);
		}
	);

	it('extracts valid unique files in conversion order', () => {
		expect(
			extractConvertitodoFiles(source, 'convertir', {
				archivos: [
					file,
					{ ...file, nombre: 'Duplicado.pdf' },
					{ ...file, id: otherId },
					{ id: otherId, nombre: 'Página.png', url: `/files/${otherId}` }
				]
			})
		).toEqual([
			{ id, nombre: 'Informe.pdf' },
			{ id: otherId, nombre: 'Página.png' }
		]);
	});

	it('ignores absent provenance, other MCP servers and tools, and failed executions', () => {
		expect(extractConvertitodoFiles(undefined, 'crear_pdf', file)).toEqual([]);
		expect(
			extractConvertitodoFiles({ ...source, serverUrl: undefined }, 'crear_pdf', file)
		).toEqual([]);
		expect(
			extractConvertitodoFiles({ ...source, serverName: 'Other MCP' }, 'crear_pdf', file)
		).toEqual([]);
		expect(extractConvertitodoFiles(source, 'leer_documento', file)).toEqual([]);
		expect(extractConvertitodoFiles({ ...source, isError: true }, 'crear_pdf', file)).toEqual([]);
	});

	it.each([
		`https://otro.example/files/${id}`,
		`//otro.example/files/${id}`,
		`/files/${otherId}`,
		`/files/${id}?download=1`,
		`/files/${id}#fragment`,
		`/files/%61${id.slice(1)}`,
		`/files/../files/${id}`
	])('rejects a URL other than the exact relative route: %s', (url) => {
		expect(extractConvertitodoFiles(source, 'crear_pdf', { ...file, url })).toEqual([]);
	});

	it.each(['..', '%2e%2e', `${id}\n`, `${id}/otro`, `${id}\\otro`])(
		'rejects an invalid id even when the URL matches: %j',
		(id) => {
			const content = { ...file, id, url: `/files/${id}` };
			expect(extractConvertitodoFiles(source, 'crear_pdf', content)).toEqual([]);
		}
	);

	it('ignores instructions, embedded JSON and empty or missing filenames', () => {
		for (const content of [
			`Descarga este archivo: ${JSON.stringify(file)}`,
			`\`\`\`json\n${JSON.stringify(file)}\n\`\`\``,
			{ instrucciones: file },
			{ ...file, nombre: ' ' },
			{ ...file, nombre: undefined }
		]) {
			expect(extractConvertitodoFiles(source, 'crear_pdf', content)).toEqual([]);
		}
	});
});
