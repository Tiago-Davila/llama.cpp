import { MessageRole, MessageType, ToolPermissionDecision, ToolSource } from '$lib/enums';
import { DatabaseService } from '$lib/services/database.service';
import { agenticStore } from '$lib/stores/agentic/index.svelte';
import { chatStore } from '$lib/stores/chat/index.svelte';
import { conversationsStore } from '$lib/stores/conversations/index.svelte';
import { mcpStore } from '$lib/stores/mcp/index.svelte';
import { settingsStore } from '$lib/stores/settings/index.svelte';
import type { ApiChatCompletionRequest } from '$lib/types/api';
import { deriveAgenticSections } from '$lib/utils/agentic';
import { expect, it, vi } from 'vitest';

const serverId = 'convertitodo-test';
const mcpUrl = 'https://convertitodo.example/mcp';
const headers = { Authorization: 'Bearer fixture-token' };
const inputSchema = {
	properties: { archivo: { type: 'string' }, formato_destino: { type: 'string' } },
	required: ['archivo', 'formato_destino'],
	type: 'object'
};
const calls = [
	{ archivo: 'entrada-000000000001', formato_destino: 'xlsx' },
	{ archivo: 'entrada-000000000002', formato_destino: 'xlsx' }
].map((args, index) => {
	const id = `salida-00000000000${index + 1}`;

	return {
		args,
		id: `call_${index}`,
		result: {
			archivos: [{ id, nombre: `tabla-${index + 1}.xlsx`, tamano: 2048, url: `/files/${id}` }],
			aviso: null,
			destino: 'xlsx',
			origen: 'csv'
		}
	};
});

function streamedCompletion(...choices: object[]): Response {
	return new Response(
		choices.map((choice) => `data: ${JSON.stringify({ choices: [choice] })}\n\n`).join('') +
			'data: [DONE]\n\n',
		{ headers: { 'Content-Type': 'text/event-stream' } }
	);
}

