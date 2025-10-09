import { BACKEND_URL } from '../config';

/**
 * Función de utilidad para realizar solicitudes HTTP con reintentos
 * @param fetchFn - Función que realiza la solicitud fetch
 * @param retries - Número máximo de reintentos (por defecto: 3)
 * @param delay - Retraso entre reintentos en ms (por defecto: 1000ms)
 */
async function withRetry<T>(
	fetchFn: () => Promise<T>,
	retries: number = 3,
	delay: number = 1000
): Promise<T> {
	let lastError: any;
	
	for (let attempt = 0; attempt < retries; attempt++) {
		try {
			// Intentar la solicitud
			return await fetchFn();
		} catch (error) {
			// Guardar el último error para poder lanzarlo si todos los intentos fallan
			lastError = error;
			
			// Si es el último intento, no esperar
			if (attempt === retries - 1) break;
			
			// Log de reintento
			console.log(`Intento ${attempt + 1}/${retries} falló, reintentando en ${delay}ms...`);
			
			// Esperar antes de reintentar
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
	
	// Si llegamos aquí, todos los intentos fallaron
	throw lastError;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface GoalTask {
	id?: string;
	title: string;
	description: string;
	priority: TaskPriority;
	estimated_duration?: string;
	type?: string;
	required?: boolean;
	weight?: number;
	order?: number;
	schedule_rrule?: string;
	due_at?: string;
}

export interface TaskRecommendation extends GoalTask {
	reason?: string;
	template_id?: string | null;
}

export interface TaskRecommendationResponse {
	success: boolean;
	goal: {
		id: string;
		title: string;
		description: string;
	};
	recommendations: TaskRecommendation[];
	method: 'ai_powered' | 'pattern_based';
	generated_at: string;
	existing_task_count: number;
	ai_metadata?: {
		tokens_used: number;
		model: string;
	};
}

export interface TaskOccurrence {
	id?: string;
	task_id: string;
	goal_id: string;
	user_id?: string;
	completed_at: string;
	notes?: string;
	value?: number;
}

/**
 * Get AI-powered task recommendations for a goal
 */
export async function fetchTaskRecommendations(
	token: string,
	goalId: string,
	count: number = 5,
	useAI: boolean = true,
	context?: any
): Promise<TaskRecommendationResponse> {
	const params = new URLSearchParams();
	params.append('use_ai', String(useAI));
	params.append('count', String(count));

	// Always use POST with context (provide defaults if not specified)
	const requestBody = {
		context: context || {
			available_time: '2 horas por día',
			current_challenges: 'Mantener la consistencia',
			preferences: 'Prefiero tareas prácticas y medibles',
			resources: ['Tiempo', 'Motivación', 'Disciplina']
		}
	};

	try {
		// Usar el store de autenticación o el token proporcionado
		return await withRetry(async () => {
			// Obtener token (usar el token proporcionado o buscarlo en el store de auth)
			let authToken = token;
			if (!authToken) {
				const { getAuthStore } = await import('../stores/auth.svelte');
				const authStore = getAuthStore();
				authToken = authStore.getToken() || '';
			}
			
			const response = await fetch(
				`${BACKEND_URL}/api/goals/${goalId}/recommendations?${params.toString()}`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${authToken}`,
						'Content-Type': 'application/json',
						Accept: 'application/json'
					},
					body: JSON.stringify(requestBody),
					mode: 'cors',
					cache: 'no-cache'
				}
			);

			if (!response.ok) {
				// Si es 401, el token expiró o es inválido
				if (response.status === 401) {
					const { getAuthStore } = await import('../stores/auth.svelte');
					const authStore = getAuthStore();
					authStore.handleUnauthorized();
					throw new Error('UNAUTHORIZED');
				}
				
				// Try to parse error as JSON, but handle HTML responses
				const contentType = response.headers.get('content-type');
				let errorMessage = `Failed to fetch recommendations: ${response.status} ${response.statusText}`;
				
				if (contentType && contentType.includes('application/json')) {
					try {
						const error = await response.json();
						errorMessage = error.error || error.message || errorMessage;
					} catch (e) {
						console.error('Failed to parse error JSON:', e);
					}
				} else {
					// Server returned HTML or other content
					const text = await response.text();
					console.error('Server returned non-JSON response:', text.substring(0, 200));
					errorMessage = `Server error (${response.status}): ${response.statusText}`;
				}
				
				throw new Error(errorMessage);
			}

			return response.json();
		});
	} catch (err) {
		if (err instanceof Error && err.message === 'UNAUTHORIZED') {
			throw err;
		}
		throw err;
	}
}

/**
 * Create a new task for a goal
 */
export async function createGoalTask(
	token: string,
	goalId: string,
	taskData: GoalTask
): Promise<GoalTask> {
	try {
		return await withRetry(async () => {
			// Obtener token (usar el token proporcionado o buscarlo en el store de auth)
			let authToken = token;
			if (!authToken) {
				const { getAuthStore } = await import('../stores/auth.svelte');
				const authStore = getAuthStore();
				authToken = authStore.getToken() || '';
			}
			
			const response = await fetch(`${BACKEND_URL}/api/goals/${goalId}/tasks`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify(taskData),
				mode: 'cors',
				cache: 'no-cache'
			});

			if (!response.ok) {
				if (response.status === 401) {
					const { getAuthStore } = await import('../stores/auth.svelte');
					const authStore = getAuthStore();
					authStore.handleUnauthorized();
					throw new Error('UNAUTHORIZED');
				}
				
				// Try to parse error as JSON
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					const error = await response.json();
					throw new Error(error.error || `Failed to create task: ${response.statusText}`);
				} else {
					throw new Error(`Failed to create task: ${response.status} ${response.statusText}`);
				}
			}

			return response.json();
		});
	} catch (err) {
		if (err instanceof Error && err.message === 'UNAUTHORIZED') {
			throw err;
		}
		console.error('Error creating goal task after retries:', err);
		throw err;
	}
}

/**
 * Get all tasks for a goal
 */
export async function fetchGoalTasks(token: string, goalId: string): Promise<GoalTask[]> {
	try {
		// Usar el store de autenticación o el token proporcionado
		return await withRetry(async () => {
			// Obtener token (usar el token proporcionado o buscarlo en el store de auth)
			let authToken = token;
			if (!authToken) {
				const { getAuthStore } = await import('../stores/auth.svelte');
				const authStore = getAuthStore();
				authToken = authStore.getToken() || '';
			}
			
			const response = await fetch(`${BACKEND_URL}/api/goals/${goalId}/tasks`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				mode: 'cors',
				cache: 'no-cache'
			});

			if (!response.ok) {
				if (response.status === 401) {
					const { getAuthStore } = await import('../stores/auth.svelte');
					const authStore = getAuthStore();
					authStore.handleUnauthorized();
					throw new Error('UNAUTHORIZED');
				}
				throw new Error(`Failed to fetch tasks: ${response.statusText}`);
			}

			return response.json();
		}, 3, 1000);
	} catch (err) {
		if (err instanceof Error && err.message === 'UNAUTHORIZED') {
			throw err;
		}
		console.error('Error fetching goal tasks after retries:', err);
		return [];
	}
}

/**
 * Update an existing task
 */
export async function updateGoalTask(
	token: string,
	goalId: string,
	taskId: string,
	taskData: Partial<GoalTask>
): Promise<GoalTask> {
	try {
		return await withRetry(async () => {
			// Obtener token (usar el token proporcionado o buscarlo en el store de auth)
			let authToken = token;
			if (!authToken) {
				const { getAuthStore } = await import('../stores/auth.svelte');
				const authStore = getAuthStore();
				authToken = authStore.getToken() || '';
			}
			
			const response = await fetch(`${BACKEND_URL}/api/goals/${goalId}/tasks/${taskId}`, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify(taskData),
				mode: 'cors',
				cache: 'no-cache'
			});

			if (!response.ok) {
				if (response.status === 401) {
					const { getAuthStore } = await import('../stores/auth.svelte');
					const authStore = getAuthStore();
					authStore.handleUnauthorized();
					throw new Error('UNAUTHORIZED');
				}
				
				// Try to parse error as JSON
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					const error = await response.json();
					throw new Error(error.error || `Failed to update task: ${response.statusText}`);
				} else {
					throw new Error(`Failed to update task: ${response.status} ${response.statusText}`);
				}
			}

			return response.json();
		});
	} catch (err) {
		if (err instanceof Error && err.message === 'UNAUTHORIZED') {
			throw err;
		}
		console.error('Error updating goal task after retries:', err);
		throw err;
	}
}

/**
 * Create occurrence (mark task as completed)
 */
export async function createTaskOccurrence(
	token: string,
	goalId: string,
	taskId: string,
	notes?: string,
	value?: number
): Promise<TaskOccurrence> {
	try {
		// Usar withRetry para intentar la operación hasta 3 veces
		return await withRetry(async () => {
			// Obtener token (usar el token proporcionado o buscarlo en el store de auth)
			let authToken = token;
			if (!authToken) {
				const { getAuthStore } = await import('../stores/auth.svelte');
				const authStore = getAuthStore();
				authToken = authStore.getToken() || '';
			}
			
			const response = await fetch(
				`${BACKEND_URL}/api/goals/tasks/${taskId}/occurrences`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${authToken}`,
						'Content-Type': 'application/json',
						Accept: 'application/json'
					},
					body: JSON.stringify({
						scheduled_at: new Date().toISOString(),
						notes: notes || '',
						value: value || 1
					}),
					mode: 'cors',
					cache: 'no-cache'
				}
			);

			if (!response.ok) {
				if (response.status === 401) {
					const { getAuthStore } = await import('../stores/auth.svelte');
					const authStore = getAuthStore();
					authStore.handleUnauthorized();
					throw new Error('UNAUTHORIZED');
				}
				if (response.status === 404) {
					throw new Error('Occurrences endpoint not found (404)');
				}
				
				// Try to parse error as JSON, handle non-JSON responses
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					const error = await response.json();
					throw new Error(error.error || `Failed to create occurrence: ${response.statusText}`);
				} else {
					throw new Error(`Failed to create occurrence: ${response.status} ${response.statusText}`);
				}
			}

			return response.json();
		});
	} catch (err) {
		// Crear objeto local para simular respuesta exitosa cuando hay error de red
		if (err instanceof Error && (err.message === 'ERROR_CREATING_OCCURRENCE' || err.message.includes('Failed to fetch'))) {
			console.log('Usando respuesta simulada local para crear ocurrencia debido a error:', err.message);
			return {
				id: 'local-' + Date.now(),
				task_id: taskId,
				goal_id: goalId,
				completed_at: new Date().toISOString(),
				notes: notes || '',
				value: value || 1
			};
		}
		throw err; // Re-throw other errors
	}
}

