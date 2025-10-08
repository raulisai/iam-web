// Configuración del backend
export const BACKEND_URL = import.meta.env.BACKEND_API_URL || 'https://iam-backend-7jmc.onrender.com';

// Configuración de la aplicación
export const APP_CONFIG = {
	name: 'IAM Dashboard',
	version: '1.0.0'
};

// Función helper para llamadas al backend
export async function apiCall(endpoint: string, options: RequestInit = {}) {
	const url = `${BACKEND_URL}${endpoint}`;
	
	const defaultHeaders = {
		'Content-Type': 'application/json',
		...options.headers
	};

	try {
		const response = await fetch(url, {
			...options,
			headers: defaultHeaders
		});

		return response;
	} catch (error) {
		console.error(`Error calling ${endpoint}:`, error);
		throw error;
	}
}
