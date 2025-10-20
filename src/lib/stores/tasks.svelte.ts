import { CacheManager } from './cache.svelte';
import {
	fetchGoalTasks,
	createGoalTask,
	updateGoalTask,
	deleteGoalTask,
	createTaskOccurrence,
	fetchTaskOccurrences,
	fetchCompletedTaskIds,
	deleteOccurrence,
	fetchOccurrenceLogs,
	createOccurrenceLog,
	fetchOccurrenceById
} from '../services/goalTasks';
import type { GoalTask, TaskOccurrence, TaskLog, TaskLogAction, TaskTimer } from '../types';
import { getAuthStore } from './auth.svelte';

/**
 * Store reactivo para gestión de tasks con sistema de caché
 */
class TasksStore {
	// Estado reactivo - tasks organizadas por goalId
	tasksByGoal = $state<Record<string, GoalTask[]>>({});
	completedTaskIds = $state<Set<string>>(new Set());
	occurrencesByTask = $state<Record<string, TaskOccurrence[]>>({});
	occurrenceIdByTask = $state<Record<string, string>>({}); // taskId -> occurrenceId
	logsByOccurrence = $state<Record<string, TaskLog[]>>({});
	activeTimers = $state<Record<string, TaskTimer>>({});
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
		
		// Cargar timers activos desde localStorage
		this.loadTimersFromStorage();
	}

	/**
	 * Cargar timers activos desde localStorage
	 */
	private loadTimersFromStorage(): void {
		try {
			const stored = localStorage.getItem('active_timers');
			if (stored) {
				const timers = JSON.parse(stored) as Record<string, TaskTimer>;
				const now = Date.now();
				
				// Reconstruir timers con el tiempo transcurrido
				for (const [taskId, timer] of Object.entries(timers)) {
					if (timer.isRunning || timer.isPaused) {
						const elapsed = timer.isRunning 
							? timer.elapsedSeconds + Math.floor((now - timer.startTime) / 1000)
							: timer.elapsedSeconds;
						
						this.activeTimers[taskId] = {
							...timer,
							elapsedSeconds: elapsed,
							startTime: timer.isRunning ? now : timer.startTime
						};
					}
				}
				
				if (Object.keys(this.activeTimers).length > 0) {
					console.log(`⌛ Timers activos restaurados: ${Object.keys(this.activeTimers).length}`);
				}
			}
		} catch (err) {
			console.error('Error loading timers from storage:', err);
		}
	}

	/**
	 * Guardar timers activos en localStorage
	 */
	private saveTimersToStorage(): void {
		try {
			if (Object.keys(this.activeTimers).length > 0) {
				localStorage.setItem('active_timers', JSON.stringify(this.activeTimers));
			} else {
				localStorage.removeItem('active_timers');
			}
		} catch (err) {
			console.error('Error saving timers to storage:', err);
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
	 * Descompletar una task (eliminar occurrence)
	 */
	async uncomplete(goalId: string, taskId: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;

		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				throw new Error('No authentication token');
			}

			// Buscar el occurrence asociado
			const occurrences = await fetchTaskOccurrences(token, taskId);
			if (occurrences.length === 0) {
				console.log('No occurrences found for task');
				this.completedTaskIds.delete(taskId);
				this.saveToCache();
				return true;
			}

			// Eliminar el occurrence más reciente
			const latestOccurrence = occurrences[occurrences.length - 1];
			if (latestOccurrence.id) {
				await deleteOccurrence(token, latestOccurrence.id);
				delete this.occurrenceIdByTask[taskId];
			}
			
			// Actualizar estado local
			this.completedTaskIds.delete(taskId);
			this.completedTaskIds = new Set(this.completedTaskIds); // Trigger reactivity
			this.saveToCache();
			
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Error uncompleting task';
			console.error('Error uncompleting task:', err);
			return false;
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Obtener logs de una tarea
	 */
	async fetchLogs(taskId: string): Promise<TaskLog[]> {
		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				return [];
			}

			// Primero obtener el occurrence ID
			const occurrenceId = this.occurrenceIdByTask[taskId];
			if (!occurrenceId) {
				// Intentar obtener de occurrences
				const occurrences = await fetchTaskOccurrences(token, taskId);
				if (occurrences.length === 0) return [];
				
				const latestOccurrence = occurrences[occurrences.length - 1];
				if (!latestOccurrence.id) return [];
				
				this.occurrenceIdByTask[taskId] = latestOccurrence.id;
			}

			const logs = await fetchOccurrenceLogs(token, this.occurrenceIdByTask[taskId]);
			this.logsByOccurrence[this.occurrenceIdByTask[taskId]] = logs;
			
			return logs;
		} catch (err) {
			console.error('Error fetching logs:', err);
			return [];
		}
	}

	/**
	 * Crear un log para una tarea
	 */
	async createLog(
		taskId: string,
		action: TaskLogAction,
		metadata?: {
			value?: number;
			notes?: string;
			duration_seconds?: number;
			timer_start?: string;
			timer_end?: string;
		}
	): Promise<boolean> {
		try {
			const authStore = getAuthStore();
			const token = authStore.getToken();
			
			if (!token) {
				return false;
			}

			// Obtener occurrence ID
			let occurrenceId = this.occurrenceIdByTask[taskId];
			
			if (!occurrenceId) {
				// Obtener occurrences
				const occurrences = await fetchTaskOccurrences(token, taskId);
				if (occurrences.length > 0) {
					const latestOccurrence = occurrences[occurrences.length - 1];
					if (latestOccurrence.id) {
						occurrenceId = latestOccurrence.id;
						this.occurrenceIdByTask[taskId] = occurrenceId;
					}
				}
			}

			if (!occurrenceId) {
				console.error('No occurrence found for task');
				return false;
			}

			await createOccurrenceLog(token, occurrenceId, action, metadata);
			
			// Actualizar logs locales
			await this.fetchLogs(taskId);
			
			return true;
		} catch (err) {
			console.error('Error creating log:', err);
			return false;
		}
	}

	/**
	 * Iniciar timer para una tarea
	 */
	startTimer(taskId: string): void {
		const now = Date.now();
		this.activeTimers[taskId] = {
			taskId,
			startTime: now,
			elapsedSeconds: 0,
			isRunning: true,
			isPaused: false
		};
		this.saveTimersToStorage();
	}

	/**
	 * Pausar timer
	 */
	pauseTimer(taskId: string): void {
		const timer = this.activeTimers[taskId];
		if (timer && timer.isRunning) {
			const now = Date.now();
			const elapsed = Math.floor((now - timer.startTime) / 1000);
			timer.elapsedSeconds += elapsed;
			timer.isRunning = false;
			timer.isPaused = true;
			this.saveTimersToStorage();
		}
	}

	/**
	 * Reanudar timer
	 */
	resumeTimer(taskId: string): void {
		const timer = this.activeTimers[taskId];
		if (timer && timer.isPaused) {
			timer.startTime = Date.now();
			timer.isRunning = true;
			timer.isPaused = false;
			this.saveTimersToStorage();
		}
	}

	/**
	 * Detener timer y obtener tiempo total
	 */
	stopTimer(taskId: string): number {
		const timer = this.activeTimers[taskId];
		if (!timer) return 0;

		let totalSeconds = timer.elapsedSeconds;
		if (timer.isRunning) {
			const now = Date.now();
			totalSeconds += Math.floor((now - timer.startTime) / 1000);
		}

		delete this.activeTimers[taskId];
		this.saveTimersToStorage();
		return totalSeconds;
	}

	/**
	 * Obtener tiempo actual del timer
	 */
	getTimerSeconds(taskId: string): number {
		const timer = this.activeTimers[taskId];
		if (!timer) return 0;

		let totalSeconds = timer.elapsedSeconds;
		if (timer.isRunning) {
			const now = Date.now();
			totalSeconds += Math.floor((now - timer.startTime) / 1000);
		}

		return totalSeconds;
	}

	/**
	 * Verificar si hay un timer activo
	 */
	hasActiveTimer(taskId: string): boolean {
		return !!this.activeTimers[taskId];
	}

	/**
	 * Obtener estado del timer
	 */
	getTimer(taskId: string): TaskTimer | null {
		return this.activeTimers[taskId] || null;
	}

	/**
	 * Limpiar estado y caché
	 */
	clear(): void {
		this.tasksByGoal = {};
		this.completedTaskIds = new Set();
		this.occurrencesByTask = {};
		this.occurrenceIdByTask = {};
		this.logsByOccurrence = {};
		this.activeTimers = {};
		this.error = null;
		CacheManager.remove('tasks_by_goal');
		CacheManager.remove('completed_task_ids');
		localStorage.removeItem('active_timers');
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
