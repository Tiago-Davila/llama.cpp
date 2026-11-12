/** Why the chat form's microphone can't record, as its button and toast tell the user. */
export const MICROPHONE_UNAVAILABLE_MESSAGE = {
	busy: 'Otra aplicación está usando el micrófono.',
	denied: "Microphone access was denied. Allow it in the browser's site settings to record.",
	failed: "The microphone couldn't start.",
	insecure:
		'El micrófono solo funciona con HTTPS o en localhost. Abrí esta página con HTTPS para grabar.',
	notFound: 'No se encontró un micrófono.',
	unsupported: "This browser can't record audio."
} as const;
