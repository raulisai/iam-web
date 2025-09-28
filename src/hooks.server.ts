import type { Handle } from '@sveltejs/kit';

// Rutas públicas que no requieren autenticación
const publicRoutes = [
	'/login',
	'/api/auth/login'
];

export const handle: Handle = async ({ event, resolve }) => {
	const { url, cookies } = event;
	
	// Obtener token de cookies
	const token = cookies.get('auth-token');

	// Verificar si es una ruta pública
	const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));
	
	// Si hay token, consideramos al usuario autenticado
	// El backend Python validará el token cuando sea necesario
	if (token) {
		event.locals.user = {
			id: token,
			email: '', // Se llenará desde el cliente
			name: '', // Se llenará desde el cliente
			createdAt: ''
		};
	}

	// Proteger rutas privadas
	if (!isPublicRoute && !event.locals.user) {
		// Si es una llamada API, retornar 401
		if (url.pathname.startsWith('/api/')) {
			return new Response(JSON.stringify({ message: 'No autorizado' }), {
				status: 401,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
		
		// Si es una página, redirigir al login
		return new Response(null, {
			status: 302,
			headers: {
				location: `/login?redirect=${encodeURIComponent(url.pathname)}`
			}
		});
	}

	// Si el usuario está autenticado y trata de acceder a login, redirigir a home
	if (event.locals.user && url.pathname === '/login') {
		return new Response(null, {
			status: 302,
			headers: {
				location: '/'
			}
		});
	}

	// Continuar con la solicitud
	const response = await resolve(event);
	
	return response;
};
