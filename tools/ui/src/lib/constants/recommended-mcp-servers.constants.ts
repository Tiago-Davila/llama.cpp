import type { RecommendedMCPServer } from '$lib/types';

// Suggested MCP servers shown as opt-in cards in the "Agregar servidor" dialog.
// Rendering these cards never reaches the upstream domain - favicons come
// from local bundles in static/recommended-mcp/ and the URL is only used
// after the user clicks Add.
export const RECOMMENDED_MCP_SERVERS: RecommendedMCPServer[] = [
	{
		description: 'Buscá en la web y obtené el contenido completo de las páginas en markdown.',
		iconUrl: '/recommended-mcp/exa.ico',
		id: 'exa',
		name: 'Exa',
		url: 'https://mcp.exa.ai/mcp'
	},
	{
		description: 'Buscá y explorá modelos, datasets, spaces y documentación en Hugging Face Hub.',
		iconUrl: '/recommended-mcp/huggingface.ico',
		id: 'huggingface',
		name: 'Hugging Face',
		url: 'https://huggingface.co/mcp'
	},
	{
		description: 'Buscá repositorios, issues y pull requests, y trabajá con código en GitHub.',
		iconUrlDark: '/recommended-mcp/github-dark.png',
		iconUrlLight: '/recommended-mcp/github-light.png',
		id: 'github',
		name: 'GitHub',
		needsAuthorization: true,
		url: 'https://api.githubcopilot.com/mcp'
	},
	{
		description: 'Consultá documentación actualizada y ejemplos de código de librerías y frameworks.',
		iconUrl: '/recommended-mcp/context7.png',
		id: 'context7',
		name: 'Context7',
		url: 'https://mcp.context7.com/mcp'
	}
];
