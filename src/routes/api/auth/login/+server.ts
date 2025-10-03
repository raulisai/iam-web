import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$lib/config';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();

		// Validación básica
		if (!email || !password) {
			return json(
				{ message: 'Email y contraseña son requeridos' },
				{ status: 400 }
			);
		}

		// Llamar al backend Python
		const response = await fetch(`${BACKEND_URL}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email, password }),
		});

		const data = await response.json();

		if (response.ok && data.token && data.user) {
			// Establecer cookie con el token del backend
			cookies.set('auth-token', data.token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 días
			});

			// Usar los datos del usuario que vienen del backend
			const user = {
				id: data.user.id,
				email: data.user.email,
				name: data.user.user // El backend retorna "user" como nombre
			};

			return json({
				user,
				token: data.token
			});
		} else {
			return json(
				{ message: data.error || 'Credenciales inválidas' },
				{ status: 401 }
			);
		}
	} catch (error) {
		console.error('Error en login:', error);
		return json(
			{ message: 'Error de conexión con el servidor' },
			{ status: 500 }
		);
	}
};