/**
 * Get task occurrences for a specific task
 */
export async function fetchTaskOccurrences(token: string, taskId: string): Promise<TaskOccurrence[]> {
	try {
		// Usar el store de autenticación o el token proporcionado
		return await withRetry(async () => {
			// Obtener token (usar el token proporcionado o buscarlo en el store de auth)
			let authToken = token;
			if (!authToken) {
				const { getAuthStore } = await import('../stores/auth.svelte');
				const authStore = getAuthStore();
				authToken = authStore.getToken() || '';
			}
			
			const response = await fetch(`${BACKEND_URL}/api/goals/tasks/${taskId}/occurrences`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				// Asegurar que no se lanzan errores CORS en consola
				mode: 'cors',
				cache: 'no-cache'
			});

			if (!response.ok) {
				if (response.status === 401) {
					const { getAuthStore } = await import('../stores/auth.svelte');
					const authStore = getAuthStore();
					authStore.handleUnauthorized();
					throw new Error('UNAUTHORIZED');
				}
				// Task not found or no occurrences
				return [];
			}

			return response.json();
		}, 3, 1000);
	} catch (err) {
		// Network or other errors - fail gracefully
		if (err instanceof Error && err.message === 'UNAUTHORIZED') {
			throw err; // Re-throw auth errors
		}
		console.error(`Error fetching occurrences for task ${taskId} after retries:`, err);
		return [];
	}
}

