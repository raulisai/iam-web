/**
 * Sistema de caché genérico para persistir datos en localStorage
 * Permite mostrar datos en caché mientras se cargan datos frescos
 */

const CACHE_PREFIX = 'iam_cache_';
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutos

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

export class CacheManager {
	/**
	 * Guardar datos en caché
	 */
	static set<T>(key: string, data: T): void {
		if (typeof window === 'undefined') return;
		
		const entry: CacheEntry<T> = {
			data,
			timestamp: Date.now()
		};
		
		try {
			localStorage.setItem(
				`${CACHE_PREFIX}${key}`,
				JSON.stringify(entry)
			);
		} catch (error) {
			console.error('Error saving to cache:', error);
		}
	}

	/**
	 * Obtener datos del caché
	 */
	static get<T>(key: string): T | null {
		if (typeof window === 'undefined') return null;
		
		try {
			const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
			if (!item) return null;

			const entry: CacheEntry<T> = JSON.parse(item);
			
			// Verificar si el caché expiró
			if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
				this.remove(key);
				return null;
			}

			return entry.data;
		} catch (error) {
			console.error('Error reading from cache:', error);
			return null;
		}
	}

	/**
	 * Verificar si existe un caché válido
	 */
	static has(key: string): boolean {
		return this.get(key) !== null;
	}

	/**
	 * Eliminar un item del caché
	 */
	static remove(key: string): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(`${CACHE_PREFIX}${key}`);
	}

	/**
	 * Limpiar todo el caché
	 */
	static clear(): void {
		if (typeof window === 'undefined') return;
		
		const keys = Object.keys(localStorage);
		keys.forEach(key => {
			if (key.startsWith(CACHE_PREFIX)) {
				localStorage.removeItem(key);
			}
		});
	}

	/**
	 * Obtener la edad del caché en milisegundos
	 */
	static getAge(key: string): number | null {
		if (typeof window === 'undefined') return null;
		
		try {
			const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
			if (!item) return null;

			const entry: CacheEntry<any> = JSON.parse(item);
			return Date.now() - entry.timestamp;
		} catch (error) {
			return null;
		}
	}
}
