import { CacheManager } from './cache.svelte';
import { 
	fetchGoals, 
	createGoal, 
	updateGoal, 
	deleteGoal,
	type Goal 
} from '../services/goals';
import { getAuthStore } from './auth.svelte';

/**
 * Store reactivo para gestión de goals con sistema de caché
 */
class GoalsStore {
	// Estado reactivo
	goals = $state<Goal[]>([]);
	isLoading = $state(false);
	error = $state<string | null>(null);
	lastFetch = $state<number>(0);
	
	private readonly CACHE_KEY = 'goals';
	
	constructor() {
		// Cargar desde caché al inicializar
		this.loadFromCache();
	}

	/**
	 * Cargar goals desde caché
	 */
	private loadFromCache(): void {
		const cached = CacheManager.get<Goal[]>(this.CACHE_KEY);
		if (cached) {
			this.goals = cached;
			console.log('✅ Goals cargados desde caché');
		}
	}

	/**
	 * Guardar en caché
	 */
	private saveToCache(): void {
		CacheManager.set(this.CACHE_KEY, this.goals);
	}

	/**
	 * Obtener todos los goals (primero caché, luego actualizar)
	 */
	async fetchAll(forceRefresh: boolean = false): Promise<void> {
		// Si tenemos caché reciente y no es refresh forzado, usar caché
		const cacheAge = CacheManager.getAge(this.CACHE_KEY);
		if (!forceRefresh && cacheAge && cacheAge < 60000) { // 1 minuto
			console.log('📦 Usando caché reciente de goals');
			return;
		}

		this.isLoading = true;
		this.error = null;

		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				throw new Error('No authentication token');
			}

			const freshGoals = await fetchGoals(token);
			this.goals = freshGoals;
			this.lastFetch = Date.now();
			this.saveToCache();
			
			console.log('🔄 Goals actualizados desde API');
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Error loading goals';
			console.error('Error fetching goals:', err);
			
			// Si falla, mantener caché si existe
			if (this.goals.length === 0) {
				this.loadFromCache();
			}
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Obtener un goal por ID
	 */
	getById(id: string): Goal | undefined {
		return this.goals.find(g => g.id === id);
	}

	/**
	 * Crear un nuevo goal
	 */
	async create(goalData: any): Promise<Goal | null> {
		this.isLoading = true;
		this.error = null;

		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				throw new Error('No authentication token');
			}

			const newGoal = await createGoal(token, goalData);
			this.goals = [...this.goals, newGoal];
			this.saveToCache();
			
			return newGoal;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Error creating goal';
			console.error('Error creating goal:', err);
			return null;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Actualizar un goal existente
	 */
	async update(id: string, goalData: Partial<Goal>): Promise<boolean> {
		this.isLoading = true;
		this.error = null;

		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				throw new Error('No authentication token');
			}

			const updatedGoal = await updateGoal(token, id, goalData);
			this.goals = this.goals.map(g => g.id === id ? updatedGoal : g);
			this.saveToCache();
			
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Error updating goal';
			console.error('Error updating goal:', err);
			return false;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Eliminar un goal
	 */
	async remove(id: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;

		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				throw new Error('No authentication token');
			}

			await deleteGoal(token, id);
			this.goals = this.goals.filter(g => g.id !== id);
			this.saveToCache();
			
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Error deleting goal';
			console.error('Error deleting goal:', err);
			return false;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Limpiar estado y caché
	 */
	clear(): void {
		this.goals = [];
		this.error = null;
		this.lastFetch = 0;
		CacheManager.remove(this.CACHE_KEY);
	}

	/**
	 * Filtrar goals por tipo
	 */
	getByType(type: 'short' | 'medium' | 'long'): Goal[] {
		return this.goals.filter(g => g.type === type);
	}

	/**
	 * Obtener goals activos
	 */
	getActive(): Goal[] {
		return this.goals.filter(g => g.is_active);
	}

	/**
	 * Obtener estadísticas
	 */
	getStats() {
		return {
			total: this.goals.length,
			active: this.goals.filter(g => g.is_active).length,
			completed: this.goals.filter(g => g.progress >= 100).length,
			avgProgress: this.goals.length > 0 
				? this.goals.reduce((sum, g) => sum + (g.progress || 0), 0) / this.goals.length 
				: 0
		};
	}
}

// Singleton
let goalsStore: GoalsStore;

export function initializeGoalsStore(): GoalsStore {
	if (!goalsStore) {
		goalsStore = new GoalsStore();
	}
	return goalsStore;
}

export function getGoalsStore(): GoalsStore {
	if (!goalsStore) {
		throw new Error('Goals store no inicializado. Llama a initializeGoalsStore() primero.');
	}
	return goalsStore;
}
