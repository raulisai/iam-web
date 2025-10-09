import { CacheManager } from './cache.svelte';
import {
	fetchGoalTasks,
	createGoalTask,
	updateGoalTask,
	deleteGoalTask,
	createTaskOccurrence,
	fetchTaskOccurrences,
	fetchCompletedTaskIds,
	type GoalTask,
	type TaskOccurrence
} from '../services/goalTasks';
import { getAuthStore } from './auth.svelte';

/**
 * Store reactivo para gestión de tasks con sistema de caché
 */
class TasksStore {
	// Estado reactivo - tasks organizadas por goalId
	tasksByGoal = $state<Record<string, GoalTask[]>>({});
	completedTaskIds = $state<Set<string>>(new Set());
	occurrencesByTask = $state<Record<string, TaskOccurrence[]>>({});
	isLoading = $state(false);
	error = $state<string | null>(null);
	
	constructor() {
		// Cargar desde caché al inicializar
		this.loadFromCache();
	}

	/**
	 * Cargar desde caché
	 */
	private loadFromCache(): void {
		const cachedTasks = CacheManager.get<Record<string, GoalTask[]>>('tasks_by_goal');
		const cachedCompleted = CacheManager.get<string[]>('completed_task_ids');
		
		if (cachedTasks) {
			this.tasksByGoal = cachedTasks;
			console.log('✅ Tasks cargadas desde caché');
		}
		
		if (cachedCompleted) {
			this.completedTaskIds = new Set(cachedCompleted);
			console.log('✅ Tasks completadas cargadas desde caché');
		}
	}

	/**
	 * Guardar en caché
	 */
	private saveToCache(): void {
		CacheManager.set('tasks_by_goal', this.tasksByGoal);
		CacheManager.set('completed_task_ids', Array.from(this.completedTaskIds));
	}

