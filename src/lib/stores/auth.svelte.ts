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

// Declaración global para la interfaz Android
declare global {
	interface Window {
		AndroidApp?: {
			saveAuthToken(token: string, userId: string): void;
		};
	}
}

// Función helper para detectar si estamos en Android WebView
function isAndroidWebView(): boolean {
	if (typeof window === 'undefined') return false;
	return typeof window.AndroidApp !== 'undefined' && typeof window.AndroidApp.saveAuthToken === 'function';
}

// Función helper para enviar el token a Android
function sendTokenToAndroid(token: string, userId: string): void {
	if (!isAndroidWebView()) {
		console.log('Android WebView no detectado, omitiendo sincronización de token');
		return;
	}

	try {
		console.log('Enviando token a Android WebView...');
		window.AndroidApp!.saveAuthToken(token, userId);
		console.log('Token enviado exitosamente a Android');
	} catch (error) {
		console.error('Error al enviar token a Android:', error);
	}
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
			// Llamar al endpoint de SvelteKit en lugar del backend directo
			const response = await fetch('/api/auth/login', {
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
				
				// Guardar en localStorage (el token ya está en la cookie httpOnly)
				localStorage.setItem('user', JSON.stringify(data.user));
				localStorage.setItem('token', data.token);
				
				// Enviar token a Android si está disponible
				sendTokenToAndroid(data.token, data.user.id);
				
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

	// Función helper para hacer peticiones autenticadas con el token JWT
	async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
		const token = this.getToken();
		
		if (!token) {
			throw new Error('No hay token de autenticación');
		}

		// Determinar la URL completa
		// Si la URL ya tiene http/https, usarla tal cual
		// Si es relativa (empieza con /), agregar el BACKEND_URL
		const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;

		// Combinar headers existentes con el Authorization header
		const headers = new Headers(options.headers);
		headers.set('Authorization', `Bearer ${token}`);
		
		// Solo agregar Content-Type si no está ya definido
		if (!headers.has('Content-Type') && options.body) {
			headers.set('Content-Type', 'application/json');
		}

		return fetch(fullUrl, {
			...options,
			headers,
		});
	}


	async logout() {
		try {
			// Llamar al endpoint de logout para limpiar cookies del servidor
			await fetch('/api/auth/logout', {
				method: 'POST'
			});
		} catch (error) {
			console.error('Error al cerrar sesión en el servidor:', error);
		}
		
		// Limpiar estado local
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

	// Manejar errores de autenticación (token expirado o inválido)
	handleUnauthorized() {
		console.warn('Sesión expirada o inválida. Redirigiendo al login...');
		
		// Limpiar estado local
		this.user = null;
		this.isAuthenticated = false;
		
		// Limpiar localStorage
		if (typeof window !== 'undefined') {
			localStorage.removeItem('user');
			localStorage.removeItem('token');
			localStorage.setItem('sessionExpired', 'true'); // Flag para mostrar mensaje
			
			// Redirigir al login
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
