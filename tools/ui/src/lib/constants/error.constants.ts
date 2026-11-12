export const ERROR_MESSAGES = {
	HTTP: {
		ACCESS_DENIED: 'Acceso denegado',
		GENERIC: 'La solicitud falló',
		INTERNAL_ERROR: 'Error del servidor: revisá los registros del servidor',
		NOT_FOUND: 'No encontrado',
		TEMPORARILY_UNAVAILABLE: 'Servidor no disponible temporalmente'
	},
	NETWORK: {
		GENERIC: 'No se pudo conectar con el servidor',
		NXDOMAIN: 'Servidor no encontrado: revisá la dirección',
		REFUSED: 'Conexión rechazada: el servidor puede estar apagado',
		TIMEOUT: 'Se agotó el tiempo de espera',
		UNREACHABLE: 'El servidor no está en ejecución o no es accesible'
	}
};

export const HTTP_CODE_TO_STRING: Record<string, string> = {
	401: ERROR_MESSAGES.HTTP.ACCESS_DENIED,
	403: ERROR_MESSAGES.HTTP.ACCESS_DENIED,
	500: ERROR_MESSAGES.HTTP.INTERNAL_ERROR,
	503: ERROR_MESSAGES.HTTP.TEMPORARILY_UNAVAILABLE
};