	/**
	 * Obtener tasks de un goal (primero caché, luego actualizar)
	 */
	async fetchForGoal(goalId: string, forceRefresh: boolean = false): Promise<void> {
		// Si tenemos caché y no es refresh forzado, usar caché
		const cacheAge = CacheManager.getAge(`tasks_${goalId}`);
		if (!forceRefresh && this.tasksByGoal[goalId] && cacheAge && cacheAge < 60000) {
			console.log(`📦 Usando caché reciente de tasks para goal ${goalId}`);
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

			const tasks = await fetchGoalTasks(token, goalId);
			this.tasksByGoal[goalId] = tasks;
			
			// Cargar tasks completadas
			if (tasks.length > 0) {
				const completedIds = await fetchCompletedTaskIds(token, tasks);
				this.completedTaskIds = completedIds;
			}
			
			this.saveToCache();
			CacheManager.set(`tasks_${goalId}`, tasks);
			
			console.log(`🔄 Tasks actualizadas desde API para goal ${goalId}`);
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Error loading tasks';
			console.error('Error fetching tasks:', err);
			
			// Si falla, mantener caché si existe
			if (!this.tasksByGoal[goalId]) {
				const cached = CacheManager.get<GoalTask[]>(`tasks_${goalId}`);
				if (cached) {
					this.tasksByGoal[goalId] = cached;
				}
			}
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Obtener tasks de un goal (desde memoria/caché)
	 */
	getForGoal(goalId: string): GoalTask[] {
		return this.tasksByGoal[goalId] || [];
	}

	/**
	 * Verificar si una task está completada
	 */
	isCompleted(taskId: string): boolean {
		return this.completedTaskIds.has(taskId);
	}

	/**
	 * Obtener tasks no completadas de un goal
	 */
	getIncompleteForGoal(goalId: string): GoalTask[] {
		const tasks = this.getForGoal(goalId);
		return tasks.filter(t => !this.completedTaskIds.has(t.id || ''));
	}

	/**
	 * Crear una nueva task
	 */
	async create(goalId: string, taskData: GoalTask): Promise<GoalTask | null> {
		this.isLoading = true;
		this.error = null;

		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				throw new Error('No authentication token');
			}

			const newTask = await createGoalTask(token, goalId, taskData);
			
			// Actualizar estado local
			if (!this.tasksByGoal[goalId]) {
				this.tasksByGoal[goalId] = [];
			}
			this.tasksByGoal[goalId] = [...this.tasksByGoal[goalId], newTask];
			this.saveToCache();
			
			return newTask;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Error creating task';
			console.error('Error creating task:', err);
			return null;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Actualizar una task
	 */
	async update(goalId: string, taskId: string, taskData: Partial<GoalTask>): Promise<boolean> {
		this.isLoading = true;
		this.error = null;

		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				throw new Error('No authentication token');
			}

			const updatedTask = await updateGoalTask(token, goalId, taskId, taskData);
			
			// Actualizar estado local
			if (this.tasksByGoal[goalId]) {
				this.tasksByGoal[goalId] = this.tasksByGoal[goalId].map(t => 
					t.id === taskId ? updatedTask : t
				);
				this.saveToCache();
			}
			
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Error updating task';
			console.error('Error updating task:', err);
			return false;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Eliminar una task
	 */
	async remove(goalId: string, taskId: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;

		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				throw new Error('No authentication token');
			}

			await deleteGoalTask(token, goalId, taskId);
			
			// Actualizar estado local
			if (this.tasksByGoal[goalId]) {
				this.tasksByGoal[goalId] = this.tasksByGoal[goalId].filter(t => t.id !== taskId);
				this.completedTaskIds.delete(taskId);
				this.saveToCache();
			}
			
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Error deleting task';
			console.error('Error deleting task:', err);
			return false;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Marcar task como completada
	 */
	async complete(goalId: string, taskId: string, notes?: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;

		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				throw new Error('No authentication token');
			}

			// Marcar inmediatamente en UI
			this.completedTaskIds.add(taskId);
			this.completedTaskIds = new Set(this.completedTaskIds); // Trigger reactivity
			this.saveToCache();
			
			// Crear occurrence en backend
			await createTaskOccurrence(token, goalId, taskId, notes);
			
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Error completing task';
			console.error('Error completing task:', err);
			// Revertir si falla
			this.completedTaskIds.delete(taskId);
			this.saveToCache();
			return false;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Obtener occurrences de una task
	 */
	async fetchOccurrences(taskId: string): Promise<TaskOccurrence[]> {
		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				return [];
			}

			const occurrences = await fetchTaskOccurrences(token, taskId);
			this.occurrencesByTask[taskId] = occurrences;
			
			return occurrences;
		} catch (err) {
			console.error('Error fetching occurrences:', err);
			return [];
		}
	}

	/**
	 * Limpiar estado y caché
	 */
	clear(): void {
		this.tasksByGoal = {};
		this.completedTaskIds = new Set();
		this.occurrencesByTask = {};
		this.error = null;
		CacheManager.remove('tasks_by_goal');
		CacheManager.remove('completed_task_ids');
	}

	/**
	 * Obtener estadísticas de un goal
	 */
	getGoalStats(goalId: string) {
		const tasks = this.getForGoal(goalId);
		const completed = tasks.filter(t => this.completedTaskIds.has(t.id || '')).length;
		
		return {
			total: tasks.length,
			completed,
			remaining: tasks.length - completed,
			progress: tasks.length > 0 ? (completed / tasks.length) * 100 : 0
		};
	}
}

// Singleton
let tasksStore: TasksStore;

export function initializeTasksStore(): TasksStore {
	if (!tasksStore) {
		tasksStore = new TasksStore();
	}
	return tasksStore;
}

export function getTasksStore(): TasksStore {
	if (!tasksStore) {
		throw new Error('Tasks store no inicializado. Llama a initializeTasksStore() primero.');
	}
	return tasksStore;
}
