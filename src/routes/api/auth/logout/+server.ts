import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	try {
		// Eliminar la cookie de autenticación
		cookies.delete('auth-token', {
			path: '/'
		});

		return json({ success: true, message: 'Sesión cerrada exitosamente' });
	} catch (error) {
		console.error('Error en logout:', error);
		return json(
			{ success: false, message: 'Error al cerrar sesión' },
			{ status: 500 }
		);
	}
};