/**
 * Get all completed task IDs for a goal by checking occurrences for each task
 */
export async function fetchCompletedTaskIds(token: string, tasks: GoalTask[]): Promise<Set<string>> {
	const completedIds = new Set<string>();
	
	// Validar que tenemos tareas para procesar
	if (!tasks || tasks.length === 0) {
		return completedIds;
	}

	try {
		// Obtener token (usar el token proporcionado o buscarlo en el store de auth)
		let authToken = token;
		if (!authToken) {
			const { getAuthStore } = await import('../stores/auth.svelte');
			const authStore = getAuthStore();
			authToken = authStore.getToken() || '';
			if (!authToken) return completedIds;
		}
		
		// Check occurrences for each task in parallel with batching
		// Procesamos en lotes de máximo 5 tareas en paralelo para evitar sobrecarga
		const batchSize = 5;
		const tasksWithIds = tasks.filter(task => task.id);
		
		for (let i = 0; i < tasksWithIds.length; i += batchSize) {
			const batch = tasksWithIds.slice(i, i + batchSize);
			const batchPromises = batch.map(async (task) => {
				if (!task.id) return;
				try {
					const occurrences = await fetchTaskOccurrences(authToken, task.id);
					if (occurrences && occurrences.length > 0) {
						completedIds.add(task.id);
					}
				} catch (err) {
					// Ignore errors for individual tasks
					console.log(`Error checking occurrences for task ${task.id}:`, err);
				}
			});
			
			await Promise.all(batchPromises);
		}
		
		return completedIds;
	} catch (err) {
		console.error('Error fetching completed tasks:', err);
		return completedIds; // Devolver conjunto vacío en caso de error
	}
}

