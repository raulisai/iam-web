import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$lib/config';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password, name } = await request.json();

		// Validación básica
		if (!email || !password || !name) {
			return json(
				{ message: 'Email, nombre y contraseña son requeridos' },
				{ status: 400 }
			);
		}

		// Llamar al backend Python
		const response = await fetch(`${BACKEND_URL}/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'accept': 'application/json'
			},
			body: JSON.stringify({ email, password, name }),
		});

		const data = await response.json();

		if (response.ok) {
			// Si el registro también hace login (comúnmente devuelven un token)
			if (data.token && data.user) {
				cookies.set('auth-token', data.token, {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict',
					maxAge: 60 * 60 * 24 * 7 // 7 días
				});

				const user = {
					id: data.user.id,
					email: data.user.email,
					name: data.user.user
				};

				return json({
					success: true,
					user,
					token: data.token
				});
			}

			// Si solo devuelve éxito
			return json({ success: true, message: data.message || 'Registro exitoso' });
		} else {
			return json(
				{ message: data.error || data.message || 'Error al registrarse' },
				{ status: response.status }
			);
		}
	} catch (error) {
		console.error('Error en registro:', error);
		return json(
			{ message: 'Error de conexión con el servidor' },
			{ status: 500 }
		);
	}
};
