import { getContext, setContext } from 'svelte';
import { BACKEND_URL } from '$lib/config';

interface User {
	id: string;
	email: string;
	name: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

class AuthStore {
	// Svelte 5 $state rune para reactividad
	user = $state<User | null>(null);
	isAuthenticated = $state(false);
	isLoading = $state(true);

	constructor() {
		// Verificar si hay una sesión almacenada al inicializar
		this.checkStoredSession();
	}

	private checkStoredSession() {
		if (typeof window === 'undefined') {
			this.isLoading = false;
			return;
		}

		try {
			const storedUser = localStorage.getItem('user');
			const token = localStorage.getItem('token');
			
			if (storedUser && token) {
				// Restaurar sesión desde localStorage
				this.user = JSON.parse(storedUser);
				this.isAuthenticated = true;
			}
		} catch (error) {
			console.error('Error verificando sesión:', error);
		} finally {
			this.isLoading = false;
		}
	}

	async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
		try {
			const response = await fetch(`${BACKEND_URL}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();
			console.log(data);

			if (response.ok && data.user && data.token) {
				this.user = data.user;
				this.isAuthenticated = true;
				
				// Guardar en localStorage
				localStorage.setItem('user', JSON.stringify(data.user));
				localStorage.setItem('token', data.token);
				
				return { success: true };
			} else {
				return { 
					success: false, 
					message: data.message || 'Credenciales inválidas' 
				};
			}
		} catch (error) {
			console.error('Error durante el login:', error);
			return { 
				success: false, 
				message: 'Error de conexión. Por favor, intenta de nuevo.' 
			};
		}
	}


	logout() {
		this.user = null;
		this.isAuthenticated = false;
		
		// Limpiar localStorage
		if (typeof window !== 'undefined') {
			localStorage.removeItem('user');
			localStorage.removeItem('token');
		}
		
		// Redirigir al login
		if (typeof window !== 'undefined') {
			window.location.href = '/login';
		}
	}

	getToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('token');
	}
}

// Crear una instancia singleton del store
let authStore: AuthStore;

export function initializeAuthStore(): AuthStore {
	if (!authStore) {
		authStore = new AuthStore();
	}
	return authStore;
}

export function getAuthStore(): AuthStore {
	if (!authStore) {
		throw new Error('Auth store no ha sido inicializado. Llama a initializeAuthStore() primero.');
	}
	return authStore;
}

// Context API para pasar el store a través del árbol de componentes
const AUTH_CONTEXT_KEY = Symbol('auth');

export function setAuthContext(store: AuthStore) {
	setContext(AUTH_CONTEXT_KEY, store);
}

export function getAuthContext(): AuthStore {
	const store = getContext<AuthStore>(AUTH_CONTEXT_KEY);
	if (!store) {
		throw new Error('Auth context no encontrado. Asegúrate de llamar setAuthContext() en el layout raíz.');
	}
	return store;
}