/**
 * Delete a task
 */
export async function deleteGoalTask(token: string, goalId: string, taskId: string): Promise<void> {
	try {
		await withRetry(async () => {
			// Obtener token (usar el token proporcionado o buscarlo en el store de auth)
			let authToken = token;
			if (!authToken) {
				const { getAuthStore } = await import('../stores/auth.svelte');
				const authStore = getAuthStore();
				authToken = authStore.getToken() || '';
			}
			
			const response = await fetch(`${BACKEND_URL}/api/goals/${goalId}/tasks/${taskId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${authToken}`,
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				mode: 'cors',
				cache: 'no-cache'
			});

			if (!response.ok) {
				if (response.status === 401) {
					const { getAuthStore } = await import('../stores/auth.svelte');
					const authStore = getAuthStore();
					authStore.handleUnauthorized();
					throw new Error('UNAUTHORIZED');
				}
				
				// Try to parse error as JSON
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					const error = await response.json();
					throw new Error(error.error || `Failed to delete task: ${response.statusText}`);
				} else {
					throw new Error(`Failed to delete task: ${response.status} ${response.statusText}`);
				}
			}
			
			return true; // Devolver algo para que withRetry funcione correctamente
		});
	} catch (err) {
		if (err instanceof Error && err.message === 'UNAUTHORIZED') {
			throw err;
		}
		console.error('Error deleting goal task after retries:', err);
		throw err;
	}
}
