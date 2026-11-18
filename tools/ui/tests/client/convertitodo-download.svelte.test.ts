import ChatMessageToolCallBlock from '$lib/components/app/chat/ChatMessages/ChatMessage/ChatMessageToolCall/ChatMessageToolCallBlock.svelte';
import { AgenticSectionType } from '$lib/enums';
import { downloadConvertitodoFile } from '$lib/services/convertitodo-files.service';
import { mcpStore, settingsStore } from '$lib/stores';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

vi.mock(import('$lib/services/convertitodo-files.service'), async (importOriginal) => ({
	...(await importOriginal()),
	downloadConvertitodoFile: vi.fn()
}));

const download = vi.mocked(downloadConvertitodoFile);
const id = 'aBcD12_34567890-';
const toolName = 'crear_pdf';
const content = JSON.stringify({ id, nombre: 'Informe.pdf', url: `/files/${id}` });
const section = { content, toolName, toolResult: content, type: AgenticSectionType.TOOL_CALL };
const server = {
	headers: { Authorization: 'Bearer test-token' },
	url: 'https://convertitodo.example/mcp',
	useProxy: false
};

afterEach(() => {
	vi.restoreAllMocks();
	download.mockReset();
	settingsStore.updateConfig('mcpServers', '[]');
});

describe('ConvertiTodo download card', () => {
	it('does not turn a matching tool name and JSON output into a download without provenance', async () => {
		const screen = await render(ChatMessageToolCallBlock, {
			isStreaming: false,
			open: false,
			section
		});

		await expect.element(screen.getByRole('button', { name: /Descargar/ })).not.toBeInTheDocument();
		expect(download).not.toHaveBeenCalled();
	});

	it('uses the execution server on click and revokes the downloaded Blob URL', async () => {
		const entry = mcpStore.addServer({
			enabled: true,
			headers: JSON.stringify(server.headers),
			url: server.url,
			useProxy: server.useProxy
		});
		const blob = new Blob(['test file']);
		download.mockResolvedValue(blob);
		const createUrl = vi.spyOn(URL, 'createObjectURL');
		const revokeUrl = vi.spyOn(URL, 'revokeObjectURL');
		const clicked = vi.fn();
		vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
			this: HTMLAnchorElement
		) {
			clicked(this.getAttribute('href'), this.download);
		});
		const screen = await render(ChatMessageToolCallBlock, {
			isStreaming: false,
			open: false,
			section: {
				...section,
				mcpToolResultSource: {
					isError: false,
					serverId: entry.id,
					serverName: 'ConvertiTodo',
					serverUrl: server.url
				}
			}
		});

		const button = screen.getByRole('button', { name: 'Descargar Informe.pdf' });
		await expect.element(button).toBeVisible();
		expect(download).not.toHaveBeenCalled();
		await button.click();

		await vi.waitFor(() => {
			expect(download).toHaveBeenCalledExactlyOnceWith(server, id, expect.any(AbortSignal));
			expect(createUrl).toHaveBeenCalledExactlyOnceWith(blob);
			const objectUrl = createUrl.mock.results[0].value;
			expect(clicked).toHaveBeenCalledExactlyOnceWith(objectUrl, 'Informe.pdf');
			expect(revokeUrl).toHaveBeenCalledExactlyOnceWith(objectUrl);
		});

		mcpStore.updateServer(entry.id, { url: 'https://different.example/mcp' });
		await expect.element(button).not.toBeInTheDocument();
	});
});