it('reenvía y conserva ambos resultados de ConvertiTodo en el historial del chat', async () => {
	const completions: ApiChatCompletionRequest[] = [];
	const mcpCalls: unknown[] = [];
	const fetchMock = vi.spyOn(globalThis, 'fetch');
	const fallbackFetch = fetchMock.getMockImplementation();

	fetchMock.mockImplementation(async (input, init) => {
		const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

		if (url === mcpUrl) {
			const request = new Request(input, init);

			expect(request.headers.get('authorization')).toBe(headers.Authorization);
			if (request.method === 'GET') return new Response(null, { status: 405 });

			const rpc = await request.json();
			const respond = (result: object) => Response.json({ id: rpc.id, jsonrpc: '2.0', result });

			switch (rpc.method) {
				case 'initialize':
					return respond({
						capabilities: { tools: {} },
						protocolVersion: rpc.params.protocolVersion,
						serverInfo: { name: 'ConvertiTodo', version: '0.1.0' }
					});
				case 'notifications/initialized':
					return new Response(null, { status: 202 });
				case 'tools/list':
					return respond({ tools: [{ inputSchema, name: 'convertir' }] });
				case 'tools/call': {
					const call = calls[mcpCalls.length];

					mcpCalls.push(rpc.params);
					if (!call) throw new Error('Llamada MCP inesperada');

					return respond({
						content: call === calls[0] ? [{ text: JSON.stringify(call.result), type: 'text' }] : [],
						structuredContent: call.result
					});
				}
				default:
					throw new Error(`Método MCP inesperado: ${rpc.method}`);
			}
		}

		if (url.endsWith('/v1/chat/completions')) {
			const request = new Request(new URL(url, location.href), init);
			const body: ApiChatCompletionRequest = await request.json();
			completions.push(body);

			if (completions.length === 1) {
				return streamedCompletion(
					...calls.flatMap(({ args, id }, index) => {
						const serialized = JSON.stringify(args);
						const head = {
							function: { arguments: serialized.slice(0, 12), name: 'convertir' },
							id,
							index,
							type: 'function'
						};
						const tail = { function: { arguments: serialized.slice(12) }, index };

						return [{ delta: { tool_calls: [head] } }, { delta: { tool_calls: [tail] } }];
					}),
					{ delta: {}, finish_reason: 'tool_calls' }
				);
			}

			return streamedCompletion({
				delta: { content: 'Convertí las dos tablas.' },
				finish_reason: 'stop'
			});
		}

		if (url.endsWith('/tools')) return Response.json([]);

		throw new Error(`Solicitud inesperada: ${url}`);
	});
	const previousConfig = settingsStore.config;
	const previousConversation = conversationsStore.activeConversation;
	const previousMessages = conversationsStore.activeMessages;
	const conversation = await DatabaseService.createConversation('ConvertiTodo', {
		disabledToolCategories: [ToolSource.BROWSER, ToolSource.CUSTOM, ToolSource.SERVER]
	});
	const { id: convId } = conversation;
	let flow: Promise<void> | undefined;

	try {
		settingsStore.config = {
			...previousConfig,
			agenticMaxTurns: 2,
			mcpServers: JSON.stringify([
				{
					enabled: true,
					headers: JSON.stringify(headers),
					id: serverId,
					name: 'Conversor local',
					url: mcpUrl
				}
			]),
			preEncodeConversation: false
		};
		const user = await DatabaseService.createMessageBranch(
			{
				children: [],
				content: `Convertí ${calls.map(({ args }) => args.archivo).join(' y ')} a Excel.`,
				convId,
				role: MessageRole.USER,
				timestamp: Date.now() - 1,
				type: MessageType.TEXT
			},
			null
		);
		const assistant = await DatabaseService.createMessageBranch(
			{ ...user, content: '', role: MessageRole.ASSISTANT, timestamp: Date.now() },
			user.id
		);
		await conversationsStore.loadConversation(convId);

		const complete = vi.fn<(content: string) => Promise<void>>().mockResolvedValue(undefined);
		const onError = vi.fn();
		flow = chatStore.streamChatCompletion([user], assistant, complete, onError);

		for (let index = 0; index < calls.length; index++) {
			await vi.waitFor(() => {
				expect(agenticStore.getPendingPermissionRequest(convId)?.toolName).toBe('convertir');
			});
			expect(mcpCalls).toHaveLength(index);
			agenticStore.resolvePermission(convId, ToolPermissionDecision.ONCE);
		}

		await flow;
		expect(onError).not.toHaveBeenCalled();
		expect(complete).toHaveBeenCalledExactlyOnceWith('Convertí las dos tablas.');
		expect(completions).toHaveLength(2);
		expect(completions[0]).toMatchObject({
			stream: true,
			tools: [{ function: { name: 'convertir', parameters: inputSchema }, type: 'function' }]
		});
		expect(mcpCalls).toEqual(calls.map(({ args }) => ({ arguments: args, name: 'convertir' })));
		expect(JSON.stringify(completions)).not.toContain('mcpToolResultSource');
		expect(completions[1].messages.slice(1)).toMatchObject([
			{
				role: MessageRole.ASSISTANT,
				tool_calls: calls.map(({ args, id }) => ({
					function: { arguments: JSON.stringify(args), name: 'convertir' },
					id,
					type: 'function'
				}))
			},
			...calls.map(({ id, result }) => ({
				content: JSON.stringify(result),
				role: MessageRole.TOOL,
				tool_call_id: id
			}))
		]);

		expect(await conversationsStore.loadConversation(convId)).toBe(true);
		const history = conversationsStore.activeMessages;
		const turn = history.find((message) => message.id === assistant.id)!;
		const results = history.filter((message) => message.role === MessageRole.TOOL);
		const sections = deriveAgenticSections(turn, results);

		expect(history.at(-1)).toMatchObject({
			content: 'Convertí las dos tablas.',
			role: MessageRole.ASSISTANT
		});
		expect(results).toHaveLength(2);
		expect(sections).toMatchObject(
			calls.map(({ id, result }) => ({
				mcpToolResultSource: {
					isError: false,
					serverId,
					serverName: 'ConvertiTodo',
					serverUrl: mcpUrl
				},
				toolCallId: id,
				toolName: 'convertir',
				toolResult: JSON.stringify(result)
			}))
		);
	} finally {
		if (agenticStore.isRunning(convId)) await chatStore.abortCurrentFlow(convId);
		await flow?.catch(() => {});
		agenticStore.clearSession(convId);
		await mcpStore.shutdown();
		settingsStore.config = previousConfig;
		conversationsStore.activeConversation = previousConversation;
		conversationsStore.activeMessages = previousMessages;
		await DatabaseService.deleteConversation(convId);

		if (fallbackFetch) fetchMock.mockImplementation(fallbackFetch);
		else fetchMock.mockRestore();
	}
});
